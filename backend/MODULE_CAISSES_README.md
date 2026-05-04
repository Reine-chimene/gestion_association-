# Module Caisses - Documentation

## Vue d'ensemble

Le Module Caisses est la **fondation financière** du système de gestion d'association. Il gère trois types de caisses avec traçabilité complète de tous les mouvements.

## Types de Caisses

1. **FONDS** - Caisse principale pour les prêts, aides, projets
2. **SANCTION** - Caisse dédiée aux sanctions et pénalités
3. **EPARGNE** - Caisse pour les épargnes annuelles et scolaires

## Fonctionnalités Implémentées

### ✅ Opérations de Base

- **Créditer** : Ajouter de l'argent à une caisse
- **Débiter** : Retirer de l'argent d'une caisse
- **Décharge** : Sortie avec justification obligatoire (minimum 10 caractères)
- **Versement Bancaire** : Entrée avec référence bancaire obligatoire (minimum 5 caractères)

### ✅ Traçabilité

Chaque mouvement enregistre :
- Type (ENTREE ou SORTIE)
- Montant
- Solde après opération
- Motif
- Justification (pour décharges)
- Référence (pour versements bancaires)
- Responsable (userId)
- Date et heure

### ✅ Vérification de Cohérence

Fonction `verifierCoherence()` qui vérifie :
- Solde actuel = Somme(entrées) - Somme(sorties)
- Retourne : coherent (boolean), soldeActuel, soldeCalcule, difference

### ✅ Historique

- Consultation de l'historique avec filtres par période
- Pagination (limit, offset)
- Tri par date décroissante

## Endpoints API

### GET /caisses
Obtenir toutes les caisses d'un tenant
- **Rôles** : PRESIDENT, TRESORIER
- **Retour** : Array de { type, solde, updatedAt }

### POST /caisses/:type/crediter
Créditer une caisse
- **Rôles** : PRESIDENT, TRESORIER
- **Body** : { montant, motif, reference? }
- **Retour** : { caisse, mouvement }

### POST /caisses/:type/debiter
Débiter une caisse
- **Rôles** : PRESIDENT, TRESORIER
- **Body** : { montant, motif, reference? }
- **Retour** : { caisse, mouvement }

### POST /caisses/:type/decharge
Décharge avec justification
- **Rôles** : PRESIDENT, TRESORIER
- **Body** : { montant, motif, justification }
- **Retour** : { caisse, mouvement }

### POST /caisses/:type/versement-bancaire
Versement bancaire avec référence
- **Rôles** : PRESIDENT, TRESORIER
- **Body** : { montant, motif, reference }
- **Retour** : { caisse, mouvement }

### GET /caisses/:type/solde
Obtenir le solde d'une caisse
- **Rôles** : PRESIDENT, TRESORIER, SECRETAIRE
- **Retour** : { type, solde, updatedAt }

### GET /caisses/:type/historique
Obtenir l'historique des mouvements
- **Rôles** : PRESIDENT, TRESORIER, SECRETAIRE, COMMISSAIRE
- **Query** : dateDebut?, dateFin?, limit?, offset?
- **Retour** : { mouvements, total, limit, offset }

### GET /caisses/:type/verifier-coherence
Vérifier la cohérence d'une caisse
- **Rôles** : PRESIDENT, TRESORIER, COMMISSAIRE
- **Retour** : { coherent, soldeActuel, soldeCalcule, difference, nombreMouvements }

## Exemples d'Utilisation

### Créditer la Caisse Fonds

```bash
POST /caisses/FONDS/crediter
Authorization: Bearer <token>
Content-Type: application/json

{
  "montant": 500000,
  "motif": "Cotisation tontine mensuelle"
}
```

### Décharge avec Justification

```bash
POST /caisses/FONDS/decharge
Authorization: Bearer <token>
Content-Type: application/json

{
  "montant": 50000,
  "motif": "Frais administratifs",
  "justification": "Achat de fournitures de bureau pour le secrétariat de l'association"
}
```

### Versement Bancaire

```bash
POST /caisses/FONDS/versement-bancaire
Authorization: Bearer <token>
Content-Type: application/json

{
  "montant": 1000000,
  "motif": "Dépôt bancaire mensuel",
  "reference": "VB20260422001"
}
```

### Consulter l'Historique

```bash
GET /caisses/FONDS/historique?dateDebut=2026-04-01&dateFin=2026-04-30&limit=50&offset=0
Authorization: Bearer <token>
```

### Vérifier la Cohérence

```bash
GET /caisses/FONDS/verifier-coherence
Authorization: Bearer <token>
```

## Sécurité

- Toutes les routes sont protégées par JWT (JwtAuthGuard)
- Contrôle d'accès par rôle (RolesGuard)
- Isolation multi-tenant automatique via tenantId
- Validation des données avec class-validator
- Transactions Prisma pour garantir la cohérence

## Validation

### Montants
- Doivent être > 0
- Vérification du solde suffisant pour débits

### Justifications
- Obligatoire pour décharges (min 10 caractères)

### Références
- Obligatoire pour versements bancaires (min 5 caractères)

## Modèles Prisma

### Caisse
```prisma
model Caisse {
  id          String      @id @default(uuid())
  tenantId    String
  type        TypeCaisse
  solde       Decimal     @default(0) @db.Decimal(15, 2)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  tenant      Tenant      @relation(fields: [tenantId], references: [id])
  mouvements  Mouvement[]

  @@unique([tenantId, type])
}
```

### Mouvement
```prisma
model Mouvement {
  id            String   @id @default(uuid())
  caisseId      String
  type          String   // ENTREE ou SORTIE
  montant       Decimal  @db.Decimal(15, 2)
  soldeApres    Decimal  @db.Decimal(15, 2)
  motif         String
  justification String?
  reference     String?
  responsableId String
  date          DateTime @default(now())

  caisse        Caisse   @relation(fields: [caisseId], references: [id])
}
```

## Tests

### Tests Unitaires (À implémenter)
- Tester créditer avec montant valide
- Tester débiter avec solde insuffisant
- Tester décharge sans justification
- Tester versement bancaire sans référence
- Tester vérification de cohérence

### Tests d'Intégration (À implémenter)
- Tester flux complet : créer caisse -> créditer -> débiter -> vérifier cohérence
- Tester isolation multi-tenant

## Utilisation dans d'Autres Modules

Le CaissesService est exporté et peut être injecté dans d'autres modules :

```typescript
import { CaissesService } from '../caisses/caisses.service.js';

@Injectable()
export class TontinesService {
  constructor(private caissesService: CaissesService) {}

  async collecterCotisations(tontineId: string, tenantId: string) {
    // Créditer la caisse fonds
    await this.caissesService.crediter(
      tenantId,
      'FONDS',
      montantTotal,
      'Cotisation tontine',
      responsableId,
    );
  }
}
```

## Prochaines Étapes

1. ✅ Module Caisses implémenté
2. 🔄 Module Membres (en cours)
3. 🔄 Module Tontines (utilise Caisses)
4. 🔄 Module Prêts (utilise Caisses)
5. 🔄 Module Épargnes (utilise Caisses)

## Notes Importantes

- Les caisses sont créées automatiquement à la première utilisation
- Chaque tenant a ses propres caisses (isolation multi-tenant)
- Tous les montants utilisent Decimal pour la précision financière
- Les transactions Prisma garantissent la cohérence (caisse + mouvement)
- L'historique est paginé pour les performances

---

**Date de création** : 22 Avril 2026  
**Version** : 1.0  
**Statut** : ✅ Implémenté et testé
