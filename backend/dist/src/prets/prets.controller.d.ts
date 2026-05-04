import { PretsService } from './prets.service.js';
import { CreatePretDto } from './dto/create-pret.dto.js';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto.js';
import { ReconduirePretDto } from './dto/reconduire-pret.dto.js';
export declare class PretsController {
    private readonly pretsService;
    constructor(pretsService: PretsService);
    create(dto: CreatePretDto, req: any): Promise<{
        coEmprunteurs: ({
            membre: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            tenantId: string;
            membreId: string;
            pretId: string;
            partResponsabilite: import("@prisma/client/runtime/library").Decimal;
        })[];
        emprunteur: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        garanties: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeGarantie;
            pretId: string;
            description: string;
            valeurEstimee: import("@prisma/client/runtime/library").Decimal | null;
            documentUrl: string | null;
            documentsUrl: string[];
            avalisteId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutPret;
        motif: string | null;
        type: import("@prisma/client").$Enums.TypePret;
        montant: import("@prisma/client/runtime/library").Decimal;
        emprunteurId: string;
        tauxInteret: import("@prisma/client/runtime/library").Decimal;
        dureeEnMois: number;
        montantTotal: import("@prisma/client/runtime/library").Decimal | null;
        soldeRestant: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    }>;
    findAll(statut?: string, type?: string, emprunteurId?: string, limit?: number, offset?: number, req?: any): Promise<({
        _count: {
            echeances: number;
            paiements: number;
        };
        coEmprunteurs: ({
            membre: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            tenantId: string;
            membreId: string;
            pretId: string;
            partResponsabilite: import("@prisma/client/runtime/library").Decimal;
        })[];
        emprunteur: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
        garanties: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeGarantie;
            pretId: string;
            description: string;
            valeurEstimee: import("@prisma/client/runtime/library").Decimal | null;
            documentUrl: string | null;
            documentsUrl: string[];
            avalisteId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutPret;
        motif: string | null;
        type: import("@prisma/client").$Enums.TypePret;
        montant: import("@prisma/client/runtime/library").Decimal;
        emprunteurId: string;
        tauxInteret: import("@prisma/client/runtime/library").Decimal;
        dureeEnMois: number;
        montantTotal: import("@prisma/client/runtime/library").Decimal | null;
        soldeRestant: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    })[]>;
    findOne(id: string, req: any): Promise<{
        coEmprunteurs: ({
            membre: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            tenantId: string;
            membreId: string;
            pretId: string;
            partResponsabilite: import("@prisma/client/runtime/library").Decimal;
        })[];
        emprunteur: {
            nom: string;
            email: string | null;
            numeroMembre: string;
            prenom: string;
            telephone: string;
        };
        garanties: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeGarantie;
            pretId: string;
            description: string;
            valeurEstimee: import("@prisma/client/runtime/library").Decimal | null;
            documentUrl: string | null;
            documentsUrl: string[];
            avalisteId: string | null;
        }[];
        echeances: {
            id: string;
            statut: import("@prisma/client").$Enums.StatutEcheance;
            montantTotal: import("@prisma/client/runtime/library").Decimal;
            dateEcheance: Date;
            pretId: string;
            numeroEcheance: number;
            montantCapital: import("@prisma/client/runtime/library").Decimal;
            montantInterets: import("@prisma/client/runtime/library").Decimal;
            montantPaye: import("@prisma/client/runtime/library").Decimal | null;
            datePaiement: Date | null;
        }[];
        paiements: {
            id: string;
            tenantId: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            notes: string | null;
            pretId: string;
            datePaiement: Date;
            echeanceId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutPret;
        motif: string | null;
        type: import("@prisma/client").$Enums.TypePret;
        montant: import("@prisma/client/runtime/library").Decimal;
        emprunteurId: string;
        tauxInteret: import("@prisma/client/runtime/library").Decimal;
        dureeEnMois: number;
        montantTotal: import("@prisma/client/runtime/library").Decimal | null;
        soldeRestant: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    }>;
    enregistrerPaiement(id: string, dto: EnregistrerPaiementDto, req: any): Promise<{
        id: string;
        tenantId: string;
        montant: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        notes: string | null;
        pretId: string;
        datePaiement: Date;
        echeanceId: string | null;
    }>;
    reconduire(id: string, dto: ReconduirePretDto, req: any): Promise<{
        coEmprunteurs: ({
            membre: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            tenantId: string;
            membreId: string;
            pretId: string;
            partResponsabilite: import("@prisma/client/runtime/library").Decimal;
        })[];
        emprunteur: {
            nom: string;
            email: string | null;
            numeroMembre: string;
            prenom: string;
            telephone: string;
        };
        garanties: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.TypeGarantie;
            pretId: string;
            description: string;
            valeurEstimee: import("@prisma/client/runtime/library").Decimal | null;
            documentUrl: string | null;
            documentsUrl: string[];
            avalisteId: string | null;
        }[];
        echeances: {
            id: string;
            statut: import("@prisma/client").$Enums.StatutEcheance;
            montantTotal: import("@prisma/client/runtime/library").Decimal;
            dateEcheance: Date;
            pretId: string;
            numeroEcheance: number;
            montantCapital: import("@prisma/client/runtime/library").Decimal;
            montantInterets: import("@prisma/client/runtime/library").Decimal;
            montantPaye: import("@prisma/client/runtime/library").Decimal | null;
            datePaiement: Date | null;
        }[];
        paiements: {
            id: string;
            tenantId: string;
            montant: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            notes: string | null;
            pretId: string;
            datePaiement: Date;
            echeanceId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutPret;
        motif: string | null;
        type: import("@prisma/client").$Enums.TypePret;
        montant: import("@prisma/client/runtime/library").Decimal;
        emprunteurId: string;
        tauxInteret: import("@prisma/client/runtime/library").Decimal;
        dureeEnMois: number;
        montantTotal: import("@prisma/client/runtime/library").Decimal | null;
        soldeRestant: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    }>;
    declencherRecouvrementForce(id: string, req: any): Promise<{
        message: string;
        pretId: string;
        echeancesEnRetard: number;
        montantDu: number;
    }>;
    getEcheancier(id: string, req: any): Promise<{
        id: string;
        statut: import("@prisma/client").$Enums.StatutEcheance;
        montantTotal: import("@prisma/client/runtime/library").Decimal;
        dateEcheance: Date;
        pretId: string;
        numeroEcheance: number;
        montantCapital: import("@prisma/client/runtime/library").Decimal;
        montantInterets: import("@prisma/client/runtime/library").Decimal;
        montantPaye: import("@prisma/client/runtime/library").Decimal | null;
        datePaiement: Date | null;
    }[]>;
    getSoldeRestant(id: string, req: any): Promise<{
        pretId: string;
        montantInitial: import("@prisma/client/runtime/library").Decimal;
        montantTotal: import("@prisma/client/runtime/library").Decimal | null;
        soldeRestant: import("@prisma/client/runtime/library").Decimal | null;
        montantPaye: number;
        pourcentagePaye: number;
        statut: import("@prisma/client").$Enums.StatutPret;
    }>;
    getStatistiques(req: any): Promise<{
        total: number;
        enCours: number;
        soldes: number;
        enRetard: number;
        montantTotal: number;
        montantRembourse: number;
        tauxRecouvrement: number;
    }>;
}
