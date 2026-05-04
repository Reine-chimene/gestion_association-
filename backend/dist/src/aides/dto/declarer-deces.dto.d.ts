import { TypeBeneficiaire } from '@prisma/client';
export declare class DeclarerDecesDto {
    membreId: string;
    typeBeneficiaire: TypeBeneficiaire;
    nomDefunt: string;
    justificatifs: string[];
    description?: string;
}
