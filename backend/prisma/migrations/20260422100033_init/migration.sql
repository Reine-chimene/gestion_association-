-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'COMMISSAIRE', 'MEMBRE');

-- CreateEnum
CREATE TYPE "StatutMembre" AS ENUM ('ACTIF', 'OBSERVATION', 'DEMISSIONNAIRE', 'DECEDE', 'MUTE');

-- CreateEnum
CREATE TYPE "TypeTontine" AS ENUM ('CLASSIQUE_NON_VENDABLE', 'VENDABLE_ENCHERE', 'VENTE_INTERETS', 'HYBRIDE');

-- CreateEnum
CREATE TYPE "Frequence" AS ENUM ('HEBDOMADAIRE', 'MENSUELLE');

-- CreateEnum
CREATE TYPE "StatutTontine" AS ENUM ('ACTIVE', 'TERMINEE', 'SUSPENDUE');

-- CreateEnum
CREATE TYPE "TypePret" AS ENUM ('SUR_FONDS', 'TONTINE', 'MENSUEL', 'COLLECTIF', 'SUR_EPARGNE');

-- CreateEnum
CREATE TYPE "StatutPret" AS ENUM ('EN_COURS', 'REMBOURSE', 'EN_RETARD', 'RECOUVREMENT');

-- CreateEnum
CREATE TYPE "TypeGarantie" AS ENUM ('MATERIELLE', 'FONDS', 'COTISATION', 'AVALISTE');

-- CreateEnum
CREATE TYPE "StatutEcheance" AS ENUM ('A_VENIR', 'PAYEE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "TypeEpargne" AS ENUM ('ANNUELLE', 'SCOLAIRE');

-- CreateEnum
CREATE TYPE "TypeAide" AS ENUM ('MALADIE', 'DECES');

-- CreateEnum
CREATE TYPE "TypeBeneficiaire" AS ENUM ('MEMBRE', 'CONJOINT', 'PARENT', 'ENFANT');

-- CreateEnum
CREATE TYPE "StatutAide" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE', 'VERSEE');

-- CreateEnum
CREATE TYPE "DureeProjet" AS ENUM ('COURT', 'MOYEN', 'LONG');

-- CreateEnum
CREATE TYPE "ModeCalcul" AS ENUM ('FIXE', 'POURCENTAGE', 'PROGRESSIF');

-- CreateEnum
CREATE TYPE "StatutSeance" AS ENUM ('EN_COURS', 'CLOTUREE');

-- CreateEnum
CREATE TYPE "TypeCaisse" AS ENUM ('FONDS', 'SANCTION', 'EPARGNE');

-- CreateEnum
CREATE TYPE "StatutDepot" AS ENUM ('EN_ATTENTE_VALIDATION', 'VALIDE', 'REJETE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'IN_APP', 'PUSH');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'FCFA',
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membres" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "numeroMembre" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "adresse" TEXT,
    "photoUrl" TEXT,
    "cniUrl" TEXT,
    "statut" "StatutMembre" NOT NULL DEFAULT 'ACTIF',
    "dateAdhesion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parrainId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tontines" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeTontine" NOT NULL,
    "montantCotisation" DECIMAL(15,2) NOT NULL,
    "frequence" "Frequence" NOT NULL DEFAULT 'HEBDOMADAIRE',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "cycleActuel" INTEGER NOT NULL DEFAULT 1,
    "statut" "StatutTontine" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tontines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts_tontine" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "nombreParts" INTEGER NOT NULL DEFAULT 1,
    "ordre" INTEGER NOT NULL,
    "aBeneficie" BOOLEAN NOT NULL DEFAULT false,
    "interetsPrimairesAccumules" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_tontine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes_tours" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "acheteurId" TEXT NOT NULL,
    "tourOriginal" INTEGER NOT NULL,
    "montantOffre" DECIMAL(15,2) NOT NULL,
    "interetsPrimaires" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventes_tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes_interets" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "vendeurId" TEXT NOT NULL,
    "acheteurId" TEXT NOT NULL,
    "montantInterets" DECIMAL(15,2) NOT NULL,
    "montantOffre" DECIMAL(15,2) NOT NULL,
    "interetsSecondaires" DECIMAL(15,2) NOT NULL,
    "modalite" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventes_interets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tours_gratuits" (
    "id" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "beneficiaireId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tours_gratuits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "TypePret" NOT NULL,
    "emprunteurId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "tauxInteret" DECIMAL(5,2) NOT NULL,
    "dureeEnMois" INTEGER NOT NULL,
    "dateOctroi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "statut" "StatutPret" NOT NULL DEFAULT 'EN_COURS',
    "nombreReconductions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "co_emprunteurs" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "partResponsabilite" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "co_emprunteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garanties" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "type" "TypeGarantie" NOT NULL,
    "description" TEXT NOT NULL,
    "valeurEstimee" DECIMAL(15,2),
    "avalisteId" TEXT,
    "documentsUrl" TEXT[],

    CONSTRAINT "garanties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "echeances" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "montantCapital" DECIMAL(15,2) NOT NULL,
    "montantInterets" DECIMAL(15,2) NOT NULL,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "statut" "StatutEcheance" NOT NULL DEFAULT 'A_VENIR',
    "datePaiement" TIMESTAMP(3),

    CONSTRAINT "echeances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epargnes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "TypeEpargne" NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "cycleActuel" INTEGER NOT NULL DEFAULT 1,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epargnes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotisations_epargne" (
    "id" TEXT NOT NULL,
    "epargneId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotisations_epargne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aides" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "TypeAide" NOT NULL,
    "beneficiaireId" TEXT NOT NULL,
    "typeBeneficiaire" "TypeBeneficiaire" NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "statut" "StatutAide" NOT NULL DEFAULT 'EN_ATTENTE',
    "justificatifs" TEXT[],
    "commissionnaireId" TEXT,
    "dateDeclaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateApprobation" TIMESTAMP(3),
    "approbateurId" TEXT,

    CONSTRAINT "aides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duree" "DureeProjet" NOT NULL,
    "objectif" DECIMAL(15,2) NOT NULL,
    "montantCollecte" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ephemere" BOOLEAN NOT NULL DEFAULT false,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phases_projet" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "objectif" DECIMAL(15,2) NOT NULL,
    "dateLimite" TIMESTAMP(3) NOT NULL,
    "ordre" INTEGER NOT NULL,

    CONSTRAINT "phases_projet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions_projet" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volontaire" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contributions_projet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanctions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "typeSanctionId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "motif" TEXT NOT NULL,
    "dateApplication" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'IMPAYEE',
    "datePaiement" TIMESTAMP(3),

    CONSTRAINT "sanctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_sanction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "modeCalcul" "ModeCalcul" NOT NULL,
    "montantFixe" DECIMAL(15,2),
    "pourcentage" DECIMAL(5,2),
    "joursDeGrace" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "types_sanction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seances" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rapportSeance" TEXT,
    "statut" "StatutSeance" NOT NULL DEFAULT 'EN_COURS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presences" (
    "id" TEXT NOT NULL,
    "seanceId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL,
    "justification" TEXT,

    CONSTRAINT "presences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proces_verbaux" (
    "id" TEXT NOT NULL,
    "seanceId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "signatures" TEXT[],
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proces_verbaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caisses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "TypeCaisse" NOT NULL,
    "solde" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caisses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements" (
    "id" TEXT NOT NULL,
    "caisseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "soldeApres" DECIMAL(15,2) NOT NULL,
    "motif" TEXT NOT NULL,
    "justification" TEXT,
    "reference" TEXT,
    "responsableId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depots_en_ligne" (
    "id" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "preuveUrl" TEXT NOT NULL,
    "motifAbsence" TEXT NOT NULL,
    "statut" "StatutDepot" NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
    "dateDepot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" TIMESTAMP(3),
    "validateurId" TEXT,

    CONSTRAINT "depots_en_ligne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channels" "NotificationChannel"[],
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "dateEnvoi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "membres_userId_key" ON "membres"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "membres_tenantId_numeroMembre_key" ON "membres"("tenantId", "numeroMembre");

-- CreateIndex
CREATE UNIQUE INDEX "parts_tontine_tontineId_membreId_ordre_key" ON "parts_tontine"("tontineId", "membreId", "ordre");

-- CreateIndex
CREATE UNIQUE INDEX "presences_seanceId_membreId_key" ON "presences"("seanceId", "membreId");

-- CreateIndex
CREATE UNIQUE INDEX "proces_verbaux_seanceId_key" ON "proces_verbaux"("seanceId");

-- CreateIndex
CREATE UNIQUE INDEX "caisses_tenantId_type_key" ON "caisses"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_tenantId_cle_key" ON "configurations"("tenantId", "cle");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres" ADD CONSTRAINT "membres_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres" ADD CONSTRAINT "membres_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres" ADD CONSTRAINT "membres_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "membres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tontines" ADD CONSTRAINT "tontines_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_tontine" ADD CONSTRAINT "parts_tontine_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "tontines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_tontine" ADD CONSTRAINT "parts_tontine_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes_tours" ADD CONSTRAINT "ventes_tours_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "tontines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes_interets" ADD CONSTRAINT "ventes_interets_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "tontines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours_gratuits" ADD CONSTRAINT "tours_gratuits_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "tontines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prets" ADD CONSTRAINT "prets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prets" ADD CONSTRAINT "prets_emprunteurId_fkey" FOREIGN KEY ("emprunteurId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_emprunteurs" ADD CONSTRAINT "co_emprunteurs_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_emprunteurs" ADD CONSTRAINT "co_emprunteurs_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garanties" ADD CONSTRAINT "garanties_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garanties" ADD CONSTRAINT "garanties_avalisteId_fkey" FOREIGN KEY ("avalisteId") REFERENCES "membres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "echeances" ADD CONSTRAINT "echeances_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epargnes" ADD CONSTRAINT "epargnes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisations_epargne" ADD CONSTRAINT "cotisations_epargne_epargneId_fkey" FOREIGN KEY ("epargneId") REFERENCES "epargnes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisations_epargne" ADD CONSTRAINT "cotisations_epargne_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aides" ADD CONSTRAINT "aides_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aides" ADD CONSTRAINT "aides_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phases_projet" ADD CONSTRAINT "phases_projet_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions_projet" ADD CONSTRAINT "contributions_projet_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions_projet" ADD CONSTRAINT "contributions_projet_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_typeSanctionId_fkey" FOREIGN KEY ("typeSanctionId") REFERENCES "types_sanction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "seances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proces_verbaux" ADD CONSTRAINT "proces_verbaux_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "seances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caisses" ADD CONSTRAINT "caisses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements" ADD CONSTRAINT "mouvements_caisseId_fkey" FOREIGN KEY ("caisseId") REFERENCES "caisses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depots_en_ligne" ADD CONSTRAINT "depots_en_ligne_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
