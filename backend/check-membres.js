const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('=== MEMBRES ===');
  const membres = await prisma.membre.findMany({
    where: { tenantId: '1' },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });
  console.log(JSON.stringify(membres, null, 2));
  
  console.log('\n=== USERS SANS MEMBRE ===');
  const users = await prisma.user.findMany({
    where: { tenantId: '1' },
    include: {
      membre: true,
    },
  });
  
  const usersSansMembre = users.filter(u => !u.membre);
  console.log(JSON.stringify(usersSansMembre.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    hasMembre: !!u.membre,
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
