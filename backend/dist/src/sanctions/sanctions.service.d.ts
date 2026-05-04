import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTypeSanctionDto } from './dto/create-type-sanction.dto.js';
import { UpdateTypeSanctionDto } from './dto/update-type-sanction.dto.js';
import { AppliquerSanctionDto } from './dto/appliquer-sanction.dto.js';
import { AnnulerSanctionDto } from './dto/annuler-sanction.dto.js';
export declare class SanctionsService {
    private prisma;
    constructor(prisma: PrismaService);
    createTypeSanction(tenantId: string, createTypeSanctionDto: CreateTypeSanctionDto): Promise<{
        id: string;
        nom: string;
        actif: boolean;
        tenantId: string;
        modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
        montantFixe: import("@prisma/client/runtime/library").Decimal | null;
        pourcentage: import("@prisma/client/runtime/library").Decimal | null;
        joursDeGrace: number;
    }>;
    findAllTypesSanctions(tenantId: string): Promise<({
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
    findOneTypeSanction(tenantId: string, id: string): Promise<{
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
    updateTypeSanction(tenantId: string, id: string, updateTypeSanctionDto: UpdateTypeSanctionDto): Promise<{
        id: string;
        nom: string;
        actif: boolean;
        tenantId: string;
        modeCalcul: import("@prisma/client").$Enums.ModeCalcul;
        montantFixe: import("@prisma/client/runtime/library").Decimal | null;
        pourcentage: import("@prisma/client/runtime/library").Decimal | null;
        joursDeGrace: number;
    }>;
    removeTypeSanction(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    appliquerSanction(tenantId: string, appliquerSanctionDto: AppliquerSanctionDto): Promise<{
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
    calculerMontantSanction(tenantId: string, typeSanctionId: string, montantBase?: number, nombreJoursRetard?: number): Promise<number>;
    findAllSanctions(tenantId: string, membreId?: string, statut?: string): Promise<({
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
    findOneSanction(tenantId: string, id: string): Promise<{
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
    annulerSanction(tenantId: string, id: string, annulerSanctionDto: AnnulerSanctionDto): Promise<{
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
    marquerPayee(tenantId: string, id: string): Promise<{
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
    getSanctionsByMembre(tenantId: string, membreId: string): Promise<({
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
    getTotalSanctionsImpayees(tenantId: string, membreId: string): Promise<number>;
}
