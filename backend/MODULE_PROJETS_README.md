# Module Projets Communautaires

## Vue d'ensemble

Le module Projets gère les projets communautaires de l'association avec support pour les contributions volontaires et obligatoires, les projets éphémères, et le suivi d'avancement par phases.

## Fonctionnalités Implémentées

### 1. Création de Projets (Exigences: 16.1, 16.2)
- Création de projets avec nom, description, durée (COURT, MOYEN, LONG)
- Définition de l'objectif financier
- Configuration volontaire/obligatoire
- Support des projets éphémères (nouveaux membres exemptés)
- Définition de phases avec objectifs et dates limites

### 2. Enregistrement des Contributions (Exigences: 16.3, 16.5, 16.6)
- Enregistrement des contributions par membre
- Support contributions volontaires et obligatoires
- Vérification d'éligibilité pour projets éphémères
- Mise à jour automatique du montant collecté
- Traçabilité complète (membre, montant, date, type)

### 3. Suivi d'Avancement (Exigences: 16.4, 16.7)
- Calcul du pourcentage d'avancement global
- Calcul de l'avancement par phase
- Statistiques des contributeurs
- Montant moyen par contributeur
- Nombre total de contributions

### 4. Statistiques Globales
- Nombre total de projets
- Projets actifs vs terminés
- Montant total objectif vs collecté
- Taux de réussite global
- Nombre total de contributions

## Modèles de Données

### Projet
```typescript
{
  id: string
  tenantId: string
  nom: string
  description: string
  duree: DureeProjet (COURT | MOYEN | LONG)
  objectif: Decimal
  montantCollecte: Decimal
  ephemere: boolean
  obligatoire: boolean
  dateDebut: DateTime
  dateFin: DateTime?
  statut: string
  phases: PhaseProjet[]
  contributions: ContributionProjet[]
}
```

### PhaseProjet
```typescript
{
  id: string
  projetId: string
  nom: string
  objectif: Decimal
  dateLimite: DateTime
  ordre: number
}
```

### ContributionProjet
```typescript
{
  id: string
  projetId: string
  membreId: string
  montant: Decimal
  date: DateTime
  volontaire: boolean
}
```

## Endpoints API

### POST /projets
Créer un nouveau projet communautaire.

**Permissions**: PRESIDENT, TRESORIER, SECRETAIRE

**Body**:
```json
{
  "nom": "Construction Siège Social",
  "description": "Projet de construction du nouveau siège",
  "duree": "LONG",
  "objectif": 50000000,
  "ephemere": false,
  "obligatoire": true,
  "dateDebut": "2026-01-01",
  "dateFin": "2027-12-31"
}
```

**Response**: Projet créé avec phases

---

### GET /projets
Obtenir tous les projets du tenant.

**Permissions**: Tous les rôles

**Response**:
```json
[
  {
    "id": "uuid",
    "nom": "Construction Siège Social",
    "description": "...",
    "duree": "LONG",
    "objectif": "50000000",
    "montantCollecte": "32500000",
    "ephemere": false,
    "obligatoire": true,
    "statut": "ACTIF",
    "dateDebut": "2026-01-01T00:00:00.000Z",
    "pourcentageAvancement": 65.0,
    "nombreContributeurs": 45,
    "phases": [...],
    "contributions": [...]
  }
]
```

---

### GET /projets/statistiques/global
Obtenir les statistiques globales des projets.

**Permissions**: PRESIDENT, TRESORIER, SECRETAIRE

**Response**:
```json
{
  "total": 5,
  "actifs": 3,
  "termines": 2,
  "montantTotalObjectif": "100000000",
  "montantTotalCollecte": "75000000",
  "nombreContributions": 250,
  "tauxReussite": 75.0
}
```

---

### GET /projets/:id
Obtenir les détails d'un projet.

**Permissions**: Tous les rôles

**Response**: Projet avec phases et contributions détaillées

---

### POST /projets/:id/contribuer
Enregistrer une contribution à un projet.

**Permissions**: PRESIDENT, TRESORIER, SECRETAIRE

**Body**:
```json
{
  "membreId": "uuid",
  "montant": 100000,
  "volontaire": false
}
```

**Response**: Contribution créée

**Validations**:
- Projet doit exister
- Membre doit exister
- Si projet éphémère: vérifier éligibilité du membre
- Montant doit être > 0

---

### GET /projets/:id/avancement
Obtenir l'avancement détaillé d'un projet.

**Permissions**: Tous les rôles

**Response**:
```json
{
  "projet": {
    "id": "uuid",
    "nom": "Construction Siège Social",
    "objectif": "50000000",
    "montantCollecte": "32500000",
    "pourcentageGlobal": 65.0,
    "statut": "ACTIF"
  },
  "phases": [
    {
      "id": "uuid",
      "nom": "Phase 1: Fondations",
      "objectif": "15000000",
      "montantCollecte": "15000000",
      "pourcentage": 100.0,
      "dateLimite": "2026-06-30T00:00:00.000Z"
    }
  ],
  "contributeurs": [
    {
      "membre": {
        "id": "uuid",
        "nom": "Dupont",
        "prenom": "Jean"
      },
      "montantTotal": "500000"
    }
  ],
  "statistiques": {
    "nombreContributeurs": 45,
    "montantMoyen": "722222.22",
    "nombreContributions": 120
  }
}
```

## Règles de Gestion

### Projets Éphémères
- Les membres ayant adhéré **après** le début du projet sont exemptés
- Seules les contributions volontaires sont acceptées pour ces membres
- Les membres existants doivent contribuer si le projet est obligatoire

### Projets Obligatoires vs Volontaires
- **Obligatoire**: Tous les membres actifs doivent contribuer
- **Volontaire**: Les contributions sont optionnelles

### Durée des Projets
- **COURT**: < 6 mois
- **MOYEN**: 6-18 mois
- **LONG**: > 18 mois

### Calcul de l'Avancement
```
Pourcentage = (Montant Collecté / Objectif) × 100
```

## Intégrations

### Avec Module Membres
- Vérification de l'existence du membre
- Vérification de la date d'adhésion pour projets éphémères
- Calcul de l'éligibilité

### Avec Module Caisses (Future)
- Crédit automatique d'une caisse projet
- Traçabilité des mouvements

## Tests

### Tests Unitaires
```bash
npm run test -- projets.service.spec.ts
```

### Tests d'Intégration
```bash
npm run test:e2e -- projets.e2e-spec.ts
```

## Exemples d'Utilisation

### Créer un Projet Long Terme
```typescript
const projet = await projetsService.create(tenantId, {
  nom: 'Construction Siège Social',
  description: 'Projet de construction du nouveau siège',
  duree: DureeProjet.LONG,
  objectif: 50000000,
  ephemere: false,
  obligatoire: true,
  dateDebut: '2026-01-01',
  dateFin: '2027-12-31',
});
```

### Enregistrer une Contribution
```typescript
const contribution = await projetsService.contribuer(tenantId, projetId, {
  membreId: 'uuid',
  montant: 100000,
  volontaire: false,
});
```

### Obtenir l'Avancement
```typescript
const avancement = await projetsService.getAvancement(tenantId, projetId);
console.log(`Progression: ${avancement.projet.pourcentageGlobal}%`);
```

## Améliorations Futures

1. **Phases avec Contributions Liées**
   - Lier les contributions aux phases spécifiques
   - Calculer l'avancement réel par phase

2. **Notifications Automatiques**
   - Rappels pour contributions obligatoires
   - Notifications de fin de phase
   - Alertes d'objectif atteint

3. **Rapports Détaillés**
   - Export PDF des rapports de projet
   - Graphiques d'évolution
   - Comparaison entre projets

4. **Gestion des Dépenses**
   - Enregistrement des dépenses par phase
   - Suivi budget vs dépenses réelles
   - Calcul du solde disponible

## Notes Techniques

### Précision Financière
- Utilisation de `Decimal` pour tous les montants
- Précision: 15 chiffres, 2 décimales
- Pas d'arrondis intermédiaires

### Performance
- Index sur `tenantId` pour isolation
- Index sur `statut` pour filtrage
- Pagination recommandée pour grandes listes

### Sécurité
- Isolation multi-tenant stricte
- Validation des permissions par rôle
- Validation des données d'entrée

---

**Date de création**: 23 Avril 2026  
**Version**: 1.0  
**Statut**: ✅ Implémenté et testé
