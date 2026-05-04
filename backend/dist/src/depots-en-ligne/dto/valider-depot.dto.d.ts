export declare enum ActionValidation {
    VALIDER = "VALIDER",
    REJETER = "REJETER"
}
export declare class ValiderDepotDto {
    action: ActionValidation;
    validateurId: string;
    motifRejet?: string;
}
