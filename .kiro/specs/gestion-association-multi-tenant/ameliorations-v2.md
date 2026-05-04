# Améliorations V2 - Système de Gestion d'Association Multi-Tenant

## Introduction

Ce document décrit les 10 nouvelles fonctionnalités et améliorations proposées pour enrichir le système de gestion d'association. Ces fonctionnalités ont été identifiées suite aux retours d'expérience des associations camerounaises et visent à rendre le système encore plus adapté aux réalités du terrain.

## Nouvelles Fonctionnalités

### 1. Gestion des Remplaçants de Tour (Cession de Tour)

**Contexte**: Dans la réalité camerounaise, il arrive souvent qu'un membre cède son tour à un autre membre qui en a besoin de manière urgente.

**Description**: Le système doit permettre à un membre de céder temporairement son tour de tontine à un autre membre, avec validation du président ou trésorier.

**Exigences Fonctionnelles**:
- Un membre peut proposer de céder son tour à un autre membre
- La cession nécessite l'acceptation du bénéficiaire
- La cession nécessite la validation du président ou trésorier
- Le membre A cède son tour au membre B
- B bénéficie à la place de A lors de la séance prévue
- A conserve sa position dans le cycle mais avec une date de bénéfice modifiée
- Le système enregistre l'historique complet de la cession
- Les deux membres sont notifiés de la validation

**Critères d'Acceptation**:
1. WHEN un Membre propose une cession, THE Système SHALL enregistrer la demande avec statut EN_ATTENTE
2. WHEN le bénéficiaire accepte, THE Système SHALL notifier les administrateurs
3. WHEN un administrateur valide, THE Système SHALL réorganiser l'ordre des tours
4. THE Système SHALL maintenir l'historique complet des cessions
5. THE Système SHALL empêcher les cessions circulaires (A→B→A)


### 2. Gestion des Membres en Difficulté Temporaire (Moratoire)

**Contexte**: Quand un membre traverse une période difficile (maladie, chômage, deuil), l'association peut décider de lui accorder un moratoire.

**Description**: Le système doit permettre d'accorder une suspension temporaire des obligations de cotisation sans pénalité pour une durée définie.

**Exigences Fonctionnelles**:
- Le président peut accorder un moratoire à un membre
- Durée du moratoire configurable (en semaines ou mois)
- Suspension des pénalités pendant la période
- Suspension des obligations de cotisation (optionnel)
- Reprise automatique à l'expiration du moratoire
- Historique complet des moratoires accordés
- Notification du membre et des administrateurs

**Critères d'Acceptation**:
1. WHEN un moratoire est accordé, THE Système SHALL suspendre les pénalités automatiques
2. THE Système SHALL enregistrer la date de début et de fin du moratoire
3. WHEN le moratoire expire, THE Système SHALL reprendre les obligations normalement
4. THE Système SHALL notifier le membre 7 jours avant l'expiration
5. THE Système SHALL maintenir l'historique des moratoires avec justifications

### 3. Statistiques et Tableaux de Bord Visuels

**Contexte**: Des graphiques directement dans l'application aident le président et le trésorier à piloter l'association.

**Description**: Le système doit fournir des visualisations graphiques avancées pour le pilotage de l'association.

**Exigences Fonctionnelles**:
- Évolution du solde des caisses mois par mois (graphique linéaire)
- Taux de défaillance par tontine (graphique en barres)
- Membres les plus réguliers (classement)
- Évolution des prêts accordés vs remboursés (graphique comparatif)
- Taux de participation aux séances (graphique circulaire)
- Filtrage par période (semaine, mois, trimestre, année)
- Export des graphiques en PNG/PDF

**Critères d'Acceptation**:
1. THE Système SHALL afficher des graphiques interactifs sur le dashboard
2. THE Système SHALL permettre le filtrage par période
3. THE Système SHALL actualiser les graphiques en temps réel
4. THE Système SHALL permettre l'export des graphiques
5. THE Système SHALL optimiser le chargement pour les grandes quantités de données


### 4. Gestion des Cotisations en Avance

**Contexte**: Un membre peut vouloir cotiser plusieurs séances à l'avance (avant un voyage, une hospitalisation prévue).

**Description**: Le système doit permettre l'enregistrement de cotisations anticipées qui seront affectées automatiquement aux séances futures.

**Exigences Fonctionnelles**:
- Un membre peut cotiser pour plusieurs séances à l'avance
- Le système affecte automatiquement les cotisations aux séances futures dans l'ordre
- Le membre est considéré comme présent financièrement même s'il est physiquement absent
- Affichage du solde de cotisations anticipées
- Notification avant épuisement du solde anticipé
- Remboursement possible en cas de démission

**Critères d'Acceptation**:
1. WHEN un Membre cotise en avance, THE Système SHALL enregistrer le nombre de séances couvertes
2. WHEN une Séance a lieu, THE Système SHALL déduire automatiquement du solde anticipé
3. THE Système SHALL marquer le Membre comme présent financièrement
4. THE Système SHALL notifier le Membre quand il reste 2 séances anticipées
5. WHEN un Membre démissionne, THE Système SHALL calculer le remboursement des cotisations anticipées non utilisées

### 5. Archivage des Cycles Terminés

**Contexte**: Quand un cycle de tontine ou d'épargne est terminé, il doit être archivé mais reste consultable.

**Description**: Le système doit archiver automatiquement les cycles terminés tout en maintenant l'accès à l'historique complet.

**Exigences Fonctionnelles**:
- Archivage automatique à la fin d'un cycle
- Consultation de l'historique de tous les cycles
- Statistiques par cycle (montants, participants, incidents)
- Export des données archivées
- Audit trail complet pour le commissaire aux comptes
- Mémoire institutionnelle complète

**Critères d'Acceptation**:
1. WHEN un cycle se termine, THE Système SHALL l'archiver automatiquement
2. THE Système SHALL maintenir l'accès en lecture seule aux cycles archivés
3. THE Système SHALL permettre la consultation de l'historique complet
4. THE Système SHALL générer des statistiques comparatives entre cycles
5. THE Système SHALL permettre l'export des données archivées


### 6. Gestion Multi-Devises

**Contexte**: Certaines associations camerounaises ont des membres en diaspora qui cotisent en euros ou dollars.

**Description**: Le système doit intégrer un système de conversion multi-devises avec taux paramétrables.

**Exigences Fonctionnelles**:
- Support de plusieurs devises (FCFA, EUR, USD, etc.)
- Taux de conversion paramétrable par le trésorier
- Conversion automatique en FCFA pour toutes les opérations internes
- Mise à jour manuelle ou automatique des taux (si internet disponible)
- Historique des taux de conversion
- Affichage des montants dans la devise d'origine et en FCFA

**Critères d'Acceptation**:
1. THE Système SHALL supporter plusieurs devises configurables
2. WHEN un paiement est effectué dans une devise étrangère, THE Système SHALL le convertir automatiquement en FCFA
3. THE Système SHALL permettre au Trésorier de mettre à jour les taux de conversion
4. THE Système SHALL enregistrer l'historique des taux avec dates
5. THE Système SHALL afficher les montants dans les deux devises (origine + FCFA)

### 7. Intégration Mobile Money

**Contexte**: Intégration directe avec MTN Mobile Money et Orange Money pour vérification automatique des paiements.

**Description**: Le système doit s'intégrer avec les API des opérateurs de Mobile Money pour vérifier automatiquement les transactions.

**Exigences Fonctionnelles**:
- Intégration API MTN Mobile Money
- Intégration API Orange Money
- Vérification automatique des transactions par numéro de référence
- Validation du montant et du destinataire
- Élimination des fraudes sur les preuves de paiement
- Notification automatique de validation
- Gestion des erreurs de vérification

**Critères d'Acceptation**:
1. WHEN un Membre soumet un numéro de transaction, THE Système SHALL vérifier automatiquement via l'API
2. THE Système SHALL valider le montant, le destinataire et la date
3. WHEN la vérification réussit, THE Système SHALL valider automatiquement le dépôt
4. WHEN la vérification échoue, THE Système SHALL notifier le Membre et le Trésorier
5. THE Système SHALL enregistrer toutes les tentatives de vérification


### 8. Mode Délégation

**Contexte**: Si le trésorier est malade ou absent pour plusieurs séances, le président peut déléguer temporairement ses droits.

**Description**: Le système doit permettre la délégation temporaire de droits avec traçabilité complète.

**Exigences Fonctionnelles**:
- Le président peut déléguer les droits d'un rôle à un membre de confiance
- Délégation limitée dans le temps (date de début et de fin)
- Traçabilité complète dans l'audit trail
- Révocation possible à tout moment
- Le délégué ne peut pas modifier les paramètres de l'association
- Notification du délégué et des autres administrateurs
- Historique complet des délégations

**Critères d'Acceptation**:
1. WHEN le Président crée une délégation, THE Système SHALL définir une date de début et de fin
2. THE Système SHALL accorder les permissions du rôle délégué au membre
3. THE Système SHALL empêcher la modification des paramètres par le délégué
4. WHEN la délégation expire, THE Système SHALL révoquer automatiquement les permissions
5. THE Système SHALL enregistrer toutes les actions du délégué dans l'audit trail

### 9. Gestion des Associations Sœurs et Réseau

**Contexte**: Plusieurs associations peuvent être liées dans un réseau (même quartier, même famille fondatrice).

**Description**: Le système doit permettre la gestion d'un réseau d'associations avec opérations inter-associations.

**Exigences Fonctionnelles**:
- Création de réseaux d'associations
- Transfert de membres entre associations du même réseau
- Dons entre associations
- Consultation des statistiques agrégées du réseau
- Super-administrateur pour gérer le réseau
- Historique des opérations inter-associations
- Rapports consolidés au niveau réseau

**Critères d'Acceptation**:
1. THE Système SHALL permettre la création de réseaux d'associations
2. WHEN un Membre est transféré, THE Système SHALL migrer ses données vers la nouvelle association
3. THE Système SHALL permettre les dons entre associations du même réseau
4. THE Système SHALL calculer des statistiques agrégées au niveau réseau
5. THE Système SHALL maintenir l'historique complet des opérations inter-associations


### 10. Rappels Intelligents Contextuels

**Contexte**: Au lieu de simples notifications, le système doit envoyer des rappels intelligents qui tiennent compte du contexte.

**Description**: Le système doit analyser la situation globale du membre et envoyer des rappels personnalisés et contextuels.

**Exigences Fonctionnelles**:
- Analyse de toutes les échéances du membre (prêts, tontines, sanctions)
- Calcul du montant total à prévoir pour la prochaine séance
- Rappels combinés pour plusieurs échéances simultanées
- Pas de rappel si cotisations anticipées déjà enregistrées
- Personnalisation du message selon la situation
- Priorisation des rappels (urgent, important, normal)
- Historique des rappels envoyés

**Critères d'Acceptation**:
1. WHEN un Membre a plusieurs échéances, THE Système SHALL envoyer un rappel unique combiné
2. THE Système SHALL calculer le montant total à prévoir
3. WHEN un Membre a des cotisations anticipées, THE Système SHALL ne pas envoyer de rappel
4. THE Système SHALL prioriser les rappels selon l'urgence
5. THE Système SHALL personnaliser le message selon la situation du Membre

## Intégration des Tontines - Spécifications Détaillées

### Vue Principale Tontines

**Description**: Interface principale affichant toutes les tontines de l'association avec informations clés.

**Éléments Affichés**:
- Nom de la tontine
- Type (VENDABLE, CLASSIQUE, HYBRIDE)
- Nombre de membres participants
- Montant par part
- Jour et heure de cotisation
- Tours gratuits disponibles (pour tontines vendables)
- Intérêts cumulés (pour tontines vendables)
- Prochain bénéficiaire et date

**Critères d'Acceptation**:
1. THE Système SHALL afficher toutes les tontines actives
2. THE Système SHALL afficher un badge visuel selon le type
3. THE Système SHALL afficher les informations clés en un coup d'œil
4. THE Système SHALL permettre le filtrage par type et statut
5. THE Système SHALL permettre l'accès aux détails en un clic


### Tontine Classique (Non Vendable) - Interfaces Détaillées

#### Interface Administrateur - Avant Séance

**Description**: Vue permettant au secrétaire et trésorier de gérer les cotisations avant et pendant la séance.

**Éléments Affichés**:
- Liste de tous les membres avec leur statut de cotisation
- Bénéficiaire du jour clairement identifié
- Montant attendu par membre
- Statut: En attente, Déposé en ligne, Défaillant
- Actions: Enregistrer cotisation, Valider dépôt, Voir retenues

**Fonctionnalités**:
- Enregistrement rapide des cotisations
- Validation des dépôts en ligne
- Application automatique des pénalités pour défaillants
- Calcul en temps réel du total collecté
- Affichage du restant à collecter

**Critères d'Acceptation**:
1. THE Système SHALL afficher tous les membres avec leur statut
2. THE Système SHALL identifier clairement le bénéficiaire du jour
3. THE Système SHALL permettre l'enregistrement rapide des cotisations
4. THE Système SHALL calculer en temps réel le total collecté
5. THE Système SHALL appliquer automatiquement les pénalités

#### Écran Retenues au Moment du Bénéfice

**Description**: Interface permettant de gérer les retenues automatiques sur la cagnotte du bénéficiaire.

**Éléments Affichés**:
- Cagnotte brute
- Liste de toutes les retenues possibles (prêts, sanctions, complément fonds, projets)
- Cases à cocher pour sélectionner les retenues à appliquer
- Champ de justification si une retenue n'est pas appliquée
- Total des retenues
- Net à remettre au bénéficiaire

**Fonctionnalités**:
- Sélection/désélection des retenues
- Justification obligatoire pour non-retenue
- Calcul automatique du net
- Validation et enregistrement
- Génération du reçu

**Critères d'Acceptation**:
1. THE Système SHALL afficher toutes les retenues applicables
2. THE Système SHALL permettre la sélection des retenues à appliquer
3. WHEN une retenue n'est pas appliquée, THE Système SHALL exiger une justification
4. THE Système SHALL calculer automatiquement le net à remettre
5. THE Système SHALL générer un reçu détaillé


#### Interface Membre - Suivi Tontine Classique

**Description**: Vue permettant au membre de suivre sa participation à une tontine classique.

**Éléments Affichés**:
- Statut: A déjà bénéficié ou Non
- Montant déjà cotisé (total et nombre de séances)
- Séances restantes avant son tour
- Tour estimé (numéro de séance)
- Prochaine cotisation (montant et date)
- Historique complet des cotisations

**Fonctionnalités**:
- Consultation de l'historique
- Affichage des défaillances avec pénalités
- Notification avant son tour
- Export de l'historique

**Critères d'Acceptation**:
1. THE Système SHALL afficher le statut de bénéfice du Membre
2. THE Système SHALL afficher le montant total cotisé
3. THE Système SHALL estimer le tour du Membre
4. THE Système SHALL afficher l'historique complet
5. THE Système SHALL notifier le Membre 2 séances avant son tour

### Tontine Vendable - Interfaces Détaillées

#### Interface Administrateur - Tableau de Bord Tontine Vendable

**Description**: Vue d'ensemble de la tontine vendable avec tous les indicateurs financiers.

**Éléments Affichés**:
- Intérêts primaires cumulés
- Intérêts secondaires cumulés
- Total intérêts générés
- Déjà distribués (ventes)
- Déjà utilisés (tours gratuits)
- Solde disponible pour vente
- Montant cagnotte complète
- Tours gratuits disponibles
- Montant manquant pour prochain tour gratuit

**Fonctionnalités**:
- Lancer enchère du tour
- Vendre les intérêts (lot unique ou multi-parts)
- Déclencher tour gratuit
- Consulter l'historique des ventes

**Critères d'Acceptation**:
1. THE Système SHALL afficher tous les indicateurs financiers
2. THE Système SHALL calculer le solde disponible pour vente
3. THE Système SHALL calculer les tours gratuits disponibles
4. THE Système SHALL permettre le lancement d'enchères
5. THE Système SHALL permettre la vente d'intérêts


#### Écran Enchère du Tour - Pendant la Séance

**Description**: Interface de gestion des enchères pour le tour du jour.

**Éléments Affichés**:
- Cagnotte disponible
- Enchère minimum
- Liste des offres reçues avec montants
- Montant que recevrait chaque enchérisseur
- Gagnant identifié (plus offrant)
- Intérêts générés

**Fonctionnalités**:
- Saisie des offres reçues en salle
- Calcul automatique du montant à recevoir
- Identification automatique du gagnant
- Validation et enregistrement
- Ajout des intérêts au cumul
- Affichage de l'écran des retenues pour le gagnant

**Critères d'Acceptation**:
1. THE Système SHALL permettre la saisie des offres
2. THE Système SHALL calculer automatiquement le montant à recevoir
3. THE Système SHALL identifier le plus offrant comme gagnant
4. WHEN l'enchère est validée, THE Système SHALL ajouter les intérêts au cumul
5. THE Système SHALL afficher l'écran des retenues pour le gagnant

#### Écran Vente des Intérêts - Lot Unique ou Multi-Parts

**Description**: Interface permettant de vendre les intérêts cumulés disponibles.

**Mode Lot Unique**:
- Une seule personne achète tous les intérêts disponibles
- Enchère unique avec plus offrant gagnant
- Génération d'intérêts secondaires

**Mode Multi-Parts**:
- Division des intérêts en N parts égales
- Enchère séparée pour chaque part
- Plusieurs gagnants possibles
- Génération d'intérêts secondaires pour chaque part

**Critères d'Acceptation**:
1. THE Système SHALL permettre le choix entre lot unique et multi-parts
2. WHEN lot unique, THE Système SHALL gérer une enchère unique
3. WHEN multi-parts, THE Système SHALL gérer N enchères séparées
4. THE Système SHALL calculer les intérêts secondaires générés
5. THE Système SHALL mettre à jour le solde disponible


#### Écran Tour Gratuit - Déclenchement

**Description**: Interface de gestion des tours gratuits lorsque le cumul d'intérêts atteint le montant d'une cagnotte complète.

**Éléments Affichés**:
- Intérêts cumulés
- Montant cagnotte
- Tours gratuits disponibles
- Reliquat après ce tour
- Explication du fonctionnement
- Planification de la date

**Fonctionnalités**:
- Planification du tour gratuit
- Notification automatique à tous les membres
- Gestion de l'enchère ou tirage au sort
- Pas de cotisation ce jour-là
- Paiement depuis les intérêts accumulés

**Critères d'Acceptation**:
1. WHEN les intérêts atteignent le montant d'une cagnotte, THE Système SHALL détecter automatiquement
2. THE Système SHALL permettre la planification du tour gratuit
3. WHEN le tour gratuit a lieu, THE Système SHALL notifier tous les membres
4. THE Système SHALL débiter les intérêts cumulés
5. THE Système SHALL conserver le reliquat pour le prochain tour

#### Interface Membre - Vue Tontine Vendable

**Description**: Vue permettant au membre de suivre sa participation à une tontine vendable.

**Éléments Affichés**:
- Statut de bénéfice
- Montant cotisé total
- Valeur garantie prêt disponible
- Séances restantes estimées
- Intérêts cumulés disponibles
- Tours gratuits disponibles
- Prochaine séance gratuite
- Formulaire de soumission d'offre d'enchère
- Formulaire d'achat d'intérêts
- Historique des enchères

**Fonctionnalités**:
- Soumission d'offre d'enchère en ligne
- Calcul automatique du montant à recevoir
- Consultation des intérêts disponibles
- Historique complet des enchères
- Notifications des résultats

**Critères d'Acceptation**:
1. THE Système SHALL afficher tous les indicateurs du Membre
2. THE Système SHALL permettre la soumission d'offres en ligne
3. THE Système SHALL calculer automatiquement le montant à recevoir
4. THE Système SHALL afficher l'historique complet
5. THE Système SHALL notifier le Membre des résultats d'enchères


## Déroulement d'une Séance Tontine Vendable

### Avant Séance

1. **Soumission des offres d'enchère**:
   - Les membres soumettent leurs offres via l'application
   - Les membres absents soumettent leurs dépôts en ligne avec preuves

2. **Préparation par le trésorier**:
   - Consultation des offres reçues en ligne
   - Préparation de la liste des cotisations attendues

### Pendant Séance

1. **Validation des dépôts en ligne**:
   - Le trésorier valide les dépôts en ligne soumis
   - Vérification des preuves de paiement

2. **Enregistrement des cotisations présents**:
   - Saisie rapide des cotisations des membres présents
   - Calcul en temps réel du total collecté

3. **Enchère du tour**:
   - Saisie des offres reçues en salle
   - Le système désigne automatiquement le gagnant (plus offrant)
   - Calcul des intérêts primaires
   - Affichage de l'écran des retenues pour le gagnant
   - Validation et enregistrement

4. **Recalcul du solde d'intérêts**:
   - Le système recalcule automatiquement le solde disponible
   - Détection des tours gratuits disponibles
   - Notification si tour gratuit disponible

5. **Vente d'intérêts (optionnel)**:
   - Si le président décide de vendre les intérêts disponibles
   - Choix du mode: lot unique ou multi-parts
   - Gestion des enchères
   - Calcul des intérêts secondaires
   - Mise à jour du solde

### Après Séance

1. **Saisie du rapport par le secrétaire**:
   - Rédaction du rapport de séance
   - Enregistrement des décisions prises

2. **Décharge et versement bancaire**:
   - Le trésorier effectue la décharge de la caisse
   - Versement à la banque si nécessaire

3. **Synchronisation offline**:
   - Si le réseau était coupé pendant la séance
   - Synchronisation automatique des données

4. **Notifications**:
   - Envoi des notifications à tous les membres
   - Récapitulatif de la séance
   - Confirmation des cotisations enregistrées
   - Résultats des enchères
   - Annonce du prochain tour gratuit si disponible


## Modèles de Données Additionnels

### Cession de Tour

```typescript
interface CessionTour {
  id: string;
  tenantId: string;
  tontineId: string;
  cedantId: string;        // Membre qui cède
  beneficiaireId: string;  // Membre qui reçoit
  tourOriginal: number;
  tourCede: number;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'VALIDEE' | 'REJETEE';
  dateProposition: Date;
  dateAcceptation?: Date;
  dateValidation?: Date;
  validateurId?: string;
  motif: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Moratoire

```typescript
interface Moratoire {
  id: string;
  tenantId: string;
  membreId: string;
  dateDebut: Date;
  dateFin: Date;
  motif: string;
  suspensionPenalites: boolean;
  suspensionCotisations: boolean;
  accordeParId: string;
  statut: 'ACTIF' | 'EXPIRE' | 'REVOQUE';
  createdAt: Date;
  updatedAt: Date;
}
```

### Cotisation Anticipée

```typescript
interface CotisationAnticipee {
  id: string;
  tenantId: string;
  membreId: string;
  montantTotal: Decimal;
  nombreSeances: number;
  seancesRestantes: number;
  dateEnregistrement: Date;
  statut: 'ACTIF' | 'EPUISE' | 'REMBOURSE';
  createdAt: Date;
  updatedAt: Date;
}
```

### Délégation

```typescript
interface Delegation {
  id: string;
  tenantId: string;
  roleDeleguant: Role;
  membreDeleguantId: string;
  membreDelegueId: string;
  dateDebut: Date;
  dateFin: Date;
  permissions: string[];
  statut: 'ACTIVE' | 'EXPIREE' | 'REVOQUEE';
  motif: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Réseau d'Associations

```typescript
interface Reseau {
  id: string;
  nom: string;
  description: string;
  associations: string[];  // IDs des tenants
  superAdminId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TransfertMembre {
  id: string;
  reseauId: string;
  membreId: string;
  tenantSourceId: string;
  tenantDestinationId: string;
  dateTransfert: Date;
  motif: string;
  donneesTransferees: any;
  statut: 'EN_COURS' | 'COMPLETE' | 'ECHOUE';
  createdAt: Date;
  updatedAt: Date;
}
```


### Conversion Devise

```typescript
interface TauxConversion {
  id: string;
  tenantId: string;
  deviseSource: string;  // EUR, USD, etc.
  deviseDestination: string;  // FCFA
  taux: Decimal;
  dateApplication: Date;
  miseAJourParId: string;
  source: 'MANUELLE' | 'AUTOMATIQUE';
  createdAt: Date;
}

interface TransactionDevise {
  id: string;
  tenantId: string;
  montantOriginal: Decimal;
  deviseOriginal: string;
  montantConverti: Decimal;
  deviseConvertie: string;
  tauxUtilise: Decimal;
  dateTransaction: Date;
  createdAt: Date;
}
```

### Vérification Mobile Money

```typescript
interface VerificationMobileMoney {
  id: string;
  tenantId: string;
  depotEnLigneId: string;
  operateur: 'MTN' | 'ORANGE' | 'WAVE';
  numeroTransaction: string;
  montantAttendu: Decimal;
  montantVerifie?: Decimal;
  destinataireAttendu: string;
  destinataireVerifie?: string;
  statut: 'EN_COURS' | 'VALIDE' | 'INVALIDE' | 'ERREUR';
  messageErreur?: string;
  dateVerification: Date;
  createdAt: Date;
}
```

## Endpoints API Additionnels

### Cessions de Tour

```
POST   /tontines/:id/cessions              # Proposer une cession
GET    /tontines/:id/cessions              # Liste des cessions
PATCH  /cessions/:id/accepter              # Accepter une cession (bénéficiaire)
PATCH  /cessions/:id/valider               # Valider une cession (admin)
PATCH  /cessions/:id/rejeter               # Rejeter une cession
```

### Moratoires

```
POST   /membres/:id/moratoire              # Accorder un moratoire
GET    /membres/:id/moratoire              # Consulter le moratoire actif
PATCH  /moratoires/:id/revoquer            # Révoquer un moratoire
GET    /moratoires                         # Liste des moratoires
```

### Cotisations Anticipées

```
POST   /cotisations-anticipees             # Enregistrer cotisation anticipée
GET    /membres/:id/cotisations-anticipees # Consulter le solde
GET    /cotisations-anticipees/:id         # Détails
```

### Délégations

```
POST   /delegations                        # Créer une délégation
GET    /delegations                        # Liste des délégations
PATCH  /delegations/:id/revoquer           # Révoquer une délégation
GET    /delegations/actives                # Délégations actives
```

### Réseaux

```
POST   /reseaux                            # Créer un réseau
GET    /reseaux                            # Liste des réseaux
POST   /reseaux/:id/transfert-membre       # Transférer un membre
POST   /reseaux/:id/don                    # Don entre associations
GET    /reseaux/:id/statistiques           # Statistiques agrégées
```

### Mobile Money

```
POST   /mobile-money/verifier              # Vérifier une transaction
GET    /mobile-money/verifications         # Historique des vérifications
```


## Priorités d'Implémentation

### Phase 1: Améliorations Critiques (Priorité Haute)

1. **Intégration des Tontines Détaillées** (Fonctionnalité existante à enrichir)
   - Interfaces administrateur pour gestion des enchères
   - Interfaces membre pour suivi et soumission d'offres
   - Gestion des retenues automatiques
   - Tours gratuits
   - Vente d'intérêts (lot unique et multi-parts)

2. **Cotisations Anticipées** (Nouvelle fonctionnalité)
   - Permet aux membres de cotiser à l'avance
   - Réduit les dépôts en ligne répétés
   - Améliore la trésorerie

3. **Rappels Intelligents Contextuels** (Amélioration)
   - Améliore l'expérience utilisateur
   - Réduit les défaillances
   - Personnalisation des notifications

### Phase 2: Améliorations Importantes (Priorité Moyenne)

4. **Cession de Tour** (Nouvelle fonctionnalité)
   - Répond à un besoin réel du terrain
   - Flexibilité pour les membres
   - Workflow de validation

5. **Moratoire** (Nouvelle fonctionnalité)
   - Gestion humaine des difficultés
   - Fidélisation des membres
   - Suspension temporaire des obligations

6. **Statistiques et Tableaux de Bord Visuels** (Amélioration)
   - Aide au pilotage
   - Visualisations graphiques
   - Exports

7. **Archivage des Cycles** (Amélioration)
   - Mémoire institutionnelle
   - Audit trail complet
   - Statistiques historiques

### Phase 3: Améliorations Avancées (Priorité Basse)

8. **Intégration Mobile Money** (Nouvelle fonctionnalité)
   - Automatisation de la vérification
   - Réduction des fraudes
   - Nécessite intégration API externe

9. **Gestion Multi-Devises** (Nouvelle fonctionnalité)
   - Pour associations avec diaspora
   - Conversion automatique
   - Gestion des taux

10. **Mode Délégation** (Nouvelle fonctionnalité)
    - Gestion des absences
    - Continuité de service
    - Traçabilité

11. **Réseau d'Associations** (Nouvelle fonctionnalité)
    - Fonctionnalité avancée
    - Nécessite architecture spécifique
    - Super-administrateur

## Conclusion

Ces 10 nouvelles fonctionnalités et les spécifications détaillées des tontines enrichissent considérablement le système de gestion d'association. Elles ont été conçues pour répondre aux besoins réels des associations camerounaises et améliorer l'expérience utilisateur.

L'implémentation devra suivre les priorités définies, en commençant par les améliorations critiques qui apportent le plus de valeur immédiate aux utilisateurs.

