const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Recherche des utilisateurs sans profil membre...\n');
  
  const users = await prisma.user.findMany({
    where: { tenantId: '1' },
    include: { membre: true },
  });
  
  const usersSansMembre = users.filter(u => !u.membre);
  
  console.log(`📊 Trouvé ${usersSansMembre.length} utilisateurs sans profil membre\n`);
  
  for (const user of usersSansMembre) {
    // Extraire nom et prénom de l'email
    const emailParts = user.email.split('@')[0];
    let nom, prenom;
    
    if (emailParts === 'admin') {
      nom = 'Admin';
      prenom = 'Test';
    } else if (emailParts.includes('.')) {
      const parts = emailParts.split('.');
      prenom = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      nom = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    } else {
      prenom = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
      nom = 'Membre';
    }
    
    // Générer un numéro de membre unique
    const count = await prisma.membre.count({ where: { tenantId: '1' } });
    const numeroMembre = `MBR${String(count + 1).padStart(4, '0')}`;
    
    console.log(`✅ Création du profil membre pour ${user.email}`);
    console.log(`   - Nom: ${nom} ${prenom}`);
    console.log(`   - Numéro: ${numeroMembre}`);
    
    await prisma.membre.create({
      data: {
        tenantId: '1',
        userId: user.id,
        nom,
        prenom,
        numeroMembre,
        telephone: `+237 6XX XX XX XX`,
        adresse: 'Yaoundé, Cameroun',
        dateAdhesion: new Date(),
        statut: 'ACTIF',
      },
    });
    
    console.log(`   ✓ Profil créé avec succès\n`);
  }
  
  console.log('🎉 Tous les profils membres ont été créés!');
  
  // Afficher le résumé
  const allMembres = await prisma.membre.findMany({
    where: { tenantId: '1' },
    include: {
      user: {
        select: { email: true, role: true },
      },
    },
  });
  
  console.log('\n📋 RÉSUMÉ DES MEMBRES:');
  console.log('========================');
  allMembres.forEach(m => {
    console.log(`${m.numeroMembre} - ${m.nom} ${m.prenom} (${m.user.email}) - ${m.statut}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
