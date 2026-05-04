import { ProjetsService } from './projets.service.js';
import { CreateProjetDto } from './dto/create-projet.dto.js';
import { ContribuerProjetDto } from './dto/contribuer-projet.dto.js';
export declare class ProjetsController {
    private readonly projetsService;
    constructor(projetsService: ProjetsService);
    create(req: any, createProjetDto: CreateProjetDto): Promise<{
        phases: {
            id: string;
            nom: string;
            ordre: number;
            objectif: import("@prisma/client/runtime/library").Decimal;
            dateLimite: Date;
            projetId: string;
        }[];
    } & {
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: string;
        dateDebut: Date;
        dateFin: Date | null;
        description: string;
        duree: import("@prisma/client").$Enums.DureeProjet;
        objectif: import("@prisma/client/runtime/library").Decimal;
        montantCollecte: import("@prisma/client/runtime/library").Decimal;
        ephemere: boolean;
        obligatoire: boolean;
    }>;
    findAll(req: any): Promise<{
        pourcentageAvancement: number;
        nombreContributeurs: number;
        phases: {
            id: string;
            nom: string;
            ordre: number;
            objectif: import("@prisma/client/runtime/library").Decimal;
            dateLimite: Date;
            projetId: string;
        }[];
        contributions: ({
            membre: {
                id: string;
                nom: string;
                prenom: string;
            };
        } & {
            id: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            membreId: string;
            volontaire: boolean;
            projetId: string;
        })[];
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: string;
        dateDebut: Date;
        dateFin: Date | null;
        description: string;
        duree: import("@prisma/client").$Enums.DureeProjet;
        objectif: import("@prisma/client/runtime/library").Decimal;
        montantCollecte: import("@prisma/client/runtime/library").Decimal;
        ephemere: boolean;
        obligatoire: boolean;
    }[]>;
    getStatistiques(req: any): Promise<{
        total: number;
        actifs: number;
        termines: number;
        montantTotalObjectif: import("@prisma/client/runtime/library").Decimal;
        montantTotalCollecte: import("@prisma/client/runtime/library").Decimal;
        nombreContributions: number;
        tauxReussite: number;
    }>;
    getAvancement(req: any, id: string): Promise<{
        projet: {
            id: string;
            nom: string;
            description: string;
            objectif: import("@prisma/client/runtime/library").Decimal;
            montantCollecte: import("@prisma/client/runtime/library").Decimal;
            pourcentageGlobal: number;
            statut: string;
        };
        phases: {
            id: string;
            nom: string;
            objectif: import("@prisma/client/runtime/library").Decimal;
            montantCollecte: import("@prisma/client/runtime/library").Decimal;
            pourcentage: number;
            dateLimite: Date;
        }[];
        contributeurs: {
            membre: any;
            montantTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
        statistiques: {
            nombreContributeurs: number;
            montantMoyen: import("@prisma/client/runtime/library").Decimal;
            nombreContributions: number;
        };
    }>;
    findOne(req: any, id: string): Promise<{
        pourcentageAvancement: number;
        nombreContributeurs: number;
        phases: {
            id: string;
            nom: string;
            ordre: number;
            objectif: import("@prisma/client/runtime/library").Decimal;
            dateLimite: Date;
            projetId: string;
        }[];
        contributions: ({
            membre: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            membreId: string;
            volontaire: boolean;
            projetId: string;
        })[];
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: string;
        dateDebut: Date;
        dateFin: Date | null;
        description: string;
        duree: import("@prisma/client").$Enums.DureeProjet;
        objectif: import("@prisma/client/runtime/library").Decimal;
        montantCollecte: import("@prisma/client/runtime/library").Decimal;
        ephemere: boolean;
        obligatoire: boolean;
    }>;
    contribuer(req: any, id: string, contribuerDto: ContribuerProjetDto): Promise<{
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        membreId: string;
        volontaire: boolean;
        projetId: string;
    }>;
}
