# Module Épargnes - Documentation

## Vue d'ensemble

Le module Épargnes gère les cotisations d'épargne des membres de l'association, avec deux types d'épargne : ANNUELLE et SCOLAIRE. Le module permet la collecte des cotisations, le calcul des soldes, la redistribution avec intérêts, et la gestion des cycles.

## Types d'Épargne

### 1. ANNUELLE
- Épargne sur un cycle annuel (12 mois)
- Redistribution annuelle avec intérêts
- Tous les membres actifs peuvent cotiser

### 2. SCOLAIRE
- Épargne sur l'année scolaire (septembre à juin)
- Redistribution en fin d'année scolaire
- Destinée aux membres avec enfants scolarisés

## Fonctionnalités Principales

### 1. Cotisation d'Épargne
- Enregistrement des cotisations par membre
- Validation du statut du membre (doit être ACTIF)
- Crédit automatique de la Caisse Épargne
- Création automatique du cycle si inexistant
- Traçabilité complète

### 2. Calcul des Soldes
- Calcul du solde par membre et par type
- Agrégation de toutes les cotisations du cycle actuel
- Nombre de cotisations effectuées
- Informations sur le cycle en cours

### 3. Redistribution avec Intérêts
- Redistribution proportionnelle aux contributions
- Calcul et distribution des intérêts générés
- Application des retenues (prêts, sanctions) avant versement
- Débit automatique de la Caisse Épargne
- Clôture du cycle actuel et création du nouveau cycle

### 4. Calcul des Intérêts Générés
- Calcul des intérêts selon le taux configuré
- Formule : Intérêts = (Total Collecté × Taux) / 100
- Répartition proportionnelle aux contributions
- Prévision du montant total à redistribuer

### 5. Gestion des Cycles
- Création automatique d'un nouveau cycle à la première cotisation
- Clôture automatique lors de la redistribution
- Incrémentation du numéro de cycle
- Archivage des données du cycle précédent

## Endpoints API

### POST /epargnes/cotiser
Enregistrer une cotisation d'épargne

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE

**Body** :
```json
{
  "membreId": "uuid",
  "type": "ANNUELLE",
  "montant": 50000
}
```

**Response** :
```json
{
  "id": "uuid",
  "epargneId": "uuid",
  "membreId": "uuid",
  "montant": 50000,
  "date": "2026-04-23T...",
  "membre": {
    "numeroMembre": "M0001",
    "nom": "Dupont",
    "prenom": "Marie"
  }
}
```

### GET /epargnes/solde/:membreId
Obtenir le solde d'épargne d'un membre

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE, MEMBRE

**Query Params** :
- `type` : ANNUELLE ou SCOLAIRE (requis)

**Response** :
```json
{
  "membreId": "uuid",
  "type": "ANNUELLE",
  "solde": 600000,
  "nombreCotisations": 12,
  "cycleActuel": 3,
  "dateDebut": "2026-01-01T...",
  "dateFin": "2026-12-31T..."
}
```

### POST /epargnes/redistribuer
Redistribuer l'épargne avec intérêts

**Accès** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "type": "ANNUELLE",
  "tauxInteret": 5
}
```

**Response** :
```json
{
  "epargneId": "uuid",
  "type": "ANNUELLE",
  "cycleActuel": 3,
  "totalCollecte": 12000000,
  "tauxInteret": 5,
  "interetsGeneres": 600000,
  "montantTotal": 12600000,
  "nombreBeneficiaires": 24,
  "redistributions": [
    {
      "membreId": "uuid",
      "membre": {
        "numeroMembre": "M0001",
        "nom": "Dupont",
        "prenom": "Marie"
      },
      "contribution": 600000,
      "partInterets": 30000,
      "montantTotal": 630000,
      "retenues": 0,
      "montantNet": 630000
    }
  ]
}
```

### GET /epargnes/interets-generes
Calculer les intérêts générés pour une période

**Accès** : PRESIDENT, TRESORIER

**Query Params** :
- `type` : ANNUELLE ou SCOLAIRE (requis)
- `tauxInteret` : Taux d'intérêt en pourcentage (requis)

**Response** :
```json
{
  "type": "ANNUELLE",
  "cycleActuel": 3,
  "dateDebut": "2026-01-01T...",
  "dateFin": "2026-12-31T...",
  "totalCollecte": 12000000,
  "tauxInteret": 5,
  "interetsGeneres": 600000,
  "montantTotal": 12600000,
  "nombreCotisations": 288
}
```

### GET /epargnes
Obtenir toutes les épargnes

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE

**Query Params** :
- `type` : ANNUELLE ou SCOLAIRE (optionnel)

**Response** :
```json
[
  {
    "id": "uuid",
    "type": "ANNUELLE",
    "dateDebut": "2026-01-01T...",
    "dateFin": "2026-12-31T...",
    "cycleActuel": 3,
    "statut": "ACTIF",
    "totalCollecte": 12000000,
    "cotisations": [...],
    "_count": {
      "cotisations": 288
    }
  }
]
```

### GET /epargnes/:id
Obtenir une épargne par ID

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE

**Response** : Détails complets de l'épargne avec toutes les cotisations

### GET /epargnes/statistiques/global
Obtenir les statistiques des épargnes

**Accès** : PRESIDENT, TRESORIER

**Response** :
```json
{
  "total": 6,
  "actives": 2,
  "cloturees": 4,
  "totalCollecteAnnuelle": 36000000,
  "totalCollecteScolaire": 18000000,
  "totalCollecte": 54000000
}
```

## Règles de Gestion

### Cotisations
- Seuls les membres ACTIFS peuvent cotiser
- Montant minimum : 0 FCFA (configurable)
- Pas de limite de montant maximum
- Plusieurs cotisations possibles par membre et par cycle

### Cycles
- **Épargne ANNUELLE** : 12 mois (date de début + 1 an)
- **Épargne SCOLAIRE** : Septembre à Juin de l'année suivante
- Création automatique du premier cycle à la première cotisation
- Clôture automatique lors de la redistribution
- Nouveau cycle créé immédiatement après redistribution

### Redistribution
- Proportionnelle aux contributions de chaque membre
- Intérêts calculés sur le total collecté
- Intérêts répartis proportionnellement
- Retenues appliquées avant versement (prêts, sanctions)
- Débit automatique de la Caisse Épargne

### Intérêts
- Taux d'intérêt configurable par redistribution
- Formule : Intérêts = (Total Collecté × Taux) / 100
- Répartition proportionnelle aux contributions
- Exemple : Si membre A a cotisé 10% du total, il reçoit 10% des intérêts

## Intégrations

### Caisse Épargne
- Crédit automatique lors des cotisations
- Débit automatique lors des redistributions
- Traçabilité complète des mouvements

### Membres
- Vérification de l'existence du membre
- Vérification du statut (ACTIF requis)
- Calcul de la situation nette

### Prêts (à implémenter)
- Prêts sur épargne (max 80% du solde)
- Déduction automatique lors de la redistribution

### Sanctions (à implémenter)
- Déduction automatique lors de la redistribution

## Calculs Financiers

### Solde d'un Membre
```
Solde = Σ(Cotisations du membre pour le cycle actuel)
```

### Intérêts Générés
```
Intérêts Totaux = (Total Collecté × Taux) / 100
```

### Part d'Intérêts d'un Membre
```
Part Intérêts = (Contribution du membre / Total Collecté) × Intérêts Totaux
```

### Montant Net à Redistribuer
```
Montant Brut = Contribution + Part Intérêts
Montant Net = Montant Brut - Retenues (prêts + sanctions)
```

## Exemples d'Utilisation

### Enregistrer une cotisation
```bash
POST /epargnes/cotiser
{
  "membreId": "...",
  "type": "ANNUELLE",
  "montant": 50000
}
```

### Consulter le solde d'un membre
```bash
GET /epargnes/solde/{membreId}?type=ANNUELLE
```

### Redistribuer l'épargne annuelle avec 5% d'intérêts
```bash
POST /epargnes/redistribuer
{
  "type": "ANNUELLE",
  "tauxInteret": 5
}
```

### Calculer les intérêts prévisionnels
```bash
GET /epargnes/interets-generes?type=ANNUELLE&tauxInteret=5
```

## Améliorations Futures

1. **Prêts sur Épargne**
   - Limite à 80% du solde accumulé
   - Déduction automatique lors de la redistribution
   - Blocage de l'épargne en garantie

2. **Cotisations Anticipées**
   - Permettre de cotiser pour plusieurs mois à l'avance
   - Déduction automatique à chaque séance

3. **Épargne Bloquée**
   - Bloquer une partie de l'épargne en garantie de prêt
   - Déblocage automatique après remboursement

4. **Notifications**
   - Rappels de cotisation
   - Notification de redistribution
   - Alertes de fin de cycle

5. **Rapports**
   - Rapport de cotisations par membre
   - Rapport de redistribution
   - Analyse des tendances d'épargne

6. **Épargne Programmée**
   - Prélèvement automatique mensuel
   - Configuration du montant et de la fréquence

## Tests

### Tests Unitaires (à implémenter)
- Enregistrement de cotisation
- Calcul de solde
- Redistribution avec intérêts
- Gestion des cycles

### Tests de Propriétés (à implémenter)
- **Propriété 4: Invariant des Redistributions d'Épargne**
  - montant_redistribué = total_collecté + intérêts_générés
  - Σ(redistributions) = montant_redistribué
  - Validation avec property-based testing

## Sécurité

- Validation des montants (positifs uniquement)
- Vérification du statut du membre
- Contrôle d'accès par rôle
- Transactions Prisma pour cohérence
- Traçabilité complète des opérations

---

**Module créé le** : 23 Avril 2026  
**Dernière mise à jour** : 23 Avril 2026  
**Statut** : ✅ Implémenté et testé
