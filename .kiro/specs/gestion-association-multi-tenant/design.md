# Document de Conception - Système de Gestion d'Association Multi-Tenant

## Vue d'Ensemble

Ce document présente la conception technique d'un système de gestion d'association multi-tenant moderne, scalable et performant. Le système permet à plusieurs associations indépendantes de gérer leurs membres, finances, tontines, prêts, épargnes, aides et projets communautaires avec une isolation complète des données.

### Objectifs Architecturaux

- Architecture multi-tenant avec isolation stricte des données
- Performance optimale avec cache distribué et calculs asynchrones
- Sécurité renforcée avec authentification JWT et RBAC
- Interface utilisateur moderne et responsive (mobile-first)
- Calculs financiers précis au centime près
- Traçabilité complète avec audit trail
- Scalabilité horizontale pour supporter la croissance

### Stack Technologique

**Backend**:
- Runtime: Node.js 20+ avec TypeScript 5+
- Framework: NestJS (architecture modulaire, DI, décorateurs)
- API: REST + GraphQL (Apollo Server)
- Validation: class-validator, class-transformer

**Base de Données**:
- PostgreSQL 15+ avec Row-Level Security (RLS) pour multi-tenant
- ORM: Prisma (type-safe, migrations, introspection)
- Indexation: B-tree pour recherches, GiST pour full-text search

**Cache & Queue**:
- Redis 7+ pour cache distribué et sessions
- BullMQ pour file d'attente de tâches asynchrones
- Redis Pub/Sub pour notifications temps réel

**Frontend**:
- Framework: React 18+ avec TypeScript
- State Management: Zustand (léger, performant)
- UI Components: shadcn/ui + Tailwind CSS
- Forms: React Hook Form + Zod validation
- Data Fetching: TanStack Query (React Query)
- Routing: React Router v6

**Infrastructure**:
- Containerisation: Docker + Docker Compose
- Reverse Proxy: Nginx
- Monitoring: Prometheus + Grafana
- Logs: Winston + Elasticsearch + Kibana (ELK Stack)
- CI/CD: GitHub Actions


## Architecture

### Architecture Globale

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App React]
        MOBILE[Mobile PWA]
    end
    
    subgraph "API Gateway"
        NGINX[Nginx Reverse Proxy]
        RATE[Rate Limiter]
    end
    
    subgraph "Application Layer"
        API[NestJS API Server]
        GRAPHQL[GraphQL Server]
        AUTH[Auth Service]
        NOTIF[Notification Service]
    end
    
    subgraph "Business Logic Layer"
        MEMBER[Member Module]
        TONTINE[Tontine Module]
        LOAN[Loan Module]
        SAVING[Saving Module]
        AID[Aid Module]
        PROJECT[Project Module]
        CASH[Cash Module]
        AUDIT[Audit Module]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
        QUEUE[BullMQ Queue]
    end
    
    subgraph "External Services"
        EMAIL[Email Service]
        SMS[SMS Gateway]
        PAYMENT[Mobile Payment APIs]
    end
    
    WEB --> NGINX
    MOBILE --> NGINX
    NGINX --> RATE
    RATE --> API
    RATE --> GRAPHQL
    
    API --> AUTH
    API --> MEMBER
    API --> TONTINE
    API --> LOAN
    API --> SAVING
    API --> AID
    API --> PROJECT
    API --> CASH
    API --> AUDIT
    
    MEMBER --> POSTGRES
    TONTINE --> POSTGRES
    LOAN --> POSTGRES
    SAVING --> POSTGRES
    AID --> POSTGRES
    PROJECT --> POSTGRES
    CASH --> POSTGRES
    AUDIT --> POSTGRES
    
    API --> REDIS
    API --> QUEUE
    
    NOTIF --> EMAIL
    NOTIF --> SMS
    API --> PAYMENT
    
    QUEUE --> NOTIF
```

### Architecture Multi-Tenant

Le système utilise une approche **multi-tenant avec isolation au niveau base de données** (shared database, shared schema avec tenant_id).

**Stratégie d'Isolation**:
1. Chaque table contient une colonne `tenant_id` (UUID)
2. Row-Level Security (RLS) de PostgreSQL pour isolation automatique
3. Middleware NestJS pour injection automatique du tenant_id
4. JWT contient le tenant_id pour identification

**Avantages**:
- Coût d'infrastructure réduit (une seule base de données)
- Maintenance simplifiée (un seul schéma)
- Performance optimale avec indexation appropriée
- Isolation garantie par RLS au niveau DB


### Modules et Composants

#### Module Auth & Multi-Tenant
- Authentification JWT avec refresh tokens
- Gestion des tenants (création, configuration)
- Contrôle d'accès basé sur les rôles (RBAC)
- Middleware d'injection tenant_id
- 2FA optionnel (TOTP)

#### Module Membres
- CRUD membres avec statuts (Actif, Observation, Démissionnaire, Décédé, Muté)
- Gestion du parrainage
- Calcul automatique du kit d'entrée
- Historique des changements de statut
- Situation nette par membre

#### Module Tontines
- Tontines classiques non vendables (ordre fixe)
- Tontines vendables aux enchères
- Gestion des parts multiples par membre
- Calcul des intérêts primaires/secondaires/tertiaires
- Tours gratuits automatiques
- Retenues automatiques au bénéfice

#### Module Prêts
- Prêts sur fonds (avec garanties)
- Prêts tontine (éviter échec cotisation)
- Prêts mensuels à échéances
- Prêts collectifs (co-emprunteurs)
- Prêts sur épargne (max 80%)
- Calcul d'intérêts (simples/composés)
- Reconduction (max 2 fois)
- Recouvrement forcé

#### Module Épargnes
- Épargne annuelle avec redistribution
- Épargne scolaire
- Calcul des intérêts d'épargne
- Retenues automatiques à la redistribution

#### Module Aides & Dons
- Aides maladie (avec justificatifs)
- Aides décès (membre, conjoint, parent, enfant)
- Désignation automatique des commissionnaires
- Recouvrement automatique des cotisations décès

#### Module Projets Communautaires
- Projets court/moyen/long terme
- Contributions volontaires ou obligatoires
- Gestion par phases
- Suivi des contributions par membre
- Rapports d'avancement

#### Module Sanctions & Pénalités
- Configuration paramétrable par association
- Trois modes: fixe, pourcentage, progressif
- Jours de grâce configurables
- Application automatique
- Annulation avec justification

#### Module Séances & Présences
- Création de séances hebdomadaires
- Enregistrement des présences
- Collecte des cotisations
- Génération de procès-verbaux
- Sanctions automatiques pour absences

#### Module Caisses & Transactions
- Trois caisses: Fonds, Sanction, Épargne
- Traçabilité complète des mouvements
- Décharges avec justification
- Versements bancaires
- Calcul des soldes en temps réel

#### Module Dépôts en Ligne
- Soumission avec preuve de paiement
- Validation/rejet par trésorier
- Intégration paiements mobiles (Orange Money, MTN, Wave)
- Réconciliation automatique

#### Module Notifications
- Multi-canal: email, SMS, in-app
- Rappels automatiques (cotisations, échéances)
- Notifications événements (désignation commissionnaire, validation dépôt)
- Préférences configurables par membre
- Historique des notifications

#### Module Bilans & Reporting
- Bilan financier global
- Situation nette par membre
- Tableaux de bord avec KPIs
- Graphiques d'évolution
- Export PDF/Excel

#### Module Audit & Traçabilité
- Enregistrement de toutes modifications sensibles
- État avant/après chaque modification
- Identification du responsable
- Horodatage précis
- Rapports d'audit
- Alertes sur modifications inhabituelles


## Composants et Interfaces

### API REST Endpoints Principaux

#### Auth & Tenant
```
POST   /api/auth/register          - Inscription nouveau tenant
POST   /api/auth/login             - Connexion
POST   /api/auth/refresh           - Refresh token
POST   /api/auth/logout            - Déconnexion
POST   /api/auth/2fa/enable        - Activer 2FA
POST   /api/auth/2fa/verify        - Vérifier code 2FA
GET    /api/tenant/config          - Configuration tenant
PUT    /api/tenant/config          - Mettre à jour configuration
```

#### Membres
```
GET    /api/members                - Liste membres (pagination, filtres)
GET    /api/members/:id            - Détails membre
POST   /api/members                - Créer membre
PUT    /api/members/:id            - Mettre à jour membre
PATCH  /api/members/:id/status     - Changer statut
GET    /api/members/:id/balance    - Situation nette
GET    /api/members/:id/history    - Historique transactions
```

#### Tontines
```
GET    /api/tontines               - Liste tontines
GET    /api/tontines/:id           - Détails tontine
POST   /api/tontines               - Créer tontine
PUT    /api/tontines/:id           - Mettre à jour tontine
POST   /api/tontines/:id/auction   - Vendre tour aux enchères
POST   /api/tontines/:id/collect   - Collecter cotisations
GET    /api/tontines/:id/schedule  - Ordre des bénéficiaires
POST   /api/tontines/:id/interests/sell - Vendre intérêts cumulés
```

#### Prêts
```
GET    /api/loans                  - Liste prêts (filtres: type, statut)
GET    /api/loans/:id              - Détails prêt
POST   /api/loans                  - Créer prêt
PUT    /api/loans/:id              - Mettre à jour prêt
POST   /api/loans/:id/payment      - Enregistrer paiement
POST   /api/loans/:id/renew        - Reconduire prêt
GET    /api/loans/:id/schedule     - Échéancier
POST   /api/loans/:id/force-collect - Recouvrement forcé
```

#### Épargnes
```
GET    /api/savings                - Liste épargnes
GET    /api/savings/:id            - Détails épargne
POST   /api/savings                - Créer épargne
POST   /api/savings/:id/contribute - Cotiser
POST   /api/savings/:id/redistribute - Redistribuer
GET    /api/savings/:id/members    - Contributions par membre
```

#### Aides
```
GET    /api/aids                   - Liste aides
GET    /api/aids/:id               - Détails aide
POST   /api/aids/illness           - Demander aide maladie
POST   /api/aids/death             - Déclarer décès
PUT    /api/aids/:id/approve       - Approuver aide
PUT    /api/aids/:id/reject        - Rejeter aide
```

#### Projets
```
GET    /api/projects               - Liste projets
GET    /api/projects/:id           - Détails projet
POST   /api/projects               - Créer projet
PUT    /api/projects/:id           - Mettre à jour projet
POST   /api/projects/:id/contribute - Contribuer
GET    /api/projects/:id/progress  - Avancement projet
```

#### Séances
```
GET    /api/sessions               - Liste séances
GET    /api/sessions/:id           - Détails séance
POST   /api/sessions               - Créer séance
PUT    /api/sessions/:id/attendance - Enregistrer présences
POST   /api/sessions/:id/close     - Clôturer séance
GET    /api/sessions/:id/minutes   - Procès-verbal
```

#### Caisses
```
GET    /api/cash-boxes             - État des trois caisses
GET    /api/cash-boxes/:type/transactions - Transactions par caisse
POST   /api/cash-boxes/:type/withdrawal - Décharge
POST   /api/cash-boxes/:type/bank-deposit - Versement bancaire
GET    /api/cash-boxes/:type/balance - Solde caisse
```

#### Dépôts en Ligne
```
GET    /api/online-deposits        - Liste dépôts
POST   /api/online-deposits        - Soumettre dépôt
PUT    /api/online-deposits/:id/validate - Valider dépôt
PUT    /api/online-deposits/:id/reject - Rejeter dépôt
POST   /api/online-deposits/mobile-payment - Paiement mobile
```

#### Bilans & Reporting
```
GET    /api/reports/financial      - Bilan financier global
GET    /api/reports/member/:id     - Situation membre
GET    /api/reports/dashboard      - Tableau de bord KPIs
GET    /api/reports/statistics     - Statistiques et analyses
GET    /api/reports/export         - Export PDF/Excel
```

#### Audit
```
GET    /api/audit/logs             - Logs d'audit (filtres)
GET    /api/audit/entity/:type/:id - Historique entité
GET    /api/audit/report           - Rapport d'audit
```


### GraphQL Schema (Extraits)

```graphql
type Query {
  # Membres
  members(filter: MemberFilter, pagination: Pagination): MemberConnection!
  member(id: ID!): Member
  memberBalance(id: ID!): MemberBalance!
  
  # Tontines
  tontines(filter: TontineFilter): [Tontine!]!
  tontine(id: ID!): Tontine
  tontineBeneficiarySchedule(id: ID!): [BeneficiaryTurn!]!
  
  # Prêts
  loans(filter: LoanFilter): [Loan!]!
  loan(id: ID!): Loan
  loanSchedule(id: ID!): [LoanInstallment!]!
  
  # Bilans
  financialReport(period: DateRange): FinancialReport!
  dashboard: Dashboard!
}

type Mutation {
  # Membres
  createMember(input: CreateMemberInput!): Member!
  updateMemberStatus(id: ID!, status: MemberStatus!): Member!
  
  # Tontines
  createTontine(input: CreateTontineInput!): Tontine!
  auctionTontineTurn(tontineId: ID!, buyerId: ID!, interestAmount: Decimal!): AuctionResult!
  collectTontineContributions(tontineId: ID!, sessionId: ID!): CollectionResult!
  
  # Prêts
  createLoan(input: CreateLoanInput!): Loan!
  recordLoanPayment(loanId: ID!, amount: Decimal!): Payment!
  renewLoan(loanId: ID!): Loan!
  
  # Dépôts
  submitOnlineDeposit(input: OnlineDepositInput!): OnlineDeposit!
  validateOnlineDeposit(id: ID!): OnlineDeposit!
}

type Subscription {
  # Notifications temps réel
  notificationReceived(memberId: ID!): Notification!
  cashBoxUpdated(type: CashBoxType!): CashBox!
  depositStatusChanged(depositId: ID!): OnlineDeposit!
}
```

### Interfaces de Services Internes

#### TenantService
```typescript
interface ITenantService {
  createTenant(data: CreateTenantDto): Promise<Tenant>;
  getTenantConfig(tenantId: string): Promise<TenantConfig>;
  updateTenantConfig(tenantId: string, config: Partial<TenantConfig>): Promise<TenantConfig>;
  validateTenantAccess(tenantId: string, userId: string): Promise<boolean>;
}
```

#### FinancialCalculationService
```typescript
interface IFinancialCalculationService {
  calculateSimpleInterest(principal: Decimal, rate: Decimal, duration: number): Decimal;
  calculateCompoundInterest(principal: Decimal, rate: Decimal, duration: number, frequency: number): Decimal;
  calculateLoanInstallment(principal: Decimal, rate: Decimal, duration: number): Decimal;
  calculateAutomaticDeductions(benefitAmount: Decimal, memberId: string): DeductionBreakdown;
  calculateProportionalDistribution(totalAmount: Decimal, contributions: Map<string, Decimal>): Map<string, Decimal>;
  calculateMemberNetBalance(memberId: string): MemberBalance;
}
```

#### NotificationService
```typescript
interface INotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSMS(to: string, message: string): Promise<void>;
  sendInAppNotification(userId: string, notification: Notification): Promise<void>;
  scheduleReminder(type: ReminderType, targetDate: Date, recipientId: string): Promise<void>;
  getNotificationHistory(userId: string, filters: NotificationFilter): Promise<Notification[]>;
}
```

#### AuditService
```typescript
interface IAuditService {
  logChange(entity: string, entityId: string, action: AuditAction, before: any, after: any, userId: string): Promise<void>;
  getEntityHistory(entity: string, entityId: string): Promise<AuditLog[]>;
  generateAuditReport(tenantId: string, period: DateRange): Promise<AuditReport>;
  detectAnomalies(tenantId: string): Promise<Anomaly[]>;
}
```

#### CacheService
```typescript
interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
  getCashBoxBalance(tenantId: string, type: CashBoxType): Promise<Decimal>;
  invalidateCashBoxCache(tenantId: string, type: CashBoxType): Promise<void>;
}
```


## Modèles de Données

### Schéma de Base de Données (Prisma)

```prisma
// ============================================
// TENANT & AUTH
// ============================================

model Tenant {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  config        TenantConfig?
  members       Member[]
  tontines      Tontine[]
  loans         Loan[]
  savings       Saving[]
  aids          Aid[]
  projects      Project[]
  sessions      Session[]
  cashBoxes     CashBox[]
  auditLogs     AuditLog[]
  
  @@index([slug])
}

model TenantConfig {
  id                    String   @id @default(uuid())
  tenantId              String   @unique
  tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Configuration financière
  currency              String   @default("FCFA")
  loanInterestRate      Decimal  @db.Decimal(5, 2)
  tontineLoanRate       Decimal  @db.Decimal(5, 2)
  savingInterestRate    Decimal  @db.Decimal(5, 2)
  savingLoanRate        Decimal  @db.Decimal(5, 2)
  savingLoanMaxPercent  Int      @default(80)
  
  // Configuration aides
  illnessAidAmount      Decimal  @db.Decimal(10, 2)
  deathAidMember        Decimal  @db.Decimal(10, 2)
  deathAidSpouse        Decimal  @db.Decimal(10, 2)
  deathAidParent        Decimal  @db.Decimal(10, 2)
  deathAidChild         Decimal  @db.Decimal(10, 2)
  commissionerFee       Decimal  @db.Decimal(10, 2)
  
  // Configuration adhésion
  entryKitAmount        Decimal  @db.Decimal(10, 2)
  
  // Configuration séances
  sessionDay            String   @default("SUNDAY")
  sessionTime           String   @default("14:00")
  
  // Configuration sanctions
  absencePenaltyAmount  Decimal  @db.Decimal(10, 2)
  absenceGraceDays      Int      @default(0)
  latePaymentPenaltyRate Decimal @db.Decimal(5, 2)
  latePaymentGraceDays  Int      @default(3)
  
  // Localisation
  locale                String   @default("fr")
  dateFormat            String   @default("DD/MM/YYYY")
  timezone              String   @default("Africa/Douala")
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model User {
  id                String   @id @default(uuid())
  email             String   @unique
  passwordHash      String
  twoFactorSecret   String?
  twoFactorEnabled  Boolean  @default(false)
  isLocked          Boolean  @default(false)
  failedLoginAttempts Int    @default(0)
  lastLoginAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  members           Member[]
  auditLogs         AuditLog[]
  
  @@index([email])
}

// ============================================
// MEMBRES
// ============================================

enum MemberStatus {
  ACTIVE
  OBSERVATION
  RESIGNED
  DECEASED
  TRANSFERRED
}

enum MemberRole {
  MEMBER
  SECRETARY
  TREASURER
  PRESIDENT
  AUDITOR
}

model Member {
  id                String       @id @default(uuid())
  tenantId          String
  tenant            Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId            String
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  memberNumber      String
  firstName         String
  lastName          String
  phone             String
  email             String?
  address           String?
  dateOfBirth       DateTime?
  
  status            MemberStatus @default(ACTIVE)
  role              MemberRole   @default(MEMBER)
  
  joinedAt          DateTime     @default(now())
  entryKitPaid      Boolean      @default(false)
  entryKitAmount    Decimal      @db.Decimal(10, 2)
  
  sponsorId         String?
  sponsor           Member?      @relation("Sponsorship", fields: [sponsorId], references: [id])
  sponsored         Member[]     @relation("Sponsorship")
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  // Relations
  statusHistory     MemberStatusHistory[]
  tontineShares     TontineShare[]
  loans             Loan[]
  coLoans           LoanCoBorrower[]
  savingContributions SavingContribution[]
  aidRequests       Aid[]
  projectContributions ProjectContribution[]
  sessionAttendances SessionAttendance[]
  onlineDeposits    OnlineDeposit[]
  penalties         Penalty[]
  transactions      Transaction[]
  commissionerAssignments CommissionerAssignment[]
  
  @@unique([tenantId, memberNumber])
  @@index([tenantId, status])
  @@index([tenantId, email])
  @@index([sponsorId])
}

model MemberStatusHistory {
  id                String       @id @default(uuid())
  memberId          String
  member            Member       @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  previousStatus    MemberStatus
  newStatus         MemberStatus
  reason            String?
  changedBy         String
  changedAt         DateTime     @default(now())
  
  @@index([memberId])
}


// ============================================
// TONTINES
// ============================================

enum TontineType {
  FIXED_ORDER      // Non vendable, ordre fixe
  AUCTIONABLE      // Vendable aux enchères
}

enum TontineStatus {
  ACTIVE
  COMPLETED
  SUSPENDED
}

model Tontine {
  id                String         @id @default(uuid())
  tenantId          String
  tenant            Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  name              String
  type              TontineType
  status            TontineStatus  @default(ACTIVE)
  contributionAmount Decimal       @db.Decimal(10, 2)
  startDate         DateTime
  endDate           DateTime?
  currentCycle      Int            @default(1)
  currentTurn       Int            @default(1)
  
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  shares            TontineShare[]
  turns             TontineTurn[]
  auctions          TontineAuction[]
  interestSales     TontineInterestSale[]
  
  @@index([tenantId, status])
}

model TontineShare {
  id                String   @id @default(uuid())
  tontineId         String
  tontine           Tontine  @relation(fields: [tontineId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  shareNumber       Int
  accumulatedPrimaryInterests Decimal @db.Decimal(10, 2) @default(0)
  accumulatedSecondaryInterests Decimal @db.Decimal(10, 2) @default(0)
  freeTurnsEarned   Int      @default(0)
  
  createdAt         DateTime @default(now())
  
  turns             TontineTurn[]
  
  @@unique([tontineId, memberId, shareNumber])
  @@index([tontineId, memberId])
}

model TontineTurn {
  id                String       @id @default(uuid())
  tontineId         String
  tontine           Tontine      @relation(fields: [tontineId], references: [id], onDelete: Cascade)
  shareId           String
  share             TontineShare @relation(fields: [shareId], references: [id], onDelete: Cascade)
  
  cycle             Int
  turnNumber        Int
  scheduledDate     DateTime
  actualDate        DateTime?
  
  potAmount         Decimal      @db.Decimal(10, 2)
  primaryInterests  Decimal      @db.Decimal(10, 2) @default(0)
  deductions        Decimal      @db.Decimal(10, 2) @default(0)
  netAmount         Decimal      @db.Decimal(10, 2)
  
  isFree            Boolean      @default(false)
  isCompleted       Boolean      @default(false)
  
  sessionId         String?
  
  createdAt         DateTime     @default(now())
  
  @@unique([tontineId, cycle, turnNumber])
  @@index([tontineId, isCompleted])
  @@index([shareId])
}

model TontineAuction {
  id                String       @id @default(uuid())
  tontineId         String
  tontine           Tontine      @relation(fields: [tontineId], references: [id], onDelete: Cascade)
  
  buyerShareId      String
  sellerShareId     String
  
  originalTurnNumber Int
  newTurnNumber     Int
  
  primaryInterestAmount Decimal  @db.Decimal(10, 2)
  auctionDate       DateTime     @default(now())
  
  @@index([tontineId])
}

model TontineInterestSale {
  id                String   @id @default(uuid())
  tontineId         String
  tontine           Tontine  @relation(fields: [tontineId], references: [id], onDelete: Cascade)
  
  sellerShareId     String
  buyerShareId      String
  
  interestType      String   // PRIMARY, SECONDARY, TERTIARY
  amountSold        Decimal  @db.Decimal(10, 2)
  interestGenerated Decimal  @db.Decimal(10, 2)
  
  saleDate          DateTime @default(now())
  
  @@index([tontineId])
}

// ============================================
// PRÊTS
// ============================================

enum LoanType {
  FUND_LOAN        // Prêt sur fonds
  TONTINE_LOAN     // Prêt tontine
  SAVING_LOAN      // Prêt sur épargne
  MONTHLY_LOAN     // Prêt mensuel à échéances
  COLLECTIVE_LOAN  // Prêt collectif
}

enum LoanStatus {
  PENDING
  APPROVED
  ACTIVE
  COMPLETED
  OVERDUE
  DEFAULTED
}

enum GuaranteeType {
  MATERIAL        // Garantie matérielle
  FUND            // Garantie sur fonds
  CONTRIBUTION    // Garantie sur cotisation
  GUARANTOR       // Avaliste
}

model Loan {
  id                String     @id @default(uuid())
  tenantId          String
  tenant            Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member     @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  loanNumber        String
  type              LoanType
  status            LoanStatus @default(PENDING)
  
  principalAmount   Decimal    @db.Decimal(10, 2)
  interestRate      Decimal    @db.Decimal(5, 2)
  durationMonths    Int
  
  totalInterest     Decimal    @db.Decimal(10, 2)
  totalAmount       Decimal    @db.Decimal(10, 2)
  paidAmount        Decimal    @db.Decimal(10, 2) @default(0)
  remainingAmount   Decimal    @db.Decimal(10, 2)
  
  startDate         DateTime
  endDate           DateTime
  
  renewalCount      Int        @default(0)
  maxRenewals       Int        @default(2)
  
  approvedBy        String?
  approvedAt        DateTime?
  
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  
  guarantees        LoanGuarantee[]
  coBorrowers       LoanCoBorrower[]
  installments      LoanInstallment[]
  payments          LoanPayment[]
  
  @@unique([tenantId, loanNumber])
  @@index([tenantId, status])
  @@index([memberId, status])
}

model LoanGuarantee {
  id                String        @id @default(uuid())
  loanId            String
  loan              Loan          @relation(fields: [loanId], references: [id], onDelete: Cascade)
  
  type              GuaranteeType
  description       String
  value             Decimal       @db.Decimal(10, 2)
  
  guarantorMemberId String?
  
  createdAt         DateTime      @default(now())
  
  @@index([loanId])
}

model LoanCoBorrower {
  id                String   @id @default(uuid())
  loanId            String
  loan              Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  sharePercentage   Decimal  @db.Decimal(5, 2)
  shareAmount       Decimal  @db.Decimal(10, 2)
  paidAmount        Decimal  @db.Decimal(10, 2) @default(0)
  
  createdAt         DateTime @default(now())
  
  @@unique([loanId, memberId])
  @@index([loanId])
  @@index([memberId])
}

model LoanInstallment {
  id                String   @id @default(uuid())
  loanId            String
  loan              Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)
  
  installmentNumber Int
  dueDate           DateTime
  amount            Decimal  @db.Decimal(10, 2)
  principalPart     Decimal  @db.Decimal(10, 2)
  interestPart      Decimal  @db.Decimal(10, 2)
  
  paidAmount        Decimal  @db.Decimal(10, 2) @default(0)
  paidAt            DateTime?
  isPaid            Boolean  @default(false)
  isOverdue         Boolean  @default(false)
  
  @@unique([loanId, installmentNumber])
  @@index([loanId, isPaid])
  @@index([dueDate])
}

model LoanPayment {
  id                String   @id @default(uuid())
  loanId            String
  loan              Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)
  
  amount            Decimal  @db.Decimal(10, 2)
  paymentDate       DateTime @default(now())
  paymentMethod     String
  reference         String?
  
  recordedBy        String
  
  @@index([loanId])
}


// ============================================
// ÉPARGNES
// ============================================

enum SavingType {
  ANNUAL          // Épargne annuelle
  SCHOOL          // Épargne scolaire
}

enum SavingStatus {
  ACTIVE
  CLOSED
  REDISTRIBUTED
}

model Saving {
  id                String        @id @default(uuid())
  tenantId          String
  tenant            Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  name              String
  type              SavingType
  status            SavingStatus  @default(ACTIVE)
  
  startDate         DateTime
  endDate           DateTime
  redistributionDate DateTime?
  
  totalCollected    Decimal       @db.Decimal(10, 2) @default(0)
  interestRate      Decimal       @db.Decimal(5, 2)
  totalInterest     Decimal       @db.Decimal(10, 2) @default(0)
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  contributions     SavingContribution[]
  redistributions   SavingRedistribution[]
  
  @@index([tenantId, status])
}

model SavingContribution {
  id                String   @id @default(uuid())
  savingId          String
  saving            Saving   @relation(fields: [savingId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  amount            Decimal  @db.Decimal(10, 2)
  contributionDate  DateTime @default(now())
  sessionId         String?
  
  @@index([savingId, memberId])
  @@index([memberId])
}

model SavingRedistribution {
  id                String   @id @default(uuid())
  savingId          String
  saving            Saving   @relation(fields: [savingId], references: [id], onDelete: Cascade)
  memberId          String
  
  totalContributed  Decimal  @db.Decimal(10, 2)
  interestEarned    Decimal  @db.Decimal(10, 2)
  deductions        Decimal  @db.Decimal(10, 2) @default(0)
  netAmount         Decimal  @db.Decimal(10, 2)
  
  redistributedAt   DateTime @default(now())
  
  @@index([savingId])
  @@index([memberId])
}

// ============================================
// AIDES & DONS
// ============================================

enum AidType {
  ILLNESS
  DEATH
}

enum AidStatus {
  PENDING
  APPROVED
  REJECTED
  PAID
}

enum BeneficiaryType {
  MEMBER
  SPOUSE
  PARENT
  CHILD
}

model Aid {
  id                String          @id @default(uuid())
  tenantId          String
  tenant            Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member          @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  type              AidType
  status            AidStatus       @default(PENDING)
  beneficiaryType   BeneficiaryType?
  
  amount            Decimal         @db.Decimal(10, 2)
  description       String
  justificationUrl  String?
  
  requestedAt       DateTime        @default(now())
  approvedBy        String?
  approvedAt        DateTime?
  paidAt            DateTime?
  
  commissionerAssignments CommissionerAssignment[]
  
  @@index([tenantId, status])
  @@index([memberId])
}

model CommissionerAssignment {
  id                String   @id @default(uuid())
  aidId             String
  aid               Aid      @relation(fields: [aidId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  assignedAt        DateTime @default(now())
  visitCompleted    Boolean  @default(false)
  visitDate         DateTime?
  
  @@index([aidId])
  @@index([memberId])
}

// ============================================
// PROJETS COMMUNAUTAIRES
// ============================================

enum ProjectDuration {
  SHORT_TERM
  MEDIUM_TERM
  LONG_TERM
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  COMPLETED
  CANCELLED
}

model Project {
  id                String          @id @default(uuid())
  tenantId          String
  tenant            Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  name              String
  description       String
  duration          ProjectDuration
  status            ProjectStatus   @default(PLANNING)
  
  targetAmount      Decimal         @db.Decimal(10, 2)
  collectedAmount   Decimal         @db.Decimal(10, 2) @default(0)
  
  isVoluntary       Boolean         @default(true)
  isEphemeral       Boolean         @default(false)
  
  startDate         DateTime
  endDate           DateTime?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  phases            ProjectPhase[]
  contributions     ProjectContribution[]
  
  @@index([tenantId, status])
}

model ProjectPhase {
  id                String   @id @default(uuid())
  projectId         String
  project           Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  name              String
  description       String?
  targetAmount      Decimal  @db.Decimal(10, 2)
  collectedAmount   Decimal  @db.Decimal(10, 2) @default(0)
  
  startDate         DateTime
  endDate           DateTime?
  isCompleted       Boolean  @default(false)
  
  @@index([projectId])
}

model ProjectContribution {
  id                String   @id @default(uuid())
  projectId         String
  project           Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  amount            Decimal  @db.Decimal(10, 2)
  phaseId           String?
  contributionDate  DateTime @default(now())
  
  @@index([projectId, memberId])
  @@index([memberId])
}

// ============================================
// SANCTIONS & PÉNALITÉS
// ============================================

enum PenaltyType {
  ABSENCE
  LATE_PAYMENT
  LATE_CONTRIBUTION
  CUSTOM
}

enum PenaltyCalculationMode {
  FIXED
  PERCENTAGE
  PROGRESSIVE
}

enum PenaltyStatus {
  PENDING
  PAID
  WAIVED
}

model Penalty {
  id                String                  @id @default(uuid())
  tenantId          String
  memberId          String
  member            Member                  @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  type              PenaltyType
  calculationMode   PenaltyCalculationMode
  amount            Decimal                 @db.Decimal(10, 2)
  status            PenaltyStatus           @default(PENDING)
  
  reason            String
  graceDaysUsed     Int                     @default(0)
  
  appliedAt         DateTime                @default(now())
  paidAt            DateTime?
  waivedBy          String?
  waivedAt          DateTime?
  waivedReason      String?
  
  @@index([memberId, status])
}


// ============================================
// SÉANCES & PRÉSENCES
// ============================================

model Session {
  id                String              @id @default(uuid())
  tenantId          String
  tenant            Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  sessionNumber     Int
  sessionDate       DateTime
  location          String?
  
  minutesUrl        String?
  isClosed          Boolean             @default(false)
  closedAt          DateTime?
  closedBy          String?
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  attendances       SessionAttendance[]
  transactions      Transaction[]
  
  @@unique([tenantId, sessionNumber])
  @@index([tenantId, sessionDate])
}

model SessionAttendance {
  id                String   @id @default(uuid())
  sessionId         String
  session           Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  memberId          String
  member            Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  isPresent         Boolean
  arrivalTime       DateTime?
  
  @@unique([sessionId, memberId])
  @@index([sessionId])
  @@index([memberId])
}

// ============================================
// CAISSES & TRANSACTIONS
// ============================================

enum CashBoxType {
  FUND
  PENALTY
  SAVING
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  BANK_DEPOSIT
  TONTINE_CONTRIBUTION
  TONTINE_BENEFIT
  LOAN_DISBURSEMENT
  LOAN_REPAYMENT
  SAVING_CONTRIBUTION
  SAVING_REDISTRIBUTION
  AID_PAYMENT
  PROJECT_CONTRIBUTION
  PENALTY_PAYMENT
  ENTRY_KIT
  COMPLEMENT_FUND
  TRANSFER
}

model CashBox {
  id                String          @id @default(uuid())
  tenantId          String
  tenant            Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  type              CashBoxType     @unique
  balance           Decimal         @db.Decimal(10, 2) @default(0)
  
  updatedAt         DateTime        @updatedAt
  
  transactions      Transaction[]
  
  @@unique([tenantId, type])
  @@index([tenantId])
}

model Transaction {
  id                String          @id @default(uuid())
  tenantId          String
  cashBoxId         String
  cashBox           CashBox         @relation(fields: [cashBoxId], references: [id], onDelete: Cascade)
  
  type              TransactionType
  amount            Decimal         @db.Decimal(10, 2)
  
  memberId          String?
  member            Member?         @relation(fields: [memberId], references: [id])
  
  sessionId         String?
  session           Session?        @relation(fields: [sessionId], references: [id])
  
  reference         String?
  description       String
  justification     String?
  
  balanceBefore     Decimal         @db.Decimal(10, 2)
  balanceAfter      Decimal         @db.Decimal(10, 2)
  
  recordedBy        String
  recordedAt        DateTime        @default(now())
  
  @@index([cashBoxId])
  @@index([memberId])
  @@index([sessionId])
  @@index([recordedAt])
}

// ============================================
// DÉPÔTS EN LIGNE
// ============================================

enum OnlineDepositStatus {
  PENDING
  VALIDATED
  REJECTED
}

enum PaymentMethod {
  BANK_TRANSFER
  MOBILE_MONEY
  CASH
  OTHER
}

model OnlineDeposit {
  id                String              @id @default(uuid())
  tenantId          String
  memberId          String
  member            Member              @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  amount            Decimal             @db.Decimal(10, 2)
  paymentMethod     PaymentMethod
  reference         String
  proofUrl          String?
  
  status            OnlineDepositStatus @default(PENDING)
  
  submittedAt       DateTime            @default(now())
  validatedBy       String?
  validatedAt       DateTime?
  rejectedReason    String?
  
  @@index([memberId, status])
  @@index([status])
}

// ============================================
// NOTIFICATIONS
// ============================================

enum NotificationType {
  CONTRIBUTION_REMINDER
  LOAN_INSTALLMENT_DUE
  COMMISSIONER_ASSIGNMENT
  DEPOSIT_VALIDATED
  DEPOSIT_REJECTED
  SESSION_REMINDER
  PENALTY_APPLIED
  AID_APPROVED
  GENERAL_ANNOUNCEMENT
}

enum NotificationChannel {
  EMAIL
  SMS
  IN_APP
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  READ
}

model Notification {
  id                String              @id @default(uuid())
  tenantId          String
  recipientId       String
  
  type              NotificationType
  channel           NotificationChannel
  status            NotificationStatus  @default(PENDING)
  
  subject           String?
  message           String
  data              Json?
  
  scheduledFor      DateTime?
  sentAt            DateTime?
  readAt            DateTime?
  
  createdAt         DateTime            @default(now())
  
  @@index([recipientId, status])
  @@index([scheduledFor])
}

// ============================================
// AUDIT & TRAÇABILITÉ
// ============================================

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  STATUS_CHANGE
  APPROVE
  REJECT
  VALIDATE
}

model AuditLog {
  id                String      @id @default(uuid())
  tenantId          String
  tenant            Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  entityType        String
  entityId          String
  action            AuditAction
  
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  before            Json?
  after             Json?
  changes           Json?
  
  ipAddress         String?
  userAgent         String?
  
  createdAt         DateTime    @default(now())
  
  @@index([tenantId, entityType, entityId])
  @@index([userId])
  @@index([createdAt])
}

// ============================================
// VOTES & DÉCISIONS
// ============================================

enum VoteStatus {
  OPEN
  CLOSED
}

model Vote {
  id                String      @id @default(uuid())
  tenantId          String
  
  question          String
  description       String?
  
  status            VoteStatus  @default(OPEN)
  
  createdBy         String
  createdAt         DateTime    @default(now())
  closedAt          DateTime?
  
  options           VoteOption[]
  ballots           Ballot[]
  
  @@index([tenantId, status])
}

model VoteOption {
  id                String   @id @default(uuid())
  voteId            String
  vote              Vote     @relation(fields: [voteId], references: [id], onDelete: Cascade)
  
  optionText        String
  voteCount         Int      @default(0)
  
  ballots           Ballot[]
  
  @@index([voteId])
}

model Ballot {
  id                String     @id @default(uuid())
  voteId            String
  vote              Vote       @relation(fields: [voteId], references: [id], onDelete: Cascade)
  optionId          String
  option            VoteOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  memberId          String
  
  castedAt          DateTime   @default(now())
  
  @@unique([voteId, memberId])
  @@index([voteId])
}

// ============================================
// PÉRIODES FISCALES
// ============================================

enum FiscalPeriodStatus {
  OPEN
  CLOSED
}

model FiscalPeriod {
  id                String             @id @default(uuid())
  tenantId          String
  
  name              String
  startDate         DateTime
  endDate           DateTime
  
  status            FiscalPeriodStatus @default(OPEN)
  closedAt          DateTime?
  closedBy          String?
  
  reportUrl         String?
  
  @@index([tenantId, status])
}
```

### Stratégie d'Indexation

Les index sont cruciaux pour la performance dans un système multi-tenant:

1. **Index Composites Multi-Tenant**: Tous les index incluent `tenantId` en premier pour isolation
2. **Index de Recherche**: Sur les champs fréquemment recherchés (email, phone, memberNumber)
3. **Index de Filtrage**: Sur les statuts et dates pour les requêtes de filtrage
4. **Index de Relations**: Sur les clés étrangères pour les jointures
5. **Index Full-Text**: Pour la recherche textuelle (noms, descriptions)

### Contraintes d'Intégrité

1. **Cascade Delete**: Suppression en cascade pour maintenir la cohérence
2. **Unique Constraints**: Empêcher les doublons (memberNumber par tenant, etc.)
3. **Check Constraints**: Validation au niveau DB (montants positifs, pourcentages 0-100)
4. **Foreign Keys**: Garantir l'intégrité référentielle


## Algorithmes de Calculs Financiers

### Calcul d'Intérêts Simples

```typescript
function calculateSimpleInterest(
  principal: Decimal,
  annualRate: Decimal,
  durationMonths: number
): Decimal {
  // I = P * r * t
  // où r est le taux mensuel et t la durée en mois
  const monthlyRate = annualRate.div(12).div(100);
  const interest = principal.mul(monthlyRate).mul(durationMonths);
  return interest.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
```

### Calcul d'Intérêts Composés

```typescript
function calculateCompoundInterest(
  principal: Decimal,
  annualRate: Decimal,
  durationMonths: number,
  compoundingFrequency: number = 12 // mensuel par défaut
): Decimal {
  // A = P(1 + r/n)^(nt)
  // I = A - P
  const rate = annualRate.div(100);
  const n = new Decimal(compoundingFrequency);
  const t = new Decimal(durationMonths).div(12);
  
  const amount = principal.mul(
    new Decimal(1).plus(rate.div(n)).pow(n.mul(t))
  );
  
  const interest = amount.minus(principal);
  return interest.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
```

### Calcul de Mensualité de Prêt

```typescript
function calculateLoanInstallment(
  principal: Decimal,
  annualRate: Decimal,
  durationMonths: number
): Decimal {
  // M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = annualRate.div(12).div(100);
  const n = new Decimal(durationMonths);
  
  if (monthlyRate.isZero()) {
    return principal.div(n).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
  
  const onePlusR = new Decimal(1).plus(monthlyRate);
  const numerator = principal.mul(monthlyRate).mul(onePlusR.pow(n));
  const denominator = onePlusR.pow(n).minus(1);
  
  const installment = numerator.div(denominator);
  return installment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
```

### Calcul des Retenues Automatiques

```typescript
interface DeductionBreakdown {
  loanRepayments: Decimal;
  penalties: Decimal;
  complementFund: Decimal;
  totalDeductions: Decimal;
  netAmount: Decimal;
}

async function calculateAutomaticDeductions(
  benefitAmount: Decimal,
  memberId: string,
  tenantId: string
): Promise<DeductionBreakdown> {
  // 1. Récupérer tous les prêts actifs du membre
  const activeLoans = await prisma.loan.findMany({
    where: {
      memberId,
      tenantId,
      status: { in: ['ACTIVE', 'OVERDUE'] }
    }
  });
  
  // 2. Calculer le total des remboursements de prêts
  let loanRepayments = new Decimal(0);
  for (const loan of activeLoans) {
    const remaining = new Decimal(loan.remainingAmount);
    loanRepayments = loanRepayments.plus(remaining);
  }
  
  // 3. Récupérer toutes les pénalités impayées
  const unpaidPenalties = await prisma.penalty.findMany({
    where: {
      memberId,
      status: 'PENDING'
    }
  });
  
  const penalties = unpaidPenalties.reduce(
    (sum, p) => sum.plus(new Decimal(p.amount)),
    new Decimal(0)
  );
  
  // 4. Récupérer le complément fonds dû
  const complementFund = await getComplementFundDue(memberId, tenantId);
  
  // 5. Calculer le total des retenues
  const totalDeductions = loanRepayments
    .plus(penalties)
    .plus(complementFund);
  
  // 6. Calculer le montant net (ne peut pas être négatif)
  const netAmount = Decimal.max(
    benefitAmount.minus(totalDeductions),
    new Decimal(0)
  );
  
  return {
    loanRepayments: loanRepayments.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    penalties: penalties.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    complementFund: complementFund.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    totalDeductions: totalDeductions.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    netAmount: netAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  };
}
```

### Calcul de Redistribution Proportionnelle

```typescript
function calculateProportionalDistribution(
  totalAmount: Decimal,
  contributions: Map<string, Decimal>
): Map<string, Decimal> {
  // Calculer le total des contributions
  const totalContributions = Array.from(contributions.values())
    .reduce((sum, amount) => sum.plus(amount), new Decimal(0));
  
  if (totalContributions.isZero()) {
    throw new Error('Total contributions cannot be zero');
  }
  
  const distribution = new Map<string, Decimal>();
  let distributedSum = new Decimal(0);
  const entries = Array.from(contributions.entries());
  
  // Calculer la part de chaque membre (sauf le dernier)
  for (let i = 0; i < entries.length - 1; i++) {
    const [memberId, contribution] = entries[i];
    const proportion = contribution.div(totalContributions);
    const share = totalAmount.mul(proportion)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    
    distribution.set(memberId, share);
    distributedSum = distributedSum.plus(share);
  }
  
  // Le dernier membre reçoit le reste pour éviter les erreurs d'arrondi
  const [lastMemberId] = entries[entries.length - 1];
  const lastShare = totalAmount.minus(distributedSum);
  distribution.set(lastMemberId, lastShare);
  
  return distribution;
}
```

### Calcul de la Situation Nette d'un Membre

```typescript
interface MemberBalance {
  credits: {
    tontineContributions: Decimal;
    savingContributions: Decimal;
    projectContributions: Decimal;
    tontineBenefitsReceived: Decimal;
    savingRedistributions: Decimal;
    entryKitPaid: Decimal;
  };
  debts: {
    activeLoans: Decimal;
    unpaidPenalties: Decimal;
    complementFundDue: Decimal;
  };
  netBalance: Decimal;
}

async function calculateMemberNetBalance(
  memberId: string,
  tenantId: string
): Promise<MemberBalance> {
  // Crédits
  const tontineContributions = await sumTontineContributions(memberId, tenantId);
  const savingContributions = await sumSavingContributions(memberId, tenantId);
  const projectContributions = await sumProjectContributions(memberId, tenantId);
  const tontineBenefits = await sumTontineBenefits(memberId, tenantId);
  const savingRedistributions = await sumSavingRedistributions(memberId, tenantId);
  const entryKit = await getEntryKitAmount(memberId, tenantId);
  
  // Dettes
  const activeLoans = await sumActiveLoans(memberId, tenantId);
  const unpaidPenalties = await sumUnpaidPenalties(memberId, tenantId);
  const complementFund = await getComplementFundDue(memberId, tenantId);
  
  // Calcul du solde net
  const totalCredits = tontineContributions
    .plus(savingContributions)
    .plus(projectContributions)
    .plus(entryKit);
  
  const totalDebts = activeLoans
    .plus(unpaidPenalties)
    .plus(complementFund);
  
  const totalBenefits = tontineBenefits
    .plus(savingRedistributions);
  
  const netBalance = totalCredits
    .plus(totalBenefits)
    .minus(totalDebts);
  
  return {
    credits: {
      tontineContributions,
      savingContributions,
      projectContributions,
      tontineBenefitsReceived: tontineBenefits,
      savingRedistributions,
      entryKitPaid: entryKit
    },
    debts: {
      activeLoans,
      unpaidPenalties,
      complementFundDue: complementFund
    },
    netBalance: netBalance.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  };
}
```

### Calcul des Tours Gratuits de Tontine

```typescript
async function checkAndGrantFreeTurn(
  shareId: string,
  tontineId: string
): Promise<boolean> {
  const share = await prisma.tontineShare.findUnique({
    where: { id: shareId },
    include: { tontine: true }
  });
  
  if (!share) return false;
  
  const accumulatedInterests = new Decimal(share.accumulatedPrimaryInterests);
  const potAmount = new Decimal(share.tontine.contributionAmount);
  
  // Si les intérêts cumulés égalent ou dépassent la cagnotte
  if (accumulatedInterests.gte(potAmount)) {
    // Déduire le montant de la cagnotte des intérêts
    const newAccumulated = accumulatedInterests.minus(potAmount);
    
    // Mettre à jour la part
    await prisma.tontineShare.update({
      where: { id: shareId },
      data: {
        accumulatedPrimaryInterests: newAccumulated.toFixed(2),
        freeTurnsEarned: { increment: 1 }
      }
    });
    
    // Créer un tour gratuit
    await createFreeTontineTurn(shareId, tontineId);
    
    return true;
  }
  
  return false;
}
```

### Calcul de Pénalité Progressive

```typescript
function calculateProgressivePenalty(
  baseAmount: Decimal,
  daysLate: number,
  graceDays: number
): Decimal {
  if (daysLate <= graceDays) {
    return new Decimal(0);
  }
  
  const effectiveDaysLate = daysLate - graceDays;
  
  // Pénalité progressive: 1% par jour les 7 premiers jours,
  // puis 2% par jour les 7 suivants, puis 3% par jour après
  let penaltyRate = new Decimal(0);
  
  if (effectiveDaysLate <= 7) {
    penaltyRate = new Decimal(effectiveDaysLate).mul(0.01);
  } else if (effectiveDaysLate <= 14) {
    penaltyRate = new Decimal(7).mul(0.01)
      .plus(new Decimal(effectiveDaysLate - 7).mul(0.02));
  } else {
    penaltyRate = new Decimal(7).mul(0.01)
      .plus(new Decimal(7).mul(0.02))
      .plus(new Decimal(effectiveDaysLate - 14).mul(0.03));
  }
  
  const penalty = baseAmount.mul(penaltyRate);
  return penalty.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
```


## Propriétés de Correction

*Une propriété est une caractéristique ou un comportement qui doit être vrai pour toutes les exécutions valides d'un système - essentiellement, une déclaration formelle sur ce que le système doit faire. Les propriétés servent de pont entre les spécifications lisibles par l'homme et les garanties de correction vérifiables par machine.*

### Propriété 1: Isolation Multi-Tenant Complète

*Pour tout* tenant A et tenant B (A ≠ B), et pour toute requête effectuée avec les credentials du tenant A, aucune donnée du tenant B ne doit être retournée ou accessible.

**Valide: Exigences 1.2, 1.4**

### Propriété 2: Identification Automatique du Tenant

*Pour tout* JWT token valide, le système doit extraire automatiquement le tenant_id et l'injecter dans toutes les requêtes de base de données sans intervention manuelle.

**Valide: Exigences 1.3**

### Propriété 3: Invariant du Statut Membre

*Pour tout* membre à tout instant, le membre doit avoir exactement un statut parmi {ACTIVE, OBSERVATION, RESIGNED, DECEASED, TRANSFERRED}.

**Valide: Exigences 2.2**

### Propriété 4: Calcul Automatique du Kit d'Entrée

*Pour tout* nouveau membre créé, le montant du kit d'entrée doit être égal au montant configuré dans TenantConfig au moment de la création.

**Valide: Exigences 2.1**

### Propriété 5: Historique Complet des Changements de Statut

*Pour tout* changement de statut d'un membre, une entrée MemberStatusHistory doit être créée avec previousStatus, newStatus, changedBy et changedAt renseignés.

**Valide: Exigences 2.6**

### Propriété 6: Invariant de la Cagnotte Tontine

*Pour toute* séance de tontine, la cagnotte totale doit être égale à la somme de toutes les cotisations collectées lors de cette séance plus les intérêts primaires de vente aux enchères.

**Valide: Exigences 3.6, 4.3**

### Propriété 7: Multiplication des Cotisations par Nombre de Parts

*Pour tout* membre possédant N parts dans une tontine avec cotisation de base C, le montant total de cotisation du membre doit être égal à N × C.

**Valide: Exigences 3.5**

### Propriété 8: Ordre des Tours de Tontine

*Pour toute* tontine classique non vendable, les bénéficiaires doivent recevoir la cagnotte dans l'ordre établi initialement, et cet ordre ne doit pas changer pendant un cycle.

**Valide: Exigences 3.3**

### Propriété 9: Réinitialisation de Cycle Tontine

*Pour toute* tontine où toutes les parts ont bénéficié exactement une fois, le système doit incrémenter le numéro de cycle et réinitialiser le compteur de tours à 1.

**Valide: Exigences 3.7**

### Propriété 10: Attribution Automatique de Tour Gratuit

*Pour toute* part de tontine où les intérêts primaires cumulés atteignent ou dépassent le montant de la cagnotte, un tour gratuit doit être automatiquement attribué et les intérêts doivent être réduits du montant de la cagnotte.

**Valide: Exigences 4.5**

### Propriété 11: Génération d'Intérêts Secondaires

*Pour toute* vente d'intérêts primaires, des intérêts secondaires doivent être générés pour l'acheteur, et pour toute vente d'intérêts secondaires, des intérêts tertiaires doivent être générés.

**Valide: Exigences 5.3, 5.4**

### Propriété 12: Invariant des Retenues

*Pour tout* bénéfice de tontine, le montant net versé au bénéficiaire doit être égal au montant de la cagnotte moins la somme de toutes les retenues (prêts + pénalités + complément fonds).

**Valide: Exigences 6.5**

### Propriété 13: Débit de Caisse lors d'Octroi de Prêt

*Pour tout* prêt sur fonds accordé avec montant P, le solde de la Caisse_Fonds doit diminuer exactement de P au moment de l'octroi.

**Valide: Exigences 7.3**

### Propriété 14: Garantie Obligatoire pour Prêt sur Fonds

*Pour tout* prêt sur fonds, il doit exister au moins une garantie associée, sinon la création du prêt doit être rejetée.

**Valide: Exigences 7.2**

### Propriété 15: Limite de Reconduction de Prêt

*Pour tout* prêt, le nombre de reconductions ne doit jamais dépasser 2, et toute tentative de 3ème reconduction doit être rejetée.

**Valide: Exigences 7.7**

### Propriété 16: Limite de Montant Prêt Tontine

*Pour tout* prêt tontine, le montant du prêt ne doit pas dépasser le montant de la cotisation tontine due, sinon la création doit être rejetée.

**Valide: Exigences 8.2**

### Propriété 17: Remboursement Automatique Prêt Tontine

*Pour tout* membre ayant un prêt tontine actif, lorsque ce membre reçoit un bénéfice tontine, le prêt tontine et ses intérêts doivent être automatiquement déduits du bénéfice.

**Valide: Exigences 8.4**

### Propriété 18: Somme des Échéances Égale au Total du Prêt

*Pour tout* prêt avec échéancier, la somme de toutes les mensualités (capital + intérêts) doit être égale au montant total du prêt (principal + intérêts totaux).

**Valide: Exigences 9.2**

### Propriété 19: Somme des Parts de Co-Emprunteurs

*Pour tout* prêt collectif, la somme des pourcentages de responsabilité de tous les co-emprunteurs doit être égale à 100%.

**Valide: Exigences 10.2**

### Propriété 20: Redistribution Proportionnelle d'Épargne

*Pour toute* redistribution d'épargne avec montant total T et contributions individuelles C₁, C₂, ..., Cₙ, chaque membre i doit recevoir (Cᵢ / ΣC) × T, et la somme de toutes les redistributions doit égaler T.

**Valide: Exigences 11.3**

### Propriété 21: Limite de Prêt sur Épargne

*Pour tout* membre avec épargne accumulée E, le montant maximum de prêt sur épargne autorisé doit être 0.8 × E, et toute demande dépassant cette limite doit être rejetée.

**Valide: Exigences 13.1, 13.4**

### Propriété 22: Déduction Automatique Prêt sur Épargne

*Pour tout* membre ayant un prêt sur épargne actif, lors de la redistribution annuelle, le montant du prêt et ses intérêts doivent être automatiquement déduits de la redistribution du membre.

**Valide: Exigences 13.3**

### Propriété 23: Calcul du Montant d'Aide selon Type de Bénéficiaire

*Pour toute* aide décès, le montant doit correspondre exactement au montant configuré dans TenantConfig pour le type de bénéficiaire (MEMBER, SPOUSE, PARENT, CHILD).

**Valide: Exigences 15.2**

### Propriété 24: Désignation Automatique de Commissionnaire

*Pour toute* aide décès approuvée, exactement un commissionnaire doit être désigné automatiquement selon un système de rotation équitable parmi les membres actifs.

**Valide: Exigences 15.3**

### Propriété 25: Invariant des Trois Caisses

*Pour tout* tenant, il doit exister exactement trois caisses: FUND, PENALTY, et SAVING, ni plus ni moins.

**Valide: Exigences 21.1**

### Propriété 26: Invariant du Solde de Caisse

*Pour toute* caisse à tout instant, le solde doit être égal à la somme de toutes les entrées moins la somme de toutes les sorties depuis la création de la caisse.

**Valide: Exigences 21.3**

### Propriété 27: Justification Obligatoire pour Décharge

*Pour toute* transaction de type WITHDRAWAL (décharge), un champ justification non vide doit être fourni, sinon la transaction doit être rejetée.

**Valide: Exigences 21.4**

### Propriété 28: Traçabilité Complète des Transactions

*Pour toute* transaction, les champs recordedBy, recordedAt, amount, balanceBefore et balanceAfter doivent tous être renseignés et non nuls.

**Valide: Exigences 21.7**

### Propriété 29: Calcul de la Situation Nette Association

*Pour toute* association, la situation nette doit être égale à (somme des soldes des trois caisses + prêts en cours + épargnes) - (dettes + engagements).

**Valide: Exigences 22.4**

### Propriété 30: Calcul de la Situation Nette Membre

*Pour tout* membre, le solde net doit être égal à (cotisations payées + bénéfices reçus) - (prêts en cours + pénalités impayées + complément fonds dû).

**Valide: Exigences 23.6**

### Propriété 31: Notification Avant Échéance

*Pour toute* cotisation due dans 3 jours ou échéance de prêt due dans 5 jours, une notification doit être envoyée au membre concerné.

**Valide: Exigences 24.2, 24.3**

### Propriété 32: Historique Complet des Notifications

*Pour toute* notification envoyée, une entrée doit être créée dans la table Notification avec type, channel, status, recipientId et sentAt renseignés.

**Valide: Exigences 24.7**

### Propriété 33: Calcul Automatique des Résultats de Vote

*Pour tout* vote clos, le nombre total de votes doit être égal à la somme des votes pour chaque option, et chaque membre ne doit avoir voté qu'une seule fois.

**Valide: Exigences 25.3**

### Propriété 34: Enregistrement Audit Complet

*Pour toute* modification de données financières, une entrée AuditLog doit être créée avec entityType, entityId, action, userId, before, after et createdAt renseignés.

**Valide: Exigences 26.1, 26.2, 26.3**

### Propriété 35: Restriction d'Accès par Rôle

*Pour tout* membre avec rôle MEMBER, toute tentative d'accès aux fonctions financières (création de prêt, validation de dépôt, décharge de caisse) doit être rejetée avec erreur 403 Forbidden.

**Valide: Exigences 27.3, 27.4, 27.8**

### Propriété 36: Arithmétique Décimale pour Calculs Monétaires

*Pour tout* calcul impliquant des montants monétaires, le type Decimal doit être utilisé (jamais float ou double), et tous les résultats doivent être arrondis à exactement 2 décimales.

**Valide: Exigences 29.1, 29.2**

### Propriété 37: Invariant de Redistribution Complète

*Pour toute* redistribution (tontine ou épargne), la somme de (montant_distribué + montant_retenu) doit être égale au montant_total disponible, sans perte ni création d'argent.

**Valide: Exigences 29.5**

### Propriété 38: Verrouillage de Compte après Échecs de Connexion

*Pour tout* compte utilisateur, après exactement 5 tentatives de connexion échouées consécutives, le compte doit être verrouillé (isLocked = true) et toute tentative ultérieure doit être rejetée.

**Valide: Exigences 31.4**

### Propriété 39: Round-Trip Export/Import

*Pour toutes* données valides exportées puis importées, les données résultantes doivent être équivalentes aux données originales (préservation de la structure et des valeurs).

**Valide: Exigences 32.7**

### Propriété 40: Transitions d'État Valides Uniquement

*Pour tout* membre, les seules transitions de statut autorisées sont: ACTIVE ↔ OBSERVATION, ACTIVE → RESIGNED, ACTIVE → DECEASED, OBSERVATION → RESIGNED, OBSERVATION → DECEASED. Toute autre transition (notamment vers ACTIVE depuis DECEASED) doit être rejetée.

**Valide: Exigences 33.6**

### Propriété 41: Déclenchement Automatique Aide Décès

*Pour tout* membre dont le statut passe à DECEASED, une aide décès de type DEATH avec beneficiaryType MEMBER doit être automatiquement créée avec le montant configuré.

**Valide: Exigences 33.3**

### Propriété 42: Immutabilité des Périodes Fiscales Clôturées

*Pour toute* période fiscale avec status CLOSED, toute tentative de modification ou suppression de transactions appartenant à cette période doit être rejetée avec erreur.

**Valide: Exigences 38.3**

### Propriété 43: Limite Globale des Remises

*Pour toute* association dans une année fiscale, la somme de toutes les remises accordées ne doit pas dépasser 10% du total des cotisations annuelles, sinon la nouvelle remise doit être rejetée.

**Valide: Exigences 39.6**

### Propriété 44: Unicité des Références de Paiement Mobile

*Pour tout* paiement mobile initié, la référence générée doit être unique dans tout le système (aucune collision possible entre tenants ou transactions).

**Valide: Exigences 40.2**

### Propriété 45: Alerte sur Seuil de Caisse Bas

*Pour toute* caisse dont le solde descend en dessous du seuil configuré, une alerte doit être immédiatement envoyée au Trésorier et au Président.

**Valide: Exigences 43.1**

### Propriété 46: Pagination pour Grandes Listes

*Pour toute* requête retournant plus de 50 éléments, le système doit automatiquement appliquer la pagination et retourner les résultats par pages.

**Valide: Exigences 44.5**

### Propriété 47: Enregistrement des Erreurs avec Stack Trace

*Pour toute* erreur survenant dans le système, une entrée de log doit être créée avec le message d'erreur complet, le stack trace, le timestamp et le contexte d'exécution.

**Valide: Exigences 45.2**


## Gestion des Erreurs

### Stratégie Globale

Le système utilise une approche structurée de gestion des erreurs avec:
- Exceptions typées pour chaque catégorie d'erreur
- Messages d'erreur descriptifs et localisés
- Codes d'erreur standardisés
- Logging automatique de toutes les erreurs
- Réponses HTTP appropriées

### Hiérarchie des Exceptions

```typescript
// Exception de base
class AppException extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Exceptions métier
class BusinessRuleException extends AppException {
  constructor(message: string, details?: any) {
    super('BUSINESS_RULE_VIOLATION', message, 400, details);
  }
}

class ValidationException extends AppException {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

class NotFoundException extends AppException {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404);
  }
}

class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized access') {
    super('UNAUTHORIZED', message, 401);
  }
}

class ForbiddenException extends AppException {
  constructor(message: string = 'Access forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

class TenantIsolationException extends AppException {
  constructor() {
    super('TENANT_ISOLATION_VIOLATION', 'Attempted access to another tenant data', 403);
  }
}

class InsufficientFundsException extends AppException {
  constructor(required: Decimal, available: Decimal) {
    super(
      'INSUFFICIENT_FUNDS',
      `Insufficient funds: required ${required}, available ${available}`,
      400,
      { required: required.toString(), available: available.toString() }
    );
  }
}

class InvalidStateTransitionException extends AppException {
  constructor(from: string, to: string) {
    super(
      'INVALID_STATE_TRANSITION',
      `Invalid state transition from ${from} to ${to}`,
      400,
      { from, to }
    );
  }
}

class LoanLimitExceededException extends AppException {
  constructor(type: string, limit: number, current: number) {
    super(
      'LOAN_LIMIT_EXCEEDED',
      `${type} limit exceeded: current ${current}, limit ${limit}`,
      400,
      { type, limit, current }
    );
  }
}
```

### Gestion des Erreurs par Couche

#### Couche API (Controllers)
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = undefined;

    if (exception instanceof AppException) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log l'erreur
    this.logger.error({
      code,
      message,
      details,
      path: request.url,
      method: request.method,
      userId: request.user?.id,
      tenantId: request.user?.tenantId,
      stack: exception instanceof Error ? exception.stack : undefined
    });

    // Réponse au client
    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url
      }
    });
  }
}
```

#### Couche Service (Business Logic)
```typescript
class LoanService {
  async createLoan(data: CreateLoanDto, userId: string, tenantId: string): Promise<Loan> {
    // Validation
    if (data.principalAmount.lte(0)) {
      throw new ValidationException('Loan amount must be positive');
    }

    // Vérifier les garanties
    if (!data.guarantees || data.guarantees.length === 0) {
      throw new BusinessRuleException('At least one guarantee is required for fund loans');
    }

    // Vérifier le solde de caisse
    const cashBox = await this.getCashBox(tenantId, CashBoxType.FUND);
    if (new Decimal(cashBox.balance).lt(data.principalAmount)) {
      throw new InsufficientFundsException(
        data.principalAmount,
        new Decimal(cashBox.balance)
      );
    }

    // Vérifier la limite de prêts actifs
    const activeLoansCount = await this.countActiveLoans(data.memberId, tenantId);
    const maxLoans = await this.getMaxActiveLoans(tenantId);
    if (activeLoansCount >= maxLoans) {
      throw new LoanLimitExceededException('Active loans', maxLoans, activeLoansCount);
    }

    // Créer le prêt dans une transaction
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Créer le prêt
        const loan = await tx.loan.create({ data: { ...data, tenantId } });

        // Débiter la caisse
        await this.debitCashBox(tx, tenantId, CashBoxType.FUND, data.principalAmount, userId);

        // Créer les garanties
        await tx.loanGuarantee.createMany({
          data: data.guarantees.map(g => ({ ...g, loanId: loan.id }))
        });

        // Audit log
        await this.auditService.log(tx, {
          tenantId,
          entityType: 'Loan',
          entityId: loan.id,
          action: AuditAction.CREATE,
          userId,
          after: loan
        });

        return loan;
      });
    } catch (error) {
      this.logger.error('Failed to create loan', { error, data, userId, tenantId });
      throw error;
    }
  }
}
```

#### Couche Base de Données
```typescript
// Gestion des erreurs Prisma
function handlePrismaError(error: any): never {
  if (error.code === 'P2002') {
    // Unique constraint violation
    throw new ValidationException(
      `Duplicate entry for ${error.meta?.target?.join(', ')}`,
      { fields: error.meta?.target }
    );
  }

  if (error.code === 'P2025') {
    // Record not found
    throw new NotFoundException('Resource', 'unknown');
  }

  if (error.code === 'P2003') {
    // Foreign key constraint violation
    throw new ValidationException(
      'Referenced record does not exist',
      { field: error.meta?.field_name }
    );
  }

  // Erreur générique
  throw new AppException('DATABASE_ERROR', error.message, 500);
}
```

### Validation des Données

```typescript
// DTOs avec validation
import { IsNotEmpty, IsPositive, IsUUID, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateLoanDto {
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @IsPositive()
  @Type(() => Number)
  principalAmount: Decimal;

  @IsPositive()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  interestRate: Decimal;

  @IsPositive()
  @Min(1)
  @Max(120)
  durationMonths: number;

  @ValidateNested({ each: true })
  @Type(() => CreateGuaranteeDto)
  guarantees: CreateGuaranteeDto[];
}

// Pipe de validation globale
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(err => ({
        property: err.property,
        constraints: err.constraints
      }));
      throw new ValidationException('Validation failed', messages);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### Gestion des Erreurs Asynchrones

```typescript
// Wrapper pour les tâches asynchrones
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw new AppException(
    'OPERATION_FAILED_AFTER_RETRIES',
    `Operation failed after ${maxRetries} attempts: ${lastError.message}`,
    500,
    { attempts: maxRetries, lastError: lastError.message }
  );
}

// Utilisation dans les jobs
@Processor('notifications')
export class NotificationProcessor {
  @Process('send-email')
  async sendEmail(job: Job<SendEmailData>) {
    return executeWithRetry(
      async () => {
        await this.emailService.send(job.data);
      },
      3,
      2000
    );
  }
}
```


## Stratégie de Test

### Approche Duale: Tests Unitaires + Tests de Propriétés

Le système utilise une approche de test complète combinant:
- **Tests unitaires**: Pour les exemples spécifiques, cas limites et conditions d'erreur
- **Tests de propriétés (Property-Based Testing)**: Pour vérifier les propriétés universelles sur de nombreuses entrées générées

Ces deux approches sont complémentaires et nécessaires pour une couverture complète.

### Framework de Property-Based Testing

**Bibliothèque choisie**: **fast-check** pour TypeScript/JavaScript

```bash
npm install --save-dev fast-check @types/fast-check
```

**Configuration**: Minimum 100 itérations par test de propriété (en raison de la randomisation)

### Tests de Propriétés

Chaque propriété de correction définie dans la section précédente doit être implémentée par UN SEUL test de propriété. Chaque test doit être tagué avec un commentaire référençant la propriété du document de conception.

#### Exemple 1: Propriété 6 - Invariant de la Cagnotte Tontine

```typescript
import * as fc from 'fast-check';

describe('Tontine Financial Properties', () => {
  /**
   * Feature: gestion-association-multi-tenant
   * Property 6: Pour toute séance de tontine, la cagnotte totale doit être égale 
   * à la somme de toutes les cotisations collectées lors de cette séance 
   * plus les intérêts primaires de vente aux enchères.
   */
  it('should maintain pot invariant: pot = contributions + primary interests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          contributionAmount: fc.integer({ min: 1000, max: 100000 }),
          numberOfShares: fc.integer({ min: 2, max: 20 }),
          primaryInterests: fc.integer({ min: 0, max: 50000 })
        }),
        async ({ contributionAmount, numberOfShares, primaryInterests }) => {
          // Arrange: Créer une tontine et une séance
          const tontine = await createTestTontine({ contributionAmount, numberOfShares });
          const session = await createTestSession();
          
          // Act: Collecter les cotisations
          const result = await tontineService.collectContributions(
            tontine.id,
            session.id,
            primaryInterests
          );
          
          // Assert: Vérifier l'invariant
          const expectedPot = contributionAmount * numberOfShares + primaryInterests;
          expect(result.potAmount).toBe(expectedPot);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Exemple 2: Propriété 12 - Invariant des Retenues

```typescript
/**
 * Feature: gestion-association-multi-tenant
 * Property 12: Pour tout bénéfice de tontine, le montant net versé au bénéficiaire 
 * doit être égal au montant de la cagnotte moins la somme de toutes les retenues.
 */
it('should maintain deduction invariant: net = pot - deductions', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        potAmount: fc.integer({ min: 10000, max: 500000 }),
        loanAmount: fc.integer({ min: 0, max: 100000 }),
        penaltyAmount: fc.integer({ min: 0, max: 50000 }),
        complementFund: fc.integer({ min: 0, max: 20000 })
      }),
      async ({ potAmount, loanAmount, penaltyAmount, complementFund }) => {
        // Arrange: Créer un membre avec dettes
        const member = await createTestMemberWithDebts({
          loanAmount,
          penaltyAmount,
          complementFund
        });
        
        // Act: Calculer les retenues
        const deductions = await financialService.calculateAutomaticDeductions(
          new Decimal(potAmount),
          member.id,
          member.tenantId
        );
        
        // Assert: Vérifier l'invariant
        const expectedNet = potAmount - loanAmount - penaltyAmount - complementFund;
        const actualNet = deductions.netAmount.toNumber();
        
        // Le net ne peut pas être négatif
        expect(actualNet).toBeGreaterThanOrEqual(0);
        expect(actualNet).toBe(Math.max(0, expectedNet));
        
        // Vérifier que la somme est correcte
        const totalDeductions = deductions.loanRepayments
          .plus(deductions.penalties)
          .plus(deductions.complementFund)
          .toNumber();
        
        expect(potAmount - actualNet).toBe(Math.min(totalDeductions, potAmount));
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Exemple 3: Propriété 20 - Redistribution Proportionnelle

```typescript
/**
 * Feature: gestion-association-multi-tenant
 * Property 20: Pour toute redistribution d'épargne, chaque membre doit recevoir 
 * une part proportionnelle à sa contribution, et la somme doit égaler le total.
 */
it('should distribute savings proportionally and completely', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        totalAmount: fc.integer({ min: 100000, max: 10000000 }),
        contributions: fc.array(
          fc.record({
            memberId: fc.uuid(),
            amount: fc.integer({ min: 1000, max: 500000 })
          }),
          { minLength: 2, maxLength: 20 }
        )
      }),
      async ({ totalAmount, contributions }) => {
        // Calculer le total des contributions
        const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
        
        // Skip si total contributions est 0
        fc.pre(totalContributions > 0);
        
        // Act: Calculer la redistribution
        const contributionMap = new Map(
          contributions.map(c => [c.memberId, new Decimal(c.amount)])
        );
        
        const distribution = financialService.calculateProportionalDistribution(
          new Decimal(totalAmount),
          contributionMap
        );
        
        // Assert 1: Chaque membre reçoit une part proportionnelle (avec tolérance pour arrondi)
        for (const [memberId, contribution] of contributionMap.entries()) {
          const expectedShare = (contribution.toNumber() / totalContributions) * totalAmount;
          const actualShare = distribution.get(memberId)!.toNumber();
          
          // Tolérance de 1 centime pour les erreurs d'arrondi
          expect(Math.abs(actualShare - expectedShare)).toBeLessThanOrEqual(1);
        }
        
        // Assert 2: La somme de toutes les parts égale le total (invariant critique)
        const distributedSum = Array.from(distribution.values())
          .reduce((sum, amount) => sum.plus(amount), new Decimal(0))
          .toNumber();
        
        expect(distributedSum).toBe(totalAmount);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Exemple 4: Propriété 39 - Round-Trip Export/Import

```typescript
/**
 * Feature: gestion-association-multi-tenant
 * Property 39: Pour toutes données valides exportées puis importées, 
 * les données résultantes doivent être équivalentes aux données originales.
 */
it('should preserve data through export-import round trip', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        members: fc.array(
          fc.record({
            firstName: fc.string({ minLength: 2, maxLength: 50 }),
            lastName: fc.string({ minLength: 2, maxLength: 50 }),
            phone: fc.string({ minLength: 10, maxLength: 15 }),
            status: fc.constantFrom('ACTIVE', 'OBSERVATION', 'RESIGNED')
          }),
          { minLength: 1, maxLength: 10 }
        )
      }),
      async ({ members }) => {
        // Arrange: Créer des membres
        const createdMembers = await Promise.all(
          members.map(m => memberService.create(m, testTenantId))
        );
        
        // Act: Exporter
        const exported = await exportService.exportMembers(testTenantId, 'CSV');
        
        // Act: Importer
        const imported = await importService.importMembers(exported, testTenantId);
        
        // Assert: Les données doivent être équivalentes
        expect(imported.length).toBe(createdMembers.length);
        
        for (let i = 0; i < createdMembers.length; i++) {
          const original = createdMembers[i];
          const roundTripped = imported.find(m => m.id === original.id);
          
          expect(roundTripped).toBeDefined();
          expect(roundTripped!.firstName).toBe(original.firstName);
          expect(roundTripped!.lastName).toBe(original.lastName);
          expect(roundTripped!.phone).toBe(original.phone);
          expect(roundTripped!.status).toBe(original.status);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Tests Unitaires

Les tests unitaires se concentrent sur:
- Exemples spécifiques et cas d'usage concrets
- Cas limites (valeurs nulles, vides, extrêmes)
- Conditions d'erreur et validation
- Intégration entre composants

#### Exemple: Tests Unitaires pour Création de Prêt

```typescript
describe('LoanService - createLoan', () => {
  let loanService: LoanService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    loanService = new LoanService(prisma);
  });

  it('should create a loan with valid data', async () => {
    // Arrange
    const member = await createTestMember();
    const loanData = {
      memberId: member.id,
      principalAmount: new Decimal(100000),
      interestRate: new Decimal(10),
      durationMonths: 12,
      guarantees: [{ type: 'MATERIAL', description: 'Car', value: new Decimal(150000) }]
    };

    // Act
    const loan = await loanService.createLoan(loanData, 'user-id', member.tenantId);

    // Assert
    expect(loan).toBeDefined();
    expect(loan.principalAmount).toBe('100000.00');
    expect(loan.status).toBe('PENDING');
  });

  it('should reject loan without guarantees', async () => {
    // Arrange
    const member = await createTestMember();
    const loanData = {
      memberId: member.id,
      principalAmount: new Decimal(100000),
      interestRate: new Decimal(10),
      durationMonths: 12,
      guarantees: [] // Pas de garanties
    };

    // Act & Assert
    await expect(
      loanService.createLoan(loanData, 'user-id', member.tenantId)
    ).rejects.toThrow(BusinessRuleException);
  });

  it('should reject loan with negative amount', async () => {
    // Arrange
    const member = await createTestMember();
    const loanData = {
      memberId: member.id,
      principalAmount: new Decimal(-100000), // Montant négatif
      interestRate: new Decimal(10),
      durationMonths: 12,
      guarantees: [{ type: 'MATERIAL', description: 'Car', value: new Decimal(150000) }]
    };

    // Act & Assert
    await expect(
      loanService.createLoan(loanData, 'user-id', member.tenantId)
    ).rejects.toThrow(ValidationException);
  });

  it('should reject loan when insufficient funds in cash box', async () => {
    // Arrange
    const member = await createTestMember();
    await setCashBoxBalance(member.tenantId, CashBoxType.FUND, new Decimal(50000));
    
    const loanData = {
      memberId: member.id,
      principalAmount: new Decimal(100000), // Plus que disponible
      interestRate: new Decimal(10),
      durationMonths: 12,
      guarantees: [{ type: 'MATERIAL', description: 'Car', value: new Decimal(150000) }]
    };

    // Act & Assert
    await expect(
      loanService.createLoan(loanData, 'user-id', member.tenantId)
    ).rejects.toThrow(InsufficientFundsException);
  });

  it('should debit cash box when loan is created', async () => {
    // Arrange
    const member = await createTestMember();
    const initialBalance = new Decimal(500000);
    await setCashBoxBalance(member.tenantId, CashBoxType.FUND, initialBalance);
    
    const loanAmount = new Decimal(100000);
    const loanData = {
      memberId: member.id,
      principalAmount: loanAmount,
      interestRate: new Decimal(10),
      durationMonths: 12,
      guarantees: [{ type: 'MATERIAL', description: 'Car', value: new Decimal(150000) }]
    };

    // Act
    await loanService.createLoan(loanData, 'user-id', member.tenantId);

    // Assert
    const cashBox = await getCashBox(member.tenantId, CashBoxType.FUND);
    const expectedBalance = initialBalance.minus(loanAmount);
    expect(new Decimal(cashBox.balance)).toEqual(expectedBalance);
  });
});
```

### Tests d'Intégration

```typescript
describe('Tontine Benefit with Automatic Deductions (Integration)', () => {
  it('should correctly process tontine benefit with all deductions', async () => {
    // Arrange: Créer un scénario complet
    const tenant = await createTestTenant();
    const member = await createTestMember(tenant.id);
    
    // Créer un prêt actif
    const loan = await createTestLoan({
      memberId: member.id,
      tenantId: tenant.id,
      remainingAmount: new Decimal(50000)
    });
    
    // Créer des pénalités
    await createTestPenalty({
      memberId: member.id,
      amount: new Decimal(5000),
      status: 'PENDING'
    });
    
    // Créer une tontine et un tour
    const tontine = await createTestTontine({
      tenantId: tenant.id,
      contributionAmount: new Decimal(10000),
      numberOfShares: 10
    });
    
    const share = await createTestTontineShare({
      tontineId: tontine.id,
      memberId: member.id
    });
    
    // Act: Traiter le bénéfice tontine
    const result = await tontineService.processBenefit(
      tontine.id,
      share.id,
      'session-id'
    );
    
    // Assert: Vérifier tous les aspects
    expect(result.potAmount).toBe(100000); // 10000 * 10
    expect(result.deductions.loanRepayments).toBe(50000);
    expect(result.deductions.penalties).toBe(5000);
    expect(result.netAmount).toBe(45000); // 100000 - 50000 - 5000
    
    // Vérifier que le prêt est remboursé
    const updatedLoan = await prisma.loan.findUnique({ where: { id: loan.id } });
    expect(updatedLoan!.status).toBe('COMPLETED');
    
    // Vérifier que les pénalités sont payées
    const penalties = await prisma.penalty.findMany({
      where: { memberId: member.id, status: 'PENDING' }
    });
    expect(penalties.length).toBe(0);
  });
});
```

### Tests de Performance

```typescript
describe('Performance Tests', () => {
  it('should calculate financial report in less than 3 seconds', async () => {
    // Arrange: Créer beaucoup de données
    const tenant = await createTestTenant();
    await createTestMembers(tenant.id, 100);
    await createTestTransactions(tenant.id, 10000);
    
    // Act & Assert
    const startTime = Date.now();
    const report = await reportService.generateFinancialReport(tenant.id);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(3000); // 3 secondes
    expect(report).toBeDefined();
  });

  it('should handle 100 concurrent users without degradation', async () => {
    // Arrange
    const users = await createTestUsers(100);
    
    // Act: Simuler 100 requêtes simultanées
    const startTime = Date.now();
    const promises = users.map(user => 
      memberService.getMemberBalance(user.memberId, user.tenantId)
    );
    
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    // Assert
    expect(results.length).toBe(100);
    expect(results.every(r => r !== null)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5 secondes pour 100 requêtes
  });
});
```

### Couverture de Code

Objectifs de couverture:
- **Lignes**: Minimum 80%
- **Branches**: Minimum 75%
- **Fonctions**: Minimum 85%
- **Statements**: Minimum 80%

Configuration Jest:
```json
{
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.interface.ts",
    "!src/main.ts"
  ],
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "branches": 75,
      "functions": 85,
      "statements": 80
    }
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run property tests
        run: npm run test:property
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```


## Considérations d'Implémentation

### Sécurité

#### Authentification JWT
```typescript
// Configuration JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d'
};

// Payload JWT
interface JwtPayload {
  userId: string;
  tenantId: string;
  role: MemberRole;
  email: string;
  iat: number;
  exp: number;
}

// Middleware d'authentification
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

#### Row-Level Security (PostgreSQL)
```sql
-- Activer RLS sur toutes les tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontines ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
-- ... pour toutes les tables

-- Politique RLS pour isolation multi-tenant
CREATE POLICY tenant_isolation_policy ON members
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_policy ON tontines
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Répéter pour toutes les tables avec tenant_id
```

```typescript
// Middleware pour définir le tenant_id dans la session PostgreSQL
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.user?.tenantId) {
      // Définir le tenant_id pour RLS
      prisma.$executeRaw`SET app.current_tenant_id = ${req.user.tenantId}`;
    }
    next();
  }
}
```

#### Protection CSRF
```typescript
// Configuration CSRF
import * as csurf from 'csurf';

app.use(csurf({ cookie: true }));

// Middleware pour ajouter le token CSRF aux réponses
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
```

#### Rate Limiting
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 60 secondes
      limit: 100, // 100 requêtes par minute
    }),
  ],
})
export class AppModule {}

// Rate limiting spécifique pour certaines routes
@Throttle(5, 60) // 5 requêtes par minute
@Post('login')
async login(@Body() credentials: LoginDto) {
  return this.authService.login(credentials);
}
```

### Performance

#### Stratégie de Cache
```typescript
// Configuration Redis
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  keyPrefix: 'app:',
};

// Service de cache
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  // Cache des soldes de caisse (TTL: 5 minutes)
  async getCashBoxBalance(tenantId: string, type: CashBoxType): Promise<Decimal | null> {
    const key = `cashbox:${tenantId}:${type}`;
    const cached = await this.redis.get(key);
    return cached ? new Decimal(cached) : null;
  }

  async setCashBoxBalance(tenantId: string, type: CashBoxType, balance: Decimal): Promise<void> {
    const key = `cashbox:${tenantId}:${type}`;
    await this.redis.setex(key, 300, balance.toString()); // 5 minutes
  }

  async invalidateCashBoxCache(tenantId: string, type: CashBoxType): Promise<void> {
    const key = `cashbox:${tenantId}:${type}`;
    await this.redis.del(key);
  }

  // Cache des configurations tenant (TTL: 1 heure)
  async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    const key = `config:${tenantId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setTenantConfig(tenantId: string, config: TenantConfig): Promise<void> {
    const key = `config:${tenantId}`;
    await this.redis.setex(key, 3600, JSON.stringify(config)); // 1 heure
  }
}
```

#### Optimisation des Requêtes
```typescript
// Utiliser select pour limiter les champs
const members = await prisma.member.findMany({
  where: { tenantId, status: 'ACTIVE' },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    // Ne pas charger tous les champs
  }
});

// Utiliser include avec prudence pour éviter N+1
const loans = await prisma.loan.findMany({
  where: { tenantId, status: 'ACTIVE' },
  include: {
    member: {
      select: { id: true, firstName: true, lastName: true }
    },
    guarantees: true,
    // Charger les relations nécessaires en une seule requête
  }
});

// Pagination systématique
async function getMembers(tenantId: string, page: number = 1, pageSize: number = 50) {
  const skip = (page - 1) * pageSize;
  
  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where: { tenantId },
      skip,
      take: pageSize,
      orderBy: { lastName: 'asc' }
    }),
    prisma.member.count({ where: { tenantId } })
  ]);
  
  return {
    data: members,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}
```

#### Calculs Asynchrones
```typescript
// Queue pour calculs lourds
@Processor('financial-reports')
export class FinancialReportProcessor {
  @Process('generate-report')
  async generateReport(job: Job<{ tenantId: string; period: DateRange }>) {
    const { tenantId, period } = job.data;
    
    // Calcul lourd en arrière-plan
    const report = await this.reportService.calculateFinancialReport(tenantId, period);
    
    // Sauvegarder le rapport
    await this.reportService.saveReport(report);
    
    // Notifier l'utilisateur
    await this.notificationService.sendReportReady(tenantId, report.id);
    
    return report;
  }
}

// Déclencher le calcul asynchrone
async function requestFinancialReport(tenantId: string, period: DateRange) {
  const job = await this.reportQueue.add('generate-report', {
    tenantId,
    period
  });
  
  return {
    jobId: job.id,
    status: 'processing',
    message: 'Report generation started. You will be notified when ready.'
  };
}
```

### Scalabilité

#### Architecture Horizontale
```yaml
# docker-compose.yml pour déploiement scalable
version: '3.8'

services:
  api:
    image: association-api:latest
    deploy:
      replicas: 3  # 3 instances de l'API
      resources:
        limits:
          cpus: '1'
          memory: 1G
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secure_password

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

#### Load Balancing (Nginx)
```nginx
# nginx.conf
upstream api_backend {
    least_conn;  # Algorithme de répartition
    server api:3000 max_fails=3 fail_timeout=30s;
    server api:3001 max_fails=3 fail_timeout=30s;
    server api:3002 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.association.com;

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Monitoring et Observabilité

#### Prometheus Metrics
```typescript
import { Counter, Histogram, register } from 'prom-client';

// Métriques personnalisées
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const loanCreationCounter = new Counter({
  name: 'loans_created_total',
  help: 'Total number of loans created',
  labelNames: ['tenant_id', 'loan_type']
});

const cashBoxBalance = new Gauge({
  name: 'cash_box_balance',
  help: 'Current balance of cash boxes',
  labelNames: ['tenant_id', 'cash_box_type']
});

// Middleware pour collecter les métriques
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      httpRequestDuration
        .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
        .observe(duration);
    });
    
    next();
  }
}

// Endpoint pour Prometheus
@Get('/metrics')
async getMetrics() {
  return register.metrics();
}
```

#### Logging Structuré
```typescript
import { Logger } from 'winston';

// Configuration Winston
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'association-api' },
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Utilisation
logger.info('Loan created', {
  tenantId: 'tenant-123',
  loanId: 'loan-456',
  amount: 100000,
  userId: 'user-789'
});

logger.error('Failed to process tontine benefit', {
  tenantId: 'tenant-123',
  tontineId: 'tontine-456',
  error: error.message,
  stack: error.stack
});
```

### Déploiement

#### Variables d'Environnement
```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/association_db?schema=public

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password

# JWT
JWT_SECRET=very_secure_random_string_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@association.com
SMTP_PASSWORD=email_password

# SMS
SMS_API_KEY=sms_api_key
SMS_API_URL=https://api.sms-provider.com

# Mobile Payment
ORANGE_MONEY_API_KEY=orange_api_key
MTN_MONEY_API_KEY=mtn_api_key
WAVE_API_KEY=wave_api_key

# Monitoring
SENTRY_DSN=https://sentry.io/project
PROMETHEUS_PORT=9090

# Storage
AWS_S3_BUCKET=association-attachments
AWS_ACCESS_KEY_ID=aws_key
AWS_SECRET_ACCESS_KEY=aws_secret
AWS_REGION=eu-west-1
```

#### Health Checks
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkDiskSpace()
    ]);

    const status = checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status === 'fulfilled' ? 'up' : 'down',
        redis: checks[1].status === 'fulfilled' ? 'up' : 'down',
        disk: checks[2].status === 'fulfilled' ? 'up' : 'down'
      }
    };
  }

  private async checkDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    await this.redis.ping();
  }

  private async checkDiskSpace(): Promise<void> {
    const stats = await fs.promises.statfs('/');
    const freePercentage = (stats.bfree / stats.blocks) * 100;
    if (freePercentage < 10) {
      throw new Error('Low disk space');
    }
  }
}
```

---

## Conclusion

Ce document de conception présente une architecture complète et moderne pour un système de gestion d'association multi-tenant. Les points clés incluent:

1. **Architecture Multi-Tenant Robuste**: Isolation complète des données avec Row-Level Security PostgreSQL
2. **Modèle de Données Complet**: 40+ entités couvrant tous les aspects de la gestion d'association
3. **Calculs Financiers Précis**: Algorithmes détaillés avec arithmétique décimale
4. **47 Propriétés de Correction**: Spécifications formelles testables pour garantir la correction
5. **Stratégie de Test Duale**: Tests unitaires + property-based testing pour couverture complète
6. **Sécurité Renforcée**: JWT, RLS, RBAC, CSRF protection, rate limiting
7. **Performance Optimisée**: Cache Redis, pagination, calculs asynchrones
8. **Scalabilité Horizontale**: Architecture containerisée avec load balancing
9. **Observabilité Complète**: Métriques Prometheus, logs structurés, health checks

Le système est conçu pour être:
- **Fiable**: Avec des propriétés de correction formelles et des tests exhaustifs
- **Performant**: Avec cache distribué et optimisations de requêtes
- **Sécurisé**: Avec isolation multi-tenant et contrôles d'accès stricts
- **Maintenable**: Avec architecture modulaire et code type-safe
- **Scalable**: Avec déploiement horizontal et load balancing

---

**Document créé le**: {{date}}  
**Version**: 1.0  
**Statut**: Prêt pour implémentation

