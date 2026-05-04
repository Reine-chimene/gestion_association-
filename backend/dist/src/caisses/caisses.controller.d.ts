import { CaissesService } from './caisses.service.js';
import { CrediterCaisseDto } from './dto/crediter-caisse.dto.js';
import { DebiterCaisseDto } from './dto/debiter-caisse.dto.js';
import { DechargeCaisseDto } from './dto/decharge-caisse.dto.js';
import { VersementBancaireDto } from './dto/versement-bancaire.dto.js';
export declare class CaissesController {
    private readonly caissesService;
    constructor(caissesService: CaissesService);
    getAllCaisses(req: any): Promise<{
        type: import("@prisma/client").$Enums.TypeCaisse;
        solde: number;
        updatedAt: Date;
    }[]>;
    crediter(type: 'FONDS' | 'SANCTION' | 'EPARGNE', dto: CrediterCaisseDto, req: any): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: import("@prisma/client/runtime/library").Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            soldeApres: import("@prisma/client/runtime/library").Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    debiter(type: 'FONDS' | 'SANCTION' | 'EPARGNE', dto: DebiterCaisseDto, req: any): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: import("@prisma/client/runtime/library").Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            soldeApres: import("@prisma/client/runtime/library").Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    decharge(type: 'FONDS' | 'SANCTION' | 'EPARGNE', dto: DechargeCaisseDto, req: any): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: import("@prisma/client/runtime/library").Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            soldeApres: import("@prisma/client/runtime/library").Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    versementBancaire(type: 'FONDS' | 'SANCTION' | 'EPARGNE', dto: VersementBancaireDto, req: any): Promise<{
        caisse: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeCaisse;
            solde: import("@prisma/client/runtime/library").Decimal;
        };
        mouvement: {
            id: string;
            motif: string;
            type: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            soldeApres: import("@prisma/client/runtime/library").Decimal;
            justification: string | null;
            reference: string | null;
            responsableId: string;
            date: Date;
            caisseId: string;
        };
    }>;
    getSolde(type: 'FONDS' | 'SANCTION' | 'EPARGNE', req: any): Promise<{
        type: import("@prisma/client").$Enums.TypeCaisse;
        solde: number;
        updatedAt: Date;
    }>;
    getHistorique(type: 'FONDS' | 'SANCTION' | 'EPARGNE', dateDebut?: string, dateFin?: string, limit?: number, offset?: number, req?: any): Promise<{
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
    verifierCoherence(type: 'FONDS' | 'SANCTION' | 'EPARGNE', req: any): Promise<{
        coherent: boolean;
        soldeActuel: number;
        soldeCalcule: number;
        difference: number;
        nombreMouvements: number;
    }>;
}
