export declare enum Role {
    PRESIDENT = "PRESIDENT",
    TRESORIER = "TRESORIER",
    SECRETAIRE = "SECRETAIRE",
    COMMISSAIRE = "COMMISSAIRE",
    MEMBRE = "MEMBRE"
}
export declare class AssignRoleDto {
    userId: string;
    role: Role;
    motif?: string;
}
