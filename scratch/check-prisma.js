const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('EventRegistration fields:', Object.keys(prisma.eventRegistration))
}

main().catch(console.error).finally(() => prisma.$disconnect())
