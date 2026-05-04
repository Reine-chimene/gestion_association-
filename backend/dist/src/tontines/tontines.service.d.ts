import { PrismaService } from '../prisma/prisma.service';
import { CaissesService } from '../caisses/caisses.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class TontinesService {
    private prisma;
    private caissesService;
    constructor(prisma: PrismaService, caissesService: CaissesService);
    create(tenantId: string, data: any): Promise<({
        parts: ({
            membre: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tontineId: string;
            membreId: string;
            nombreParts: number;
            ordre: number;
            aBeneficie: boolean;
            interetsPrimairesAccumules: Decimal;
        })[];
    } & {
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutTontine;
        type: import("@prisma/client").$Enums.TypeTontine;
        dateDebut: Date;
        montantCotisation: Decimal;
        frequence: import("@prisma/client").$Enums.Frequence;
        cycleActuel: number;
    }) | null>;
    findAll(tenantId: string, filters?: any): Promise<({
        parts: ({
            membre: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tontineId: string;
            membreId: string;
            nombreParts: number;
            ordre: number;
            aBeneficie: boolean;
            interetsPrimairesAccumules: Decimal;
        })[];
        ventesTours: {
            id: string;
            date: Date;
            tontineId: string;
            acheteurId: string;
            tourOriginal: number;
            montantOffre: Decimal;
            interetsPrimaires: Decimal;
        }[];
        ventesInterets: {
            id: string;
            date: Date;
            tontineId: string;
            montantInterets: Decimal;
            acheteurId: string;
            montantOffre: Decimal;
            vendeurId: string;
            modalite: string;
            interetsSecondaires: Decimal;
        }[];
        toursGratuits: {
            id: string;
            montant: Decimal;
            date: Date;
            tontineId: string;
            beneficiaireId: string;
        }[];
    } & {
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutTontine;
        type: import("@prisma/client").$Enums.TypeTontine;
        dateDebut: Date;
        montantCotisation: Decimal;
        frequence: import("@prisma/client").$Enums.Frequence;
        cycleActuel: number;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        parts: ({
            membre: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tontineId: string;
            membreId: string;
            nombreParts: number;
            ordre: number;
            aBeneficie: boolean;
            interetsPrimairesAccumules: Decimal;
        })[];
        ventesTours: {
            id: string;
            date: Date;
            tontineId: string;
            acheteurId: string;
            tourOriginal: number;
            montantOffre: Decimal;
            interetsPrimaires: Decimal;
        }[];
        ventesInterets: {
            id: string;
            date: Date;
            tontineId: string;
            montantInterets: Decimal;
            acheteurId: string;
            montantOffre: Decimal;
            vendeurId: string;
            modalite: string;
            interetsSecondaires: Decimal;
        }[];
        toursGratuits: {
            id: string;
            montant: Decimal;
            date: Date;
            tontineId: string;
            beneficiaireId: string;
        }[];
    } & {
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutTontine;
        type: import("@prisma/client").$Enums.TypeTontine;
        dateDebut: Date;
        montantCotisation: Decimal;
        frequence: import("@prisma/client").$Enums.Frequence;
        cycleActuel: number;
    }>;
    collecterCotisations(tenantId: string, tontineId: string, responsableId: string, cotisations: {
        membreId: string;
        paye: boolean;
    }[]): Promise<{
        succes: boolean;
        membresNonPayeurs: string[];
        nombreNonPayeurs: number;
    }>;
    private creerPenalitesRetard;
    private gererRetenuesDistribution;
    distribuerCagnotte(tenantId: string, tontineId: string, responsableId: string, retenues: {
        prets?: number;
        sanctions?: number;
        complementFonds?: number;
    }): Promise<{
        beneficiaire: {
            id: string;
            nom: string;
            prenom: string;
            numeroMembre: string;
        };
        cagnotteTotal: number;
        retenues: {
            prets: number;
            sanctions: number;
            complementFonds: number;
            total: number;
        };
        montantNet: number;
        cycleTermine: boolean;
        nouveauCycle: number;
    }>;
    sellTour(tenantId: string, tontineId: string, data: any): Promise<{
        id: string;
        date: Date;
        tontineId: string;
        acheteurId: string;
        tourOriginal: number;
        montantOffre: Decimal;
        interetsPrimaires: Decimal;
    }>;
    sellInterets(tenantId: string, tontineId: string, data: any): Promise<{
        id: string;
        date: Date;
        tontineId: string;
        montantInterets: Decimal;
        acheteurId: string;
        montantOffre: Decimal;
        vendeurId: string;
        modalite: string;
        interetsSecondaires: Decimal;
    }>;
    getBeneficiaireActuel(tenantId: string, tontineId: string): Promise<{
        partId: string;
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        ordre: number;
        tourActuel: number;
    } | null>;
    verifierTourGratuit(tenantId: string, tontineId: string, membreId: string): Promise<{
        aTourGratuit: boolean;
        tourGratuit: {
            id: string;
            montant: Decimal;
            date: Date;
            tontineId: string;
            beneficiaireId: string;
        } | null;
    }>;
    attribuerTourGratuit(tenantId: string, tontineId: string, beneficiaireId: string): Promise<{
        id: string;
        montant: Decimal;
        date: Date;
        tontineId: string;
        beneficiaireId: string;
    }>;
}
