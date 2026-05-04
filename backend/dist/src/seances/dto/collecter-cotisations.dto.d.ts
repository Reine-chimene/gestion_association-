declare class CotisationDto {
    membreId: string;
    montantTontine: number;
    montantEpargneAnnuelle?: number;
    montantEpargneScolaire?: number;
    montantProjets?: number;
    montantRemboursementPret?: number;
}
export declare class CollecterCotisationsDto {
    cotisations: CotisationDto[];
}
export {};
