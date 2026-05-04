declare class PresenceDto {
    membreId: string;
    present: boolean;
    justification?: string;
}
export declare class EnregistrerPresencesDto {
    presences: PresenceDto[];
}
export {};
