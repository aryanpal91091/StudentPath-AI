const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const opps = await prisma.opportunity.count();
  const careers = await prisma.career.count();
  const skills = await prisma.skill.count();
  console.log('Database row counts:', { users, opps, careers, skills });
}

main().finally(() => prisma.$disconnect());
