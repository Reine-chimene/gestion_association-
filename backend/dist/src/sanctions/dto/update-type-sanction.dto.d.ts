import { ModeCalcul } from '@prisma/client';
export declare class UpdateTypeSanctionDto {
    nom?: string;
    modeCalcul?: ModeCalcul;
    montantFixe?: number;
    pourcentage?: number;
    joursDeGrace?: number;
    actif?: boolean;
}
