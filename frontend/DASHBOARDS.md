# Dashboards de l'Application

## 🎯 Dashboards Différenciés par Rôle

L'application dispose de TROIS dashboards distincts selon le rôle de l'utilisateur :

### 1. Dashboard Président (`/president`)

**Accessible par** : Utilisateurs avec le rôle `PRESIDENT`

**Autorité Suprême** : Le président a accès à TOUT ce que font le trésorier et le secrétaire, plus des fonctionnalités exclusives de gouvernance.

#### 📊 Vue d'Ensemble Complète
- **Membres Actifs** : Total + membres en observation
- **Caisse Totale** : Fonds + Sanctions + Épargne (vue consolidée)
- **Tontines Actives** : Total + tontines en enchères
- **Prêts en Cours** : Total + prêts en retard

#### 🔔 Alertes & Validations Requises
**En Attente de Validation** :
- Nouvelles inscriptions de membres
- Demandes de prêts (montants importants)
- Demandes d'aides (maladie/décès)
- Modifications sensibles (nom, CNI)

**Situations Critiques** :
- Prêts en retard (recouvrement forcé)
- Membres irréguliers (action requise)
- Dépôts en ligne en attente

#### ⚙️ Gouvernance & Contrôle (8 Modules Principaux)

**1. Paramétrage de l'Association** (Module Principal - Violet)
- Configuration des règles globales
- Pourcentage de garantie pour prêts
- Nombre max de reconductions
- Activation recouvrement forcé
- Nombre max d'absences avant sanction
- Âge max enfants pour aides
- Jours min hospitalisation aide maladie
- Ordre désignation commissionnaires
- Activation dépôt en ligne + délai
- Taux d'intérêt par tranches

**2. Gestion des Membres**
- Validation nouvelles inscriptions
- Changement de statut (Actif → Observation/Démissionnaire/Muté)
- Fixation dates période d'observation
- Traitement modifications sensibles
- Clôture dossiers (démissions/mutations)
- Transfert vers autres associations
- Solde de tout compte

**3. Gestion des Tontines**
- Création (vendable/non vendable)
- Configuration taux (fixe/variable)
- Ouverture/clôture sessions d'enchères
- Vente intérêts cumulés (lot unique/division)
- Lancement tours gratuits
- Fixation ordre bénéficiaires

**4. Gestion des Prêts**
- Approbation/refus demandes
- Définition règles de délégation
- Déclenchement recouvrement forcé manuel
- Dérogations exceptionnelles
- Extension délais
- Réduction pénalités

**5. Aides & Dons**
- Création types d'aide
- Configuration conditions d'éligibilité
- Validation demandes
- Organisation visites condoléances
- Validation dons externes
- Dérogations exceptionnelles

**6. Projets Communautaires**
- Création projets (court/moyen/long terme)
- Mode contribution (volontaire/obligatoire)
- Configuration phases et dates limites
- Projets éphémères (nouveaux membres exemptés)
- Suivi avancement
- Clôture projets

**7. Votes & Décisions d'Assemblée**
- Soumission décisions au vote
- Rédaction objets et arguments
- Clôture votes
- Validation procès-verbaux
- Décisions exécutoires urgentes

**8. Rapports & Exports**
- Accès à TOUT
- Situation financière de chaque membre
- État caisses en temps réel
- Membres en retard/irréguliers
- Prêts à échéance
- Historique complet opérations
- Génération rapports à tout moment

#### 💰 Fonctionnalités Financières Exclusives
- **Augmentation Fonds** : Par intérêts, versement, retenue, redistribution
- **Cassation Fonds** : Quand trop élevés, redistribution par membre
- **Résolution Conflits** : Synchronisation offline

### 2. Dashboard Membre (`/membre`)

**Accessible par** : Utilisateurs avec le rôle `MEMBRE`

**Fonctionnalités principales** :

#### 📊 Situation Financière Globale
- **Avoir Total** : Fonds + Cotisations non bénéficiées + Épargnes
- **Dette Totale** : Prêts en cours + Intérêts + Sanctions + Complément fonds
- **Situation Nette** : Avoir - Dette (ce qui reste au membre)

#### 🔔 Alertes & Échéances
- Prochaine séance avec montants attendus
- Prêts dont l'échéance approche (7 jours)
- Sanctions non payées
- Dépôts en ligne en attente de validation
- Notifications non lues

#### 🚀 Accès Rapide (8 modules)
1. **Mes Tontines** : Consultation, enchères, vente d'intérêts
2. **Mes Prêts** : Demandes, suivi, remboursements, avaliste
3. **Mes Épargnes** : Consultation, prêts sur épargne
4. **Dépôt en Ligne** : Soumettre paiements quand absent
5. **Mes Sanctions** : Consultation, paiement, contestation
6. **Projets** : Contributions volontaires/obligatoires
7. **Mon Profil** : Informations personnelles, enfants, préférences
8. **Mes Relevés** : Téléchargement PDF de tous les documents

#### 📱 Fonctionnalités Détaillées du Membre

**Tontines** :
- Voir position dans l'ordre des bénéficiaires
- Montant cotisé et restant à cotiser
- Soumettre offres d'enchères (tontine vendable)
- Vendre intérêts cumulés
- Historique complet séance par séance

**Prêts** :
- Demander un prêt (fonds, tontine, épargne, mensuel, collectif)
- Désigner avalistes
- Upload garanties matérielles
- Suivi en temps réel (solde, intérêts, échéances)
- Remboursement via dépôt en ligne
- Se porter avaliste pour d'autres membres

**Dépôt en Ligne** (fonctionnalité clé pour absents) :
- Soumettre avant date limite
- Types : cotisation, remboursement, sanction, complément, projet, épargne
- Upload preuve de paiement
- Suivi statut : soumis → validé/rejeté
- Reçu numérique téléchargeable

**Sanctions** :
- Liste complète avec détails
- Paiement via dépôt en ligne
- Contestation avec justification

**Projets Communautaires** :
- Voir tous les projets (court/moyen/long terme)
- Contribution volontaire ou obligatoire
- Suivi des phases et montants

**Commissions** :
- Notification quand c'est son tour
- Confirmer disponibilité
- Historique des commissions effectuées

**Votes** :
- Recevoir notifications de nouveaux votes
- Voter : pour, contre, abstention
- Voir résultats et procès-verbaux

**Relevés & Documents** :
- Relevé de cotisations (toutes tontines)
- Relevé de prêts
- Relevé d'épargnes
- Relevé de sanctions
- Reçus de dépôts validés
- État de situation nette
- Téléchargement PDF

### 3. Dashboard Administrateur (`/dashboard`)

**Accessible par** : Utilisateurs avec les rôles `TRESORIER`, `SECRETAIRE`, `COMMISSAIRE`

**Fonctionnalités principales** :

#### 📊 Vue d'Ensemble
- **Membres Actifs** : Nombre total de membres actifs
- **Tontines Actives** : Nombre de tontines en cours
- **Prêts en Cours** : Nombre de prêts actifs
- **Caisse Totale** : Solde global de toutes les caisses

#### ⚡ Actions Rapides
- Créer une nouvelle tontine
- Ajouter un membre
- Créer une séance
- Valider dépôts en ligne
- Gérer les sanctions
- Approuver les prêts

#### 🔔 Alertes Administrateur
- Prêts en retard
- Dépôts en attente de validation
- Membres en situation irrégulière
- Caisses faibles
- Échéances importantes

#### 📈 Gestion Complète
- **Membres** : CRUD, changement statut, situation nette
- **Tontines** : Création, collecte, distribution, enchères
- **Prêts** : Validation, suivi, recouvrement
- **Caisses** : Mouvements, décharges, versements bancaires
- **Séances** : Création, présences, cotisations, PV
- **Sanctions** : Configuration types, application, annulation
- **Projets** : Création, suivi, contributions
- **Aides** : Validation maladie/décès, commissionnaires
- **Votes** : Création, résultats, PV signés
- **Rapports** : Exports, statistiques, bilans

## 🔄 Redirection Automatique

Lors de la connexion, l'utilisateur est automatiquement redirigé vers le dashboard approprié :

```typescript
// Dans /dashboard/page.tsx
if (user.role === 'MEMBRE') {
  router.push('/membre');
} else if (user.role === 'PRESIDENT') {
  router.push('/president');
} else {
  // TRESORIER, SECRETAIRE, COMMISSAIRE restent sur /dashboard
}
```

## 🎨 Design

**Dashboard Président** :
- Header avec dégradé indigo/violet
- Badge "Autorité Suprême"
- Module Paramétrage en vedette (dégradé violet)
- Alertes critiques prioritaires
- Vue d'ensemble complète
- Design professionnel et puissant

**Dashboard Membre** :
- Design moderne et coloré
- Cartes avec dégradés
- Icônes intuitives
- Navigation simplifiée
- Focus sur les informations personnelles

**Dashboard Admin** :
- Design professionnel
- Vue d'ensemble claire
- Actions rapides accessibles
- Alertes prioritaires
- Outils de gestion avancés

## 📱 Responsive

Les deux dashboards sont entièrement responsive :
- **Mobile** : Navigation optimisée, cartes empilées
- **Tablet** : Grille 2 colonnes
- **Desktop** : Grille 4 colonnes, vue complète

## 🔐 Sécurité

- Authentification JWT requise
- Vérification du rôle côté serveur
- Isolation des données par tenant
- Row-Level Security PostgreSQL
