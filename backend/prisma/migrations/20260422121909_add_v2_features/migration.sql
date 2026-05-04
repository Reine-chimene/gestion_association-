-- CreateEnum
CREATE TYPE "StatutCession" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'VALIDEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "StatutMoratoire" AS ENUM ('ACTIF', 'EXPIRE', 'REVOQUE');

-- CreateEnum
CREATE TYPE "StatutCotisationAnticipee" AS ENUM ('ACTIF', 'EPUISE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "StatutDelegation" AS ENUM ('ACTIVE', 'EXPIREE', 'REVOQUEE');

-- CreateEnum
CREATE TYPE "StatutTransfert" AS ENUM ('EN_COURS', 'COMPLETE', 'ECHOUE');

-- CreateEnum
CREATE TYPE "SourceTaux" AS ENUM ('MANUELLE', 'AUTOMATIQUE');

-- CreateEnum
CREATE TYPE "OperateurMobileMoney" AS ENUM ('MTN', 'ORANGE', 'WAVE');

-- CreateEnum
CREATE TYPE "StatutVerification" AS ENUM ('EN_COURS', 'VALIDE', 'INVALIDE', 'ERREUR');

-- CreateTable
CREATE TABLE "cessions_tour" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tontineId" TEXT NOT NULL,
    "cedantId" TEXT NOT NULL,
    "beneficiaireId" TEXT NOT NULL,
    "tourOriginal" INTEGER NOT NULL,
    "tourCede" INTEGER NOT NULL,
    "statut" "StatutCession" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateProposition" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateAcceptation" TIMESTAMP(3),
    "dateValidation" TIMESTAMP(3),
    "validateurId" TEXT,
    "motif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cessions_tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moratoires" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT NOT NULL,
    "suspensionPenalites" BOOLEAN NOT NULL DEFAULT true,
    "suspensionCotisations" BOOLEAN NOT NULL DEFAULT false,
    "accordeParId" TEXT NOT NULL,
    "statut" "StatutMoratoire" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moratoires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotisations_anticipees" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "nombreSeances" INTEGER NOT NULL,
    "seancesRestantes" INTEGER NOT NULL,
    "dateEnregistrement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutCotisationAnticipee" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotisations_anticipees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roleDeleguant" "Role" NOT NULL,
    "membreDeleguantId" TEXT NOT NULL,
    "membreDelegueId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "permissions" TEXT[],
    "statut" "StatutDelegation" NOT NULL DEFAULT 'ACTIVE',
    "motif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reseaux" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "associations" TEXT[],
    "superAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reseaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferts_membre" (
    "id" TEXT NOT NULL,
    "reseauId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "tenantSourceId" TEXT NOT NULL,
    "tenantDestinationId" TEXT NOT NULL,
    "dateTransfert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT NOT NULL,
    "donneesTransferees" JSONB NOT NULL,
    "statut" "StatutTransfert" NOT NULL DEFAULT 'EN_COURS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transferts_membre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dons_inter_association" (
    "id" TEXT NOT NULL,
    "reseauId" TEXT NOT NULL,
    "tenantSourceId" TEXT NOT NULL,
    "tenantDestinationId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "motif" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dons_inter_association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taux_conversion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviseSource" TEXT NOT NULL,
    "deviseDestination" TEXT NOT NULL,
    "taux" DECIMAL(10,6) NOT NULL,
    "dateApplication" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "miseAJourParId" TEXT NOT NULL,
    "source" "SourceTaux" NOT NULL DEFAULT 'MANUELLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taux_conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions_devise" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "montantOriginal" DECIMAL(15,2) NOT NULL,
    "deviseOriginal" TEXT NOT NULL,
    "montantConverti" DECIMAL(15,2) NOT NULL,
    "deviseConvertie" TEXT NOT NULL,
    "tauxUtilise" DECIMAL(10,6) NOT NULL,
    "dateTransaction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_devise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications_mobile_money" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "depotEnLigneId" TEXT NOT NULL,
    "operateur" "OperateurMobileMoney" NOT NULL,
    "numeroTransaction" TEXT NOT NULL,
    "montantAttendu" DECIMAL(15,2) NOT NULL,
    "montantVerifie" DECIMAL(15,2),
    "destinataireAttendu" TEXT NOT NULL,
    "destinataireVerifie" TEXT,
    "statut" "StatutVerification" NOT NULL DEFAULT 'EN_COURS',
    "messageErreur" TEXT,
    "dateVerification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_mobile_money_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycles_archives" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "numeroCycle" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "donneesArchivees" JSONB NOT NULL,
    "statistiques" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cycles_archives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transferts_membre" ADD CONSTRAINT "transferts_membre_reseauId_fkey" FOREIGN KEY ("reseauId") REFERENCES "reseaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dons_inter_association" ADD CONSTRAINT "dons_inter_association_reseauId_fkey" FOREIGN KEY ("reseauId") REFERENCES "reseaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
