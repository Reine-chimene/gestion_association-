const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      nom: true,
      slug: true,
    },
  });
  
  console.log('=== TENANTS ===');
  console.log(JSON.stringify(tenants, null, 2));
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      tenantId: true,
    },
    take: 10,
  });
  
  console.log('\n=== USERS ===');
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
