'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Calendar, Plus, Loader2, Users, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Seance {
  id: string;
  date: string;
  statut: string;
  rapportSeance?: string;
  presences: Array<{
    id: string;
    present: boolean;
    justification?: string;
    membre: {
      id: string;
      nom: string;
      prenom: string;
    };
  }>;
  procesVerbal?: {
    id: string;
    contenu: string;
    dateCreation: string;
  };
}

export default function SeancesPage() {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('');

  useEffect(() => {
    loadSeances();
  }, [filterStatut]);

  const loadSeances = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/seances');
      
      // Ensure response.data is an array
      const seancesData = Array.isArray(response.data) ? response.data : [];
      
      // Apply filter if needed
      const filteredSeances = filterStatut
        ? seancesData.filter((s: Seance) => s.statut === filterStatut)
        : seancesData;
      
      setSeances(filteredSeances);
    } catch (err: any) {
      console.error('Erreur lors du chargement des séances:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des séances');
      setSeances([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      EN_COURS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      CLOTUREE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return styles[statut as keyof typeof styles] || styles.EN_COURS;
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      EN_COURS: 'En cours',
      CLOTUREE: 'Clôturée',
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculatePresenceRate = (seance: Seance) => {
    if (!seance.presences || seance.presences.length === 0) return 0;
    const presents = seance.presences.filter(p => p.present).length;
    return (presents / seance.presences.length) * 100;
  };

  const totalSeances = seances.length;
  const seancesEnCours = seances.filter(s => s.statut === 'EN_COURS').length;
  const seancesCloturees = seances.filter(s => s.statut === 'CLOTUREE').length;

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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Erreur de chargement
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
          <button
            onClick={loadSeances}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
              <Calendar className="w-8 h-8 mr-3" />
              Gestion des Séances
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les séances et les présences
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            <span>Nouvelle Séance</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Séances</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalSeances}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">En Cours</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{seancesEnCours}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Clôturées</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{seancesCloturees}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrer par statut:
            </label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous</option>
              <option value="EN_COURS">En cours</option>
              <option value="CLOTUREE">Clôturées</option>
            </select>
          </div>
        </div>

        {/* Séances List */}
        {seances.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune séance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer votre première séance
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
              Créer une séance
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {seances.map((seance) => {
              const presenceRate = calculatePresenceRate(seance);
              const presents = seance.presences?.filter(p => p.present).length || 0;
              const absents = (seance.presences?.length || 0) - presents;

              return (
                <div
                  key={seance.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Séance du {formatDate(seance.date)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatTime(seance.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatutBadge(seance.statut)}`}>
                      {getStatutLabel(seance.statut)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Présents</p>
                      <p className="text-lg font-semibold text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {presents}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Absents</p>
                      <p className="text-lg font-semibold text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        {absents}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Taux de présence</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {presenceRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${presenceRate}%` }}
                      />
                    </div>
                  </div>

                  {seance.rapportSeance && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        <FileText className="w-4 h-4 inline mr-1" />
                        {seance.rapportSeance}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {seance.statut === 'EN_COURS' && (
                      <>
                        <button className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                          Enregistrer Présences
                        </button>
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Clôturer
                        </button>
                      </>
                    )}
                    {seance.statut === 'CLOTUREE' && (
                      <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        Voir Procès-Verbal
                      </button>
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
