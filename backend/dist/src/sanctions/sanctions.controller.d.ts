import { SanctionsService } from './sanctions.service.js';
import { CreateTypeSanctionDto } from './dto/create-type-sanction.dto.js';
import { UpdateTypeSanctionDto } from './dto/update-type-sanction.dto.js';
import { AppliquerSanctionDto } from './dto/appliquer-sanction.dto.js';
import { AnnulerSanctionDto } from './dto/annuler-sanction.dto.js';
export declare class SanctionsController {
    private readonly sanctionsService;
    constructor(sanctionsService: SanctionsService);
    createTypeSanction(req: any, createTypeSanctionDto: CreateTypeSanctionDto): Promise<{
        id: string;
        nom: string;
        actif: boolean;
        tenantId: string;
        modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
        montantFixe: import("@prisma/client/runtime/library").Decimal | null;
        pourcentage: import("@prisma/client/runtime/library").Decimal | null;
        joursDeGrace: number;
    }>;
    findAllTypesSanctions(req: any): Promise<({
        _count: {
            sanctions: number;
        };
    } & {
        id: string;
        nom: string;
        actif: boolean;
        tenantId: string;
        modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
        montantFixe: import("@prisma/client/runtime/library").Decimal | null;
        pourcentage: import("@prisma/client/runtime/library").Decimal | null;
        joursDeGrace: number;
    })[]>;
    findOneTypeSanction(req: any, id: string): Promise<{
        _count: {
            sanctions: number;
        };
    } & {
        id: string;
        nom: string;
        actif: boolean;
        tenantId: string;
        modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
        montantFixe: import("@prisma/client/runtime/library").Decimal | null;
        pourcentage: import("@prisma/client/runtime/library").Decimal | null;
        joursDeGrace: number;
    }>;
    updateTypeSanction(req: any, id: string, updateTypeSanctionDto: UpdateTypeSanctionDto): Promise<{
        id: string;
        nom: string;
        actif: boolean;
        tenantId: string;
        modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
        montantFixe: import("@prisma/client/runtime/library").Decimal | null;
        pourcentage: import("@prisma/client/runtime/library").Decimal | null;
        joursDeGrace: number;
    }>;
    removeTypeSanction(req: any, id: string): Promise<{
        message: string;
    }>;
    appliquerSanction(req: any, appliquerSanctionDto: AppliquerSanctionDto): Promise<{
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        typeSanction: {
            id: string;
            nom: string;
            actif: boolean;
            tenantId: string;
            modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
            montantFixe: import("@prisma/client/runtime/library").Decimal | null;
            pourcentage: import("@prisma/client/runtime/library").Decimal | null;
            joursDeGrace: number;
        };
    } & {
        id: string;
        tenantId: string;
        statut: string;
        motif: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        datePaiement: Date | null;
        typeSanctionId: string;
        dateApplication: Date;
    }>;
    findAllSanctions(req: any, membreId?: string, statut?: string): Promise<({
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        typeSanction: {
            id: string;
            nom: string;
            actif: boolean;
            tenantId: string;
            modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
            montantFixe: import("@prisma/client/runtime/library").Decimal | null;
            pourcentage: import("@prisma/client/runtime/library").Decimal | null;
            joursDeGrace: number;
        };
    } & {
        id: string;
        tenantId: string;
        statut: string;
        motif: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        datePaiement: Date | null;
        typeSanctionId: string;
        dateApplication: Date;
    })[]>;
    findOneSanction(req: any, id: string): Promise<{
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
            telephone: string;
        };
        typeSanction: {
            id: string;
            nom: string;
            actif: boolean;
            tenantId: string;
            modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
            montantFixe: import("@prisma/client/runtime/library").Decimal | null;
            pourcentage: import("@prisma/client/runtime/library").Decimal | null;
            joursDeGrace: number;
        };
    } & {
        id: string;
        tenantId: string;
        statut: string;
        motif: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        datePaiement: Date | null;
        typeSanctionId: string;
        dateApplication: Date;
    }>;
    annulerSanction(req: any, id: string, annulerSanctionDto: AnnulerSanctionDto): Promise<{
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        typeSanction: {
            id: string;
            nom: string;
            actif: boolean;
            tenantId: string;
            modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
            montantFixe: import("@prisma/client/runtime/library").Decimal | null;
            pourcentage: import("@prisma/client/runtime/library").Decimal | null;
            joursDeGrace: number;
        };
    } & {
        id: string;
        tenantId: string;
        statut: string;
        motif: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        datePaiement: Date | null;
        typeSanctionId: string;
        dateApplication: Date;
    }>;
    marquerPayee(req: any, id: string): Promise<{
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        typeSanction: {
            id: string;
            nom: string;
            actif: boolean;
            tenantId: string;
            modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
            montantFixe: import("@prisma/client/runtime/library").Decimal | null;
            pourcentage: import("@prisma/client/runtime/library").Decimal | null;
            joursDeGrace: number;
        };
    } & {
        id: string;
        tenantId: string;
        statut: string;
        motif: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        datePaiement: Date | null;
        typeSanctionId: string;
        dateApplication: Date;
    }>;
    getSanctionsByMembre(req: any, membreId: string): Promise<({
        membre: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        typeSanction: {
            id: string;
            nom: string;
            actif: boolean;
            tenantId: string;
            modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
            montantFixe: import("@prisma/client/runtime/library").Decimal | null;
            pourcentage: import("@prisma/client/runtime/library").Decimal | null;
            joursDeGrace: number;
        };
    } & {
        id: string;
        tenantId: string;
        statut: string;
        motif: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        membreId: string;
        datePaiement: Date | null;
        typeSanctionId: string;
        dateApplication: Date;
    })[]>;
    getTotalSanctionsImpayees(req: any, membreId: string): Promise<number>;
}
