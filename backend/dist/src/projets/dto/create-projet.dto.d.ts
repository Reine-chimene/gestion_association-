import { DureeProjet } from '@prisma/client';
export declare class CreateProjetDto {
    nom: string;
    description: string;
    duree: DureeProjet;
    objectif: number;
    ephemere?: boolean;
    obligatoire?: boolean;
    dateDebut?: string;
    dateFin?: string;
}
