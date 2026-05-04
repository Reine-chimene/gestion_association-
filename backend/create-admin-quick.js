const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.com';
  const password = 'admin123';
  const tenantId = '1';
  
  // Check if user exists
  const existing = await prisma.user.findFirst({
    where: { email, tenantId },
  });
  
  if (existing) {
    console.log('User exists, updating password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashedPassword },
    });
    console.log('✅ Password updated for admin@test.com');
  } else {
    console.log('Creating new admin user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'PRESIDENT',
        tenantId,
      },
    });
    console.log('✅ Admin user created');
  }
  
  console.log('\n📋 Login credentials:');
  console.log('Email: admin@test.com');
  console.log('Password: admin123');
  console.log('TenantId: 1');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
