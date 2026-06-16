import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Single source of truth: the user guide. Resolve the relative screenshot
// references (assets/screenshots/*) to the public-served path.
const guidePath = join(__dirname, '..', 'docs', 'sunshine-dental', 'user-guide.md')
const content = readFileSync(guidePath, 'utf8').replace(
  /assets\/screenshots\//g,
  '/sunshine-dental/',
)

const data = {
  title: 'Sunshine Dental',
  excerpt:
    'A 24/7 AI phone receptionist for dental clinics, paired with a staff dashboard for calendar, patients, appointments, and call logs — one synced system that books appointments around the clock and keeps humans in control.',
  content,
  technologies: 'Next.js, AI Voice Agent, Calendar, Patient CRM, Call Analytics',
  image: '/sunshine-dental/sunshine-dental-cover.png',
  published: true,
}

async function main() {
  const project = await prisma.project.upsert({
    where: { slug: 'sunshine-dental' },
    update: data,
    create: { slug: 'sunshine-dental', ...data },
  })
  console.log(`✅ Upserted project "${project.title}" (slug: ${project.slug}, published: ${project.published})`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
