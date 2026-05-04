export declare enum TypePret {
    ORDINAIRE = "ORDINAIRE",
    SOCIAL = "SOCIAL",
    URGENT = "URGENT",
    INVESTISSEMENT = "INVESTISSEMENT",
    SOLIDARITE = "SOLIDARITE"
}
export declare enum TypeGarantie {
    MATERIELLE = "MATERIELLE",
    CAUTION_SOLIDAIRE = "CAUTION_SOLIDAIRE",
    EPARGNE_BLOQUEE = "EPARGNE_BLOQUEE",
    SALAIRE = "SALAIRE"
}
export declare class GarantieDto {
    type: TypeGarantie;
    description: string;
    valeurEstimee: number;
    documentUrl?: string;
}
export declare class CoEmprunteurDto {
    membreId: string;
    partResponsabilite: number;
}
export declare class CreatePretDto {
    emprunteurId: string;
    type: TypePret;
    montant: number;
    tauxInteret: number;
    dureeEnMois: number;
    motif: string;
    garanties: GarantieDto[];
    coEmprunteurs?: CoEmprunteurDto[];
    notes?: string;
}
