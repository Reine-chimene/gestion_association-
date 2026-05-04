-- Add missing fields to Pret table
ALTER TABLE "prets" ADD COLUMN IF NOT EXISTS "montantTotal" DECIMAL(15,2);
ALTER TABLE "prets" ADD COLUMN IF NOT EXISTS "soldeRestant" DECIMAL(15,2);
ALTER TABLE "prets" ADD COLUMN IF NOT EXISTS "motif" TEXT;
ALTER TABLE "prets" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add missing field to Echeance table
ALTER TABLE "echeances" ADD COLUMN IF NOT EXISTS "montantPaye" DECIMAL(15,2) DEFAULT 0;

-- Add missing field to CoEmprunteur table  
ALTER TABLE "co_emprunteurs" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Add missing field to Garantie table
ALTER TABLE "garanties" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "garanties" ADD COLUMN IF NOT EXISTS "documentUrl" TEXT;

-- Add missing field to Paiement table
ALTER TABLE "paiements" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "paiements" ADD COLUMN IF NOT EXISTS "echeanceId" TEXT;
ALTER TABLE "paiements" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "paiements" RENAME COLUMN "date" TO "datePaiement";

-- Update existing records with default values
UPDATE "prets" SET "montantTotal" = "montant" WHERE "montantTotal" IS NULL;
UPDATE "prets" SET "soldeRestant" = "montant" WHERE "soldeRestant" IS NULL;
UPDATE "prets" SET "motif" = 'Migration' WHERE "motif" IS NULL;

-- Add new enum values for TypePret
ALTER TYPE "TypePret" ADD VALUE IF NOT EXISTS 'ORDINAIRE';
ALTER TYPE "TypePret" ADD VALUE IF NOT EXISTS 'SOCIAL';
ALTER TYPE "TypePret" ADD VALUE IF NOT EXISTS 'URGENT';
ALTER TYPE "TypePret" ADD VALUE IF NOT EXISTS 'INVESTISSEMENT';
ALTER TYPE "TypePret" ADD VALUE IF NOT EXISTS 'SOLIDARITE';

-- Add new enum values for TypeGarantie
ALTER TYPE "TypeGarantie" ADD VALUE IF NOT EXISTS 'CAUTION_SOLIDAIRE';
ALTER TYPE "TypeGarantie" ADD VALUE IF NOT EXISTS 'EPARGNE_BLOQUEE';
ALTER TYPE "TypeGarantie" ADD VALUE IF NOT EXISTS 'SALAIRE';

-- Add new enum values for StatutPret
ALTER TYPE "StatutPret" ADD VALUE IF NOT EXISTS 'SOLDE';

-- Add new enum values for StatutEcheance
ALTER TYPE "StatutEcheance" ADD VALUE IF NOT EXISTS 'EN_ATTENTE';
ALTER TYPE "StatutEcheance" ADD VALUE IF NOT EXISTS 'PARTIELLE';
