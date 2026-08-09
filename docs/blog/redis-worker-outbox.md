The booking engine went green last week. Customers can hold a slot, confirm it, reschedule it, cancel it — and the database, not the application, decides who got the last appointment at 14:00. That part was always going to be the interesting one.

Then I started a second process and watched this appear in the log:

```json
{
  "service": "worker",
  "msg": "worker: queues registered, outbox dispatcher, sweep and notification sender running",
  "queues": [
    "calendar-sync",
    "notifications",
    "booking-reminders",
    "hold-expiration",
    "outbox-dispatch",
    "usage-aggregation",
    "retention-cleanup"
  ],
  "pollIntervalMs": 5000,
  "sweepIntervalMs": 60000,
  "emailProvider": "resend"
}
```

Eleven lines of JSON, and none of them are a feature a customer can see. No screen changed. Nobody can do anything today they could not do yesterday. What changed is that the system now keeps promises it previously only made.

This is a post about what a background worker and a Redis-backed queue actually buy you, written from the specific decisions in one codebase rather than from the general shape of the pattern. Every claim below is one I had to make a call on, and several of them I made twice.

## What existed before the worker

The API had been writing rows into a table called `outbox_events` for weeks. Every booking confirmation, every reschedule, every cancellation, every organization provisioned by the platform admin — all of them appended a row inside the same database transaction that did the real work.

Nothing consumed those rows. That was deliberate, and it is worth dwelling on, because "the producer shipped months before the consumer" is normally a smell and here it was the whole design:

```
outbox_events        →  notifications      →  BullMQ job
(the API owes            (the platform         (something should
 someone this)            owes this message)    send it now)
```

Three links. **The first two are durable. The third is deliberately not.**

A row in `outbox_events` says an event happened. A row in `notifications` says a specific message is owed to a specific address in a specific language at a specific time. A BullMQ job says nothing at all except "act on that row now" — it is a prompt, not a promise. If Redis loses every job it holds, nothing has been forgotten, because the promise was never in Redis.

That single property is what the rest of this post keeps cashing in.

## Consistency: the queue is never inside the transaction

The obvious way to send a booking confirmation is to send it from the route handler. The next-most-obvious way is to publish a job to the queue from the route handler. Both are wrong, and they are wrong in opposite directions.

Sending inline couples the customer's HTTP response to a third-party email API. Resend has a bad afternoon; your booking endpoint has a bad afternoon.

Publishing to the queue inside the transaction is subtler and worse. Two failure modes, and they cannot both be fixed:

- **The transaction rolls back after the job is published.** The queue now holds a job for a booking that does not exist. You send a confirmation for an appointment nobody has.
- **The queue is down when the transaction runs.** Either you fail the transaction — the booking is refused because *the email system* is unavailable — or you swallow the error, and the message is silently never sent.

So the API never talks to BullMQ. It writes a row. The comment on that function in the booking service says it plainly:

> Nothing here talks to BullMQ, and that is the point: a job published inside a transaction is lost when the transaction rolls back, and a transaction that waits on a queue fails when the queue is down.

The booking and the record-that-a-message-is-owed commit together or not at all. That is the transactional outbox, and it is the only part of this whole architecture that is genuinely non-negotiable.

## The claim has to be one statement

Once rows exist, something has to take them. The naive version — `SELECT` the pending rows, then `UPDATE` them to `PROCESSING` — has a window between the read and the write in which a second worker reads the same rows. Under one worker you will never see it. Under two, or during a rolling deploy where old and new overlap for thirty seconds, you will.

This is the same mistake as checking capacity before inserting a reservation, and it has the same fix: let PostgreSQL arbitrate.

```sql
UPDATE outbox_events AS e
SET status = 'PROCESSING',
    claimed_at = now(),
    attempts = e.attempts + 1
FROM (
  SELECT id
  FROM outbox_events
  WHERE (status = 'PENDING' AND available_at <= now())
     OR (status = 'PROCESSING'
         AND claimed_at < now() - make_interval(secs => 300))
  ORDER BY available_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT $1
) AS claimed
WHERE e.id = claimed.id
RETURNING ...
```

`FOR UPDATE SKIP LOCKED` is doing the load-bearing work: two workers running this simultaneously get disjoint batches, with no coordination, no lease table, and no distributed lock. It is also, incidentally, why the claim is raw SQL — Prisma cannot express row-level locking, and the two-statement version it *can* express is the buggy one.

Two details in there that took a second pass to get right:

**`attempts` increments at claim time, not at failure time.** A worker killed mid-dispatch would otherwise be reclaimed with its attempt count unchanged, and retry forever. Counting the claim means even a crash loop terminates at the ceiling and parks the row for a human.

**The stale-claim window is 300 seconds, and it is explicitly a bet.** Too short and two workers dispatch the same event while the first is merely slow. Too long and a crashed worker's events wait five minutes. Both are survivable — which is only true because of the next section.

## Idempotency, three times, on purpose

A distributed system that retries is a system that duplicates. There are exactly three places a duplicate could be born here, and each one is closed by the database rather than by application logic.

| Where a duplicate could appear | What stops it |
|---|---|
| The same outbox event dispatched twice (redelivery, stale-claim reclaim) | A unique index on `(tenant_id, dedupe_key)`. The insert is attempted with no `SELECT` first; `P2002` means somebody already committed to sending this exact message. |
| The same notification row enqueued twice (dispatcher *and* sweep both find it) | `jobId` is the notification id. BullMQ refuses a second job with an id it already holds. |
| The same job delivered twice (BullMQ redelivery, worker restart) | A conditional `UPDATE … WHERE status = 'PENDING'` → `SENDING`. The loser sees zero rows updated and returns `NOT_CLAIMED`, which is not an error. |

None of these is "check, then act". All of them are "act, and let the database tell you that you lost". Between a check and an act there is a window, and under load somebody is always inside it.

The dedupe key is also where a surprising amount of product judgement lives. Most notifications are keyed on the outbox event id, so an owner who clicks *Subscribe* twice legitimately gets two emails — because the second click usually means the first email did not arrive. But the subscription **confirmation** is keyed on the Stripe subscription id instead, because `customer.subscription.updated` fires on every later billing change, and an event-keyed confirmation would congratulate the owner every time they touched their card details. Same mechanism, opposite decision, and only the second one is obvious in hindsight.

## Stability: what happens when things are missing

The interesting question about a new dependency is not what it does when it works. It is what the system does when it is absent.

**No `REDIS_URL`.** The worker starts, logs that it has nothing to attach to, and stays alive. Not exiting, because a process that exits looks like a crash to a supervisor and produces a restart loop. Not pretending to be healthy, because that hides the fact that no jobs are being processed. Outbox rows accumulate, which is the correct behaviour rather than a gap — the moment Redis appears, the backlog drains.

**No email API key.** The provider is constructed lazily and degrades to writing message bodies to the log. It does *not* report success. This one is a scar: an earlier version recorded `status: SENT` when nothing had left the building, and five onboarding emails looked delivered for days. The only tell was a null `provider_message_id`, and nobody reads a null. Now that path writes `SKIPPED` with an explicit reason, because a provider that does not deliver must never claim it did.

**Redis configured wrongly.** On startup the worker asks for `maxmemory-policy` and shouts if it is not `noeviction`. Under memory pressure, an evicting Redis will delete BullMQ's keys *mid-Lua-script* — between a job's hash and the sorted set that references it. The result is not a lost job, it is a corrupted queue, and it happens precisely when the system is busiest. The check is advisory rather than fatal, though: refusing to start would leave the outbox undrained, which is worse than running on a suspect Redis. (Hosted providers often forbid `CONFIG GET` entirely. Not knowing is not a failure.)

**Redis unreachable at boot.** The connection uses `enableOfflineQueue: false`, so commands reject immediately rather than buffering against a socket that may never open. That is the behaviour you want at runtime — but it makes any startup check race the connection. So the eviction check waits for readiness first, because a check that always reports "unavailable" is worse than no check at all: it reports a *result* rather than reporting that it did not run.

**A send that fails.** Failures are classified rather than blindly retried. A `4xx` from the provider that means "this address is malformed" is terminal; a `429` or a `5xx` is not. Terminal failures write `FAILED` and stop. Retryable ones go back to `PENDING` and re-throw, which is what tells BullMQ to apply its backoff. Failed jobs are retained for 14 days and 5,000 entries, against 24 hours and 1,000 for successes — a failed job is evidence, a completed one is not.

And nothing is ever deleted on failure. An event that could not be dispatched is the only surviving evidence that somebody is owed a message.

## The 15-minute horizon, and why the sweep exists

Here is the decision I did not expect to have to make.

A booking reminder fires 24 hours before the appointment. Appointments get booked three weeks out. BullMQ supports delayed jobs, so the obvious move is to enqueue the reminder with a three-week delay and forget about it.

Do not do this. A delayed job lives in a Redis sorted set **for the entire duration of its delay**. A thousand bookings three weeks out is a thousand entries occupying Redis memory continuously, on an instance sized for throughput rather than storage — and it buys nothing, because the `notifications` row already records exactly the same fact, durably, in a database that is already paid for.

So the dispatcher hands BullMQ only what is due within 15 minutes. Anything further out stays a row with a `scheduled_at` and nothing pointing at it.

Which means something has to eventually point at it. That is the sweep: every 60 seconds, find `PENDING` rows whose time has come, and enqueue them. It runs once immediately at startup too, because after a restart anything the previous process held only in Redis exists nowhere else, and waiting out a full interval to discover that is a minute of silence for no reason.

The sweep takes no claim of its own, deliberately. Two mechanisms already prevent a double send — the `jobId` and the sender's conditional claim — and both are load-bearing elsewhere. A third answer to a question already settled twice would need its own staleness rule to survive a worker dying between claiming and enqueuing.

And this is where the third link being disposable pays out in full:

> A notification row is the commitment; the job is only a prompt. If Redis is wiped, restarted without persistence, or loses a delayed job, nothing is forgotten — the rows are still `PENDING`, and the next sweep re-enqueues them.

**It is safe to run this on a Redis with no persistence at all.** Not because losing jobs is fine, but because losing jobs costs at most 60 seconds of latency and zero messages. That is a very different operational posture from "Redis is a database now, please back it up."

## Scalability: what actually scales, and what does not

Three things get easier, and one gets harder.

**Horizontal workers are free.** `SKIP LOCKED` means a second worker process is a deployment change, not a code change. No leader election, no partitioning scheme, no coordination.

**Slow work stops blocking fast work.** The API's p99 no longer includes anybody else's SMTP handshake. A provider outage becomes a growing `PENDING` count and a backlog that drains later — which is a graph you can alert on, rather than a spike in 500s.

**Batches drain instead of sleeping.** A full batch means more is waiting, so the poller goes straight round again rather than sleeping the interval. Without that, a backlog of *N* takes `(N / batchSize) × interval` to clear, which for a 5-second poll and a few thousand rows is an afternoon. (The sweep is the exception: a row it enqueued is found again next pass until the sender moves it out of `PENDING`, so a full batch there does not always mean progress, and it stops after one.)

The thing that gets harder is **connections**. BullMQ opens its own connection per `Queue`, and two per `Worker`, unless you hand it one. Seven queues reaches twenty-odd connections without anybody deciding to — and hosted Redis plans cap connections long before they cap memory, with free tiers around thirty. So one `ioredis` instance is constructed and shared everywhere. That arithmetic should be a decision, not an emergent property of how many times you typed `new Queue`.

Two ioredis settings are non-obvious and both matter:

- `maxRetriesPerRequest: null` — BullMQ requires it and throws at construction otherwise, which is the library being kind. Its workers sit in blocking reads (`BZPOPMIN`) that legitimately outlive any retry budget, so ioredis's default of 20 turns an ordinary idle period into a stream of errors.
- `retryStrategy: attempt => Math.min(attempt * 500, 10_000)` — queue work is not latency-critical, and a burst of reconnects against a provider that is already struggling makes things worse.

Also worth noting: seven queues are registered but only `notifications` has a consumer today. The other six are declared because their names are part of the spec's contract, and inventing them ad hoc later is exactly how a typo becomes a silently-idle queue that nobody notices for a month.

## What it costs

The honest column.

**Eventual consistency is now visible to users.** A customer sees "booked" before the confirmation email exists. That is a UX obligation — the confirmation screen has to carry everything the email would have, because the email might be 5 seconds away or 5 minutes away.

**There is a second process to deploy, monitor and shut down cleanly.** Shutdown ordering is real work: stop claiming, let the consumer finish the job it is holding, close the queues, *then* drop the connection underneath them. A job that finishes after its queue is gone cannot record its own outcome. And a second `SIGTERM` during a drain must not start a second drain.

**A dead-letter row needs a human.** `FAILED` events are never deleted and never retried. That is correct, and it means somebody has to look at them. A queue with no one reading its failures is a queue that quietly loses things with extra steps.

**Debugging is now a trace across three stores.** Was the row written? Was it claimed? Did it produce a notification, or hit the dedupe index? Was a job enqueued, or left beyond the horizon? Did the send fail retryably? Five questions where there used to be one stack trace.

Not everything moved, either. The Stripe event poller reads and writes PostgreSQL only, and starts regardless of Redis — so a customer who pays while Redis is down is still activated, and only their confirmation email waits.

## What it actually bought

| | Before | After |
|---|---|---|
| **Consistency** | A message is owed only if the request that owed it also succeeded at sending it | The owing commits with the booking; delivery is a separate, retryable fact |
| **Stability** | Third-party latency and outages inside the request path | Provider down means a growing backlog, not failed bookings |
| **Durability** | — | Nothing lives only in the queue; Redis can be wiped with no message loss |
| **Scalability** | One process doing everything, serially | `SKIP LOCKED` makes worker count a deploy-time decision |
| **Punctuality** | Not possible: nothing runs on a schedule | Near-term work is second-accurate via the queue; long-term work is a row plus a 60-second sweep |
| **Observability** | Success is "no exception was thrown" | Every message has a status, an attempt count, and a last error, kept for 14 days |

The line I keep coming back to is the one about the third link. It is tempting to reach for a queue and treat it as infrastructure — durable, persisted, backed up, the system of record for pending work. That is a real architecture and plenty of people run it.

The cheaper one, and I think the better one for a system that already has a transactional database it trusts, is to treat the queue as **a scheduling hint over durable state**. Redis holds nothing you would cry about losing. It is there for punctuality and concurrency, not for memory. Everything you would cry about losing is in PostgreSQL, where the transaction that created the obligation also recorded it.

You get to run the queue on the cheapest tier available, restart it without ceremony, and lose the whole thing to a provider incident — and the worst that happens is that some emails go out a minute late.

---

*From the build log of a multi-tenant booking SaaS: Fastify, Next.js, PostgreSQL 18, Prisma, BullMQ, and one deliberately disposable Redis.*
