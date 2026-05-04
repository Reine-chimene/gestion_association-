import { PrismaService } from '../prisma/prisma.service.js';
export declare class MembresService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: {
        nom: string;
        prenom: string;
        telephone: string;
        email?: string;
        dateNaissance?: Date;
        adresse?: string;
        situationMatrimoniale?: string;
        nombreEnfants?: number;
        parrainId?: string;
        userId?: string;
    }): Promise<{
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
    calculateKitEntree(tenantId: string): Promise<number>;
    findAll(tenantId: string, options?: {
        statut?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
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
    findOne(tenantId: string, id: string): Promise<{
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
    findByUserId(tenantId: string, userId: string): Promise<{
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
    update(tenantId: string, id: string, data: {
        nom?: string;
        prenom?: string;
        telephone?: string;
        email?: string;
        dateNaissance?: Date;
        adresse?: string;
        photoUrl?: string;
        cniUrl?: string;
    }): Promise<{
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
    changeStatus(tenantId: string, id: string, nouveauStatut: 'ACTIF' | 'OBSERVATION' | 'DEMISSIONNAIRE' | 'DECEDE' | 'MUTE', motif: string): Promise<{
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
    private validateStatusTransition;
    getSituationNette(tenantId: string, membreId: string): Promise<{
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
    getStatistiques(tenantId: string): Promise<{
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
}
