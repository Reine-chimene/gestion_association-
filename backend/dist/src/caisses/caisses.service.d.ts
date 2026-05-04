import { PrismaService } from '../prisma/prisma.service.js';
import { Decimal } from '@prisma/client/runtime/library';
export declare class CaissesService {
    private prisma;
    constructor(prisma: PrismaService);
    getCaisse(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import("@prisma/client").$Enums.TypeCaisse;
        solde: Decimal;
    }>;
    crediter(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE', montant: number, motif: string, responsableId: string, reference?: string): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: Decimal;
            soldeApres: Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    debiter(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE', montant: number, motif: string, responsableId: string, reference?: string): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: Decimal;
            soldeApres: Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    decharge(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE', montant: number, motif: string, justification: string, responsableId: string): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: Decimal;
            soldeApres: Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    versementBancaire(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE', montant: number, motif: string, reference: string, responsableId: string): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: Decimal;
            soldeApres: Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    getSolde(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE'): Promise<{
        type: import("@prisma/client").$Enums.TypeCaisse;
        solde: number;
        updatedAt: Date;
    }>;
    getHistorique(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE', dateDebut?: Date, dateFin?: Date, limit?: number, offset?: number): Promise<{
        mouvements: {
            montant: number;
            soldeApres: number;
            id: string;
            motif: string;
            type: string;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    verifierCoherence(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE'): Promise<{
        coherent: boolean;
        soldeActuel: number;
        soldeCalcule: number;
        difference: number;
        nombreMouvements: number;
    }>;
    getAllCaisses(tenantId: string): Promise<{
        type: import("@prisma/client").$Enums.TypeCaisse;
        solde: number;
        updatedAt: Date;
    }[]>;
}
