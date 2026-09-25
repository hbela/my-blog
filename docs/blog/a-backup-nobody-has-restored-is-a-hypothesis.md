A few weeks ago I wrote a line I didn't fully believe yet: *a backup nobody has restored is a hypothesis.* It went at the bottom of a post about deploying this thing to one VPS, in the list of what that setup didn't give me. I meant it as an honest admission, not a plan.

Then I actually restored one.

Not a `pg_restore` on my laptop against a dump I'd just made — I'd already done that once and it told me almost nothing. I mean: could I lose the server, and get the *application* back? Not just the rows. The encryption keys the rows are unreadable without. The container images. The background job queue. A real HTTPS session in an actual browser, on infrastructure that had never heard of this product before.

Two staging drills, one Hetzner project, and about two hours later, I had an answer.

---

## What "restore the database" was quietly skipping

The instinct is to treat backups as solved once `pg_dump` runs on a schedule and the file lands somewhere durable. That's necessary and it's most of the work, but it answers a narrower question than "can I recover." Three things sit outside it:

- **Encryption keys.** Customer PII in this app is encrypted at the field level, with a blind index for lookups. A database dump without the keys is a very well-organized pile of ciphertext. The keys have to be recoverable *independently* of the server that died.
- **Application images.** A VPS that fails takes its built Docker images with it. Recovery means rebuilding from source, not redeploying from a cache that no longer exists.
- **Everything that isn't the primary database.** Background jobs live in Redis. Redis isn't backed up — on purpose, it's disposable — but "disposable" is a claim, and claims are for testing.

So the real question wasn't "does the backup exist." It was "if this server disappeared right now, could I stand the product up somewhere else, log in, and read a real booking." That's a different, much more honest bar, and I hadn't cleared it.

---

## Part one: proving the backup pipeline itself

Before testing recovery, I needed to trust the thing being recovered *from*.

Every 30 minutes, a systemd timer on the staging VPS streams a `pg_dump` straight into [Restic](https://restic.net/), which encrypts it and ships it to Cloudflare R2 — off the machine, so losing the VPS doesn't also lose the backups. The snapshot gets a pending tag first; only after the full dump-and-upload succeeds does the script promote it to the tag recovery actually looks for. A snapshot existing in Restic isn't the same claim as a snapshot being an *accepted* backup, and conflating those two was exactly the kind of gap I wanted to close.

Monitoring lives outside the VPS too — a small Cloudflare Worker with D1 for state and Resend for email, so a server that stops can't also silence its own alarm by going quiet. Each backup run reports a start and a terminal success or failure; a five-minute cron checks for runs that overran or never showed up at all:

| Condition | What happens |
|---|---|
| Explicit failure | Failure email |
| Run takes over 20 minutes | Overrun incident opened |
| No success in 50 minutes | Stale-backup incident opened |
| Fresh success after an incident | Recovery email, incident closed |
| Ordinary success | Recorded, no email — silence is the expected state |

I rehearsed all three failure modes against a throwaway test monitor, each followed by a real success to trigger the recovery path. Six emails, three alerts and three recoveries, all landed. One integration hiccup on the way: Cloudflare rejected the Python client with an HTTP 403 until I set an explicit `User-Agent` header — apparently a blank one reads as suspicious traffic. I added a regression check for that and moved on.

Rehearsal proves the alerting works. It doesn't prove the *timer* works, so the last step was just watching it run — twice, unassisted, on its own schedule — and checking the systemd journal and the monitor's database agreed with each other:

| Scheduled | Actual UTC window | Result |
|---|---|---|
| 15:00 local | 13:00:03–13:00:19 | Both systemd and the monitor recorded success |
| 15:30 local | 13:30:02–13:30:17 | Both systemd and the monitor recorded success |

Two quiet, unremarkable 16-second runs, no email for either — because ordinary success isn't supposed to page anyone, and it didn't. With that confirmed, I retired the old Sentry cron check that had been watching this before the new monitor existed, keeping a rollback copy of it just in case. Sentry stayed in place for actual application errors; it just stopped also being the backup watchdog.

That closed the part of the question I was fairly confident about already. The part I wasn't confident about was next.

---

## Part two: recovering on a machine that had never seen this app

### The easy version, which doesn't count

First pass: restore into fresh containers *on the same server* — separate Postgres and Redis, no published ports, no real integration credentials, an outbound check confirming it couldn't reach anything external. It worked in under 80 seconds.

It also proved almost nothing, because it quietly reused that server's cached Docker images and its existing secrets. A restore that only works on the machine that already has everything isn't a disaster recovery test, it's a very fast `docker compose up`. I needed to take those two crutches away on purpose.

### Recovering the keys without the server that has them

I keep the handful of values recovery actually depends on — the Restic repository password, the R2 credentials, and the application's encryption keys — in a KeePassXC vault that lives independently of any application server. I pulled them from there, unlocked with a local prompt so nothing sensitive touched shell history, and diffed them against staging's real values before trusting them.

All three matched. Generating fresh keys instead would have "worked" in the sense of producing a running app — and would have made every existing encrypted record permanently unreadable, since a new key can't decrypt data written under the old one. Recovering the *actual* keys, from somewhere that isn't the server, was the entire point of this step.

### A server that owed this app nothing

Next, a brand new Hetzner VPS in a **separate project** — ARM64, nothing installed, nothing shared with staging but the DNS zone. Two small, very familiar mistakes on the way in: I created it once without explicitly attaching my SSH key (adding a key to the project doesn't retroactively install it on a server that already exists), and I mangled a public key paste by including the trailing comment. Both are the kind of thing you only remember by re-learning them.

```powershell
ssh -G hetzner | Select-String '^identityfile '
```

is the one-liner that would've saved me ten minutes — it tells you which private key an SSH alias is actually about to use, before you find out the hard way.

### Rebuilding, not redeploying

With a clean server up, I exported the exact committed source for the staging revision straight from git — not the working tree, not `node_modules`, just what's actually checked in — and rebuilt the API, worker, and web images from scratch on that machine. Postgres and Redis came from the registry by digest. Nothing was copied over from staging: no cached layers, no volumes, no `.env` file riding along for convenience.

The one build argument that mattered: the web image needs the API's URL baked in at *build* time, because Next.js inlines it into the browser bundle. Get that wrong and the container looks fine while every request from the browser quietly goes to the wrong place — a failure mode that's invisible until you actually open it in a browser, which is exactly why that step was still ahead of me.

### Restoring the data, and checking it's actually readable

The recovery runner streamed a real R2 snapshot through Restic into an empty Postgres, alongside an empty Redis. Then, with the encryption keys pulled from KeePassXC, I checked the things that actually matter for "this data survived":

- Customer fields decrypt.
- The blind index for a lookup matches the right tenant — and produces something *different* for another tenant, which is the whole point of a blind index.
- The wrong key, or a missing key, is rejected rather than silently producing garbage.
- A restored booking is readable through the real application API, not just a raw SQL query.
- Signing up, signing in, and getting back an authenticated session all work end to end.

Everything passed. The one honest caveat: that particular snapshot predated any real customer bookings, so I added synthetic records on the recovered stack itself to exercise the checks above — which proves the *mechanism* survives serialization and decrypts correctly, not that a specific afternoon's worth of real customer ciphertext round-trips. Worth being precise about that distinction rather than letting a green checklist imply more than it earned.

### Killing Redis on purpose

Background jobs — reminder emails, the notification outbox — live in Redis, and Redis isn't part of the backup by design. So I added a delayed test notification, started the worker, and watched it reconstruct the job from Postgres into an empty Redis. Then, for good measure, I stopped the worker, wiped Redis a second time, and restarted it. Same result. "Redis is disposable" turned from an assumption into something I'd actually watched happen twice.

### DNS, without breaking the site that was still live

Staging's real wildcard DNS record pointed at the original server the whole time — I did not want to find out live traffic had glitched because of a recovery drill. So the recovery host got its own explicit subdomains added underneath the existing zone, TTL 60, while the original wildcard stayed untouched. Caddy on the new box requested real certificates and proxied to the recovery containers once those records resolved; access was restricted to my own IP. I checked all four relevant hostnames afterward — the two recovery ones reached the new server, and staging's own still reached the old one, completely unaffected.

### The part that actually counts: a browser

Everything up to here could, in principle, still be lying to me — a script that thinks it succeeded is not the same thing as a person being able to log in. So the last check was a real, un-spoofed HTTPS session in an actual Chromium browser, no certificate bypass, hitting the rebuilt recovery server exclusively:

1. The site loads over valid HTTPS.
2. The API answers a health check over HTTPS.
3. Signup goes to the *rebuilt* API, not a cached one.
4. Password sign-in works through the real UI.
5. The session cookie is `Secure` and `HttpOnly`.
6. The session survives a cross-origin fetch using that cookie.
7. Authenticated API calls succeed.
8. A restored, encrypted booking reads correctly from the browser.
9. The session survives a page reload.
10. Nothing — not one request — went to staging or to any real external integration.

All ten passed, at TLS 1.3, on a server that had existed for well under two hours.

---

## The number, and what it doesn't include

From the moment I started provisioning software on the clean server to that final green browser check: **2 hours, 10 minutes**, DNS propagation included.

I'm not rounding that up to "sub-four-hour disaster recovery," and I don't think a real drill should let itself do that. The clock didn't include the manual work of creating the server and getting SSH working in the first place. The snapshot I restored was from the previous day, so this says nothing about how much data a real incident would actually lose — that's a separate number (recovery point objective) from how long recovery takes (recovery time objective), and this drill only measured the second one. And the database I restored was still light on real customer data, so I was proving the *machinery* works, not rehearsing the worst version of the real thing.

What I do think I earned: independently stored encryption keys that actually match production, a rebuild process that doesn't quietly depend on the dead server for anything, a real off-host encrypted backup with two genuine unattended successes on record, and a browser that logged in and read real, decrypted data on infrastructure that owed the original server nothing.

A backup nobody has restored is a hypothesis. This one isn't, anymore — it's a two-hour, ten-minute number with a list of what it still doesn't prove attached to it, which is a more useful thing to have than a green checkmark with no asterisks.
