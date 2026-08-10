import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Single source of truth: the markdown file. Edit that, re-run this.
const postPath = join(__dirname, '..', 'docs', 'blog', 'deploying-a-booking-saas-to-one-vps.md')
const content = readFileSync(postPath, 'utf8')

const slug = 'deploying-a-booking-saas-to-one-vps'

// Draft by default. Publishing is a decision, not a side effect of running a
// script — pass --publish, or flip the toggle in /admin once it reads right.
const published = process.argv.includes('--publish')

const data = {
  title: 'Deploying a multi-tenant booking SaaS: what a real customer actually needs',
  excerpt:
    'A customer said yes, and asked what they need to install. Nothing — which turns one question into two: deploy the platform once, then onboard them through the product. This is the whole path, including the three failed deploys and the CERT-Bund report that reordered the steps.',
  content,
  // 1400x990 (1.414) to match the cover box on the post page — 80% of an 860px
  // column at 460px tall — so `object-cover` has nothing to crop. The SVG it was
  // rendered from sits beside it; regenerate with:
  //   magick public/blog/deploying-a-booking-saas-to-one-vps.svg public/blog/deploying-a-booking-saas-to-one-vps.png
  image: '/blog/deploying-a-booking-saas-to-one-vps.png',
  published,
}

async function main() {
  // Post.authorId is required. Use the admin account rather than inventing one.
  const author =
    (await prisma.user.findFirst({ where: { role: 'ADMIN' } })) ??
    (await prisma.user.findFirst())

  if (!author) {
    console.error(
      '❌ No user in the database to attribute the post to.\n' +
        '   Sign in once at /admin, then re-run this script.',
    )
    process.exitCode = 1
    return
  }

  const existing = await prisma.post.findUnique({ where: { slug } })

  // Do not silently un-publish a post that is already live: if it has been
  // published before, a plain re-run updates the content and leaves it up.
  const nextPublished = existing?.published ? true : published

  const post = await prisma.post.upsert({
    where: { slug },
    update: { ...data, published: nextPublished },
    create: { slug, ...data, authorId: author.id },
  })

  console.log(
    `✅ ${existing ? 'Updated' : 'Created'} post "${post.title}"\n` +
      `   slug:      ${post.slug}\n` +
      `   author:    ${author.email}\n` +
      `   published: ${post.published}${post.published ? '' : '  (run with --publish, or use /admin)'}\n` +
      `   preview:   /blog/${post.slug}`,
  )
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
