-- AddForeignKey
ALTER TABLE "ventes_tours" ADD CONSTRAINT "ventes_tours_acheteurId_fkey" FOREIGN KEY ("acheteurId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes_interets" ADD CONSTRAINT "ventes_interets_vendeurId_fkey" FOREIGN KEY ("vendeurId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes_interets" ADD CONSTRAINT "ventes_interets_acheteurId_fkey" FOREIGN KEY ("acheteurId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours_gratuits" ADD CONSTRAINT "tours_gratuits_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES "membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
