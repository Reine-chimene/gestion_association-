import { ModeCalcul } from '@prisma/client';
export declare class CreateTypeSanctionDto {
    nom: string;
    modeCalcul: ModeCalcul;
    montantFixe?: number;
    pourcentage?: number;
    joursDeGrace: number;
    actif?: boolean;
}
