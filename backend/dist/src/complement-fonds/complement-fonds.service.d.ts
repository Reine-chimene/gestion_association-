import { PrismaService } from '../prisma/prisma.service.js';
import { CaissesService } from '../caisses/caisses.service.js';
export declare class ComplementFondsService {
    private prisma;
    private caissesService;
    constructor(prisma: PrismaService, caissesService: CaissesService);
    calculerComplementAnnuel(tenantId: string, annee: number, montantTotal: number): Promise<{
        montantTotal: number;
        montantParMembre: number;
        nombreMembresActifs: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutComplementFonds;
        annee: number;
    }>;
    findAll(tenantId: string, options?: {
        annee?: number;
        statut?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        complementFonds: {
            montantTotal: number;
            montantParMembre: number;
            nombrePaiements: number;
            paiements: {
                montant: number;
                membre: {
                    id: string;
                    nom: string;
                    numeroMembre: string;
                    prenom: string;
                };
                id: string;
                membreId: string;
                datePaiement: Date;
                complementFondsId: string;
                modePaiement: import("@prisma/client").$Enums.ModePaiementComplement;
            }[];
            _count: {
                paiements: number;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            statut: import("@prisma/client").$Enums.StatutComplementFonds;
            annee: number;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        montantTotal: number;
        montantParMembre: number;
        paiements: {
            montant: number;
            membre: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
            id: string;
            membreId: string;
            datePaiement: Date;
            complementFondsId: string;
            modePaiement: import("@prisma/client").$Enums.ModePaiementComplement;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutComplementFonds;
        annee: number;
    }>;
    getSuiviPaiements(tenantId: string, complementFondsId: string): Promise<{
        complementFonds: {
            id: string;
            annee: number;
            montantTotal: number;
            montantParMembre: number;
            statut: import("@prisma/client").$Enums.StatutComplementFonds;
        };
        suiviPaiements: {
            membre: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
            montantDu: number;
            montantPaye: number;
            montantRestant: number;
            statut: string;
            nombrePaiements: number;
            dernierPaiement: Date | null;
        }[];
        statistiques: {
            nombreMembres: number;
            totalPaye: number;
            totalRestant: number;
            tauxRecouvrement: number;
            nombrePayes: number;
            nombrePartiels: number;
            nombreImpayes: number;
        };
    }>;
    enregistrerPaiement(tenantId: string, complementFondsId: string, responsableId: string, data: {
        membreId: string;
        montant: number;
        modePaiement?: 'PRELEVEMENT_AUTO' | 'PAIEMENT_MANUEL';
    }): Promise<{
        paiement: {
            montant: number;
            membre: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
            id: string;
            membreId: string;
            datePaiement: Date;
            complementFondsId: string;
            modePaiement: import("@prisma/client").$Enums.ModePaiementComplement;
        };
        montantDejaPaye: number;
        montantRestant: number;
    }>;
    augmenter(tenantId: string, complementFondsId: string, nouveauMontantTotal: number): Promise<{
        montantTotal: number;
        montantParMembre: number;
        ancienMontantTotal: number;
        ancienMontantParMembre: number;
        augmentation: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutComplementFonds;
        annee: number;
    }>;
    casser(tenantId: string, complementFondsId: string, responsableId: string, motif: string): Promise<{
        montantTotal: number;
        montantParMembre: number;
        montantRembourse: number;
        nombrePaiementsRembourses: number;
        motif: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutComplementFonds;
        annee: number;
    }>;
    preleverAutomatique(tenantId: string, membreId: string, annee: number): Promise<{
        montant: number;
        complementFondsId: string;
    } | null>;
}
