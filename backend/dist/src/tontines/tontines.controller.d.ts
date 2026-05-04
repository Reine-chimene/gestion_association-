import { TontinesService } from './tontines.service.js';
import { CreateTontineDto } from './dto/create-tontine.dto.js';
import { CollecterCotisationsDto } from './dto/collecter-cotisations.dto.js';
import { DistribuerCagnotteDto } from './dto/distribuer-cagnotte.dto.js';
import { VendreTourDto } from './dto/vendre-tour.dto.js';
import { VendreInteretsDto } from './dto/vendre-interets.dto.js';
export declare class TontinesController {
    private readonly tontinesService;
    constructor(tontinesService: TontinesService);
    create(dto: CreateTontineDto, req: any): Promise<({
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
            interetsPrimairesAccumules: import("@prisma/client/runtime/library").Decimal;
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
        montantCotisation: import("@prisma/client/runtime/library").Decimal;
        frequence: import("@prisma/client").$Enums.Frequence;
        cycleActuel: number;
    }) | null>;
    findAll(statut?: string, type?: string, limit?: number, offset?: number, req?: any): Promise<({
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
            interetsPrimairesAccumules: import("@prisma/client/runtime/library").Decimal;
        })[];
        ventesTours: {
            id: string;
            date: Date;
            tontineId: string;
            acheteurId: string;
            tourOriginal: number;
            montantOffre: import("@prisma/client/runtime/library").Decimal;
            interetsPrimaires: import("@prisma/client/runtime/library").Decimal;
        }[];
        ventesInterets: {
            id: string;
            date: Date;
            tontineId: string;
            montantInterets: import("@prisma/client/runtime/library").Decimal;
            acheteurId: string;
            montantOffre: import("@prisma/client/runtime/library").Decimal;
            vendeurId: string;
            modalite: string;
            interetsSecondaires: import("@prisma/client/runtime/library").Decimal;
        }[];
        toursGratuits: {
            id: string;
            montant: import("@prisma/client/runtime/library").Decimal;
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
        montantCotisation: import("@prisma/client/runtime/library").Decimal;
        frequence: import("@prisma/client").$Enums.Frequence;
        cycleActuel: number;
    })[]>;
    collecterCotisations(id: string, dto: CollecterCotisationsDto, req: any): Promise<{
        succes: boolean;
        membresNonPayeurs: string[];
        nombreNonPayeurs: number;
    }>;
    distribuerCagnotte(id: string, dto: DistribuerCagnotteDto, req: any): Promise<{
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
    sellTour(id: string, dto: VendreTourDto, req: any): Promise<{
        id: string;
        date: Date;
        tontineId: string;
        acheteurId: string;
        tourOriginal: number;
        montantOffre: import("@prisma/client/runtime/library").Decimal;
        interetsPrimaires: import("@prisma/client/runtime/library").Decimal;
    }>;
    sellInterets(id: string, dto: VendreInteretsDto, req: any): Promise<{
        id: string;
        date: Date;
        tontineId: string;
        montantInterets: import("@prisma/client/runtime/library").Decimal;
        acheteurId: string;
        montantOffre: import("@prisma/client/runtime/library").Decimal;
        vendeurId: string;
        modalite: string;
        interetsSecondaires: import("@prisma/client/runtime/library").Decimal;
    }>;
    attribuerTourGratuit(id: string, beneficiaireId: string, req: any): Promise<{
        id: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        tontineId: string;
        beneficiaireId: string;
    }>;
    getVentesTour(id: string, req: any): Promise<{
        id: string;
        date: Date;
        tontineId: string;
        acheteurId: string;
        tourOriginal: number;
        montantOffre: import("@prisma/client/runtime/library").Decimal;
        interetsPrimaires: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getToursGratuits(id: string, req: any): Promise<{
        id: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        tontineId: string;
        beneficiaireId: string;
    }[]>;
    getBeneficiaireActuel(id: string, req: any): Promise<{
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
    verifierTourGratuit(id: string, membreId: string, req: any): Promise<{
        aTourGratuit: boolean;
        tourGratuit: {
            id: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            tontineId: string;
            beneficiaireId: string;
        } | null;
    }>;
    findOne(id: string, req: any): Promise<{
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
            interetsPrimairesAccumules: import("@prisma/client/runtime/library").Decimal;
        })[];
        ventesTours: {
            id: string;
            date: Date;
            tontineId: string;
            acheteurId: string;
            tourOriginal: number;
            montantOffre: import("@prisma/client/runtime/library").Decimal;
            interetsPrimaires: import("@prisma/client/runtime/library").Decimal;
        }[];
        ventesInterets: {
            id: string;
            date: Date;
            tontineId: string;
            montantInterets: import("@prisma/client/runtime/library").Decimal;
            acheteurId: string;
            montantOffre: import("@prisma/client/runtime/library").Decimal;
            vendeurId: string;
            modalite: string;
            interetsSecondaires: import("@prisma/client/runtime/library").Decimal;
        }[];
        toursGratuits: {
            id: string;
            montant: import("@prisma/client/runtime/library").Decimal;
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
        montantCotisation: import("@prisma/client/runtime/library").Decimal;
        frequence: import("@prisma/client").$Enums.Frequence;
        cycleActuel: number;
    }>;
}
