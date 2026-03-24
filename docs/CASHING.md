# Caching Strategy

## Context

This blog updates content **weekly**. The goal is to serve public pages (blog, projects) from cache as much as possible, while ensuring admin changes go live immediately when published.

## Architecture Overview

| Route | Cache Strategy | Invalidation |
|---|---|---|
| `/blog` | Static, revalidate weekly | On publish/delete |
| `/blog/[slug]` | Static at build time | On publish/delete |
| `/projects` | Static, revalidate weekly | On publish/delete |
| `/projects/[slug]` | Static at build time | On publish/delete |
| `/admin/*` | **No cache** | N/A (always fresh) |
| `/api/comments/*` | **No cache** | N/A (always fresh) |
| `/api/contact` | **No cache** | N/A |

---

## Implementation

### 1. Route Segment Config (ISR) — List Pages

Add to `src/app/blog/page.tsx` and `src/app/projects/page.tsx`:

```ts
export const revalidate = 604800 // 7 days in seconds
```

This tells Next.js to statically generate the page at build time and regenerate it in the background **at most once per week**. Combined with on-demand revalidation (see step 3), the page refreshes immediately on publish and falls back to the weekly timer.

### 2. Static Pre-rendering — Detail Pages

Add `generateStaticParams` to `src/app/blog/[slug]/page.tsx` and `src/app/projects/[slug]/page.tsx`:

```ts
export const revalidate = 604800

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return posts.map((p) => ({ slug: p.slug }))
}
```

At `pnpm build` time, Next.js pre-renders all published slugs into static HTML. New posts created after the build are rendered on first request and then cached. Requests for unpublished or deleted slugs return 404.

### 3. On-demand Invalidation — Server Actions

When you publish, update, or delete a post/project, the cache must be invalidated immediately. Use `revalidateTag` to invalidate tagged caches alongside the existing `revalidatePath` calls.

In `src/app/actions/post.ts`:
```ts
import { revalidatePath, revalidateTag } from "next/cache"

// After save/delete:
revalidateTag("posts")
revalidatePath("/admin/posts")
revalidatePath("/blog")
revalidatePath(`/blog/${slug}`) // revalidate the specific post page
```

In `src/app/actions/project.ts`:
```ts
import { revalidatePath, revalidateTag } from "next/cache"

// After save/delete:
revalidateTag("projects")
revalidatePath("/admin/projects")
revalidatePath("/projects")
revalidatePath(`/projects/${slug}`)
```

### 4. Cache Tags on Data Fetches (Optional but Recommended)

Wrap Prisma queries in `unstable_cache` from `next/cache` to attach tags, enabling fine-grained `revalidateTag` invalidation:

```ts
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getPosts = unstable_cache(
  async () =>
    prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
  ["posts"],
  { tags: ["posts"], revalidate: 604800 }
)
```

Then in `src/app/blog/page.tsx`:
```ts
const posts = await getPosts()
```

This gives you both time-based (weekly) and on-demand invalidation via `revalidateTag("posts")`.

### 5. Future: `"use cache"` Directive (Next.js 16 native)

Next.js 16 introduces the `"use cache"` directive as the native replacement for `unstable_cache`. Enable it in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    cacheComponents: true,  // enables "use cache" directive
  },
  // ...
}
```

Then use it directly in data-fetching functions:

```ts
import { cacheLife, cacheTag } from "next/cache"

async function getPosts() {
  "use cache"
  cacheLife("weeks")
  cacheTag("posts")
  return prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } })
}
```

And in server actions, call `revalidateTag("posts")` to bust the cache immediately on publish.

> **Note:** `"use cache"` with `cacheComponents: true` is experimental in 16.x. Use `unstable_cache` (step 4) if you need stability today. The API is compatible — both use `revalidateTag` for on-demand invalidation.

---

## What NOT to Cache

- **`/admin/*`** — Auth-protected, user-specific. Next.js automatically skips caching for routes that read cookies/session. No action needed.
- **`/api/comments/[slug]`** — Comments need to be fresh on every visit. The existing API route handler is not cached by default.
- **`/api/contact`** — POST-only endpoint, not cached by default.

---

## Summary of Changes

| File | Change |
|---|---|
| `src/app/blog/page.tsx` | Add `export const revalidate = 604800` |
| `src/app/blog/[slug]/page.tsx` | Add `export const revalidate = 604800` + `generateStaticParams` |
| `src/app/projects/page.tsx` | Add `export const revalidate = 604800` |
| `src/app/projects/[slug]/page.tsx` | Add `export const revalidate = 604800` + `generateStaticParams` |
| `src/app/actions/post.ts` | Add `revalidateTag("posts")` + `revalidatePath("/blog/${slug}")` |
| `src/app/actions/project.ts` | Add `revalidateTag("projects")` + `revalidatePath("/projects/${slug}")` |
| `next.config.ts` | Add `experimental.cacheComponents: true` (when ready for `"use cache"`) |

## Verification

```bash
pnpm build
# Look for "○ (Static)" or "● (SSG)" next to /blog and /projects routes in the build output
# All known slugs should appear as pre-rendered pages

pnpm start
# Visit /blog — should serve from cache
# Publish a new post in /admin — /blog should show the new post immediately
```
