import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjetDto } from './dto/create-projet.dto.js';
import { ContribuerProjetDto } from './dto/contribuer-projet.dto.js';
import { CreatePhaseDto } from './dto/create-phase.dto.js';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProjetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau projet communautaire
   * Exigences: 16.1, 16.2
   */
  async create(tenantId: string, createProjetDto: CreateProjetDto, phases?: CreatePhaseDto[]) {
    const { nom, description, duree, objectif, ephemere, obligatoire, dateDebut, dateFin } = createProjetDto;

    // Créer le projet avec ses phases
    const projet = await this.prisma.projet.create({
      data: {
        tenantId,
        nom,
        description,
        duree,
        objectif: new Decimal(objectif),
        ephemere: ephemere ?? false,
        obligatoire: obligatoire ?? true,
        dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
        dateFin: dateFin ? new Date(dateFin) : null,
        phases: phases ? {
          create: phases.map(phase => ({
            nom: phase.nom,
            objectif: new Decimal(phase.objectif),
            dateLimite: new Date(phase.dateLimite),
            ordre: phase.ordre,
          })),
        } : undefined,
      },
      include: {
        phases: {
          orderBy: { ordre: 'asc' },
        },
      },
    });

    return projet;
  }

  /**
   * Obtenir tous les projets d'un tenant
   * Exigences: 16.1
   */
  async findAll(tenantId: string) {
    const projets = await this.prisma.projet.findMany({
      where: { tenantId },
      include: {
        phases: {
          orderBy: { ordre: 'asc' },
        },
        contributions: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculer le pourcentage d'avancement pour chaque projet
    return projets.map(projet => ({
      ...projet,
      pourcentageAvancement: this.calculatePourcentageAvancement(projet.montantCollecte, projet.objectif),
      nombreContributeurs: new Set(projet.contributions.map(c => c.membreId)).size,
    }));
  }

  /**
   * Obtenir un projet par ID
   * Exigences: 16.1
   */
  async findOne(tenantId: string, id: string) {
    const projet = await this.prisma.projet.findFirst({
      where: { id, tenantId },
      include: {
        phases: {
          orderBy: { ordre: 'asc' },
        },
        contributions: {
          include: {
            membre: {
              select: {
                id: true,
                numeroMembre: true,
                nom: true,
                prenom: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!projet) {
      throw new NotFoundException(`Projet avec l'ID ${id} introuvable`);
    }

    return {
      ...projet,
      pourcentageAvancement: this.calculatePourcentageAvancement(projet.montantCollecte, projet.objectif),
      nombreContributeurs: new Set(projet.contributions.map(c => c.membreId)).size,
    };
  }

  /**
   * Enregistrer une contribution à un projet
   * Exigences: 16.3, 16.5, 16.6
   */
  async contribuer(tenantId: string, projetId: string, contribuerDto: ContribuerProjetDto) {
    const { membreId, montant, volontaire } = contribuerDto;

    // Vérifier que le projet existe
    const projet = await this.prisma.projet.findFirst({
      where: { id: projetId, tenantId },
    });

    if (!projet) {
      throw new NotFoundException(`Projet avec l'ID ${projetId} introuvable`);
    }

    // Vérifier que le membre existe
    const membre = await this.prisma.membre.findFirst({
      where: { id: membreId, tenantId },
    });

    if (!membre) {
      throw new NotFoundException(`Membre avec l'ID ${membreId} introuvable`);
    }

    // Vérifier l'éligibilité si projet éphémère
    if (projet.ephemere) {
      // Les nouveaux membres (adhésion après début du projet) sont exemptés
      const isExempte = membre.dateAdhesion > projet.dateDebut;
      
      if (isExempte && !volontaire) {
        throw new BadRequestException(
          'Ce membre est exempté de ce projet éphémère. Seules les contributions volontaires sont acceptées.'
        );
      }
    }

    // Enregistrer la contribution
    const contribution = await this.prisma.$transaction(async (tx) => {
      // Créer la contribution
      const newContribution = await tx.contributionProjet.create({
        data: {
          projetId,
          membreId,
          montant: new Decimal(montant),
          volontaire: volontaire ?? false,
        },
        include: {
          membre: {
            select: {
              id: true,
              numeroMembre: true,
              nom: true,
              prenom: true,
            },
          },
        },
      });

      // Mettre à jour le montant collecté du projet
      await tx.projet.update({
        where: { id: projetId },
        data: {
          montantCollecte: {
            increment: new Decimal(montant),
          },
        },
      });

      return newContribution;
    });

    return contribution;
  }

  /**
   * Obtenir l'avancement d'un projet
   * Exigences: 16.4, 16.7
   */
  async getAvancement(tenantId: string, projetId: string) {
    const projet = await this.prisma.projet.findFirst({
      where: { id: projetId, tenantId },
      include: {
        phases: {
          orderBy: { ordre: 'asc' },
        },
        contributions: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    if (!projet) {
      throw new NotFoundException(`Projet avec l'ID ${projetId} introuvable`);
    }

    // Calculer l'avancement global
    const pourcentageGlobal = this.calculatePourcentageAvancement(projet.montantCollecte, projet.objectif);

    // Calculer l'avancement par phase
    const avancementPhases = await Promise.all(
      projet.phases.map(async (phase) => {
        // Calculer le montant collecté pour cette phase
        // Note: Dans une implémentation réelle, il faudrait lier les contributions aux phases
        // Pour simplifier, on suppose une répartition proportionnelle
        const montantPhase = new Decimal(0); // À implémenter selon la logique métier
        
        return {
          id: phase.id,
          nom: phase.nom,
          objectif: phase.objectif,
          montantCollecte: montantPhase,
          pourcentage: this.calculatePourcentageAvancement(montantPhase, phase.objectif),
          dateLimite: phase.dateLimite,
        };
      })
    );

    // Statistiques des contributeurs
    const contributeurs = new Map<string, { membre: any; total: Decimal }>();
    projet.contributions.forEach(contrib => {
      const existing = contributeurs.get(contrib.membreId);
      if (existing) {
        existing.total = existing.total.add(contrib.montant);
      } else {
        contributeurs.set(contrib.membreId, {
          membre: contrib.membre,
          total: contrib.montant,
        });
      }
    });

    return {
      projet: {
        id: projet.id,
        nom: projet.nom,
        description: projet.description,
        objectif: projet.objectif,
        montantCollecte: projet.montantCollecte,
        pourcentageGlobal,
        statut: projet.statut,
      },
      phases: avancementPhases,
      contributeurs: Array.from(contributeurs.values()).map(c => ({
        membre: c.membre,
        montantTotal: c.total,
      })),
      statistiques: {
        nombreContributeurs: contributeurs.size,
        montantMoyen: contributeurs.size > 0 
          ? projet.montantCollecte.div(contributeurs.size) 
          : new Decimal(0),
        nombreContributions: projet.contributions.length,
      },
    };
  }

  /**
   * Obtenir les statistiques globales des projets
   */
  async getStatistiques(tenantId: string) {
    const projets = await this.prisma.projet.findMany({
      where: { tenantId },
      include: {
        contributions: true,
      },
    });

    const total = projets.length;
    const actifs = projets.filter(p => p.statut === 'ACTIF').length;
    const termines = projets.filter(p => p.statut === 'TERMINE').length;
    
    const montantTotalObjectif = projets.reduce(
      (sum, p) => sum.add(p.objectif), 
      new Decimal(0)
    );
    
    const montantTotalCollecte = projets.reduce(
      (sum, p) => sum.add(p.montantCollecte), 
      new Decimal(0)
    );

    const nombreContributions = projets.reduce(
      (sum, p) => sum + p.contributions.length, 
      0
    );

    return {
      total,
      actifs,
      termines,
      montantTotalObjectif,
      montantTotalCollecte,
      nombreContributions,
      tauxReussite: montantTotalObjectif.gt(0)
        ? montantTotalCollecte.div(montantTotalObjectif).mul(100).toNumber()
        : 0,
    };
  }

  /**
   * Calculer le pourcentage d'avancement
   */
  private calculatePourcentageAvancement(montantCollecte: Decimal, objectif: Decimal): number {
    if (objectif.lte(0)) return 0;
    const pourcentage = montantCollecte.div(objectif).mul(100);
    return Math.min(pourcentage.toNumber(), 100);
  }
}
