# Gestion Association Multi-Tenant

Application moderne de gestion d'association avec support multi-tenant, développée avec NestJS et Next.js.

## 🚀 Technologies

### Backend
- **NestJS** - Framework Node.js progressif
- **Prisma 6** - ORM moderne pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **TypeScript** - Typage statique

### Frontend
- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **Tailwind CSS 4** - Framework CSS utilitaire
- **Zustand** - Gestion d'état
- **Axios** - Client HTTP
- **TypeScript** - Typage statique

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos informations de base de données

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# Initialiser la base de données avec des données de test
npm run seed

# Démarrer le serveur de développement
npm run start:dev
```

Le backend sera accessible sur http://localhost:3000

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur http://localhost:3001

## 🔐 Authentification

### Compte de test
Après avoir exécuté `npm run seed` dans le backend, vous pouvez utiliser :

- **Email**: admin@test.com
- **Password**: Admin123!
- **Tenant ID**: 1

### Endpoints API

- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Rafraîchir le token

## 📁 Structure du projet

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma de base de données
│   │   ├── migrations/        # Migrations Prisma
│   │   └── seed.ts           # Script d'initialisation
│   ├── src/
│   │   ├── auth/             # Module d'authentification
│   │   ├── prisma/           # Service Prisma
│   │   └── main.ts           # Point d'entrée
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/           # Pages d'authentification
│   │   ├── (dashboard)/      # Pages du dashboard
│   │   ├── globals.css       # Styles globaux
│   │   └── layout.tsx        # Layout principal
│   ├── components/           # Composants réutilisables
│   ├── lib/
│   │   ├── api.ts           # Client API
│   │   └── utils.ts         # Utilitaires
│   ├── store/
│   │   └── auth.ts          # Store d'authentification
│   └── package.json
│
└── .kiro/
    └── specs/               # Spécifications du projet
```

## 🎯 Fonctionnalités

### Actuellement implémentées
- ✅ Authentification JWT avec refresh token
- ✅ Multi-tenant avec Row-Level Security
- ✅ Interface de connexion/inscription
- ✅ Dashboard administrateur
- ✅ Gestion des rôles (PRESIDENT, TRESORIER, SECRETAIRE, COMMISSAIRE, MEMBRE)

### À venir
- 🔄 Gestion des membres
- 🔄 Gestion des tontines (4 types)
- 🔄 Gestion des prêts (5 types)
- 🔄 Gestion des épargnes
- 🔄 Gestion des aides
- 🔄 Gestion des projets communautaires
- 🔄 Gestion des sanctions
- 🔄 Gestion des séances
- 🔄 Gestion de la caisse
- 🔄 Notifications
- 🔄 Audit logs

## 🛠️ Commandes utiles

### Backend
```bash
npm run start:dev    # Démarrer en mode développement
npm run build        # Compiler le projet
npm run start:prod   # Démarrer en production
npm run seed         # Initialiser la base de données
npx prisma studio    # Interface graphique pour la base de données
```

### Frontend
```bash
npm run dev          # Démarrer en mode développement
npm run build        # Compiler le projet
npm run start        # Démarrer en production
npm run lint         # Vérifier le code
```

## 📝 Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:Admin@localhost:5432/gestion_association"
JWT_SECRET="votre-secret-jwt-super-securise"
JWT_REFRESH_SECRET="votre-secret-refresh-super-securise"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🤝 Contribution

Ce projet suit une méthodologie de développement basée sur les spécifications. Consultez le dossier `.kiro/specs/` pour plus de détails.

## 📄 Licence

Propriétaire - Tous droits réservés
