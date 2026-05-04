import { PrismaService } from '../prisma/prisma.service.js';
import { CaissesService } from '../caisses/caisses.service.js';
import { CotiserDto } from './dto/cotiser.dto.js';
import { RedistribuerDto } from './dto/redistribuer.dto.js';
import { TypeEpargne, Prisma } from '@prisma/client';
export declare class EpargnesService {
    private readonly prisma;
    private readonly caissesService;
    constructor(prisma: PrismaService, caissesService: CaissesService);
    cotiser(tenantId: string, responsableId: string, dto: CotiserDto): Promise<{
        membre: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        montant: Prisma.Decimal;
        date: Date;
        membreId: string;
        epargneId: string;
    }>;
    calculerSolde(tenantId: string, membreId: string, type: TypeEpargne): Promise<{
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
    redistribuer(tenantId: string, responsableId: string, dto: RedistribuerDto): Promise<{
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
    calculerInteretsGeneres(tenantId: string, type: TypeEpargne, tauxInteret: number): Promise<{
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
    findAll(tenantId: string, type?: TypeEpargne): Promise<{
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
            montant: Prisma.Decimal;
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
    findOne(tenantId: string, id: string): Promise<{
        totalCollecte: number;
        cotisations: ({
            membre: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            montant: Prisma.Decimal;
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
    getStatistiques(tenantId: string): Promise<{
        total: number;
        actives: number;
        cloturees: number;
        totalCollecteAnnuelle: number;
        totalCollecteScolaire: number;
        totalCollecte: number;
    }>;
}
