import { DepotsEnLigneService } from './depots-en-ligne.service.js';
import { CreateDepotDto } from './dto/create-depot.dto.js';
import { ValiderDepotDto } from './dto/valider-depot.dto.js';
export declare class DepotsEnLigneController {
    private readonly depotsEnLigneService;
    constructor(depotsEnLigneService: DepotsEnLigneService);
    create(createDepotDto: CreateDepotDto, req: any): Promise<{
        membre: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        statut: import("@prisma/client").$Enums.StatutDepot;
        type: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    }>;
    getDepotsEnAttente(req: any): Promise<({
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
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    })[]>;
    getDepotsByMembre(membreId: string, req: any): Promise<{
        id: string;
        statut: import("@prisma/client").$Enums.StatutDepot;
        type: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    }[]>;
    validerDepot(id: string, validerDepotDto: ValiderDepotDto, req: any): Promise<{
        membre: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        statut: import("@prisma/client").$Enums.StatutDepot;
        type: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        preuveUrl: string;
        motifAbsence: string;
        validateurId: string | null;
        dateDepot: Date;
        dateValidation: Date | null;
    }>;
    getStatistiques(req: any): Promise<{
        enAttente: number;
        valides: number;
        rejetes: number;
        totalMontant: number | import("@prisma/client/runtime/library").Decimal;
    }>;
}
