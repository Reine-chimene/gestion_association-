import { AidesService } from './aides.service.js';
import { DemanderAideMaladieDto } from './dto/demander-aide-maladie.dto.js';
import { DeclarerDecesDto } from './dto/declarer-deces.dto.js';
import { ApprouverAideDto } from './dto/approuver-aide.dto.js';
import { RejeterAideDto } from './dto/rejeter-aide.dto.js';
import { TypeAide } from '@prisma/client';
export declare class AidesController {
    private readonly aidesService;
    constructor(aidesService: AidesService);
    demanderAideMaladie(dto: DemanderAideMaladieDto, req: any): Promise<{
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
        montant: import("@prisma/client/runtime/library").Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
    declarerDeces(dto: DeclarerDecesDto, req: any): Promise<{
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
            montant: import("@prisma/client/runtime/library").Decimal;
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
    approuver(id: string, dto: ApprouverAideDto, req: any): Promise<{
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
        montant: import("@prisma/client/runtime/library").Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
    rejeter(id: string, dto: RejeterAideDto, req: any): Promise<{
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
        montant: import("@prisma/client/runtime/library").Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
    findAll(type?: TypeAide, statut?: string, beneficiaireId?: string, limit?: number, offset?: number, req?: any): Promise<({
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
        montant: import("@prisma/client/runtime/library").Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    })[]>;
    getStatistiques(req: any): Promise<{
        total: number;
        enAttente: number;
        approuvees: number;
        rejetees: number;
        totalMaladie: number;
        totalDeces: number;
        montantTotal: number;
    }>;
    findOne(id: string, req: any): Promise<{
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
        montant: import("@prisma/client/runtime/library").Decimal;
        beneficiaireId: string;
        justificatifs: string[];
        typeBeneficiaire: import("@prisma/client").$Enums.TypeBeneficiaire;
        commissionnaireId: string | null;
        dateDeclaration: Date;
        dateApprobation: Date | null;
        approbateurId: string | null;
    }>;
}
