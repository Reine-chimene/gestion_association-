import { SeancesService } from './seances.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { EnregistrerPresencesDto } from './dto/enregistrer-presences.dto.js';
import { CollecterCotisationsDto } from './dto/collecter-cotisations.dto.js';
import { CloturerSeanceDto } from './dto/cloturer-seance.dto.js';
export declare class SeancesController {
    private readonly seancesService;
    constructor(seancesService: SeancesService);
    create(req: any, createSeanceDto: CreateSeanceDto): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(req: any, id: string): Promise<{
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
    enregistrerPresences(req: any, id: string, enregistrerPresencesDto: EnregistrerPresencesDto): Promise<{
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
    collecterCotisations(req: any, id: string, collecterCotisationsDto: CollecterCotisationsDto): Promise<{
        message: string;
    }>;
    genererProcesVerbal(req: any, id: string): Promise<{
        id: string;
        seanceId: string;
        contenu: string;
        signatures: string[];
        dateCreation: Date;
    }>;
    cloturerSeance(req: any, id: string, cloturerSeanceDto: CloturerSeanceDto): Promise<{
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
