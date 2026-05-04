import { EpargnesService } from './epargnes.service.js';
import { CotiserDto } from './dto/cotiser.dto.js';
import { RedistribuerDto } from './dto/redistribuer.dto.js';
import { TypeEpargne } from '@prisma/client';
export declare class EpargnesController {
    private readonly epargnesService;
    constructor(epargnesService: EpargnesService);
    cotiser(dto: CotiserDto, req: any): Promise<{
        membre: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        membreId: string;
        epargneId: string;
    }>;
    getSolde(membreId: string, type: TypeEpargne, req: any): Promise<{
        membreId: string;
        type: import("@prisma/client").$Enums.TypeEpargne;
        solde: number;
        nombreCotisations: number;
        cycleActuel: number;
        dateDebut?: undefined;
        dateFin?: undefined;
    } | {
        membreId: string;
        type: import("@prisma/client").$Enums.TypeEpargne;
        solde: number;
        nombreCotisations: number;
        cycleActuel: number;
        dateDebut: Date;
        dateFin: Date | null;
    }>;
    redistribuer(dto: RedistribuerDto, req: any): Promise<{
        epargneId: string;
        type: import("@prisma/client").$Enums.TypeEpargne;
        cycleActuel: number;
        totalCollecte: number;
        tauxInteret: number;
        interetsGeneres: number;
        montantTotal: number;
        nombreBeneficiaires: number;
        redistributions: {
            membreId: string;
            membre: any;
            contribution: number;
            partInterets: number;
            montantTotal: number;
            retenues: number;
            montantNet: number;
        }[];
    }>;
    getInteretsGeneres(type: TypeEpargne, tauxInteret: string, req: any): Promise<{
        type: import("@prisma/client").$Enums.TypeEpargne;
        totalCollecte: number;
        tauxInteret: number;
        interetsGeneres: number;
        montantTotal: number;
        cycleActuel?: undefined;
        dateDebut?: undefined;
        dateFin?: undefined;
        nombreCotisations?: undefined;
    } | {
        type: import("@prisma/client").$Enums.TypeEpargne;
        cycleActuel: number;
        dateDebut: Date;
        dateFin: Date | null;
        totalCollecte: number;
        tauxInteret: number;
        interetsGeneres: number;
        montantTotal: number;
        nombreCotisations: number;
    }>;
    findAll(type: TypeEpargne, req: any): Promise<{
        totalCollecte: number;
        _count: {
            cotisations: number;
        };
        cotisations: ({
            membre: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            membreId: string;
            epargneId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: string;
        type: import("@prisma/client").$Enums.TypeEpargne;
        dateDebut: Date;
        dateFin: Date | null;
        cycleActuel: number;
    }[]>;
    findOne(id: string, req: any): Promise<{
        totalCollecte: number;
        cotisations: ({
            membre: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            membreId: string;
            epargneId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: string;
        type: import("@prisma/client").$Enums.TypeEpargne;
        dateDebut: Date;
        dateFin: Date | null;
        cycleActuel: number;
    }>;
    getStatistiques(req: any): Promise<{
        total: number;
        actives: number;
        cloturees: number;
        totalCollecteAnnuelle: number;
        totalCollecteScolaire: number;
        totalCollecte: number;
    }>;
}
