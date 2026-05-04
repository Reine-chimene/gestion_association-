# Module Complément Fonds - Documentation Complète

## Vue d'ensemble

Le module **Complément Fonds** gère le calcul et la collecte annuelle du complément fonds, qui est une contribution supplémentaire demandée aux membres pour couvrir les dépenses prévisionnelles de l'association.

## Fonctionnalités Principales

### 1. Calcul Annuel du Complément Fonds
- Définition du montant total basé sur les dépenses prévisionnelles
- Répartition équitable entre tous les membres actifs
- Calcul automatique du montant par membre

### 2. Suivi des Paiements
- Enregistrement des paiements individuels
- Suivi du statut de paiement par membre (PAYE, PARTIEL, IMPAYE)
- Statistiques de recouvrement en temps réel

### 3. Prélèvement Automatique
- Prélèvement automatique lors de la distribution de tontine
- Intégration transparente avec le module Tontines
- Crédit automatique de la Caisse Fonds

### 4. Gestion du Statut
- **ACTIF** : Complément fonds en cours de collecte
- **AUGMENTE** : Montant augmenté après décision
- **CASSE** : Complément fonds annulé avec remboursement

### 5. Augmentation et Cassation
- Possibilité d'augmenter le montant total
- Recalcul automatique du montant par membre
- Cassation avec remboursement automatique des paiements

## Modèles de Données

### ComplementFonds
```prisma
model ComplementFonds {
  id                String   @id @default(uuid())
  tenantId          String
  annee             Int
  montantTotal      Decimal  @db.Decimal(15, 2)
  montantParMembre  Decimal  @db.Decimal(15, 2)
  statut            StatutComplementFonds @default(ACTIF)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  paiements         PaiementComplementFonds[]

  @@unique([tenantId, annee])
}
```

### PaiementComplementFonds
```prisma
model PaiementComplementFonds {
  id                  String          @id @default(uuid())
  complementFondsId   String
  membreId            String
  montant             Decimal         @db.Decimal(15, 2)
  datePaiement        DateTime        @default(now())
  modePaiement        ModePaiementComplement @default(PRELEVEMENT_AUTO)

  complementFonds     ComplementFonds @relation(fields: [complementFondsId], references: [id])
  membre              Membre          @relation(fields: [membreId], references: [id])
}
```

### Enums
```prisma
enum StatutComplementFonds {
  ACTIF
  AUGMENTE
  CASSE
}

enum ModePaiementComplement {
  PRELEVEMENT_AUTO
  PAIEMENT_MANUEL
}
```

## Endpoints API

### 1. Calculer le Complément Fonds Annuel
**POST** `/complement-fonds/calculer`

**Rôles autorisés** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "annee": 2026,
  "montantTotal": 500000,
  "montantParMembre": 10000
}
```

**Réponse** :
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "annee": 2026,
  "montantTotal": 500000,
  "montantParMembre": 10000,
  "statut": "ACTIF",
  "nombreMembresActifs": 50,
  "createdAt": "2026-04-27T10:00:00Z",
  "updatedAt": "2026-04-27T10:00:00Z"
}
```

**Logique** :
- Vérifie qu'aucun complément n'existe déjà pour cette année
- Compte les membres actifs
- Calcule le montant par membre (montantTotal / nombreMembresActifs)
- Crée le complément fonds avec statut ACTIF

---

### 2. Obtenir Tous les Compléments Fonds
**GET** `/complement-fonds?annee=2026&statut=ACTIF&limit=50&offset=0`

**Rôles autorisés** : PRESIDENT, TRESORIER, SECRETAIRE

**Query Parameters** :
- `annee` (optionnel) : Filtrer par année
- `statut` (optionnel) : Filtrer par statut (ACTIF, AUGMENTE, CASSE)
- `limit` (optionnel, défaut: 50) : Nombre de résultats
- `offset` (optionnel, défaut: 0) : Pagination

**Réponse** :
```json
{
  "complementFonds": [
    {
      "id": "uuid",
      "annee": 2026,
      "montantTotal": 500000,
      "montantParMembre": 10000,
      "statut": "ACTIF",
      "nombrePaiements": 25,
      "paiements": [...]
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### 3. Obtenir un Complément Fonds par ID
**GET** `/complement-fonds/:id`

**Rôles autorisés** : PRESIDENT, TRESORIER, SECRETAIRE

**Réponse** :
```json
{
  "id": "uuid",
  "annee": 2026,
  "montantTotal": 500000,
  "montantParMembre": 10000,
  "statut": "ACTIF",
  "paiements": [
    {
      "id": "uuid",
      "membreId": "uuid",
      "montant": 10000,
      "datePaiement": "2026-04-27T10:00:00Z",
      "modePaiement": "PRELEVEMENT_AUTO",
      "membre": {
        "id": "uuid",
        "nom": "Dupont",
        "prenom": "Jean",
        "numeroMembre": "M0001"
      }
    }
  ]
}
```

---

### 4. Obtenir le Suivi des Paiements
**GET** `/complement-fonds/:id/suivi-paiements`

**Rôles autorisés** : PRESIDENT, TRESORIER, SECRETAIRE

**Réponse** :
```json
{
  "complementFonds": {
    "id": "uuid",
    "annee": 2026,
    "montantTotal": 500000,
    "montantParMembre": 10000,
    "statut": "ACTIF"
  },
  "suiviPaiements": [
    {
      "membre": {
        "id": "uuid",
        "nom": "Dupont",
        "prenom": "Jean",
        "numeroMembre": "M0001"
      },
      "montantDu": 10000,
      "montantPaye": 10000,
      "montantRestant": 0,
      "statut": "PAYE",
      "nombrePaiements": 1,
      "dernierPaiement": "2026-04-27T10:00:00Z"
    },
    {
      "membre": {
        "id": "uuid",
        "nom": "Martin",
        "prenom": "Marie",
        "numeroMembre": "M0002"
      },
      "montantDu": 10000,
      "montantPaye": 5000,
      "montantRestant": 5000,
      "statut": "PARTIEL",
      "nombrePaiements": 1,
      "dernierPaiement": "2026-04-27T11:00:00Z"
    }
  ],
  "statistiques": {
    "nombreMembres": 50,
    "totalPaye": 350000,
    "totalRestant": 150000,
    "tauxRecouvrement": 70,
    "nombrePayes": 35,
    "nombrePartiels": 10,
    "nombreImpayes": 5
  }
}
```

**Logique** :
- Récupère tous les membres actifs
- Pour chaque membre, calcule le montant payé, restant et le statut
- Génère des statistiques globales de recouvrement

---

### 5. Enregistrer un Paiement
**POST** `/complement-fonds/:id/paiements`

**Rôles autorisés** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "membreId": "uuid",
  "montant": 10000,
  "modePaiement": "PAIEMENT_MANUEL"
}
```

**Réponse** :
```json
{
  "paiement": {
    "id": "uuid",
    "complementFondsId": "uuid",
    "membreId": "uuid",
    "montant": 10000,
    "datePaiement": "2026-04-27T10:00:00Z",
    "modePaiement": "PAIEMENT_MANUEL",
    "membre": {
      "id": "uuid",
      "nom": "Dupont",
      "prenom": "Jean",
      "numeroMembre": "M0001"
    }
  },
  "montantDejaPaye": 10000,
  "montantRestant": 0
}
```

**Logique** :
- Vérifie que le complément fonds n'est pas cassé
- Vérifie que le membre existe et est actif
- Calcule le montant déjà payé par le membre
- Vérifie que le montant ne dépasse pas le montant restant
- Enregistre le paiement
- **Crédite automatiquement la Caisse Fonds**

---

### 6. Augmenter le Complément Fonds
**PUT** `/complement-fonds/:id/augmenter`

**Rôles autorisés** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "nouveauMontantTotal": 600000
}
```

**Réponse** :
```json
{
  "id": "uuid",
  "annee": 2026,
  "montantTotal": 600000,
  "montantParMembre": 12000,
  "statut": "AUGMENTE",
  "ancienMontantTotal": 500000,
  "ancienMontantParMembre": 10000,
  "augmentation": 100000
}
```

**Logique** :
- Vérifie que le complément fonds n'est pas cassé
- Vérifie que le nouveau montant est supérieur à l'ancien
- Compte les membres actifs
- Recalcule le montant par membre
- Met à jour le statut à AUGMENTE

---

### 7. Casser le Complément Fonds
**PUT** `/complement-fonds/:id/casser`

**Rôles autorisés** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "motif": "Décision de l'assemblée générale"
}
```

**Réponse** :
```json
{
  "id": "uuid",
  "annee": 2026,
  "montantTotal": 500000,
  "montantParMembre": 10000,
  "statut": "CASSE",
  "montantRembourse": 350000,
  "nombrePaiementsRembourses": 35,
  "motif": "Décision de l'assemblée générale"
}
```

**Logique** :
- Vérifie que le complément fonds n'est pas déjà cassé
- Calcule le montant total des paiements déjà effectués
- **Débite la Caisse Fonds pour rembourser les paiements**
- Met à jour le statut à CASSE

---

## Intégrations

### 1. Module Caisses
- **Crédit automatique** lors de l'enregistrement d'un paiement
- **Débit automatique** lors de la cassation (remboursement)

### 2. Module Tontines
- **Prélèvement automatique** lors de la distribution de tontine
- Méthode `preleverAutomatique()` appelée par le module Tontines
- Vérifie si le membre a déjà payé son complément fonds
- Prélève le montant restant automatiquement

### 3. Module Membres
- Vérifie que seuls les membres actifs sont concernés
- Calcul du montant par membre basé sur le nombre de membres actifs

## Méthode de Prélèvement Automatique

```typescript
async preleverAutomatique(
  tenantId: string,
  membreId: string,
  annee: number,
): Promise<{ montant: number; complementFondsId: string } | null>
```

**Utilisée par** : Module Tontines lors de la distribution de cagnotte

**Logique** :
1. Trouve le complément fonds actif pour l'année
2. Vérifie si le membre a déjà payé
3. Calcule le montant restant
4. Enregistre le prélèvement automatique
5. Retourne le montant prélevé ou null si déjà payé

**Exemple d'utilisation dans Tontines** :
```typescript
// Lors de la distribution de tontine
const prelevement = await this.complementFondsService.preleverAutomatique(
  tenantId,
  beneficiaireId,
  new Date().getFullYear(),
);

if (prelevement) {
  // Déduire le montant de la cagnotte
  montantNet = montantNet.minus(prelevement.montant);
}
```

## Règles de Gestion

### 1. Unicité
- Un seul complément fonds par année et par tenant
- Contrainte unique sur `(tenantId, annee)`

### 2. Calcul du Montant par Membre
- Montant par membre = Montant total / Nombre de membres actifs
- Recalculé automatiquement lors de l'augmentation

### 3. Statuts
- **ACTIF** : Complément fonds en cours de collecte
- **AUGMENTE** : Montant augmenté, collecte continue
- **CASSE** : Annulé, remboursement effectué, plus de collecte possible

### 4. Paiements
- Un membre peut payer en plusieurs fois (paiements partiels)
- Le montant total des paiements ne peut pas dépasser le montant dû
- Deux modes de paiement : PRELEVEMENT_AUTO, PAIEMENT_MANUEL

### 5. Remboursement
- Lors de la cassation, tous les paiements sont remboursés
- Le remboursement débite la Caisse Fonds

## Statistiques Disponibles

### Par Complément Fonds
- Nombre de paiements enregistrés
- Montant total collecté
- Montant restant à collecter
- Taux de recouvrement (%)

### Par Membre
- Montant dû
- Montant payé
- Montant restant
- Statut (PAYE, PARTIEL, IMPAYE)
- Nombre de paiements
- Date du dernier paiement

### Globales
- Nombre de membres concernés
- Total payé
- Total restant
- Taux de recouvrement
- Nombre de membres payés
- Nombre de membres partiels
- Nombre de membres impayés

## Exemples d'Utilisation

### Scénario 1 : Calcul Annuel
```bash
# 1. Calculer le complément fonds pour 2026
POST /complement-fonds/calculer
{
  "annee": 2026,
  "montantTotal": 500000,
  "montantParMembre": 10000
}

# Résultat : 50 membres actifs, 10 000 FCFA par membre
```

### Scénario 2 : Enregistrement de Paiements
```bash
# 2. Enregistrer un paiement manuel
POST /complement-fonds/{id}/paiements
{
  "membreId": "uuid",
  "montant": 10000,
  "modePaiement": "PAIEMENT_MANUEL"
}

# Résultat : Paiement enregistré, Caisse Fonds créditée de 10 000 FCFA
```

### Scénario 3 : Suivi des Paiements
```bash
# 3. Consulter le suivi des paiements
GET /complement-fonds/{id}/suivi-paiements

# Résultat : Liste de tous les membres avec leur statut de paiement
```

### Scénario 4 : Augmentation
```bash
# 4. Augmenter le montant total
PUT /complement-fonds/{id}/augmenter
{
  "nouveauMontantTotal": 600000
}

# Résultat : Montant par membre passe de 10 000 à 12 000 FCFA
```

### Scénario 5 : Cassation
```bash
# 5. Casser le complément fonds
PUT /complement-fonds/{id}/casser
{
  "motif": "Décision de l'assemblée générale"
}

# Résultat : Remboursement de 350 000 FCFA, Caisse Fonds débitée
```

## Sécurité et Contrôle d'Accès

### Rôles Autorisés

| Endpoint | PRESIDENT | TRESORIER | SECRETAIRE | MEMBRE |
|----------|-----------|-----------|------------|--------|
| POST /calculer | ✅ | ✅ | ❌ | ❌ |
| GET / | ✅ | ✅ | ✅ | ❌ |
| GET /:id | ✅ | ✅ | ✅ | ❌ |
| GET /:id/suivi-paiements | ✅ | ✅ | ✅ | ❌ |
| POST /:id/paiements | ✅ | ✅ | ❌ | ❌ |
| PUT /:id/augmenter | ✅ | ✅ | ❌ | ❌ |
| PUT /:id/casser | ✅ | ✅ | ❌ | ❌ |

### Validations
- Tous les montants doivent être positifs
- L'année doit être >= 2000
- Le membre doit être actif
- Le complément fonds ne doit pas être cassé (sauf pour consultation)

## Tests Recommandés

### Tests Unitaires
- [ ] Calcul du montant par membre
- [ ] Vérification de l'unicité par année
- [ ] Calcul du montant restant
- [ ] Validation des paiements partiels
- [ ] Calcul des statistiques

### Tests d'Intégration
- [ ] Création et enregistrement de paiements
- [ ] Augmentation et recalcul
- [ ] Cassation et remboursement
- [ ] Prélèvement automatique depuis Tontines
- [ ] Crédit/Débit de la Caisse Fonds

## Améliorations Futures

- [ ] Notifications automatiques aux membres impayés
- [ ] Génération de rapports PDF
- [ ] Export Excel du suivi des paiements
- [ ] Historique des modifications (augmentations, cassations)
- [ ] Prévisions basées sur les années précédentes
- [ ] Paiements en ligne via Mobile Money

---

**Dernière mise à jour** : 27 Avril 2026  
**Version** : 1.0.0  
**Statut** : ✅ Complété et Intégré
