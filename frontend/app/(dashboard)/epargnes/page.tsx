'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Wallet, Plus, Loader2, TrendingUp, Calendar, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Epargne {
  id: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  cycleActuel: number;
  statut: string;
  totalCollecte: number;
  cotisations: Array<{
    id: string;
    montant: number;
    date: string;
    membre: {
      numeroMembre: string;
      nom: string;
      prenom: string;
    };
  }>;
  _count: {
    cotisations: number;
  };
}

interface Stats {
  total: number;
  actives: number;
  cloturees: number;
  totalCollecteAnnuelle: number;
  totalCollecteScolaire: number;
  totalCollecte: number;
}

export default function EpargnesPage() {
  const [epargnes, setEpargnes] = useState<Epargne[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filterType]);

   const loadData = async () => {
     try {
       setLoading(true);
       setError(null);
       
       const params: any = {};
       if (filterType) params.type = filterType;

       const [epargnesResponse, statsResponse] = await Promise.all([
         api.get('/epargnes', { params }).catch(err => {
           console.error('Erreur /epargnes:', err.message);
           return { data: [] };
         }),
         api.get('/epargnes/statistiques/global').catch(err => {
           console.error('Erreur /epargnes/statistiques/global:', err.message);
           return { data: null };
         }),
       ]);

       setEpargnes(Array.isArray(epargnesResponse.data) ? epargnesResponse.data : []);
       setStats(statsResponse.data);
     } catch (err: any) {
       console.error('Erreur lors du chargement des épargnes:', err);
       setError(err.response?.data?.message || 'Erreur lors du chargement des épargnes');
     } finally {
       setLoading(false);
     }
   };

  const getTypeLabel = (type: string) => {
    const labels = {
      ANNUELLE: 'Annuelle',
      SCOLAIRE: 'Scolaire',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      ACTIF: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CLOTURE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return styles[statut as keyof typeof styles] || styles.ACTIF;
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      ACTIF: 'Active',
      CLOTURE: 'Clôturée',
    };
    return labels[statut as keyof typeof labels] || statut;
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
              <Wallet className="w-8 h-8 mr-3" />
              Gestion des Épargnes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les épargnes annuelles et scolaires
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            <span>Nouvelle Cotisation</span>
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Épargnes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Actives</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.actives}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Épargne Annuelle</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.totalCollecteAnnuelle.toLocaleString()} FCFA
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Épargne Scolaire</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.totalCollecteScolaire.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrer par type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous</option>
              <option value="ANNUELLE">Annuelle</option>
              <option value="SCOLAIRE">Scolaire</option>
            </select>
          </div>
        </div>

        {/* Épargnes List */}
        {epargnes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune épargne
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par enregistrer une première cotisation
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
              Nouvelle Cotisation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {epargnes.map((epargne) => (
              <div
                key={epargne.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Épargne {getTypeLabel(epargne.type)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cycle {epargne.cycleActuel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatutBadge(epargne.statut)}`}>
                    {getStatutLabel(epargne.statut)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total collecté</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {epargne.totalCollecte.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cotisations</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {epargne._count.cotisations}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date début</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(epargne.dateDebut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date fin</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(epargne.dateFin)}
                    </p>
                  </div>
                </div>

                {/* Dernières cotisations */}
                {epargne.cotisations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Dernières cotisations:
                    </p>
                    <div className="space-y-2">
                      {epargne.cotisations.slice(0, 3).map((cotisation) => (
                        <div
                          key={cotisation.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {cotisation.membre.prenom} {cotisation.membre.nom}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({cotisation.membre.numeroMembre})
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-semibold text-green-600">
                              {Number(cotisation.montant).toLocaleString()} FCFA
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(cotisation.date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                    Ajouter Cotisation
                  </button>
                  <button className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                    Voir Détails
                  </button>
                  {epargne.statut === 'ACTIF' && (
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Redistribuer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
