const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.employee.findMany({ include: { user: true, manager: true, jobTitle: true }});
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
