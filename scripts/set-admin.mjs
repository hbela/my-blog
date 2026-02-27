import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'hajzerbela@gmail.com'
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log(`❌ No user found with email: ${email}`)
    console.log('Available users:')
    const all = await prisma.user.findMany({ select: { email: true, role: true } })
    all.forEach(u => console.log(`  - ${u.email} (${u.role})`))
    return
  }
  
  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  })
  console.log(`✅ Updated ${updated.email} → role: ${updated.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
