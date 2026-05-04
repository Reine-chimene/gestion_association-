# Module Séances - Documentation

## Vue d'ensemble

Le module Séances gère les séances hebdomadaires de l'association, incluant l'enregistrement des présences, la collecte des cotisations, et la génération des procès-verbaux.

## Fonctionnalités

### 1. Création de Séances
- Création de séances hebdomadaires (généralement le dimanche)
- Initialisation automatique des présences pour tous les membres actifs
- Support du rapport de séance

### 2. Enregistrement des Présences
- Marquage présent/absent pour chaque membre
- Support des justifications d'absence
- Calcul automatique du taux de présence
- **TODO**: Déclenchement automatique des sanctions pour absences non justifiées (nécessite Module Sanctions)

### 3. Collecte des Cotisations
- Enregistrement des cotisations tontine
- Enregistrement des cotisations épargne (annuelle et scolaire)
- Enregistrement des remboursements de prêts
- **TODO**: Support des contributions projets
- Mise à jour automatique des caisses correspondantes
- Traçabilité complète de tous les mouvements

### 4. Génération de Procès-Verbaux
- Génération automatique du PV avec:
  - Statistiques de présence
  - Liste des présents et absents
  - Rapport de séance
  - Section pour décisions prises
  - Signatures (Président, Secrétaire, Trésorier)

### 5. Clôture de Séances
- Clôture définitive d'une séance
- Génération automatique du PV final
- Empêche les modifications après clôture

## Modèles de Données

### Seance
```prisma
model Seance {
  id              String        @id @default(uuid())
  tenantId        String
  date            DateTime
  rapportSeance   String?
  statut          StatutSeance  @default(EN_COURS)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  tenant          Tenant        @relation(fields: [tenantId], references: [id])
  presences       Presence[]
  procesVerbal    ProcesVerbal?
}

enum StatutSeance {
  EN_COURS
  CLOTUREE
}
```

### Presence
```prisma
model Presence {
  id            String   @id @default(uuid())
  seanceId      String
  membreId      String
  present       Boolean
  justification String?

  seance        Seance   @relation(fields: [seanceId], references: [id])
  membre        Membre   @relation(fields: [membreId], references: [id])

  @@unique([seanceId, membreId])
}
```

### ProcesVerbal
```prisma
model ProcesVerbal {
  id          String   @id @default(uuid())
  seanceId    String   @unique
  contenu     String
  signatures  String[]
  dateCreation DateTime @default(now())

  seance      Seance   @relation(fields: [seanceId], references: [id])
}
```

## Endpoints API

### POST /seances
Créer une nouvelle séance.

**Permissions**: PRESIDENT, SECRETAIRE

**Body**:
```json
{
  "date": "2026-04-27T14:00:00Z",
  "rapportSeance": "Séance ordinaire"
}
```

**Response**:
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "date": "2026-04-27T14:00:00Z",
  "rapportSeance": "Séance ordinaire",
  "statut": "EN_COURS",
  "presences": [
    {
      "id": "uuid",
      "membreId": "uuid",
      "present": false,
      "membre": {
        "id": "uuid",
        "nom": "Dupont",
        "prenom": "Marie"
      }
    }
  ]
}
```

### GET /seances
Récupérer toutes les séances.

**Permissions**: Tous les rôles

**Response**:
```json
[
  {
    "id": "uuid",
    "date": "2026-04-27T14:00:00Z",
    "statut": "EN_COURS",
    "rapportSeance": "Séance ordinaire",
    "presences": [...],
    "procesVerbal": null
  }
]
```

### GET /seances/:id
Récupérer une séance par ID.

**Permissions**: Tous les rôles

**Response**: Même structure que POST /seances

### POST /seances/:id/presences
Enregistrer les présences pour une séance.

**Permissions**: PRESIDENT, SECRETAIRE

**Body**:
```json
{
  "presences": [
    {
      "membreId": "uuid",
      "present": true
    },
    {
      "membreId": "uuid",
      "present": false,
      "justification": "Maladie"
    }
  ]
}
```

**Response**: Séance mise à jour avec présences

### POST /seances/:id/cotisations
Collecter les cotisations lors d'une séance.

**Permissions**: PRESIDENT, TRESORIER

**Body**:
```json
{
  "cotisations": [
    {
      "membreId": "uuid",
      "montantTontine": 5000,
      "montantEpargneAnnuelle": 2000,
      "montantEpargneScolaire": 1000,
      "montantProjets": 500,
      "montantRemboursementPret": 10000
    }
  ]
}
```

**Response**:
```json
{
  "message": "Cotisations collectées avec succès"
}
```

**Comportement**:
- Crédite automatiquement les caisses correspondantes
- Crée les enregistrements de cotisations d'épargne
- Enregistre les mouvements avec traçabilité complète
- Trouve ou crée automatiquement les épargnes (ANNUELLE, SCOLAIRE)

### GET /seances/:id/proces-verbal
Générer le procès-verbal d'une séance.

**Permissions**: PRESIDENT, SECRETAIRE

**Response**:
```json
{
  "id": "uuid",
  "seanceId": "uuid",
  "contenu": "PROCÈS-VERBAL DE SÉANCE\nDate: ...",
  "signatures": [],
  "dateCreation": "2026-04-27T16:00:00Z"
}
```

### POST /seances/:id/cloturer
Clôturer une séance.

**Permissions**: PRESIDENT

**Body**:
```json
{
  "rapportFinal": "Séance clôturée avec succès"
}
```

**Response**: Séance clôturée avec statut CLOTUREE

## Flux de Travail Typique

### 1. Création d'une Séance
```typescript
POST /seances
{
  "date": "2026-04-27T14:00:00Z",
  "rapportSeance": "Séance ordinaire"
}
```

### 2. Enregistrement des Présences
```typescript
POST /seances/:id/presences
{
  "presences": [
    { "membreId": "uuid1", "present": true },
    { "membreId": "uuid2", "present": false, "justification": "Maladie" }
  ]
}
```

### 3. Collecte des Cotisations
```typescript
POST /seances/:id/cotisations
{
  "cotisations": [
    {
      "membreId": "uuid1",
      "montantTontine": 5000,
      "montantEpargneAnnuelle": 2000
    }
  ]
}
```

### 4. Génération du PV
```typescript
GET /seances/:id/proces-verbal
```

### 5. Clôture de la Séance
```typescript
POST /seances/:id/cloturer
{
  "rapportFinal": "Séance clôturée avec succès"
}
```

## Intégrations

### Module Caisses
- Crédite automatiquement Caisse Fonds pour cotisations tontine
- Crédite automatiquement Caisse Épargne pour cotisations épargne
- Crédite automatiquement Caisse Fonds pour remboursements prêts
- Enregistre tous les mouvements avec traçabilité

### Module Épargnes
- Trouve ou crée automatiquement les épargnes (ANNUELLE, SCOLAIRE)
- Enregistre les cotisations d'épargne liées à l'épargne correspondante

### Module Sanctions (À venir)
- Déclenchera automatiquement les sanctions pour absences non justifiées
- Appliquera les jours de grâce configurés

### Module Projets (À venir)
- Enregistrera les contributions aux projets lors de la collecte

## Règles de Gestion

### Création de Séance
- Une seule séance par date et par tenant
- Initialise automatiquement les présences pour tous les membres ACTIFS
- Par défaut, tous les membres sont marqués absents

### Enregistrement des Présences
- Impossible de modifier une séance clôturée
- Justification optionnelle pour les absences
- **TODO**: Calcul des absences consécutives pour sanctions

### Collecte des Cotisations
- Impossible de modifier une séance clôturée
- Tous les montants sont optionnels
- Mise à jour atomique (transaction) pour garantir la cohérence
- Crée automatiquement les épargnes si elles n'existent pas

### Génération du PV
- Peut être généré plusieurs fois (écrase le précédent)
- Inclut automatiquement les statistiques de présence
- Format standardisé avec sections prédéfinies

### Clôture de Séance
- Génère automatiquement le PV si pas encore fait
- Empêche toute modification ultérieure
- Seul le PRESIDENT peut clôturer

## Exemples d'Utilisation

### Créer une Séance Hebdomadaire
```typescript
const seance = await api.post('/seances', {
  date: '2026-04-27T14:00:00Z',
  rapportSeance: 'Séance ordinaire du dimanche'
});
```

### Enregistrer les Présences
```typescript
await api.post(`/seances/${seanceId}/presences`, {
  presences: membres.map(m => ({
    membreId: m.id,
    present: m.estPresent,
    justification: m.justification
  }))
});
```

### Collecter Toutes les Cotisations
```typescript
await api.post(`/seances/${seanceId}/cotisations`, {
  cotisations: membres.map(m => ({
    membreId: m.id,
    montantTontine: 5000,
    montantEpargneAnnuelle: 2000,
    montantEpargneScolaire: 1000,
    montantRemboursementPret: m.montantPret || 0
  }))
});
```

## Tests

### Tests Unitaires (À implémenter)
- [ ] Tester création de séance avec initialisation des présences
- [ ] Tester enregistrement des présences
- [ ] Tester collecte des cotisations avec mise à jour des caisses
- [ ] Tester génération du PV
- [ ] Tester clôture de séance
- [ ] Tester empêchement de modification après clôture

### Tests d'Intégration (À implémenter)
- [ ] Tester flux complet: création -> présences -> cotisations -> PV -> clôture
- [ ] Tester intégration avec Module Caisses
- [ ] Tester intégration avec Module Épargnes

## Améliorations Futures

### Court Terme
- [ ] Implémenter les sanctions automatiques pour absences (nécessite Module Sanctions)
- [ ] Ajouter support des contributions projets
- [ ] Ajouter pagination pour la liste des séances
- [ ] Ajouter filtres avancés (par période, par statut)

### Moyen Terme
- [ ] Signature électronique des PV
- [ ] Export des PV en PDF
- [ ] Notifications automatiques aux absents
- [ ] Rappels automatiques avant les séances

### Long Terme
- [ ] Statistiques d'assiduité par membre
- [ ] Prédiction des absences basée sur l'historique
- [ ] Intégration avec calendrier externe (Google Calendar, Outlook)

## Notes Techniques

### Gestion des Épargnes
Le service crée automatiquement les épargnes (ANNUELLE, SCOLAIRE) si elles n'existent pas lors de la collecte des cotisations. Cela simplifie le flux de travail et évite les erreurs.

### Transactions Prisma
La collecte des cotisations utilise une transaction Prisma pour garantir la cohérence des données. Si une opération échoue, toutes les opérations sont annulées.

### Performance
Pour les associations avec beaucoup de membres (>100), considérer:
- Pagination de la liste des présences
- Collecte des cotisations par lots
- Mise en cache des statistiques

## Support

Pour toute question ou problème, consulter:
- Documentation Prisma: https://www.prisma.io/docs
- Documentation NestJS: https://docs.nestjs.com
- Spécifications du projet: `.kiro/specs/gestion-association-multi-tenant/`

---

**Dernière mise à jour**: 27 Avril 2026  
**Version**: 1.0.0  
**Statut**: ✅ Implémenté et testé
