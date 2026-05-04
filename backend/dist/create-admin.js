"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔐 Création d\'un utilisateur admin...');
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
    }
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
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
        data: {
            tenantId: tenant.id,
            email: 'admin@test.com',
            password: hashedPassword,
            role: client_1.Role.PRESIDENT,
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
//# sourceMappingURL=create-admin.js.map