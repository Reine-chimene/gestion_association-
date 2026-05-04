# Plan d'Implémentation - Système de Gestion d'Association Multi-Tenant

## Vue d'Ensemble

Ce plan d'implémentation détaille toutes les tâches nécessaires pour développer le système de gestion d'association multi-tenant. Le système sera développé en TypeScript avec NestJS (backend) et Next.js/React (frontend), suivant une approche progressive par phases.

### Stack Technique Confirmée

- **Backend**: Node.js 20+ avec TypeScript 5+, NestJS, Prisma ORM
- **Frontend**: Next.js 14+, React 18+, Shadcn/ui, Tailwind CSS
- **Base de données**: PostgreSQL 15+ avec Row-Level Security, Redis 7+
- **Infrastructure**: Docker, Docker Compose, Nginx

### Approche d'Implémentation

1. Commencer par les fondations (multi-tenant, auth, base de données)
2. Implémenter les modules financiers core (tontines, prêts, épargnes)
3. Ajouter les modules de gestion (aides, projets, sanctions, séances)
4. Développer les interfaces utilisateur (admin + membre)
5. Intégrer les services externes (paiements, notifications)

---

## Phase 1: Infrastructure & Fondations

### 1. Configuration Projet Backend

- [x] 1.1 Initialiser le projet NestJS avec TypeScript
  - Créer le projet avec `nest new backend`
  - Configurer TypeScript strict mode
  - Installer les dépendances de base (class-validator, class-transformer)
  - Configurer ESLint et Prettier
  - _Exigences: 1.1, 31.2_

- [x] 1.2 Configurer Prisma ORM
  - Installer Prisma et Prisma Client
  - Initialiser Prisma avec PostgreSQL
  - Configurer le module Prisma dans NestJS
  - Créer le service Prisma réutilisable
  - _Exigences: 1.1, 29.1_


- [x] 1.3 Setup Docker Compose pour développement
  - Créer docker-compose.yml avec PostgreSQL, Redis
  - Configurer les variables d'environnement
  - Créer les scripts de démarrage
  - Tester la connexion aux services
  - _Exigences: 1.1_

- [x] 1.4 Configurer les variables d'environnement
  - Créer .env.example avec toutes les variables
  - Installer @nestjs/config
  - Créer le module de configuration
  - Valider les variables au démarrage
  - _Exigences: 30.8, 31.2_

### 2. Architecture Multi-Tenant

- [x] 2.1 Créer le schéma de base de données multi-tenant
  - Définir le modèle Tenant dans Prisma
  - Ajouter tenant_id à toutes les tables métier
  - Créer les relations et contraintes
  - Générer et exécuter la migration
  - _Exigences: 1.1, 1.2_

- [ ] 2.2 Implémenter Row-Level Security PostgreSQL
  - Créer les policies RLS pour chaque table
  - Configurer la variable de session app.current_tenant
  - Tester l'isolation entre tenants
  - _Exigences: 1.2, 1.4_

- [ ] 2.3 Créer le middleware d'isolation tenant
  - Implémenter TenantMiddleware pour extraire tenant_id
  - Configurer la session PostgreSQL par requête
  - Créer le décorateur @TenantId()
  - Gérer les erreurs de tenant invalide
  - _Exigences: 1.3, 1.4_


- [ ]* 2.4 Écrire les tests d'isolation multi-tenant
  - Tester que les données d'un tenant ne sont pas accessibles par un autre
  - Tester les erreurs de tenant invalide
  - Tester les policies RLS
  - _Exigences: 1.2, 1.4_

### 3. Authentification et Autorisation

- [x] 3.1 Créer le module Auth avec JWT
  - Installer @nestjs/jwt et @nestjs/passport
  - Créer AuthModule, AuthService, AuthController
  - Implémenter login avec génération de tokens JWT
  - Implémenter refresh token
  - _Exigences: 31.3, 31.4_

- [x] 3.2 Implémenter le système de rôles (RBAC)
  - Définir l'enum Role (PRESIDENT, TRESORIER, SECRETAIRE, COMMISSAIRE, MEMBRE)
  - Créer le décorateur @Roles()
  - Créer le guard RolesGuard
  - Tester les permissions par rôle
  - _Exigences: 27.1, 27.2, 27.8_

- [ ] 3.3 Implémenter l'authentification 2FA (optionnel)
  - Installer speakeasy pour TOTP
  - Créer les endpoints enable2FA, verify2FA
  - Générer et stocker les secrets 2FA
  - Valider les tokens TOTP
  - _Exigences: 31.3_

- [x] 3.4 Créer le système de gestion des sessions
  - Configurer Redis pour stocker les sessions
  - Implémenter la déconnexion automatique après 30 min
  - Implémenter le verrouillage après 5 tentatives échouées
  - _Exigences: 31.4, 31.5_


- [ ]* 3.5 Écrire les tests unitaires pour Auth
  - Tester login avec credentials valides/invalides
  - Tester refresh token
  - Tester verrouillage de compte
  - Tester 2FA
  - _Exigences: 31.3, 31.4_

### 4. Module Caisses (Fondation Financière)

- [x] 4.1 Créer le modèle de données Caisses
  - Définir les modèles Caisse et Mouvement dans Prisma
  - Créer l'enum TypeCaisse (FONDS, SANCTION, EPARGNE)
  - Ajouter les relations et contraintes
  - Générer la migration
  - _Exigences: 21.1, 21.7_

- [x] 4.2 Implémenter CaissesService
  - Créer les méthodes crediter(), debiter()
  - Implémenter decharge() avec justification obligatoire
  - Implémenter versementBancaire() avec référence
  - Calculer le solde en temps réel
  - _Exigences: 21.2, 21.3, 21.4, 21.5_

- [x] 4.3 Implémenter la traçabilité des mouvements
  - Enregistrer responsable, date, motif pour chaque mouvement
  - Calculer et stocker le solde après chaque mouvement
  - Créer getHistorique() avec filtrage par période
  - _Exigences: 21.6, 21.7_

- [x] 4.4 Implémenter la vérification de cohérence
  - Créer verifierCoherence() pour détecter les incohérences
  - Vérifier que solde = somme(entrées) - somme(sorties)
  - Alerter en cas d'incohérence détectée
  - _Exigences: 29.6_


- [ ]* 4.5 Écrire les tests de propriétés pour Caisses
  - **Propriété 1: Invariant des Caisses**
  - **Valide: Exigences 21.1, 21.2, 21.3, 29.6**
  - Tester que solde = somme(entrées) - somme(sorties) à tout moment
  - _Exigences: 21.1, 21.2, 29.6_

- [x] 4.6 Créer CaissesController avec endpoints REST
  - POST /caisses/:type/crediter
  - POST /caisses/:type/debiter
  - POST /caisses/:type/decharge
  - POST /caisses/:type/versement-bancaire
  - GET /caisses/:type/solde
  - GET /caisses/:type/historique
  - _Exigences: 21.1-21.7_

### 5. Checkpoint - Infrastructure Complète

- [ ] 5.1 Vérifier que tous les tests passent
  - Exécuter tous les tests unitaires et d'intégration
  - Vérifier l'isolation multi-tenant
  - Tester l'authentification et les rôles
  - Tester les opérations de caisses
  - Demander au user si des questions se posent

---

## Phase 2: Modules Core Financiers

### 6. Module Membres

- [x] 6.1 Créer le modèle de données Membres
  - Définir le modèle Membre dans Prisma
  - Créer l'enum StatutMembre (ACTIF, OBSERVATION, DEMISSIONNAIRE, DECEDE, MUTE)
  - Ajouter les champs (nom, prenom, telephone, email, etc.)
  - Créer la relation de parrainage (parrainId)
  - Générer la migration
  - _Exigences: 2.1, 2.2, 2.3_


- [x] 6.2 Implémenter MembresService
  - Créer create() avec calcul automatique du kit d'entrée
  - Implémenter update() avec validation
  - Créer changeStatus() avec gestion des transitions
  - Implémenter calculateKitEntree() selon configuration
  - _Exigences: 2.1, 2.4, 2.5, 30.6_

- [x] 6.3 Implémenter la gestion des transitions de statut
  - Valider les transitions autorisées (ex: pas de DECEDE vers ACTIF)
  - Calculer les montants dus/à restituer lors du changement
  - Enregistrer l'historique avec horodatage et responsable
  - Déclencher les événements appropriés (ex: aide décès)
  - _Exigences: 2.4, 2.5, 2.6, 33.1-33.7_

- [x] 6.4 Implémenter le calcul de situation nette
  - Créer getSituationNette() pour calculer le solde d'un membre
  - Agréger cotisations (tontine, épargne, projets)
  - Agréger prêts en cours avec soldes restants
  - Agréger sanctions impayées
  - Calculer le solde net (créances - dettes)
  - _Exigences: 23.1-23.7_

- [x] 6.5 Créer MembresController avec endpoints REST
  - POST /membres (création)
  - GET /membres (liste avec pagination)
  - GET /membres/:id (détails)
  - PATCH /membres/:id (mise à jour)
  - PATCH /membres/:id/status (changement statut)
  - GET /membres/:id/situation-nette
  - GET /membres/:id/historique
  - _Exigences: 2.1-2.6, 23.1-23.7_


- [ ]* 6.6 Écrire les tests unitaires pour Membres
  - Tester création avec calcul kit d'entrée
  - Tester transitions de statut valides/invalides
  - Tester calcul situation nette
  - _Exigences: 2.1-2.6, 23.1-23.7_

### 7. Module Tontines

- [x] 7.1 Créer le modèle de données Tontines
  - Définir les modèles Tontine, PartTontine, VenteTour, VenteInterets
  - Créer l'enum TypeTontine (CLASSIQUE_NON_VENDABLE, VENDABLE_ENCHERE, etc.)
  - Ajouter les champs (montantCotisation, frequence, cycleActuel, etc.)
  - Créer les relations (tontine -> parts -> membre)
  - Générer la migration
  - _Exigences: 3.1, 3.4, 4.1, 5.1_

- [x] 7.2 Implémenter TontinesService - Création et gestion de base
  - Créer create() pour initialiser une tontine
  - Valider les données (participants, montants, ordre)
  - Créer les parts avec ordre initial
  - Supporter plusieurs parts par membre
  - _Exigences: 3.1, 3.4, 3.5_

- [x] 7.3 Implémenter la collecte des cotisations
  - Créer collecterCotisations() pour une séance
  - Calculer le montant par membre (cotisation × nombre de parts)
  - Enregistrer les cotisations dans la caisse
  - Calculer la cagnotte totale
  - _Exigences: 3.2, 3.6_


- [x] 7.4 Implémenter la distribution de cagnotte
  - Créer distribuerCagnotte() pour le bénéficiaire actuel
  - Identifier le bénéficiaire selon l'ordre
  - Calculer les retenues (prêts, sanctions, complément fonds)
  - Verser le montant net au bénéficiaire
  - Marquer la part comme ayant bénéficié
  - _Exigences: 3.3, 6.1-6.6_

- [x] 7.5 Implémenter la vente aux enchères de tours
  - Créer sellTour() pour vendre un tour
  - Valider que la tontine est de type VENDABLE
  - Calculer les intérêts primaires
  - Enregistrer la vente avec acheteur et montant
  - Réorganiser l'ordre des tours
  - _Exigences: 4.1-4.5_

- [x] 7.6 Implémenter la vérification de tour gratuit
  - Créer verifierTourGratuit() pour un membre
  - Calculer les intérêts primaires accumulés
  - Comparer avec le montant de la cagnotte complète
  - Attribuer automatiquement un tour gratuit si égalité
  - _Exigences: 4.5_

- [x] 7.7 Implémenter la vente d'intérêts cumulés
  - Créer sellInterets() pour vendre les intérêts primaires
  - Supporter vente en lot unique ou multi-parts
  - Calculer les intérêts secondaires pour l'acheteur
  - Gérer les niveaux d'intérêts (primaires, secondaires, tertiaires)
  - _Exigences: 5.1-5.5_


- [x] 7.8 Implémenter la gestion des cycles
  - Détecter la fin d'un cycle (toutes les parts ont bénéficié)
  - Réinitialiser l'ordre des tours pour le nouveau cycle
  - Incrémenter le numéro de cycle
  - _Exigences: 3.7_

- [x] 7.9 Créer TontinesController avec endpoints REST
  - POST /tontines (création)
  - GET /tontines (liste)
  - GET /tontines/:id (détails)
  - POST /tontines/:id/collecter-cotisations
  - POST /tontines/:id/distribuer-cagnotte
  - POST /tontines/:id/vendre-tour
  - POST /tontines/:id/vendre-interets
  - GET /tontines/:id/beneficiaire-actuel
  - _Exigences: 3.1-3.7, 4.1-4.5, 5.1-5.5_

- [ ]* 7.10 Écrire les tests de propriétés pour Tontines
  - **Propriété 2: Invariant des Parts Tontine**
  - **Valide: Exigences 3.4, 3.5**
  - Tester que le nombre total de parts reste constant pendant un cycle
  - **Propriété 3: Invariant des Redistributions**
  - **Valide: Exigences 3.6, 6.1-6.6**
  - Tester que montant_distribué + montant_retenu = montant_total
  - _Exigences: 3.1-3.7, 4.1-4.5, 5.1-5.5_

### 8. Module Prêts

- [ ] 8.1 Créer le modèle de données Prêts
  - Définir les modèles Pret, Garantie, Echeance, Paiement, CoEmprunteur
  - Créer les enums TypePret, TypeGarantie, StatutPret
  - Ajouter les champs (montant, tauxInteret, dureeEnMois, etc.)
  - Créer les relations (prêt -> garanties, prêt -> échéances)
  - Générer la migration
  - _Exigences: 7.1, 7.2, 8.1, 9.1, 10.1_


- [ ] 8.2 Implémenter PretsService - Création et validation
  - Créer create() pour initialiser un prêt
  - Valider les garanties (au moins une requise)
  - Débiter la Caisse_Fonds lors de l'octroi
  - Supporter les prêts collectifs avec co-emprunteurs
  - _Exigences: 7.1, 7.2, 7.3, 10.1, 10.2_

- [ ] 8.3 Implémenter le calcul des intérêts
  - Créer calculerInterets() avec formules configurables
  - Supporter intérêts simples et composés
  - Calculer les intérêts mensuels pour échéanciers
  - Utiliser Decimal pour précision financière
  - _Exigences: 7.4, 9.2, 29.1, 29.3_

- [ ] 8.4 Implémenter la génération d'échéanciers
  - Créer genererEcheancier() pour prêts mensuels
  - Calculer montant capital et intérêts par échéance
  - Créer les enregistrements Echeance en base
  - Supporter les échéances proportionnelles pour prêts collectifs
  - _Exigences: 7.5, 9.1, 9.2, 10.3_

- [ ] 8.5 Implémenter l'enregistrement des paiements
  - Créer enregistrerPaiement() pour une échéance
  - Mettre à jour le statut de l'échéance (PAYEE)
  - Calculer le solde restant du prêt
  - Créditer la Caisse_Fonds
  - Gérer les paiements partiels
  - _Exigences: 7.6, 9.3, 9.4_


- [ ] 8.6 Implémenter les reconductions de prêts
  - Créer reconduire() pour prolonger un prêt
  - Vérifier le nombre de reconductions (max 2)
  - Recalculer les intérêts et échéances
  - Enregistrer l'historique de reconduction
  - _Exigences: 7.7_

- [ ] 8.7 Implémenter le recouvrement forcé
  - Créer declencherRecouvrementForce() pour prêts en retard
  - Prélever automatiquement sur bénéfice tontine
  - Prélever sur épargne si autorisé
  - Notifier le membre et les administrateurs
  - _Exigences: 7.8, 8.4_

- [ ] 8.8 Implémenter les prêts tontine
  - Créer createPretTontine() spécifique
  - Limiter le montant à la cotisation due
  - Appliquer le taux d'intérêt spécifique
  - Rembourser automatiquement au prochain bénéfice
  - _Exigences: 8.1, 8.2, 8.3, 8.4_

- [ ] 8.9 Implémenter les prêts sur épargne
  - Créer createPretSurEpargne() spécifique
  - Limiter à 80% de l'épargne accumulée
  - Calculer les intérêts
  - Déduire automatiquement lors de la redistribution
  - _Exigences: 13.1, 13.2, 13.3, 13.4_


- [ ] 8.10 Créer PretsController avec endpoints REST
  - POST /prets (création)
  - GET /prets (liste avec filtres)
  - GET /prets/:id (détails)
  - POST /prets/:id/paiement
  - POST /prets/:id/reconduire
  - POST /prets/:id/recouvrement-force
  - GET /prets/:id/echeancier
  - GET /prets/:id/solde-restant
  - _Exigences: 7.1-7.8, 8.1-8.4, 9.1-9.5, 10.1-10.5, 13.1-13.4_

- [ ]* 8.11 Écrire les tests de propriétés pour Prêts
  - **Propriété 5: Invariant des Prêts**
  - **Valide: Exigences 7.1-7.8, 9.1-9.5**
  - Tester que montant_remboursé ≤ montant_prêté + intérêts_calculés
  - _Exigences: 7.1-7.8, 8.1-8.4, 9.1-9.5_

### 9. Module Épargnes

- [ ] 9.1 Créer le modèle de données Épargnes
  - Définir les modèles Epargne, CotisationEpargne, Redistribution
  - Créer l'enum TypeEpargne (ANNUELLE, SCOLAIRE)
  - Ajouter les champs (solde, dateDebut, dateFin, cycleActuel)
  - Créer les relations (épargne -> cotisations -> membre)
  - Générer la migration
  - _Exigences: 11.1, 12.1_

- [ ] 9.2 Implémenter EpargnesService - Cotisations
  - Créer cotiser() pour enregistrer une cotisation
  - Valider le type d'épargne (ANNUELLE, SCOLAIRE)
  - Créditer la Caisse_Épargne
  - Mettre à jour le solde du membre
  - _Exigences: 11.1, 11.2, 12.1_


- [ ] 9.3 Implémenter le calcul des soldes
  - Créer calculerSolde() pour un membre et type d'épargne
  - Agréger toutes les cotisations du cycle actuel
  - Retourner le solde disponible
  - _Exigences: 11.2, 12.2_

- [ ] 9.4 Implémenter la redistribution d'épargne
  - Créer redistribuer() pour un type d'épargne
  - Calculer la redistribution proportionnelle aux contributions
  - Calculer et distribuer les intérêts générés
  - Appliquer les retenues (prêts, sanctions) avant versement
  - Débiter la Caisse_Épargne
  - _Exigences: 11.3, 11.4, 11.5, 12.3, 12.4_

- [ ] 9.5 Implémenter le calcul des intérêts générés
  - Créer calculerInteretsGeneres() pour une période
  - Calculer les intérêts selon la configuration
  - Répartir proportionnellement aux contributions
  - _Exigences: 11.4_

- [ ] 9.6 Créer EpargnesController avec endpoints REST
  - POST /epargnes/cotiser
  - GET /epargnes/:membreId/solde
  - POST /epargnes/redistribuer
  - GET /epargnes/interets-generes
  - _Exigences: 11.1-11.5, 12.1-12.4, 13.1-13.4_

- [ ]* 9.7 Écrire les tests unitaires pour Épargnes
  - Tester cotisation et mise à jour du solde
  - Tester redistribution avec retenues
  - Tester calcul des intérêts
  - _Exigences: 11.1-11.5, 12.1-12.4_


### 10. Checkpoint - Modules Financiers Core

- [ ] 10.1 Vérifier que tous les tests passent
  - Exécuter tous les tests des modules Membres, Tontines, Prêts, Épargnes
  - Vérifier les calculs financiers (précision décimale)
  - Tester les flux complets (création -> cotisation -> distribution)
  - Demander au user si des questions se posent

---

## Phase 3: Modules Aides & Gestion

### 11. Module Aides

- [ ] 11.1 Créer le modèle de données Aides
  - Définir le modèle Aide
  - Créer les enums TypeAide (MALADIE, DECES), TypeBeneficiaire (MEMBRE, CONJOINT, PARENT, ENFANT)
  - Ajouter les champs (montant, statut, justificatifs, commissionnaireId)
  - Générer la migration
  - _Exigences: 14.1, 15.1_

- [ ] 11.2 Implémenter AidesService - Aide Maladie
  - Créer demanderAideMaladie() avec justificatifs
  - Vérifier les conditions d'éligibilité
  - Calculer le montant selon configuration
  - Limiter le nombre d'aides par membre
  - _Exigences: 14.1, 14.2, 14.5_

- [ ] 11.3 Implémenter l'approbation des aides
  - Créer approuverAide() pour valider une demande
  - Débiter la Caisse_Fonds
  - Notifier le bénéficiaire
  - Enregistrer l'approbateur et la date
  - _Exigences: 14.3, 14.4_


- [ ] 11.4 Implémenter l'aide décès
  - Créer declarerDeces() avec type de bénéficiaire
  - Calculer le montant selon le type (MEMBRE, CONJOINT, PARENT, ENFANT)
  - Désigner automatiquement un commissionnaire à tour de rôle
  - Débiter la Caisse_Fonds (aide + frais visite)
  - Notifier tous les membres
  - _Exigences: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 11.5 Implémenter le recouvrement cotisation décès
  - Déclencher automatiquement la collecte auprès de tous les membres
  - Calculer le montant par membre
  - Enregistrer les cotisations
  - _Exigences: 15.6_

- [ ] 11.6 Implémenter la désignation des commissionnaires
  - Créer designerCommissionnaire() avec rotation automatique
  - Suivre l'ordre de désignation
  - Notifier le commissionnaire désigné
  - _Exigences: 15.3_

- [ ] 11.7 Créer AidesController avec endpoints REST
  - POST /aides/maladie (demande aide maladie)
  - POST /aides/deces (déclaration décès)
  - POST /aides/:id/approuver
  - POST /aides/:id/rejeter
  - GET /aides (liste avec filtres)
  - GET /aides/:id (détails)
  - _Exigences: 14.1-14.5, 15.1-15.6_

- [ ]* 11.8 Écrire les tests unitaires pour Aides
  - Tester demande aide maladie avec éligibilité
  - Tester déclaration décès et désignation commissionnaire
  - Tester approbation et débitage caisse
  - _Exigences: 14.1-14.5, 15.1-15.6_


### 12. Module Projets Communautaires

- [ ] 12.1 Créer le modèle de données Projets
  - Définir les modèles Projet, PhaseProjet, ContributionProjet
  - Créer les enums DureeProjet (COURT, MOYEN, LONG), TypeContribution (VOLONTAIRE, OBLIGATOIRE)
  - Ajouter les champs (nom, description, objectif, montantCollecte, ephemere)
  - Créer les relations (projet -> phases -> contributions)
  - Générer la migration
  - _Exigences: 16.1, 16.2_

- [ ] 12.2 Implémenter ProjetsService
  - Créer create() pour initialiser un projet
  - Définir les phases avec objectifs
  - Configurer si volontaire ou obligatoire
  - Configurer si éphémère (nouveaux membres exemptés)
  - _Exigences: 16.1, 16.2, 16.5, 16.6_

- [ ] 12.3 Implémenter l'enregistrement des contributions
  - Créer enregistrerContribution() pour un membre et une phase
  - Valider l'éligibilité (éphémère vs obligatoire)
  - Créditer la caisse du projet
  - Mettre à jour le montant collecté
  - _Exigences: 16.3, 16.5, 16.6_

- [ ] 12.4 Implémenter le suivi d'avancement
  - Calculer le total collecté par phase
  - Comparer à l'objectif
  - Calculer le pourcentage d'avancement
  - Générer des rapports d'avancement
  - _Exigences: 16.4, 16.7_


- [ ] 12.5 Créer ProjetsController avec endpoints REST
  - POST /projets (création)
  - GET /projets (liste)
  - GET /projets/:id (détails)
  - POST /projets/:id/contribuer
  - GET /projets/:id/avancement
  - _Exigences: 16.1-16.7_

- [ ]* 12.6 Écrire les tests unitaires pour Projets
  - Tester création avec phases
  - Tester contributions volontaires vs obligatoires
  - Tester projets éphémères
  - Tester calcul d'avancement
  - _Exigences: 16.1-16.7_

### 13. Module Complément Fonds

- [ ] 13.1 Créer le modèle de données Complément Fonds
  - Définir le modèle ComplementFonds
  - Ajouter les champs (montantTotal, montantParMembre, annee, statut)
  - Créer la relation avec les paiements par membre
  - Générer la migration
  - _Exigences: 17.1, 17.2_

- [ ] 13.2 Implémenter ComplementFondsService
  - Créer calculerComplementAnnuel() pour les dépenses prévisionnelles
  - Répartir équitablement entre membres actifs
  - Permettre augmentation ou cassation selon décision
  - _Exigences: 17.1, 17.2, 17.3_

- [ ] 13.3 Implémenter le prélèvement automatique
  - Intégrer avec le module Tontines pour prélèvement au bénéfice
  - Enregistrer le paiement automatique
  - Mettre à jour le statut du complément
  - _Exigences: 17.4_


- [ ] 13.4 Implémenter le suivi des paiements
  - Créer getSuiviPaiements() pour voir qui a payé
  - Calculer le montant restant dû par membre
  - Générer des rappels pour impayés
  - _Exigences: 17.5_

- [ ] 13.5 Créer ComplementFondsController avec endpoints REST
  - POST /complement-fonds/calculer
  - GET /complement-fonds/actuel
  - GET /complement-fonds/suivi-paiements
  - POST /complement-fonds/:id/augmenter
  - POST /complement-fonds/:id/casser
  - _Exigences: 17.1-17.5_

- [ ]* 13.6 Écrire les tests unitaires pour Complément Fonds
  - Tester calcul et répartition
  - Tester prélèvement automatique
  - Tester augmentation/cassation
  - _Exigences: 17.1-17.5_

### 14. Module Sanctions

- [ ] 14.1 Créer le modèle de données Sanctions
  - Définir les modèles TypeSanction, Sanction
  - Créer l'enum ModeCalcul (FIXE, POURCENTAGE, PROGRESSIF)
  - Ajouter les champs (montant, joursDeGrace, statut, dateApplication)
  - Créer les relations (sanction -> membre)
  - Générer la migration
  - _Exigences: 18.1, 18.2, 18.3_

- [ ] 14.2 Implémenter SanctionsService - Configuration
  - Créer configurerTypeSanction() pour définir les règles
  - Configurer mode de calcul (fixe, pourcentage, progressif)
  - Configurer les jours de grâce
  - Rendre paramétrable par association
  - _Exigences: 18.1, 18.2, 18.3, 30.3, 30.4_


- [ ] 14.3 Implémenter l'application automatique des sanctions
  - Créer appliquerSanction() déclenchée par événements
  - Vérifier les jours de grâce avant application
  - Calculer le montant selon le mode configuré
  - Enregistrer dans la Caisse_Sanction
  - _Exigences: 18.4, 18.5_

- [ ] 14.4 Implémenter l'annulation de sanctions
  - Créer annulerSanction() avec justification obligatoire
  - Vérifier les permissions (admin uniquement)
  - Enregistrer l'annulation avec responsable
  - Rembourser si déjà payée
  - _Exigences: 18.6_

- [ ] 14.5 Créer SanctionsController avec endpoints REST
  - POST /sanctions/types (configuration)
  - GET /sanctions/types (liste des types)
  - GET /sanctions (liste des sanctions appliquées)
  - POST /sanctions/:id/annuler
  - GET /sanctions/membre/:membreId
  - _Exigences: 18.1-18.6_

- [ ]* 14.6 Écrire les tests unitaires pour Sanctions
  - Tester configuration des types
  - Tester application automatique avec jours de grâce
  - Tester calculs (fixe, pourcentage, progressif)
  - Tester annulation
  - _Exigences: 18.1-18.6_

### 15. Module Séances

- [ ] 15.1 Créer le modèle de données Séances
  - Définir les modèles Seance, Presence, CotisationSeance, ProcesVerbal
  - Ajouter les champs (date, rapportSeance, statut)
  - Créer les relations (séance -> présences, séance -> cotisations)
  - Générer la migration
  - _Exigences: 19.1, 19.2, 19.3_


- [ ] 15.2 Implémenter SeancesService - Création et gestion
  - Créer creer() pour initialiser une séance hebdomadaire
  - Configurer la date (généralement dimanche)
  - Initialiser les présences pour tous les membres actifs
  - _Exigences: 19.1, 30.5_

- [ ] 15.3 Implémenter l'enregistrement des présences
  - Créer enregistrerPresence() pour marquer présent/absent
  - Permettre la justification d'absence
  - Calculer le nombre d'absences consécutives
  - Déclencher sanctions selon configuration
  - _Exigences: 19.2, 19.6_

- [ ] 15.4 Implémenter la collecte des cotisations
  - Créer collecterCotisations() pour enregistrer les paiements
  - Enregistrer cotisations tontine, épargne, projets
  - Enregistrer les remboursements de prêts
  - Mettre à jour les caisses correspondantes
  - _Exigences: 19.4, 19.5_

- [ ] 15.5 Implémenter la génération de procès-verbaux
  - Créer genererProcesVerbal() automatiquement
  - Inclure présences, cotisations, décisions
  - Permettre la signature électronique
  - Archiver le PV
  - _Exigences: 19.7, 25.4, 25.5_

- [ ] 15.6 Implémenter la clôture de séance
  - Créer cloturerSeance() pour finaliser
  - Vérifier que toutes les données sont complètes
  - Générer le PV final
  - Empêcher les modifications après clôture
  - _Exigences: 19.1, 38.3_


- [ ] 15.7 Créer SeancesController avec endpoints REST
  - POST /seances (création)
  - GET /seances (liste)
  - GET /seances/:id (détails)
  - POST /seances/:id/presences
  - POST /seances/:id/cotisations
  - POST /seances/:id/cloturer
  - GET /seances/:id/proces-verbal
  - _Exigences: 19.1-19.7_

- [ ]* 15.8 Écrire les tests unitaires pour Séances
  - Tester création et initialisation des présences
  - Tester enregistrement présences et sanctions absences
  - Tester collecte cotisations
  - Tester génération PV
  - _Exigences: 19.1-19.7_

### 16. Module Votes et Décisions

- [ ] 16.1 Créer le modèle de données Votes
  - Définir les modèles Vote, OptionVote, VoteMembre
  - Ajouter les champs (question, dateDebut, dateFin, statut)
  - Créer les relations (vote -> options -> votes membres)
  - Générer la migration
  - _Exigences: 25.1, 25.2_

- [ ] 16.2 Implémenter VotesService
  - Créer creerVote() avec question et options
  - Enregistrer les votes des membres présents
  - Calculer automatiquement les résultats (pour, contre, abstention)
  - Clore le vote et générer le PV
  - _Exigences: 25.1, 25.2, 25.3, 25.4_


- [ ] 16.3 Implémenter la signature électronique des PV
  - Créer signerProcesVerbal() pour les administrateurs
  - Enregistrer les signatures avec horodatage
  - Vérifier que tous les signataires requis ont signé
  - Archiver le PV signé
  - _Exigences: 25.5, 25.6_

- [ ] 16.4 Créer VotesController avec endpoints REST
  - POST /votes (création)
  - POST /votes/:id/voter
  - POST /votes/:id/clore
  - GET /votes/:id/resultats
  - POST /votes/:id/proces-verbal/signer
  - GET /votes (historique)
  - _Exigences: 25.1-25.6_

- [ ]* 16.5 Écrire les tests unitaires pour Votes
  - Tester création et enregistrement des votes
  - Tester calcul des résultats
  - Tester génération et signature PV
  - _Exigences: 25.1-25.6_

### 17. Checkpoint - Modules Aides & Gestion

- [ ] 17.1 Vérifier que tous les tests passent
  - Exécuter tous les tests des modules Aides, Projets, Sanctions, Séances, Votes
  - Tester les flux complets (séance -> présences -> cotisations -> PV)
  - Tester les intégrations (sanctions automatiques, prélèvements)
  - Demander au user si des questions se posent

---

## Phase 4: Interface Utilisateur

### 18. Configuration Projet Frontend

- [x] 18.1 Initialiser le projet Next.js
  - Créer le projet avec `npx create-next-app@latest`
  - Configurer TypeScript strict mode
  - Configurer le App Router
  - Installer les dépendances de base
  - _Exigences: 28.1_


- [ ] 18.2 Configurer Shadcn/ui et Tailwind CSS
  - Installer et configurer Tailwind CSS
  - Initialiser Shadcn/ui
  - Configurer le thème (couleurs, typographie)
  - Installer les composants de base (Button, Card, Input, etc.)
  - _Exigences: 28.1_

- [ ] 18.3 Configurer React Query et Zustand
  - Installer @tanstack/react-query
  - Configurer le QueryClient
  - Installer zustand pour state management
  - Créer les stores de base (auth, user)
  - _Exigences: 28.1_

- [ ] 18.4 Créer le client API
  - Créer le client HTTP avec axios
  - Configurer les intercepteurs (auth, tenant, errors)
  - Créer les fonctions API par module
  - Gérer les erreurs globalement
  - _Exigences: 28.1, 31.2_

- [ ] 18.5 Créer les layouts de base
  - Créer le layout principal avec navigation
  - Créer le layout authentification
  - Créer le layout dashboard admin
  - Créer le layout mobile membre
  - _Exigences: 28.1, 28.2_

### 19. Pages Authentification

- [ ] 19.1 Créer la page de connexion
  - Formulaire login avec validation
  - Gestion des erreurs (credentials invalides, compte verrouillé)
  - Redirection après connexion selon rôle
  - Support 2FA si activé
  - _Exigences: 31.3, 31.4_


- [ ] 19.2 Créer la page d'inscription
  - Formulaire inscription avec validation
  - Vérification email/téléphone
  - Création du compte utilisateur
  - Redirection vers login après inscription
  - _Exigences: 2.1_

- [ ] 19.3 Créer la page de réinitialisation mot de passe
  - Formulaire demande de réinitialisation
  - Envoi email avec lien sécurisé
  - Formulaire nouveau mot de passe
  - Validation et mise à jour
  - _Exigences: 31.3_

### 20. Dashboard Administrateur

- [ ] 20.1 Créer le dashboard principal admin
  - Afficher les KPIs (membres actifs, soldes caisses, prêts en cours)
  - Créer les StatCards avec icônes
  - Afficher le taux de recouvrement
  - Rendre responsive (desktop/tablet)
  - _Exigences: 34.1, 34.2_

- [ ] 20.2 Créer les graphiques d'évolution
  - Implémenter EvolutionSoldesChart avec Recharts
  - Afficher l'évolution sur 12 mois
  - Permettre le filtrage par période
  - Rendre interactif (tooltips, zoom)
  - _Exigences: 34.2, 34.6_

- [ ] 20.3 Créer le widget des alertes
  - Afficher les alertes critiques (prêts en retard, caisses faibles)
  - Permettre le filtrage par type
  - Rendre cliquable pour accéder aux détails
  - Actualiser en temps réel
  - _Exigences: 34.5, 34.7, 43.1-43.6_


- [ ] 20.4 Créer le widget des prochaines tontines
  - Afficher les tontines avec distribution prochaine
  - Afficher le bénéficiaire et le montant
  - Permettre l'accès rapide aux détails
  - _Exigences: 34.1_

### 21. Pages Gestion des Membres

- [ ] 21.1 Créer la page liste des membres
  - Tableau avec pagination
  - Colonnes: nom, prénom, statut, téléphone, date adhésion
  - Filtres par statut
  - Recherche par nom/téléphone
  - Actions rapides (voir détails, modifier)
  - _Exigences: 36.1, 36.2, 36.5_

- [ ] 21.2 Créer la page détails membre
  - Afficher toutes les informations du membre
  - Afficher la situation nette
  - Afficher l'historique des transactions
  - Permettre la modification
  - Permettre le changement de statut
  - _Exigences: 23.1-23.7_

- [ ] 21.3 Créer le formulaire création/modification membre
  - Champs avec validation (nom, prénom, téléphone, email, etc.)
  - Sélection du parrain
  - Upload photo
  - Calcul et affichage du kit d'entrée
  - _Exigences: 2.1, 2.3, 37.1_

- [ ] 21.4 Créer la modale changement de statut
  - Sélection du nouveau statut
  - Champ justification obligatoire
  - Affichage des montants dus/à restituer
  - Confirmation avant validation
  - _Exigences: 2.4, 2.5, 33.1-33.7_


### 22. Pages Gestion des Tontines

- [ ] 22.1 Créer la page liste des tontines
  - Tableau avec pagination
  - Colonnes: nom, type, montant cotisation, statut, cycle actuel
  - Filtres par type et statut
  - Actions rapides (voir détails, collecter, distribuer)
  - _Exigences: 3.1, 4.1_

- [ ] 22.2 Créer la page détails tontine
  - Afficher les informations de la tontine
  - Afficher la liste des participants avec parts
  - Afficher l'ordre des tours
  - Afficher le bénéficiaire actuel
  - Afficher l'historique des distributions
  - _Exigences: 3.1-3.7, 4.1-4.5_

- [ ] 22.3 Créer le formulaire création tontine
  - Champs de base (nom, type, montant, fréquence)
  - Sélection des participants avec nombre de parts
  - Définition de l'ordre initial
  - Validation et création
  - _Exigences: 3.1, 3.4, 3.5_

- [ ] 22.4 Créer la modale collecte cotisations
  - Liste des participants avec montants dus
  - Checkboxes pour marquer les paiements
  - Calcul automatique de la cagnotte
  - Validation et enregistrement
  - _Exigences: 3.2, 3.6_

- [ ] 22.5 Créer la modale distribution cagnotte
  - Affichage du bénéficiaire
  - Calcul et affichage des retenues
  - Affichage du montant net
  - Confirmation et distribution
  - _Exigences: 3.3, 6.1-6.6_


- [ ] 22.6 Créer la modale vente de tour
  - Sélection de l'acheteur
  - Saisie du montant offert
  - Calcul automatique des intérêts primaires
  - Confirmation et enregistrement
  - _Exigences: 4.1-4.5_

### 23. Pages Gestion des Prêts

- [ ] 23.1 Créer la page liste des prêts
  - Tableau avec pagination
  - Colonnes: emprunteur, type, montant, taux, statut, échéance
  - Filtres par type et statut
  - Recherche par emprunteur
  - Actions rapides (voir détails, enregistrer paiement)
  - _Exigences: 7.1, 36.4_

- [ ] 23.2 Créer la page détails prêt
  - Afficher toutes les informations du prêt
  - Afficher les garanties avec documents
  - Afficher l'échéancier avec statuts
  - Afficher l'historique des paiements
  - Calculer et afficher le solde restant
  - _Exigences: 7.1-7.8, 9.1-9.5_

- [ ] 23.3 Créer le formulaire création prêt
  - Sélection du type de prêt
  - Champs (emprunteur, montant, taux, durée)
  - Ajout des garanties avec upload documents
  - Pour prêts collectifs: ajout co-emprunteurs avec parts
  - Validation et création
  - _Exigences: 7.1, 7.2, 10.1, 10.2, 37.1_

- [ ] 23.4 Créer la modale enregistrement paiement
  - Sélection de l'échéance
  - Saisie du montant payé
  - Support paiements partiels
  - Calcul du solde restant
  - Confirmation et enregistrement
  - _Exigences: 7.6, 9.3, 9.4_


### 24. Pages Gestion des Caisses

- [ ] 24.1 Créer la page vue d'ensemble des caisses
  - Afficher les 3 caisses avec soldes actuels
  - Graphiques d'évolution par caisse
  - Actions rapides (créditer, débiter, décharge, versement)
  - _Exigences: 21.1, 21.3, 22.1_

- [ ] 24.2 Créer la page historique d'une caisse
  - Tableau des mouvements avec pagination
  - Colonnes: date, type, montant, solde après, responsable, motif
  - Filtres par type et période
  - Export en PDF/Excel
  - _Exigences: 21.6, 21.7, 32.1, 32.3_

- [ ] 24.3 Créer les modales opérations caisse
  - Modale créditer (montant, motif)
  - Modale débiter (montant, motif)
  - Modale décharge (montant, justification obligatoire)
  - Modale versement bancaire (montant, référence)
  - _Exigences: 21.2, 21.4, 21.5_

### 25. Pages Gestion des Séances

- [ ] 25.1 Créer la page liste des séances
  - Tableau avec pagination
  - Colonnes: date, nombre présents, montant collecté, statut
  - Filtres par statut et période
  - Actions rapides (voir détails, créer nouvelle)
  - _Exigences: 19.1_

- [ ] 25.2 Créer la page détails séance
  - Afficher les informations de la séance
  - Liste des présences avec statuts
  - Liste des cotisations collectées
  - Rapport de séance
  - Procès-verbal si généré
  - _Exigences: 19.2, 19.3, 19.4, 19.7_


- [ ] 25.3 Créer le formulaire création séance
  - Sélection de la date
  - Initialisation automatique des présences
  - Validation et création
  - _Exigences: 19.1, 19.2_

- [ ] 25.4 Créer l'interface enregistrement présences
  - Liste des membres avec checkboxes présent/absent
  - Champ justification pour absences
  - Sauvegarde en temps réel
  - Affichage des sanctions automatiques
  - _Exigences: 19.2, 19.6_

- [ ] 25.5 Créer l'interface collecte cotisations
  - Liste des membres avec montants dus
  - Saisie des montants payés par type (tontine, épargne, projets)
  - Enregistrement des remboursements prêts
  - Calcul automatique du total collecté
  - _Exigences: 19.4, 19.5_

### 26. Interface Membre Mobile

- [ ] 26.1 Créer le dashboard membre mobile
  - Afficher le solde net en grand
  - Afficher les cotisations à venir
  - Afficher les prêts en cours
  - Navigation par onglets (Cotisations, Prêts, Historique)
  - Optimiser pour mobile (touch, swipe)
  - _Exigences: 23.1-23.7, 28.1, 28.2, 28.4_

- [ ] 26.2 Créer la page situation nette membre
  - Afficher toutes les cotisations payées
  - Afficher les prêts avec soldes restants
  - Afficher les sanctions impayées
  - Afficher les bénéfices reçus
  - Calculer et afficher le solde net
  - Bouton export PDF
  - _Exigences: 23.1-23.7, 32.2_


- [ ] 26.3 Créer la page dépôt en ligne
  - Formulaire sélection type de paiement
  - Saisie du montant
  - Upload preuve de paiement (photo/PDF)
  - Soumission et notification trésorier
  - Affichage du statut (en attente, validé, rejeté)
  - _Exigences: 20.1, 20.2, 37.2, 37.3_

- [ ] 26.4 Créer la page historique transactions membre
  - Liste des transactions avec pagination
  - Filtres par type et période
  - Affichage détaillé par transaction
  - _Exigences: 23.1-23.7_

- [ ] 26.5 Créer les actions rapides membre
  - Bouton "Déposer en ligne"
  - Bouton "Voir ma situation"
  - Bouton "Contacter trésorier"
  - Bouton "Notifications"
  - _Exigences: 20.1, 23.7, 24.1_

### 27. Pages Configuration

- [ ] 27.1 Créer la page configuration association
  - Configuration devise et format (FCFA, EUR, USD)
  - Configuration format date et langue
  - Configuration jour et heure des séances
  - Configuration montant kit d'entrée
  - _Exigences: 30.1-30.8, 35.1-35.5_

- [ ] 27.2 Créer la page configuration taux et montants
  - Configuration taux d'intérêt par type de prêt
  - Configuration montants aides (maladie, décès) par type
  - Configuration règles d'éligibilité
  - Validation de cohérence
  - _Exigences: 30.1, 30.2, 30.7, 30.8_


- [ ] 27.3 Créer la page configuration sanctions
  - Liste des types de sanctions
  - Formulaire création/modification type sanction
  - Configuration mode calcul (fixe, pourcentage, progressif)
  - Configuration jours de grâce
  - _Exigences: 18.1, 18.2, 18.3, 30.3, 30.4_

### 28. Checkpoint - Interface Utilisateur

- [ ] 28.1 Vérifier la responsivité
  - Tester sur mobile (320px, 375px, 414px)
  - Tester sur tablet (768px, 1024px)
  - Tester sur desktop (1280px, 1920px)
  - Vérifier la navigation tactile
  - _Exigences: 28.1, 28.4_

- [ ] 28.2 Vérifier les performances frontend
  - Mesurer les temps de chargement (< 2s sur 3G)
  - Optimiser les images et assets
  - Implémenter le lazy loading
  - Vérifier les Core Web Vitals
  - _Exigences: 28.3, 44.1, 44.2_

- [ ] 28.3 Tester sur différents navigateurs
  - Chrome (dernières versions)
  - Firefox (dernières versions)
  - Safari (dernières versions)
  - Edge (dernières versions)
  - _Exigences: 28.5_

- [ ] 28.4 Demander feedback utilisateur
  - Demander au user si l'interface est intuitive
  - Demander si des ajustements sont nécessaires
  - Vérifier l'accessibilité de base

---

## Phase 5: Intégrations & Optimisations

### 29. Module Notifications

- [ ] 29.1 Créer le modèle de données Notifications
  - Définir les modèles Notification, NotificationPreferences
  - Créer l'enum NotificationChannel (EMAIL, SMS, IN_APP, PUSH)
  - Ajouter les champs (recipientId, subject, message, channels, statut)
  - Générer la migration
  - _Exigences: 24.1_


- [ ] 29.2 Implémenter NotificationsService
  - Créer send() pour envoyer une notification
  - Créer sendBulk() pour envois groupés
  - Implémenter scheduleReminder() pour rappels automatiques
  - Gérer les préférences utilisateur
  - _Exigences: 24.1, 24.6, 24.7_

- [ ] 29.3 Intégrer SendGrid pour emails
  - Installer @sendgrid/mail
  - Configurer les templates d'emails
  - Implémenter l'envoi d'emails
  - Gérer les erreurs et retries
  - _Exigences: 24.1_

- [ ] 29.4 Intégrer Twilio pour SMS
  - Installer twilio SDK
  - Configurer les credentials
  - Implémenter l'envoi de SMS
  - Gérer les erreurs et retries
  - _Exigences: 24.1_

- [ ] 29.5 Implémenter les notifications in-app
  - Créer le système de notifications temps réel (WebSocket ou SSE)
  - Afficher les notifications dans l'interface
  - Marquer comme lues
  - Gérer l'historique
  - _Exigences: 24.1, 24.7_

- [ ] 29.6 Implémenter les rappels automatiques
  - Rappel cotisation 3 jours avant séance
  - Rappel échéance prêt 5 jours avant
  - Notification désignation commissionnaire
  - Notification validation/rejet dépôt en ligne
  - _Exigences: 24.2, 24.3, 24.4, 24.5_


- [ ] 29.7 Créer NotificationsController avec endpoints REST
  - GET /notifications (liste)
  - POST /notifications/send
  - POST /notifications/send-bulk
  - PATCH /notifications/:id/mark-read
  - GET /notifications/preferences
  - PUT /notifications/preferences
  - _Exigences: 24.1-24.7_

- [ ]* 29.8 Écrire les tests unitaires pour Notifications
  - Tester envoi email
  - Tester envoi SMS
  - Tester notifications in-app
  - Tester rappels automatiques
  - _Exigences: 24.1-24.7_

### 30. Module Paiements Mobiles

- [ ] 30.1 Créer le modèle de données Paiements Mobiles
  - Définir le modèle PaiementMobile
  - Créer l'enum ProviderPaiement (ORANGE_MONEY, MTN, WAVE)
  - Ajouter les champs (montant, reference, statut, provider)
  - Générer la migration
  - _Exigences: 40.1_

- [ ] 30.2 Implémenter PaiementsMobilesService
  - Créer initierPaiement() pour démarrer un paiement
  - Générer une référence unique
  - Intégrer les API des providers (Orange Money, MTN, Wave)
  - Vérifier automatiquement la confirmation
  - _Exigences: 40.1, 40.2, 40.3_

- [ ] 30.3 Implémenter la vérification automatique
  - Créer verifierPaiement() pour checker le statut
  - Utiliser webhooks des providers si disponibles
  - Enregistrer automatiquement comme dépôt validé si confirmé
  - Notifier le membre du résultat
  - _Exigences: 40.3, 40.4, 40.5_


- [ ] 30.4 Implémenter la réconciliation
  - Enregistrer toutes les transactions avec références
  - Créer un rapport de réconciliation
  - Détecter les écarts
  - _Exigences: 40.6_

- [ ] 30.5 Créer PaiementsMobilesController avec endpoints REST
  - POST /paiements-mobiles/initier
  - GET /paiements-mobiles/:id/statut
  - POST /paiements-mobiles/webhook (pour callbacks providers)
  - GET /paiements-mobiles/reconciliation
  - _Exigences: 40.1-40.6_

- [ ]* 30.6 Écrire les tests unitaires pour Paiements Mobiles
  - Tester initiation paiement
  - Tester vérification statut
  - Tester webhooks
  - Tester réconciliation
  - _Exigences: 40.1-40.6_

### 31. Module Audit et Traçabilité

- [ ] 31.1 Créer le modèle de données Audit
  - Définir le modèle AuditLog
  - Ajouter les champs (entityType, entityId, action, oldValue, newValue, userId, timestamp)
  - Créer les index pour performance
  - Générer la migration
  - _Exigences: 26.1, 26.2, 26.3_

- [ ] 31.2 Implémenter AuditService
  - Créer logChange() pour enregistrer une modification
  - Enregistrer l'état avant et après
  - Enregistrer l'utilisateur responsable
  - Créer getHistorique() pour consulter l'audit
  - _Exigences: 26.1, 26.2, 26.3, 26.4_


- [ ] 31.3 Implémenter l'intercepteur d'audit
  - Créer un intercepteur NestJS pour capturer les modifications
  - Détecter automatiquement les changements sur entités sensibles
  - Enregistrer dans AuditLog
  - _Exigences: 26.1, 26.2_

- [ ] 31.4 Implémenter la détection d'anomalies
  - Créer detecterAnomalies() pour identifier les modifications inhabituelles
  - Alerter en cas de montants élevés
  - Alerter en cas de suppressions
  - Notifier les administrateurs
  - _Exigences: 26.6_

- [ ] 31.5 Implémenter les rapports d'audit
  - Créer genererRapportAudit() pour une période
  - Filtrer par entité, utilisateur, action
  - Export en PDF/Excel
  - _Exigences: 26.5_

- [ ] 31.6 Créer AuditController avec endpoints REST
  - GET /audit/historique (avec filtres)
  - GET /audit/entity/:type/:id
  - GET /audit/user/:userId
  - GET /audit/rapport
  - GET /audit/anomalies
  - _Exigences: 26.1-26.6_

- [ ]* 31.7 Écrire les tests unitaires pour Audit
  - Tester enregistrement des modifications
  - Tester détection d'anomalies
  - Tester génération de rapports
  - _Exigences: 26.1-26.6_

### 32. Module Export et Rapports

- [ ] 32.1 Implémenter ExportService
  - Créer exportBilanPDF() pour générer bilan en PDF
  - Créer exportBilanExcel() pour générer bilan en Excel
  - Créer exportSituationMembrePDF()
  - Créer exportTransactionsCSV()
  - _Exigences: 32.1, 32.2, 32.3_


- [ ] 32.2 Intégrer les bibliothèques de génération
  - Installer pdfkit ou puppeteer pour PDF
  - Installer exceljs pour Excel
  - Créer les templates de documents
  - Gérer le formatage selon configuration (devise, date)
  - _Exigences: 32.1, 32.2, 32.3, 35.1-35.5_

- [ ] 32.3 Implémenter le Pretty Printer
  - Créer formatData() pour formater les données exportées
  - Appliquer les formats locaux (devise, date, nombres)
  - Rendre lisible et structuré
  - _Exigences: 32.6, 35.5_

- [ ] 32.4 Créer ExportController avec endpoints REST
  - GET /export/bilan/pdf
  - GET /export/bilan/excel
  - GET /export/membre/:id/situation/pdf
  - GET /export/transactions/csv
  - _Exigences: 32.1, 32.2, 32.3_

- [ ]* 32.5 Écrire les tests de propriétés pour Export
  - **Propriété 7: Round-trip Export/Import**
  - **Valide: Exigences 32.1-32.7**
  - Tester que exporter puis importer produit des données équivalentes
  - _Exigences: 32.1-32.7_

### 33. Module Statistiques et Analyses

- [ ] 33.1 Implémenter StatistiquesService
  - Créer calculerTauxCroissance() pour les caisses
  - Créer calculerTauxDefaut() par type de prêt
  - Créer identifierMembresRetards()
  - Créer calculerRentabilitePrets()
  - Créer projeterSoldesFuturs() basé sur tendances
  - _Exigences: 41.1, 41.2, 41.3, 41.4, 41.5_


- [ ] 33.2 Implémenter la génération de rapports statistiques
  - Créer genererRapportStatistiques() pour une période
  - Inclure tous les indicateurs clés
  - Export en PDF et Excel
  - _Exigences: 41.6_

- [ ] 33.3 Créer StatistiquesController avec endpoints REST
  - GET /statistiques/taux-croissance
  - GET /statistiques/taux-defaut
  - GET /statistiques/membres-retards
  - GET /statistiques/rentabilite-prets
  - GET /statistiques/projections
  - GET /statistiques/rapport
  - _Exigences: 41.1-41.6_

- [ ]* 33.4 Écrire les tests unitaires pour Statistiques
  - Tester calculs de taux
  - Tester identifications membres
  - Tester projections
  - _Exigences: 41.1-41.6_

### 34. Module Communications de Masse

- [ ] 34.1 Créer le modèle de données Communications
  - Définir le modèle MessageGroupe
  - Ajouter les champs (sujet, contenu, cibles, statut, tauxDelivrance)
  - Créer les relations avec les destinataires
  - Générer la migration
  - _Exigences: 42.1, 42.6_

- [ ] 34.2 Implémenter CommunicationsService
  - Créer envoyerMessageGroupe() pour envois groupés
  - Implémenter le ciblage par statut membre
  - Implémenter le ciblage par critères personnalisés
  - Prévisualiser avant envoi
  - _Exigences: 42.1, 42.2, 42.3, 42.4_


- [ ] 34.3 Implémenter le suivi des envois
  - Enregistrer l'historique de tous les messages
  - Calculer le taux de délivrance
  - Calculer le taux de lecture (si disponible)
  - Afficher les statistiques
  - _Exigences: 42.5, 42.6_

- [ ] 34.4 Créer CommunicationsController avec endpoints REST
  - POST /communications/envoyer
  - POST /communications/previsualiser
  - GET /communications/historique
  - GET /communications/:id/statistiques
  - _Exigences: 42.1-42.6_

- [ ]* 34.5 Écrire les tests unitaires pour Communications
  - Tester envoi groupé
  - Tester ciblage
  - Tester prévisualisation
  - _Exigences: 42.1-42.6_

### 35. Module Alertes Automatiques

- [ ] 35.1 Créer le modèle de données Alertes
  - Définir le modèle Alerte, ConfigurationAlerte
  - Créer l'enum TypeAlerte (CAISSE_FAIBLE, PRET_RETARD, ABSENCES, ECHEANCE, CONNEXION_SUSPECTE)
  - Ajouter les champs (type, seuil, destinataires, statut)
  - Générer la migration
  - _Exigences: 43.1-43.6_

- [ ] 35.2 Implémenter AlertesService
  - Créer verifierAlerteCaisse() pour seuils de caisses
  - Créer verifierAlertePretRetard() pour prêts > 30 jours
  - Créer verifierAlerteAbsences() pour 3 absences consécutives
  - Créer verifierAlerteEcheance() pour échéances importantes
  - Créer verifierAlerteConnexion() pour tentatives suspectes
  - _Exigences: 43.1-43.5_


- [ ] 35.3 Implémenter le système de vérification périodique
  - Créer un cron job pour vérifier les alertes
  - Exécuter toutes les heures
  - Notifier les destinataires appropriés
  - Enregistrer les alertes déclenchées
  - _Exigences: 43.1-43.6_

- [ ] 35.4 Implémenter la configuration des seuils
  - Permettre la configuration des seuils par association
  - Valider les seuils configurés
  - Appliquer les seuils lors des vérifications
  - _Exigences: 43.6_

- [ ] 35.5 Créer AlertesController avec endpoints REST
  - GET /alertes (liste des alertes actives)
  - GET /alertes/configuration
  - PUT /alertes/configuration
  - POST /alertes/:id/acquitter
  - _Exigences: 43.1-43.6_

- [ ]* 35.6 Écrire les tests unitaires pour Alertes
  - Tester vérification de chaque type d'alerte
  - Tester configuration des seuils
  - Tester notifications
  - _Exigences: 43.1-43.6_

### 36. Optimisation des Performances

- [ ] 36.1 Implémenter le cache Redis
  - Configurer Redis pour cache
  - Mettre en cache les soldes de caisses
  - Mettre en cache les situations nettes
  - Mettre en cache les configurations
  - Invalider le cache lors des modifications
  - _Exigences: 44.6_


- [ ] 36.2 Optimiser les requêtes de base de données
  - Ajouter les index nécessaires (tenant_id, dates, statuts)
  - Utiliser les includes Prisma pour éviter N+1
  - Implémenter la pagination partout
  - Utiliser les transactions pour cohérence
  - _Exigences: 44.5, 44.7_

- [ ] 36.3 Implémenter les calculs asynchrones
  - Utiliser Bull Queue pour tâches lourdes
  - Calculer les bilans en arrière-plan
  - Calculer les statistiques en arrière-plan
  - Notifier quand terminé
  - _Exigences: 44.3_

- [ ] 36.4 Optimiser le frontend
  - Implémenter le lazy loading des composants
  - Optimiser les images (WebP, compression)
  - Utiliser React Query pour cache côté client
  - Implémenter le code splitting
  - _Exigences: 44.1, 44.2_

- [ ] 36.5 Tester les performances
  - Mesurer les temps de réponse des API
  - Tester avec 100 utilisateurs simultanés
  - Mesurer les temps de chargement frontend
  - Identifier et corriger les bottlenecks
  - _Exigences: 44.1, 44.2, 44.3, 44.4_

### 37. Monitoring et Logs

- [ ] 37.1 Configurer Winston pour logging
  - Installer winston
  - Configurer les niveaux de log (error, warn, info, debug)
  - Créer les transports (console, fichier)
  - Formater les logs en JSON structuré
  - _Exigences: 45.1_


- [ ] 37.2 Implémenter le logging des erreurs
  - Logger toutes les erreurs avec stack traces
  - Logger les erreurs critiques avec notification
  - Inclure le contexte (user, tenant, request)
  - _Exigences: 45.2, 45.5_

- [ ] 37.3 Configurer Prometheus pour métriques
  - Installer prom-client
  - Exposer l'endpoint /metrics
  - Collecter les métriques système (CPU, mémoire, disque)
  - Collecter les métriques applicatives (temps réponse API)
  - _Exigences: 45.3, 45.4_

- [ ] 37.4 Configurer Grafana pour visualisation
  - Installer Grafana
  - Connecter à Prometheus
  - Créer les dashboards de monitoring
  - Configurer les alertes
  - _Exigences: 45.3, 45.4_

- [ ] 37.5 Implémenter la rotation et archivage des logs
  - Configurer la rotation quotidienne
  - Conserver les logs pendant 90 jours
  - Archiver les logs anciens
  - _Exigences: 45.6_

- [ ] 37.6 Créer l'interface de consultation des logs
  - Page de recherche et filtrage des logs
  - Filtres par niveau, date, module
  - Affichage détaillé avec stack traces
  - _Exigences: 45.7_

### 38. Sécurité Avancée

- [ ] 38.1 Implémenter le chiffrement des données sensibles
  - Chiffrer les données sensibles au repos (AES-256)
  - Chiffrer les mots de passe (bcrypt)
  - Gérer les clés de chiffrement de manière sécurisée
  - _Exigences: 31.1_


- [ ] 38.2 Implémenter le scan antivirus des uploads
  - Intégrer ClamAV ou service cloud
  - Scanner tous les fichiers uploadés
  - Rejeter les fichiers infectés
  - Notifier les administrateurs
  - _Exigences: 37.4_

- [ ] 38.3 Implémenter les sauvegardes automatiques
  - Configurer les sauvegardes quotidiennes de PostgreSQL
  - Sauvegarder les fichiers uploadés
  - Tester la restauration
  - Conserver les sauvegardes pendant 30 jours
  - _Exigences: 31.6, 31.7_

- [ ] 38.4 Implémenter la conformité RGPD
  - Créer l'endpoint d'export des données personnelles
  - Créer l'endpoint de suppression des données
  - Implémenter le consentement pour traitement des données
  - Créer la politique de confidentialité
  - _Exigences: 31.8_

### 39. Gestion des Périodes Fiscales

- [ ] 39.1 Créer le modèle de données Périodes Fiscales
  - Définir le modèle PeriodeFiscale
  - Ajouter les champs (dateDebut, dateFin, statut, bilanId)
  - Générer la migration
  - _Exigences: 38.1_

- [ ] 39.2 Implémenter PeriodesFiscalesService
  - Créer cloturerPeriode() pour finaliser une période
  - Générer automatiquement le bilan de la période
  - Empêcher les modifications des transactions clôturées
  - Calculer les reports à nouveau
  - _Exigences: 38.2, 38.3, 38.4_


- [ ] 39.3 Implémenter l'archivage des bilans
  - Archiver tous les bilans des périodes clôturées
  - Permettre la consultation des bilans historiques
  - Export des bilans archivés
  - _Exigences: 38.5, 38.6_

- [ ] 39.4 Créer PeriodesFiscalesController avec endpoints REST
  - POST /periodes-fiscales/cloturer
  - GET /periodes-fiscales (liste)
  - GET /periodes-fiscales/:id/bilan
  - GET /periodes-fiscales/historique
  - _Exigences: 38.1-38.6_

- [ ]* 39.5 Écrire les tests unitaires pour Périodes Fiscales
  - Tester clôture et génération bilan
  - Tester empêchement modifications
  - Tester reports à nouveau
  - _Exigences: 38.1-38.6_

### 40. Gestion des Remises

- [ ] 40.1 Créer le modèle de données Remises
  - Définir le modèle Remise
  - Ajouter les champs (membreId, montant, justification, approbateurs, statut)
  - Générer la migration
  - _Exigences: 39.1, 39.2_

- [ ] 40.2 Implémenter RemisesService
  - Créer demanderRemise() pour soumettre une demande
  - Implémenter approuverRemise() avec validation 2 admins
  - Appliquer automatiquement lors du calcul des montants dus
  - Vérifier la limite de 10% des cotisations annuelles
  - _Exigences: 39.1, 39.2, 39.3, 39.4, 39.6_


- [ ] 40.3 Implémenter l'inclusion dans les rapports d'audit
  - Enregistrer toutes les remises dans l'audit
  - Inclure dans les rapports d'audit
  - Alerter si dépassement de la limite
  - _Exigences: 39.5_

- [ ] 40.4 Créer RemisesController avec endpoints REST
  - POST /remises/demander
  - POST /remises/:id/approuver
  - GET /remises (liste)
  - GET /remises/total-annuel
  - _Exigences: 39.1-39.6_

- [ ]* 40.5 Écrire les tests unitaires pour Remises
  - Tester demande et approbation
  - Tester validation 2 admins
  - Tester limite 10%
  - _Exigences: 39.1-39.6_

### 41. Checkpoint Final - Intégrations & Optimisations

- [ ] 41.1 Vérifier tous les tests
  - Exécuter tous les tests unitaires
  - Exécuter tous les tests d'intégration
  - Exécuter tous les tests de propriétés
  - Vérifier la couverture de code (> 80%)
  - _Exigences: Toutes_

- [ ] 41.2 Tester les performances globales
  - Tester avec charge (100+ utilisateurs simultanés)
  - Mesurer les temps de réponse
  - Vérifier la stabilité sur 24h
  - Identifier et corriger les problèmes
  - _Exigences: 44.1-44.7_

- [ ] 41.3 Tester la sécurité
  - Effectuer un audit de sécurité
  - Tester l'isolation multi-tenant
  - Tester les permissions et rôles
  - Vérifier le chiffrement
  - _Exigences: 31.1-31.8_


- [ ] 41.4 Préparer la documentation
  - Documenter l'API avec Swagger/OpenAPI
  - Créer le guide d'installation
  - Créer le guide d'utilisation administrateur
  - Créer le guide d'utilisation membre
  - Documenter l'architecture technique
  - _Exigences: Toutes_

- [ ] 41.5 Préparer le déploiement
  - Créer les Dockerfiles de production
  - Configurer le docker-compose de production
  - Configurer Nginx avec SSL/TLS
  - Créer les scripts de déploiement
  - Tester le déploiement en environnement de staging
  - _Exigences: 31.2_

- [ ] 41.6 Demander validation finale
  - Demander au user de tester le système complet
  - Recueillir les feedbacks
  - Effectuer les ajustements nécessaires
  - Obtenir l'approbation pour mise en production

---

## Notes Importantes

### Tâches Optionnelles (marquées avec *)

Les tâches marquées d'un astérisque (*) sont optionnelles et peuvent être sautées pour accélérer le développement du MVP. Elles concernent principalement:
- Tests de propriétés (property-based testing)
- Tests unitaires complémentaires
- Tests d'intégration avancés

Ces tâches sont recommandées pour assurer la qualité et la robustesse du système, mais ne sont pas bloquantes pour le fonctionnement de base.

### Dépendances entre Phases

- **Phase 1** doit être complète avant de commencer la Phase 2
- **Phase 2** doit être complète avant la Phase 3
- **Phase 4** peut commencer après Phase 2 (en parallèle avec Phase 3)
- **Phase 5** nécessite les Phases 1-3 complètes

### Estimation de Complexité

- **Phase 1**: ~2-3 semaines (fondations critiques)
- **Phase 2**: ~4-5 semaines (modules financiers complexes)
- **Phase 3**: ~3-4 semaines (modules de gestion)
- **Phase 4**: ~3-4 semaines (interface utilisateur)
- **Phase 5**: ~3-4 semaines (intégrations et optimisations)

**Total estimé**: ~15-20 semaines pour un développeur expérimenté

### Priorités pour MVP

Pour un MVP rapide, se concentrer sur:
1. Phase 1 complète (infrastructure)
2. Phase 2: Membres, Tontines classiques, Prêts de base, Épargnes
3. Phase 3: Séances, Caisses (déjà en Phase 1)
4. Phase 4: Dashboard admin et interface membre basique
5. Sauter Phase 5 initialement (ajouter après validation MVP)

---

**Document créé le**: {{date}}  
**Version**: 1.0  
**Statut**: Prêt pour implémentation
