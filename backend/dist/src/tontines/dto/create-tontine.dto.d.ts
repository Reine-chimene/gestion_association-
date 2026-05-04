declare class ParticipantDto {
    membreId: string;
    nombreParts: number;
    ordre: number;
}
export declare class CreateTontineDto {
    nom: string;
    type: 'CLASSIQUE_NON_VENDABLE' | 'VENDABLE_ENCHERE' | 'VENTE_INTERETS' | 'HYBRIDE';
    montantCotisation: number;
    frequence: 'JOURNALIERE' | 'HEBDOMADAIRE' | 'MENSUELLE';
    dateDebut: string;
    participants: ParticipantDto[];
}
export {};
