'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { HandHeart, Plus, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Aide {
  id: string;
  type: string;
  typeBeneficiaire: string;
  montant: number;
  statut: string;
  dateDeclaration: string;
  dateApprobation?: string;
  justificatifs: string[];
  beneficiaire: {
    numeroMembre: string;
    nom: string;
    prenom: string;
  };
}

interface Stats {
  total: number;
  enAttente: number;
  approuvees: number;
  rejetees: number;
  totalMaladie: number;
  totalDeces: number;
  montantTotal: number;
}

export default function AidesPage() {
  const [aides, setAides] = useState<Aide[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filterType, filterStatut]);

   const loadData = async () => {
     try {
       setLoading(true);
       setError(null);
       
       const params: any = {};
       if (filterType) params.type = filterType;
       if (filterStatut) params.statut = filterStatut;

       const [aidesResponse, statsResponse] = await Promise.all([
         api.get('/aides', { params }).catch(err => {
           console.error('Erreur /aides:', err.message);
           return { data: [] };
         }),
         api.get('/aides/statistiques/global').catch(err => {
           console.error('Erreur /aides/statistiques/global:', err.message);
           return { data: null };
         }),
       ]);

       setAides(Array.isArray(aidesResponse.data) ? aidesResponse.data : []);
       setStats(statsResponse.data);
     } catch (err: any) {
       console.error('Erreur lors du chargement des aides:', err);
       setError(err.response?.data?.message || 'Erreur lors du chargement des aides');
     } finally {
       setLoading(false);
     }
   };

  const getTypeLabel = (type: string) => {
    const labels = {
      MALADIE: 'Maladie',
      DECES: 'Décès',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBeneficiaireLabel = (type: string) => {
    const labels = {
      MEMBRE: 'Membre',
      CONJOINT: 'Conjoint',
      PARENT: 'Parent',
      ENFANT: 'Enfant',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROUVEE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      REJETEE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      VERSEE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return styles[statut as keyof typeof styles] || styles.EN_ATTENTE;
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      EN_ATTENTE: 'En attente',
      APPROUVEE: 'Approuvée',
      REJETEE: 'Rejetée',
      VERSEE: 'Versée',
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const getStatutIcon = (statut: string) => {
    const icons = {
      EN_ATTENTE: Clock,
      APPROUVEE: CheckCircle,
      REJETEE: XCircle,
      VERSEE: CheckCircle,
    };
    return icons[statut as keyof typeof icons] || Clock;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
          <button 
            onClick={loadData}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <HandHeart className="w-8 h-8 mr-3" />
              Gestion des Aides
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les aides maladie et décès
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
              <Plus className="w-5 h-5" />
              <span>Aide Maladie</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all">
              <Plus className="w-5 h-5" />
              <span>Déclarer Décès</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Aides</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.enAttente}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Approuvées</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approuvees}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant Total</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.montantTotal.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrer:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous les types</option>
              <option value="MALADIE">Maladie</option>
              <option value="DECES">Décès</option>
            </select>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="APPROUVEE">Approuvées</option>
              <option value="REJETEE">Rejetées</option>
            </select>
          </div>
        </div>

        {/* Aides List */}
        {aides.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <HandHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune aide
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer une demande d'aide
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {aides.map((aide) => {
              const StatutIcon = getStatutIcon(aide.statut);

              return (
                <div
                  key={aide.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <HandHeart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Aide {getTypeLabel(aide.type)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {aide.beneficiaire.prenom} {aide.beneficiaire.nom} ({aide.beneficiaire.numeroMembre})
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatutBadge(aide.statut)}`}>
                      <StatutIcon className="w-3 h-3" />
                      <span>{getStatutLabel(aide.statut)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Type bénéficiaire</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {getTypeBeneficiaireLabel(aide.typeBeneficiaire)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Montant</p>
                      <p className="text-lg font-semibold text-green-600">
                        {aide.montant.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date déclaration</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(aide.dateDeclaration)}
                      </p>
                    </div>
                  </div>

                  {/* Justificatifs */}
                  {aide.justificatifs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Justificatifs: {aide.justificatifs.length} document(s)
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {aide.statut === 'EN_ATTENTE' && (
                      <>
                        <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          Approuver
                        </button>
                        <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                          Rejeter
                        </button>
                      </>
                    )}
                    <button className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                      Voir Détails
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
