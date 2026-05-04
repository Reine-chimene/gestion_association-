import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjetDto } from './dto/create-projet.dto.js';
import { ContribuerProjetDto } from './dto/contribuer-projet.dto.js';
import { CreatePhaseDto } from './dto/create-phase.dto.js';
import { Decimal } from '@prisma/client/runtime/library';
export declare class ProjetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createProjetDto: CreateProjetDto, phases?: CreatePhaseDto[]): Promise<{
        phases: {
            id: string;
            nom: string;
            ordre: number;
            objectif: Decimal;
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
        objectif: Decimal;
        montantCollecte: Decimal;
        ephemere: boolean;
        obligatoire: boolean;
    }>;
    findAll(tenantId: string): Promise<{
        pourcentageAvancement: number;
        nombreContributeurs: number;
        phases: {
            id: string;
            nom: string;
            ordre: number;
            objectif: Decimal;
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
            montant: Decimal;
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
        objectif: Decimal;
        montantCollecte: Decimal;
        ephemere: boolean;
        obligatoire: boolean;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        pourcentageAvancement: number;
        nombreContributeurs: number;
        phases: {
            id: string;
            nom: string;
            ordre: number;
            objectif: Decimal;
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
            montant: Decimal;
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
        objectif: Decimal;
        montantCollecte: Decimal;
        ephemere: boolean;
        obligatoire: boolean;
    }>;
    contribuer(tenantId: string, projetId: string, contribuerDto: ContribuerProjetDto): Promise<{
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        montant: Decimal;
        date: Date;
        membreId: string;
        volontaire: boolean;
        projetId: string;
    }>;
    getAvancement(tenantId: string, projetId: string): Promise<{
        projet: {
            id: string;
            nom: string;
            description: string;
            objectif: Decimal;
            montantCollecte: Decimal;
            pourcentageGlobal: number;
            statut: string;
        };
        phases: {
            id: string;
            nom: string;
            objectif: Decimal;
            montantCollecte: Decimal;
            pourcentage: number;
            dateLimite: Date;
        }[];
        contributeurs: {
            membre: any;
            montantTotal: Decimal;
        }[];
        statistiques: {
            nombreContributeurs: number;
            montantMoyen: Decimal;
            nombreContributions: number;
        };
    }>;
    getStatistiques(tenantId: string): Promise<{
        total: number;
        actifs: number;
        termines: number;
        montantTotalObjectif: Decimal;
        montantTotalCollecte: Decimal;
        nombreContributions: number;
        tauxReussite: number;
    }>;
    private calculatePourcentageAvancement;
}
