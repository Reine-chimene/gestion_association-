# Module Dépôts en Ligne

## Vue d'Ensemble

Le module **Dépôts en Ligne** permet aux membres de l'association de soumettre leurs cotisations à distance via Orange Money ou MTN Mobile Money lorsqu'ils ne peuvent pas assister physiquement aux séances.

## Fonctionnalités

### Pour les Membres

1. **Soumettre un dépôt en ligne**
   - Choisir le type de cotisation (Tontine, Épargne, Projet, Complément Fonds)
   - Indiquer le montant
   - Sélectionner l'opérateur (Orange Money ou MTN Money)
   - Fournir un motif d'absence
   - Joindre une preuve de paiement (capture d'écran)

2. **Consulter l'historique des dépôts**
   - Voir tous les dépôts soumis
   - Statut de chaque dépôt (En attente, Validé, Rejeté)
   - Date de soumission et de validation

### Pour les Administrateurs

1. **Valider ou rejeter les dépôts**
   - Consulter la liste des dépôts en attente
   - Voir la preuve de paiement
   - Valider ou rejeter avec motif

2. **Statistiques**
   - Nombre de dépôts en attente
   - Nombre de dépôts validés
   - Nombre de dépôts rejetés
   - Montant total des dépôts validés

## Endpoints API

### POST /depots-en-ligne
Créer un nouveau dépôt en ligne (accessible à tous les membres authentifiés)

**Body:**
```json
{
  "membreId": "uuid",
  "type": "TONTINE",
  "montant": 50000,
  "operateur": "ORANGE_MONEY",
  "motifAbsence": "Voyage professionnel",
  "preuveUrl": "https://exemple.com/preuve.jpg"
}
```

**Response:**
```json
{
  "id": "uuid",
  "membreId": "uuid",
  "type": "TONTINE",
  "montant": 50000,
  "preuveUrl": "https://exemple.com/preuve.jpg",
  "motifAbsence": "Voyage professionnel",
  "statut": "EN_ATTENTE_VALIDATION",
  "dateDepot": "2026-04-22T10:00:00Z",
  "membre": {
    "numeroMembre": "M0001",
    "nom": "Dupont",
    "prenom": "Jean"
  }
}
```

### GET /depots-en-ligne/en-attente
Obtenir tous les dépôts en attente de validation (PRESIDENT, TRESORIER, SECRETAIRE uniquement)

**Response:**
```json
[
  {
    "id": "uuid",
    "membreId": "uuid",
    "type": "TONTINE",
    "montant": 50000,
    "preuveUrl": "https://exemple.com/preuve.jpg",
    "motifAbsence": "Voyage professionnel",
    "statut": "EN_ATTENTE_VALIDATION",
    "dateDepot": "2026-04-22T10:00:00Z",
    "membre": {
      "numeroMembre": "M0001",
      "nom": "Dupont",
      "prenom": "Jean",
      "telephone": "+237600000000"
    }
  }
]
```

### GET /depots-en-ligne/membre/:membreId
Obtenir les dépôts d'un membre spécifique

**Response:**
```json
[
  {
    "id": "uuid",
    "membreId": "uuid",
    "type": "TONTINE",
    "montant": 50000,
    "preuveUrl": "https://exemple.com/preuve.jpg",
    "motifAbsence": "Voyage professionnel",
    "statut": "VALIDE",
    "dateDepot": "2026-04-22T10:00:00Z",
    "dateValidation": "2026-04-22T14:00:00Z",
    "validateurId": "uuid"
  }
]
```

### POST /depots-en-ligne/:id/valider
Valider ou rejeter un dépôt (PRESIDENT, TRESORIER uniquement)

**Body:**
```json
{
  "action": "VALIDER",
  "validateurId": "uuid",
  "motifRejet": "Preuve de paiement invalide" // Optionnel, obligatoire si action = REJETER
}
```

**Response:**
```json
{
  "id": "uuid",
  "membreId": "uuid",
  "type": "TONTINE",
  "montant": 50000,
  "preuveUrl": "https://exemple.com/preuve.jpg",
  "motifAbsence": "Voyage professionnel",
  "statut": "VALIDE",
  "dateDepot": "2026-04-22T10:00:00Z",
  "dateValidation": "2026-04-22T14:00:00Z",
  "validateurId": "uuid",
  "membre": {
    "numeroMembre": "M0001",
    "nom": "Dupont",
    "prenom": "Jean"
  }
}
```

### GET /depots-en-ligne/statistiques
Obtenir les statistiques des dépôts (PRESIDENT, TRESORIER, SECRETAIRE uniquement)

**Response:**
```json
{
  "enAttente": 5,
  "valides": 120,
  "rejetes": 3,
  "totalMontant": 6000000
}
```

## Modèle de Données

```prisma
model DepotEnLigne {
  id              String        @id @default(uuid())
  membreId        String
  type            String        // TONTINE, EPARGNE, PROJET, COMPLEMENT_FONDS
  montant         Decimal       @db.Decimal(15, 2)
  preuveUrl       String        // URL de la capture d'écran
  motifAbsence    String        // Raison de l'absence à la séance
  statut          StatutDepot   @default(EN_ATTENTE_VALIDATION)
  dateDepot       DateTime      @default(now())
  dateValidation  DateTime?
  validateurId    String?

  membre          Membre        @relation(fields: [membreId], references: [id])

  @@map("depots_en_ligne")
}

enum StatutDepot {
  EN_ATTENTE_VALIDATION
  VALIDE
  REJETE
}
```

## Workflow

1. **Membre absent à une séance**
   - Le membre effectue son paiement via Orange Money ou MTN Money
   - Il prend une capture d'écran de la transaction
   - Il se connecte à son espace membre
   - Il clique sur "Nouveau Dépôt"
   - Il remplit le formulaire avec tous les détails
   - Il soumet le dépôt

2. **Validation par l'administrateur**
   - L'administrateur (Président ou Trésorier) se connecte
   - Il consulte la liste des dépôts en attente
   - Il vérifie la preuve de paiement
   - Il valide ou rejette le dépôt

3. **Crédit automatique de la caisse** (À implémenter)
   - Lorsqu'un dépôt est validé, le montant est automatiquement crédité dans la caisse correspondante
   - Un mouvement de caisse est créé avec le motif "Dépôt en ligne validé"

## Sécurité

- **Authentification JWT** : Tous les endpoints nécessitent une authentification
- **Contrôle d'accès par rôle** : 
  - Membres : Peuvent créer des dépôts et consulter leur historique
  - Administrateurs : Peuvent valider/rejeter les dépôts et consulter les statistiques
- **Isolation multi-tenant** : Chaque dépôt est lié à un membre qui appartient à un tenant spécifique

## Améliorations Futures

1. **Intégration avec les APIs de paiement**
   - Vérification automatique des transactions Orange Money
   - Vérification automatique des transactions MTN Money

2. **Upload de fichiers**
   - Permettre l'upload direct de la capture d'écran
   - Stockage sécurisé des preuves de paiement

3. **Notifications**
   - Notifier le membre lorsque son dépôt est validé ou rejeté
   - Notifier les administrateurs lorsqu'un nouveau dépôt est soumis

4. **Crédit automatique de caisse**
   - Intégrer avec le module Caisses pour créditer automatiquement lors de la validation

## Tests

### Tests Unitaires
```bash
npm run test
```

### Tests d'Intégration
```bash
npm run test:e2e
```

## Utilisation

### Exemple de création de dépôt (Frontend)
```typescript
const handleDepotSubmit = async () => {
  try {
    const response = await api.post('/depots-en-ligne', {
      membreId: currentMembre.id,
      type: 'TONTINE',
      montant: 50000,
      operateur: 'ORANGE_MONEY',
      motifAbsence: 'Voyage professionnel',
      preuveUrl: 'https://imgur.com/abc123.jpg',
    });
    
    console.log('Dépôt créé:', response.data);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Exemple de validation de dépôt (Frontend Admin)
```typescript
const handleValiderDepot = async (depotId: string) => {
  try {
    const response = await api.post(`/depots-en-ligne/${depotId}/valider`, {
      action: 'VALIDER',
      validateurId: currentUser.id,
    });
    
    console.log('Dépôt validé:', response.data);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## Support

Pour toute question ou problème, contactez l'équipe de développement.
