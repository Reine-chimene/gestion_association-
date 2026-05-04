import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePretDto } from './dto/create-pret.dto.js';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto.js';
import { ReconduirePretDto } from './dto/reconduire-pret.dto.js';
import { Decimal } from '@prisma/client/runtime/library';
export declare class PretsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, responsableId: string, dto: CreatePretDto): Promise<{
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
            partResponsabilite: Decimal;
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
            valeurEstimee: Decimal | null;
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
        montant: Decimal;
        emprunteurId: string;
        tauxInteret: Decimal;
        dureeEnMois: number;
        montantTotal: Decimal | null;
        soldeRestant: Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    }>;
    private calculerInteretsSimples;
    private genererEcheancier;
    findAll(tenantId: string, filters?: {
        statut?: string;
        type?: string;
        emprunteurId?: string;
        limit?: number;
        offset?: number;
    }): Promise<({
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
            partResponsabilite: Decimal;
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
            valeurEstimee: Decimal | null;
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
        montant: Decimal;
        emprunteurId: string;
        tauxInteret: Decimal;
        dureeEnMois: number;
        montantTotal: Decimal | null;
        soldeRestant: Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
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
            partResponsabilite: Decimal;
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
            valeurEstimee: Decimal | null;
            documentUrl: string | null;
            documentsUrl: string[];
            avalisteId: string | null;
        }[];
        echeances: {
            id: string;
            statut: import("@prisma/client").$Enums.StatutEcheance;
            montantTotal: Decimal;
            dateEcheance: Date;
            pretId: string;
            numeroEcheance: number;
            montantCapital: Decimal;
            montantInterets: Decimal;
            montantPaye: Decimal | null;
            datePaiement: Date | null;
        }[];
        paiements: {
            id: string;
            tenantId: string;
            montant: Decimal;
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
        montant: Decimal;
        emprunteurId: string;
        tauxInteret: Decimal;
        dureeEnMois: number;
        montantTotal: Decimal | null;
        soldeRestant: Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    }>;
    enregistrerPaiement(tenantId: string, pretId: string, responsableId: string, dto: EnregistrerPaiementDto): Promise<{
        id: string;
        tenantId: string;
        montant: Decimal;
        reference: string | null;
        notes: string | null;
        pretId: string;
        datePaiement: Date;
        echeanceId: string | null;
    }>;
    reconduire(tenantId: string, pretId: string, dto: ReconduirePretDto): Promise<{
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
            partResponsabilite: Decimal;
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
            valeurEstimee: Decimal | null;
            documentUrl: string | null;
            documentsUrl: string[];
            avalisteId: string | null;
        }[];
        echeances: {
            id: string;
            statut: import("@prisma/client").$Enums.StatutEcheance;
            montantTotal: Decimal;
            dateEcheance: Date;
            pretId: string;
            numeroEcheance: number;
            montantCapital: Decimal;
            montantInterets: Decimal;
            montantPaye: Decimal | null;
            datePaiement: Date | null;
        }[];
        paiements: {
            id: string;
            tenantId: string;
            montant: Decimal;
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
        montant: Decimal;
        emprunteurId: string;
        tauxInteret: Decimal;
        dureeEnMois: number;
        montantTotal: Decimal | null;
        soldeRestant: Decimal | null;
        notes: string | null;
        dateOctroi: Date;
        dateEcheance: Date;
        nombreReconductions: number;
    }>;
    getEcheancier(tenantId: string, pretId: string): Promise<{
        id: string;
        statut: import("@prisma/client").$Enums.StatutEcheance;
        montantTotal: Decimal;
        dateEcheance: Date;
        pretId: string;
        numeroEcheance: number;
        montantCapital: Decimal;
        montantInterets: Decimal;
        montantPaye: Decimal | null;
        datePaiement: Date | null;
    }[]>;
    getSoldeRestant(tenantId: string, pretId: string): Promise<{
        pretId: string;
        montantInitial: Decimal;
        montantTotal: Decimal | null;
        soldeRestant: Decimal | null;
        montantPaye: number;
        pourcentagePaye: number;
        statut: import("@prisma/client").$Enums.StatutPret;
    }>;
    declencherRecouvrementForce(tenantId: string, pretId: string, responsableId: string): Promise<{
        message: string;
        pretId: string;
        echeancesEnRetard: number;
        montantDu: number;
    }>;
    getStatistiques(tenantId: string): Promise<{
        total: number;
        enCours: number;
        soldes: number;
        enRetard: number;
        montantTotal: number;
        montantRembourse: number;
        tauxRecouvrement: number;
    }>;
}
