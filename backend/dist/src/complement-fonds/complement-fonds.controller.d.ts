import { ComplementFondsService } from './complement-fonds.service.js';
import { CreateComplementFondsDto } from './dto/create-complement-fonds.dto.js';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto.js';
export declare class ComplementFondsController {
    private readonly complementFondsService;
    constructor(complementFondsService: ComplementFondsService);
    calculerComplementAnnuel(dto: CreateComplementFondsDto, req: any): Promise<{
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
    findAll(annee?: number, statut?: string, limit?: number, offset?: number, req?: any): Promise<{
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
    getSuiviPaiements(id: string, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    enregistrerPaiement(id: string, dto: EnregistrerPaiementDto, req: any): Promise<{
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
    augmenter(id: string, nouveauMontantTotal: number, req: any): Promise<{
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
    casser(id: string, motif: string, req: any): Promise<{
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
}
