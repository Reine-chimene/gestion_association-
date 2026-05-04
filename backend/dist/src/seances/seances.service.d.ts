import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { EnregistrerPresencesDto } from './dto/enregistrer-presences.dto.js';
import { CollecterCotisationsDto } from './dto/collecter-cotisations.dto.js';
import { CloturerSeanceDto } from './dto/cloturer-seance.dto.js';
export declare class SeancesService {
    private prisma;
    constructor(prisma: PrismaService);
    creer(tenantId: string, createSeanceDto: CreateSeanceDto): Promise<{
        presences: ({
            membre: {
                id: string;
                nom: string;
                prenom: string;
            };
        } & {
            id: string;
            justification: string | null;
            membreId: string;
            present: boolean;
            seanceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutSeance;
        date: Date;
        rapportSeance: string | null;
    }>;
    findAll(tenantId: string): Promise<({
        procesVerbal: {
            id: string;
            seanceId: string;
            contenu: string;
            signatures: string[];
            dateCreation: Date;
        } | null;
        presences: ({
            membre: {
                id: string;
                nom: string;
                prenom: string;
            };
        } & {
            id: string;
            justification: string | null;
            membreId: string;
            present: boolean;
            seanceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutSeance;
        date: Date;
        rapportSeance: string | null;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        procesVerbal: {
            id: string;
            seanceId: string;
            contenu: string;
            signatures: string[];
            dateCreation: Date;
        } | null;
        presences: ({
            membre: {
                id: string;
                nom: string;
                prenom: string;
                telephone: string;
            };
        } & {
            id: string;
            justification: string | null;
            membreId: string;
            present: boolean;
            seanceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutSeance;
        date: Date;
        rapportSeance: string | null;
    }>;
    enregistrerPresences(tenantId: string, seanceId: string, enregistrerPresencesDto: EnregistrerPresencesDto): Promise<{
        procesVerbal: {
            id: string;
            seanceId: string;
            contenu: string;
            signatures: string[];
            dateCreation: Date;
        } | null;
        presences: ({
            membre: {
                id: string;
                nom: string;
                prenom: string;
                telephone: string;
            };
        } & {
            id: string;
            justification: string | null;
            membreId: string;
            present: boolean;
            seanceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutSeance;
        date: Date;
        rapportSeance: string | null;
    }>;
    collecterCotisations(tenantId: string, seanceId: string, collecterCotisationsDto: CollecterCotisationsDto): Promise<{
        message: string;
    }>;
    genererProcesVerbal(tenantId: string, seanceId: string): Promise<{
        id: string;
        seanceId: string;
        contenu: string;
        signatures: string[];
        dateCreation: Date;
    }>;
    cloturerSeance(tenantId: string, seanceId: string, cloturerSeanceDto: CloturerSeanceDto): Promise<{
        procesVerbal: {
            id: string;
            seanceId: string;
            contenu: string;
            signatures: string[];
            dateCreation: Date;
        } | null;
        presences: ({
            membre: {
                id: string;
                nom: string;
                prenom: string;
            };
        } & {
            id: string;
            justification: string | null;
            membreId: string;
            present: boolean;
            seanceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutSeance;
        date: Date;
        rapportSeance: string | null;
    }>;
}
