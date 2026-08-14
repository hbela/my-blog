import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

/**
 * Push a post from this machine's database to a deployed site, through
 * /api/posts/import.
 *
 * The local database is the source of truth. The seed-post-*.mjs scripts put a
 * post here from its markdown file; this mirrors that row to production. So the
 * review loop stays local — `pnpm dev`, read it at /blog/<slug>, then ship the
 * thing you actually read.
 *
 *   node scripts/publish-post.mjs <slug>              # push content, keep draft
 *   node scripts/publish-post.mjs <slug> --publish    # push content, make it live
 *   node scripts/publish-post.mjs <slug> --unpublish  # take it down again
 *   node scripts/publish-post.mjs <slug> --dry-run    # show what would be sent
 *
 * Environment:
 *   BLOG_URL            target site (default https://portfolio.appointer.hu)
 *   IMPORT_API_SECRET   must match the value set on the TARGET, not this laptop
 */

const prisma = new PrismaClient()

const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith('-'))
const wantPublish = args.includes('--publish')
const wantUnpublish = args.includes('--unpublish')
const dryRun = args.includes('--dry-run')

const urlArg = args.find((a) => a.startsWith('--url='))
const baseUrl = (urlArg?.slice('--url='.length) ?? process.env.BLOG_URL ?? 'https://portfolio.appointer.hu')
  .replace(/\/+$/, '')

function fail(message) {
  console.error(`❌ ${message}`)
  process.exitCode = 1
}

async function main() {
  if (!slug) {
    fail('Usage: node scripts/publish-post.mjs <slug> [--publish|--unpublish] [--dry-run] [--url=https://…]')
    return
  }

  if (wantPublish && wantUnpublish) {
    fail('--publish and --unpublish contradict each other. Pick one.')
    return
  }

  const secret = process.env.IMPORT_API_SECRET
  if (!secret) {
    fail(
      'IMPORT_API_SECRET is not set.\n' +
        '   It must be the secret configured on the TARGET site, which is not\n' +
        '   necessarily the one in this laptop\'s .env.',
    )
    return
  }

  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post) {
    const known = await prisma.post.findMany({ select: { slug: true }, orderBy: { createdAt: 'desc' }, take: 10 })
    fail(
      `No local post with slug "${slug}".\n` +
        `   Seed it first. Recent local slugs:\n` +
        known.map((p) => `     ${p.slug}`).join('\n'),
    )
    return
  }

  // `published` is always sent explicitly.
  //
  // The import route's `update` writes `body.published ?? false`, so a request
  // that omits the field takes a live post DOWN. Never rely on the default:
  // a plain content update has to carry the state it wants to preserve, which
  // is the local row's — the same rule the seed scripts follow in reverse.
  const published = wantPublish ? true : wantUnpublish ? false : post.published

  const payload = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? undefined,
    image: post.image ?? undefined,
    content: post.content,
    published,
  }

  const endpoint = `${baseUrl}/api/posts/import`

  console.log(
    `→ ${dryRun ? 'WOULD POST' : 'POST'} ${endpoint}\n` +
      `   slug:      ${payload.slug}\n` +
      `   title:     ${payload.title}\n` +
      `   image:     ${payload.image ?? '(none)'}\n` +
      `   content:   ${payload.content.length.toLocaleString()} characters\n` +
      `   published: ${published}${published ? '  ← PUBLIC on the live site' : '  (draft)'}`,
  )

  if (dryRun) {
    console.log('\n✋ --dry-run: nothing sent.')
    return
  }

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    fail(`Could not reach ${endpoint}\n   ${e.message}`)
    return
  }

  const text = await response.text()

  if (!response.ok) {
    // 401 is the one worth naming: it almost always means this laptop's
    // IMPORT_API_SECRET and the deployed one have drifted, not that the
    // endpoint is broken.
    const hint =
      response.status === 401
        ? '\n   401 — IMPORT_API_SECRET here does not match the one on the target.'
        : ''
    fail(`${endpoint} returned ${response.status}\n   ${text}${hint}`)
    return
  }

  const result = JSON.parse(text)

  // Keep the two in step, so the next plain run does not silently retract what
  // this one just published.
  if (post.published !== published) {
    await prisma.post.update({ where: { slug }, data: { published } })
  }

  console.log(
    `\n✅ ${result.action === 'created' ? 'Created' : 'Updated'} on ${baseUrl}\n` +
      `   ${baseUrl}/blog/${slug}${published ? '' : '   (draft — not publicly visible yet)'}`,
  )
}

main()
  .catch((e) => {
    console.error('❌ Publish failed:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
