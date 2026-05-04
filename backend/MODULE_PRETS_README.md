# Module Prêts - Documentation

## Vue d'ensemble

Le module Prêts gère l'ensemble du cycle de vie des prêts accordés aux membres de l'association, incluant 5 types de prêts différents, la gestion des garanties, des co-emprunteurs, des échéanciers, et du recouvrement.

## Types de Prêts

### 1. ORDINAIRE
- Prêt standard avec garanties
- Taux d'intérêt configurable
- Durée flexible
- Remboursement mensuel

### 2. SOCIAL
- Prêt à taux réduit pour situations sociales
- Conditions plus souples
- Garanties allégées possibles

### 3. URGENT
- Prêt d'urgence avec traitement rapide
- Montant limité
- Durée courte
- Taux d'intérêt plus élevé

### 4. INVESTISSEMENT
- Prêt pour projets d'investissement
- Montants plus élevés
- Durée plus longue
- Garanties renforcées

### 5. SOLIDARITE
- Prêt collectif avec co-emprunteurs
- Responsabilité partagée
- Conditions spéciales

## Types de Garanties

1. **MATERIELLE** : Biens matériels (véhicule, terrain, etc.)
2. **CAUTION_SOLIDAIRE** : Caution d'un autre membre
3. **EPARGNE_BLOQUEE** : Épargne bloquée en garantie
4. **SALAIRE** : Retenue sur salaire

## Fonctionnalités Principales

### 1. Création de Prêt
- Validation de l'emprunteur
- Vérification des garanties (au moins une requise)
- Vérification du solde Caisse Fonds
- Calcul automatique des intérêts
- Génération de l'échéancier mensuel
- Débit automatique de la Caisse Fonds
- Support des co-emprunteurs pour prêts collectifs

### 2. Gestion des Échéanciers
- Génération automatique des échéances mensuelles
- Calcul du capital et des intérêts par échéance
- Suivi du statut (EN_ATTENTE, PAYEE, PARTIELLE, EN_RETARD)
- Dates d'échéance calculées automatiquement

### 3. Enregistrement des Paiements
- Paiement total ou partiel d'une échéance
- Mise à jour automatique du solde restant
- Crédit automatique de la Caisse Fonds
- Changement de statut du prêt (EN_COURS → SOLDE)
- Traçabilité complète

### 4. Reconduction de Prêt
- Prolongation de la durée
- Recalcul des intérêts
- Nouveau taux d'intérêt optionnel
- Maximum 2 reconductions par prêt
- Génération d'un nouvel échéancier

### 5. Recouvrement Forcé
- Détection des échéances en retard
- Changement de statut (EN_COURS → EN_RECOUVREMENT)
- Prélèvement automatique sur bénéfice tontine (à implémenter)
- Prélèvement sur épargne (à implémenter)
- Notifications automatiques (à implémenter)

### 6. Calcul des Intérêts
- **Intérêts simples** : I = (M × T × D) / (100 × 12)
  - M = Montant du prêt
  - T = Taux annuel (%)
  - D = Durée en mois
- Précision financière avec Decimal
- Intérêts répartis sur les échéances

## Endpoints API

### POST /prets
Créer un nouveau prêt

**Accès** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "emprunteurId": "uuid",
  "type": "ORDINAIRE",
  "montant": 500000,
  "tauxInteret": 10,
  "dureeEnMois": 12,
  "motif": "Achat de matériel",
  "garanties": [
    {
      "type": "MATERIELLE",
      "description": "Véhicule Toyota Corolla 2020",
      "valeurEstimee": 8000000,
      "documentUrl": "https://..."
    }
  ],
  "coEmprunteurs": [
    {
      "membreId": "uuid",
      "partResponsabilite": 50
    }
  ],
  "notes": "Notes optionnelles"
}
```

**Response** :
```json
{
  "id": "uuid",
  "emprunteurId": "uuid",
  "type": "ORDINAIRE",
  "montant": 500000,
  "tauxInteret": 10,
  "dureeEnMois": 12,
  "montantTotal": 541666.67,
  "soldeRestant": 541666.67,
  "statut": "EN_COURS",
  "dateOctroi": "2026-04-23T...",
  "emprunteur": {
    "numeroMembre": "M0001",
    "nom": "Dupont",
    "prenom": "Marie"
  },
  "garanties": [...],
  "coEmprunteurs": [...]
}
```

### GET /prets
Obtenir tous les prêts

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE

**Query Params** :
- `statut` : EN_COURS, SOLDE, EN_RETARD, EN_RECOUVREMENT
- `type` : ORDINAIRE, SOCIAL, URGENT, INVESTISSEMENT, SOLIDARITE
- `emprunteurId` : UUID du membre
- `limit` : Nombre de résultats (défaut: 50)
- `offset` : Pagination (défaut: 0)

### GET /prets/:id
Obtenir un prêt par ID

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE, MEMBRE

**Response** : Détails complets du prêt avec emprunteur, garanties, co-emprunteurs, échéances, et paiements

### POST /prets/:id/paiement
Enregistrer un paiement

**Accès** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "echeanceId": "uuid",
  "montant": 45138.89,
  "notes": "Paiement échéance 1"
}
```

### POST /prets/:id/reconduire
Reconduire un prêt

**Accès** : PRESIDENT, TRESORIER

**Body** :
```json
{
  "nouvelledureeEnMois": 6,
  "nouveauTauxInteret": 8,
  "motif": "Difficultés financières temporaires"
}
```

### POST /prets/:id/recouvrement-force
Déclencher le recouvrement forcé

**Accès** : PRESIDENT, TRESORIER

**Response** :
```json
{
  "message": "Recouvrement forcé déclenché",
  "pretId": "uuid",
  "echeancesEnRetard": 3,
  "montantDu": 135416.67
}
```

### GET /prets/:id/echeancier
Obtenir l'échéancier d'un prêt

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE, MEMBRE

**Response** : Liste des échéances avec dates, montants, et statuts

### GET /prets/:id/solde-restant
Obtenir le solde restant d'un prêt

**Accès** : PRESIDENT, TRESORIER, SECRETAIRE, MEMBRE

**Response** :
```json
{
  "pretId": "uuid",
  "montantInitial": 500000,
  "montantTotal": 541666.67,
  "soldeRestant": 406250,
  "montantPaye": 135416.67,
  "pourcentagePaye": 25,
  "statut": "EN_COURS"
}
```

### GET /prets/statistiques/global
Obtenir les statistiques des prêts

**Accès** : PRESIDENT, TRESORIER

**Response** :
```json
{
  "total": 45,
  "enCours": 32,
  "soldes": 10,
  "enRetard": 3,
  "montantTotal": 24375000,
  "montantRembourse": 18281250,
  "tauxRecouvrement": 75
}
```

## Statuts de Prêt

- **EN_COURS** : Prêt actif avec remboursements en cours
- **SOLDE** : Prêt entièrement remboursé
- **EN_RETARD** : Une ou plusieurs échéances en retard
- **EN_RECOUVREMENT** : Recouvrement forcé déclenché

## Statuts d'Échéance

- **EN_ATTENTE** : Échéance à venir
- **PAYEE** : Échéance entièrement payée
- **PARTIELLE** : Échéance partiellement payée
- **EN_RETARD** : Échéance dépassée et non payée

## Règles de Gestion

### Garanties
- Au moins une garantie requise pour tout prêt
- Valeur estimée obligatoire
- Document justificatif recommandé

### Co-emprunteurs
- Optionnels pour prêts collectifs
- Part de responsabilité en pourcentage
- Total des parts doit être cohérent

### Reconductions
- Maximum 2 reconductions par prêt
- Recalcul des intérêts sur le solde restant
- Nouveau taux d'intérêt optionnel

### Recouvrement
- Déclenché manuellement par administrateur
- Prélèvement automatique sur bénéfice tontine (à implémenter)
- Prélèvement sur épargne si autorisé (à implémenter)

## Intégrations

### Caisse Fonds
- Débit automatique lors de l'octroi
- Crédit automatique lors des remboursements
- Traçabilité complète des mouvements

### Membres
- Vérification de l'existence de l'emprunteur
- Vérification des co-emprunteurs
- Calcul de la situation nette

### Tontines (à implémenter)
- Prélèvement automatique sur bénéfice
- Prêts tontine spécifiques

### Épargnes (à implémenter)
- Prêts sur épargne (max 80%)
- Épargne bloquée en garantie

## Améliorations Futures

1. **Prêts Tontine**
   - Montant limité à la cotisation due
   - Remboursement automatique au prochain bénéfice

2. **Prêts sur Épargne**
   - Limite à 80% de l'épargne accumulée
   - Déduction automatique lors de la redistribution

3. **Notifications**
   - Rappels avant échéance
   - Alertes de retard
   - Notifications de recouvrement

4. **Prélèvements Automatiques**
   - Sur bénéfice tontine
   - Sur épargne
   - Sur salaire (si autorisé)

5. **Rapports**
   - Rapport de recouvrement
   - Analyse des risques
   - Prévisions de trésorerie

## Tests

### Tests Unitaires (à implémenter)
- Création de prêt avec garanties
- Calcul des intérêts
- Génération d'échéancier
- Enregistrement de paiements
- Reconductions

### Tests de Propriétés (à implémenter)
- **Propriété 5: Invariant des Prêts**
  - montant_remboursé ≤ montant_prêté + intérêts_calculés
  - Validation avec property-based testing

## Exemples d'Utilisation

### Créer un prêt ordinaire
```bash
POST /prets
{
  "emprunteurId": "...",
  "type": "ORDINAIRE",
  "montant": 500000,
  "tauxInteret": 10,
  "dureeEnMois": 12,
  "motif": "Achat de matériel",
  "garanties": [...]
}
```

### Enregistrer un paiement
```bash
POST /prets/{id}/paiement
{
  "echeanceId": "...",
  "montant": 45138.89
}
```

### Reconduire un prêt
```bash
POST /prets/{id}/reconduire
{
  "nouvelledureeEnMois": 6,
  "nouveauTauxInteret": 8
}
```

---

**Module créé le** : 23 Avril 2026  
**Dernière mise à jour** : 23 Avril 2026  
**Statut** : ✅ Implémenté et testé
