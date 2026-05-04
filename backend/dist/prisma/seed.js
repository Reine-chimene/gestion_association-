"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
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
//# sourceMappingURL=seed.js.map