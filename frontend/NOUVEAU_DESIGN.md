# Nouveau Design avec Sidebar - GestAsso

## Vue d'ensemble

Le nouveau design utilise une **sidebar latérale moderne** avec menu organisé par rubriques, similaire aux logiciels de gestion professionnels (style Matriix) mais avec un design moderne et épuré.

## Caractéristiques

### 1. Sidebar Moderne
- **Menu organisé par sections** : Tableau de Bord, Gestion des Membres, Modules Financiers, etc.
- **Icônes intuitives** : Chaque rubrique a une icône claire (Lucide React)
- **Collapsible** : La sidebar peut se réduire sur desktop (icône uniquement)
- **Responsive** : Menu mobile avec overlay sur petits écrans
- **Contrôle d'accès par rôle** : Les menus s'adaptent selon le rôle de l'utilisateur

### 2. Sections du Menu

#### Tableau de Bord
- Accueil (vue d'ensemble)

#### Gestion des Membres
- Membres (liste, création, modification)
- Situation Nette (calculs financiers par membre)

#### Modules Financiers
- Tontines (gestion complète des tontines)
- Prêts (octroi, remboursements, échéanciers)
- Épargnes (cotisations, redistributions)
- Caisses (mouvements, soldes, décharges)

#### Gestion & Aides
- Aides (maladie, décès)
- Projets (projets communautaires)
- Sanctions (configuration et application)
- Complément Fonds (calculs annuels)

#### Séances & Votes
- Séances (présences, cotisations, PV)
- Votes & Décisions (votes, signatures électroniques)

#### Rapports & Statistiques
- Rapports (bilans, exports PDF/Excel)
- Statistiques (analyses, projections)

#### Configuration
- Paramètres (configuration association)
- Notifications (préférences, historique)

### 3. Design System

#### Couleurs
- **Primary**: Gradient bleu-violet (`from-blue-500 to-purple-600`)
- **Success**: Vert (`green-500`)
- **Warning**: Jaune (`yellow-500`)
- **Danger**: Rouge (`red-500`)
- **Neutral**: Gris (`gray-50` à `gray-900`)

#### Composants
- **Cards**: Arrondis (`rounded-xl`), ombres subtiles (`shadow-sm`)
- **Buttons**: Gradients, hover effects, transitions fluides
- **Tables**: Hover states, badges colorés pour statuts
- **Stats**: KPI cards avec icônes et gradients

### 4. Dark Mode
- Support complet du dark mode
- Classes Tailwind `dark:` pour tous les composants
- Transitions fluides entre modes

## Structure des Fichiers

```
frontend/
├── components/
│   └── layout/
│       ├── sidebar.tsx              # Sidebar avec menu
│       └── dashboard-layout.tsx     # Layout wrapper
├── app/
│   └── (dashboard)/
│       ├── dashboard/
│       │   └── page.tsx            # Page d'accueil
│       ├── membres/
│       │   └── page.tsx            # Gestion membres
│       ├── tontines/
│       │   └── page.tsx            # Gestion tontines
│       ├── prets/
│       ├── epargnes/
│       ├── caisses/
│       ├── aides/
│       ├── projets/
│       ├── sanctions/
│       ├── seances/
│       ├── votes/
│       ├── rapports/
│       ├── statistiques/
│       └── parametres/
```

## Utilisation

### Créer une nouvelle page

```tsx
'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Icon } from 'lucide-react';

export default function MaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Mon Titre</h1>
        {/* Votre contenu ici */}
      </div>
    </DashboardLayout>
  );
}
```

### Contrôle d'accès par rôle

Dans `sidebar.tsx`, chaque item de menu peut avoir un tableau `roles`:

```tsx
{
  title: 'Paramètres',
  icon: Settings,
  href: '/parametres',
  roles: ['PRESIDENT'] // Visible uniquement pour le président
}
```

## Pages Créées

✅ **Dashboard** (`/dashboard`) - Vue d'ensemble avec stats et activités
✅ **Membres** (`/membres`) - Liste des membres avec filtres et recherche
✅ **Tontines** (`/tontines`) - Grille de tontines avec actions rapides

## Pages à Créer

- [ ] Prêts (`/prets`)
- [ ] Épargnes (`/epargnes`)
- [ ] Caisses (`/caisses`)
- [ ] Aides (`/aides`)
- [ ] Projets (`/projets`)
- [ ] Sanctions (`/sanctions`)
- [ ] Complément Fonds (`/complement-fonds`)
- [ ] Séances (`/seances`)
- [ ] Votes (`/votes`)
- [ ] Rapports (`/rapports`)
- [ ] Statistiques (`/statistiques`)
- [ ] Paramètres (`/parametres`)
- [ ] Notifications (`/notifications`)

## Responsive Design

### Desktop (≥1024px)
- Sidebar visible en permanence
- Largeur: 256px (non collapsed) ou 80px (collapsed)
- Bouton collapse en haut à droite de la sidebar

### Tablet (768px - 1023px)
- Sidebar visible en permanence
- Largeur: 256px
- Pas de collapse

### Mobile (<768px)
- Sidebar cachée par défaut
- Bouton menu hamburger en haut à gauche
- Sidebar en overlay avec fond sombre
- Fermeture au clic sur l'overlay ou sur un lien

## Prochaines Étapes

1. ✅ Créer la sidebar avec menu organisé
2. ✅ Créer le layout wrapper
3. ✅ Créer la page Dashboard
4. ✅ Créer la page Membres
5. ✅ Créer la page Tontines
6. 🔄 Créer les autres pages (Prêts, Épargnes, etc.)
7. 🔄 Connecter au backend (API calls)
8. 🔄 Ajouter les formulaires de création/modification
9. 🔄 Ajouter la pagination et les filtres avancés
10. 🔄 Ajouter les graphiques et statistiques

## Notes

- Le design est inspiré des logiciels de gestion modernes
- L'organisation par rubriques facilite la navigation
- Les couleurs et gradients rendent l'interface attractive
- Le dark mode améliore le confort visuel
- La structure est extensible pour ajouter de nouvelles fonctionnalités
