import { PrismaService } from '../prisma/prisma.service.js';
import { CaissesService } from '../caisses/caisses.service.js';
import { DemanderAideMaladieDto } from './dto/demander-aide-maladie.dto.js';
import { DeclarerDecesDto } from './dto/declarer-deces.dto.js';
import { ApprouverAideDto } from './dto/approuver-aide.dto.js';
import { RejeterAideDto } from './dto/rejeter-aide.dto.js';
import { TypeAide, Prisma } from '@prisma/client';
export declare class AidesService {
    private readonly prisma;
    private readonly caissesService;
    constructor(prisma: PrismaService, caissesService: CaissesService);
    demanderAideMaladie(tenantId: string, dto: DemanderAideMaladieDto): Promise<{
        beneficiaire: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutAide;
        type: import("@prisma/client").$Enums.TypeAide;
        montant: Prisma.Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
    declarerDeces(tenantId: string, dto: DeclarerDecesDto): Promise<{
        aide: {
            beneficiaire: {
                nom: string;
                numeroMembre: string;
                prenom: string;
            };
        } & {
            id: string;
            tenantId: string;
            statut: import("@prisma/client").$Enums.StatutAide;
            type: import("@prisma/client").$Enums.TypeAide;
            montant: Prisma.Decimal;
            beneficiaireId: string;
            justificatifs: string[];
            typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
            commissionnaireId: string | null;
            dateDeclaration: Date;
            dateApprobation: Date | null;
            approbateurId: string | null;
        };
        commissionnaire: {
            numeroMembre: string;
            nom: string;
            prenom: string;
        };
        montantAide: number;
        fraisVisite: number;
        montantTotal: number;
    }>;
    private designerCommissionnaire;
    approuver(tenantId: string, aideId: string, approbateurId: string, dto: ApprouverAideDto): Promise<{
        beneficiaire: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutAide;
        type: import("@prisma/client").$Enums.TypeAide;
        montant: Prisma.Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
    rejeter(tenantId: string, aideId: string, dto: RejeterAideDto): Promise<{
        beneficiaire: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutAide;
        type: import("@prisma/client").$Enums.TypeAide;
        montant: Prisma.Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
    findAll(tenantId: string, filters: {
        type?: TypeAide;
        statut?: string;
        beneficiaireId?: string;
        limit?: number;
        offset?: number;
    }): Promise<({
        beneficiaire: {
            nom: string;
            numeroMembre: string;
            prenom: string;
        };
    } & {
        id: string;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutAide;
        type: import("@prisma/client").$Enums.TypeAide;
        montant: Prisma.Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        beneficiaire: {
            nom: string;
            email: string | null;
            numeroMembre: string;
            prenom: string;
            telephone: string;
        };
    } & {
        id: string;
        tenantId: string;
        statut: import("@prisma/client").$Enums.StatutAide;
        type: import("@prisma/client").$Enums.TypeAide;
        montant: Prisma.Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
    getStatistiques(tenantId: string): Promise<{
        total: number;
        enAttente: number;
        approuvees: number;
        rejetees: number;
        totalMaladie: number;
        totalDeces: number;
        montantTotal: number;
    }>;
}
