import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Création d\'un utilisateur admin...');

  // Vérifier si le tenant existe
  let tenant = await prisma.tenant.findUnique({
    where: { slug: 'association-test' },
  });

  if (!tenant) {
    // Créer le tenant
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
  }

  // Vérifier si l'utilisateur existe déjà
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

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Créer l'utilisateur admin
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@test.com',
      password: hashedPassword,
      role: Role.PRESIDENT,
    },
  });

  console.log('✅ Utilisateur admin créé avec succès!');
  console.log('📧 Email: admin@test.com');
  console.log('🔑 Mot de passe: admin123');
  console.log('👤 Rôle: PRESIDENT');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
