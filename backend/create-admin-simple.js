const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Création de l\'utilisateur admin...');

  try {
    // Vérifier si le tenant existe
    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'association-test' },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          nom: 'Association Test',
          slug: 'association-test',
          devise: 'FCFA',
          langue: 'fr',
          actif: true,
        },
      });
      console.log('✅ Tenant créé:', tenant.nom);
    } else {
      console.log('ℹ️  Tenant existe déjà:', tenant.nom);
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email: 'admin@test.com',
      },
    });

    if (existingUser) {
      console.log('ℹ️  L\'utilisateur admin existe déjà');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Mot de passe: admin123');
      return;
    }

    // Créer l'utilisateur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        tenantId: tenant.id,
        role: 'PRESIDENT',
      },
    });

    console.log('✅ Utilisateur admin créé avec succès!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('👤 Rôle: PRESIDENT');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
