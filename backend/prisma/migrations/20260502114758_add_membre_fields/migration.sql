-- AlterTable
ALTER TABLE "membres" ADD COLUMN     "acteNaissanceUrl" TEXT,
ADD COLUMN     "nombreEnfants" INTEGER DEFAULT 0,
ADD COLUMN     "situationMatrimoniale" TEXT;
