import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un tenant de test
  const tenant = await prisma.tenant.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      nom: 'Association Test',
      slug: 'association-test',
      devise: 'FCFA',
      langue: 'fr',
      actif: true,
    },
  });

  console.log('✅ Tenant créé:', tenant.nom);

  console.log('🎉 Seeding terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
