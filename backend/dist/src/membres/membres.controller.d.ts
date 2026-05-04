import { MembresService } from './membres.service.js';
import { CreateMembreDto } from './dto/create-membre.dto.js';
import { UpdateMembreDto } from './dto/update-membre.dto.js';
import { ChangeStatusDto } from './dto/change-status.dto.js';
export declare class MembresController {
    private readonly membresService;
    constructor(membresService: MembresService);
    create(dto: CreateMembreDto, req: any): Promise<{
        membre: {
            parrain: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            } | null;
        } & {
            id: string;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            email: string | null;
            userId: string | null;
            numeroMembre: string;
            prenom: string;
            telephone: string;
            dateNaissance: Date | null;
            situationMatrimoniale: string | null;
            nombreEnfants: number | null;
            adresse: string | null;
            photoUrl: string | null;
            cniUrl: string | null;
            acteNaissanceUrl: string | null;
            statut: import("@prisma/client").$Enums.StatutMembre;
            dateAdhesion: Date;
            parrainId: string | null;
        };
        kitEntree: number;
    }>;
    getMyProfile(req: any): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
        parrain: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        } | null;
    } & {
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        userId: string | null;
        numeroMembre: string;
        prenom: string;
        telephone: string;
        dateNaissance: Date | null;
        situationMatrimoniale: string | null;
        nombreEnfants: number | null;
        adresse: string | null;
        photoUrl: string | null;
        cniUrl: string | null;
        acteNaissanceUrl: string | null;
        statut: import("@prisma/client").$Enums.StatutMembre;
        dateAdhesion: Date;
        parrainId: string | null;
    }>;
    findAll(statut?: string, search?: string, limit?: number, offset?: number, req?: any): Promise<{
        membres: ({
            user: {
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            } | null;
            parrain: {
                id: string;
                nom: string;
                numeroMembre: string;
                prenom: string;
            } | null;
        } & {
            id: string;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            email: string | null;
            userId: string | null;
            numeroMembre: string;
            prenom: string;
            telephone: string;
            dateNaissance: Date | null;
            situationMatrimoniale: string | null;
            nombreEnfants: number | null;
            adresse: string | null;
            photoUrl: string | null;
            cniUrl: string | null;
            acteNaissanceUrl: string | null;
            statut: import("@prisma/client").$Enums.StatutMembre;
            dateAdhesion: Date;
            parrainId: string | null;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getStatistiques(req: any): Promise<{
        total: number;
        parStatut: {
            actifs: number;
            observation: number;
            demissionnaires: number;
            decedes: number;
            mutes: number;
        };
        nouveauxCeMois: number;
    }>;
    getSituationNette(id: string, req: any): Promise<{
        membre: {
            id: string;
            nom: string;
            prenom: string;
            numeroMembre: string;
            statut: import("@prisma/client").$Enums.StatutMembre;
        };
        cotisations: {
            tontine: number;
            epargne: number;
            projets: number;
        };
        dettes: {
            prets: number;
            sanctions: number;
        };
        soldeNet: number;
        details: {
            nombrePartsTontine: number;
            nombrePrets: number;
            nombreSanctions: number;
        };
    }>;
    changeStatus(id: string, dto: ChangeStatusDto, req: any): Promise<{
        membre: {
            id: string;
            nom: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            email: string | null;
            userId: string | null;
            numeroMembre: string;
            prenom: string;
            telephone: string;
            dateNaissance: Date | null;
            situationMatrimoniale: string | null;
            nombreEnfants: number | null;
            adresse: string | null;
            photoUrl: string | null;
            cniUrl: string | null;
            acteNaissanceUrl: string | null;
            statut: import("@prisma/client").$Enums.StatutMembre;
            dateAdhesion: Date;
            parrainId: string | null;
        };
        motif: string;
        montantsDus: number;
        montantsARestituer: number;
    }>;
    findOne(id: string, req: any): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
        parrain: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        } | null;
        filleuls: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        }[];
    } & {
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        userId: string | null;
        numeroMembre: string;
        prenom: string;
        telephone: string;
        dateNaissance: Date | null;
        situationMatrimoniale: string | null;
        nombreEnfants: number | null;
        adresse: string | null;
        photoUrl: string | null;
        cniUrl: string | null;
        acteNaissanceUrl: string | null;
        statut: import("@prisma/client").$Enums.StatutMembre;
        dateAdhesion: Date;
        parrainId: string | null;
    }>;
    update(id: string, dto: UpdateMembreDto, req: any): Promise<{
        parrain: {
            id: string;
            nom: string;
            numeroMembre: string;
            prenom: string;
        } | null;
    } & {
        id: string;
        nom: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        userId: string | null;
        numeroMembre: string;
        prenom: string;
        telephone: string;
        dateNaissance: Date | null;
        situationMatrimoniale: string | null;
        nombreEnfants: number | null;
        adresse: string | null;
        photoUrl: string | null;
        cniUrl: string | null;
        acteNaissanceUrl: string | null;
        statut: import("@prisma/client").$Enums.StatutMembre;
        dateAdhesion: Date;
        parrainId: string | null;
    }>;
}
