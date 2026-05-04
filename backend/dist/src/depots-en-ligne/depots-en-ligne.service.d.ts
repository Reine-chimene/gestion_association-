import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDepotDto } from './dto/create-depot.dto.js';
import { ValiderDepotDto } from './dto/valider-depot.dto.js';
import { Decimal } from '@prisma/client/runtime/library';
export declare class DepotsEnLigneService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDepotDto: CreateDepotDto, tenantId: string): Promise<{
        membre: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        statut: import("@prisma/client").$Enums.StatutDepot;
        type: string;
        montant: Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    }>;
    getDepotsEnAttente(tenantId: string): Promise<({
        membre: {
            nom: string;
            numeroMembre: string;
            prenom: string;
            telephone: string;
        };
    } & {
        id: string;
        statut: import("@prisma/client").$Enums.StatutDepot;
        type: string;
        montant: Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    })[]>;
    getDepotsByMembre(membreId: string, tenantId: string): Promise<{
        id: string;
        statut: import("@prisma/client").$Enums.StatutDepot;
        type: string;
        montant: Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    }[]>;
    validerDepot(depotId: string, validerDepotDto: ValiderDepotDto, tenantId: string): Promise<{
        membre: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        statut: import("@prisma/client").$Enums.StatutDepot;
        type: string;
        montant: Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    }>;
    getStatistiques(tenantId: string): Promise<{
        enAttente: number;
        valides: number;
        rejetes: number;
        totalMontant: number | Decimal;
    }>;
}
