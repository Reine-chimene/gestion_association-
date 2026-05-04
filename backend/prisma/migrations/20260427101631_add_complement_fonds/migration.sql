/*
  Warnings:

  - You are about to drop the column `numero` on the `echeances` table. All the data in the column will be lost.
  - Made the column `tenantId` on table `co_emprunteurs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `numeroEcheance` to the `echeances` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `garanties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `paiements` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StatutComplementFonds" AS ENUM ('ACTIF', 'AUGMENTE', 'CASSE');

-- CreateEnum
CREATE TYPE "ModePaiementComplement" AS ENUM ('PRELEVEMENT_AUTO', 'PAIEMENT_MANUEL');

-- AlterTable
ALTER TABLE "co_emprunteurs" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "echeances" DROP COLUMN "numero",
ADD COLUMN     "numeroEcheance" INTEGER NOT NULL,
ALTER COLUMN "statut" SET DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "garanties" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "paiements" ALTER COLUMN "tenantId" SET NOT NULL;

-- CreateTable
CREATE TABLE "complement_fonds" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "montantParMembre" DECIMAL(15,2) NOT NULL,
    "statut" "StatutComplementFonds" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complement_fonds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements_complement_fonds" (
    "id" TEXT NOT NULL,
    "complementFondsId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modePaiement" "ModePaiementComplement" NOT NULL DEFAULT 'PRELEVEMENT_AUTO',

    CONSTRAINT "paiements_complement_fonds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "complement_fonds_tenantId_annee_key" ON "complement_fonds"("tenantId", "annee");

-- AddForeignKey
ALTER TABLE "complement_fonds" ADD CONSTRAINT "complement_fonds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements_complement_fonds" ADD CONSTRAINT "paiements_complement_fonds_complementFondsId_fkey" FOREIGN KEY ("complementFondsId") REFERENCES "complement_fonds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements_complement_fonds" ADD CONSTRAINT "paiements_complement_fonds_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
