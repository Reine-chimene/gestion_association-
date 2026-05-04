'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Gavel, Plus, Loader2, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Sanction {
  id: string;
  montant: number;
  motif: string;
  statut: string;
  dateApplication: string;
  datePaiement?: string;
  membre: {
    id: string;
    numeroMembre: string;
    nom: string;
    prenom: string;
  };
  typeSanction: {
    id: string;
    nom: string;
    modeCalcul: string;
  };
}

export default function SanctionsPage() {
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('');

  useEffect(() => {
    loadSanctions();
  }, [filterStatut]);

  const loadSanctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filterStatut) {
        params.append('statut', filterStatut);
      }
      
      const response = await api.get(`/sanctions?${params.toString()}`);
      
      // Ensure response.data is an array
      const sanctionsData = Array.isArray(response.data) ? response.data : [];
      setSanctions(sanctionsData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des sanctions:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des sanctions');
      setSanctions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      IMPAYEE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      PAYEE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      ANNULEE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return styles[statut as keyof typeof styles] || styles.IMPAYEE;
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      IMPAYEE: 'Impayée',
      PAYEE: 'Payée',
      ANNULEE: 'Annulée',
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const getModeCalculLabel = (mode: string) => {
    const labels = {
      FIXE: 'Montant fixe',
      POURCENTAGE: 'Pourcentage',
      PROGRESSIF: 'Progressif',
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const totalSanctions = sanctions.length;
  const totalImpayees = sanctions.filter(s => s.statut === 'IMPAYEE').length;
  const totalPayees = sanctions.filter(s => s.statut === 'PAYEE').length;
  const montantTotal = sanctions.filter(s => s.statut === 'IMPAYEE').reduce((sum, s) => sum + s.montant, 0);

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
            onClick={loadSanctions}
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
              <Gavel className="w-8 h-8 mr-3" />
              Gestion des Sanctions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les sanctions et pénalités
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            <span>Configurer Type</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Sanctions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalSanctions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Impayées</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalImpayees}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Payées</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalPayees}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Montant Dû</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {montantTotal.toLocaleString()} FCFA
            </p>
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
              <option value="IMPAYEE">Impayées</option>
              <option value="PAYEE">Payées</option>
              <option value="ANNULEE">Annulées</option>
            </select>
          </div>
        </div>

        {/* Sanctions List */}
        {sanctions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune sanction
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aucune sanction n'a été appliquée
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sanctions.map((sanction) => (
              <div
                key={sanction.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Gavel className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {sanction.membre.prenom} {sanction.membre.nom}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sanction.membre.numeroMembre} • {sanction.typeSanction.nom}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatutBadge(sanction.statut)}`}>
                    {getStatutLabel(sanction.statut)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Montant</p>
                    <p className="text-lg font-semibold text-red-600">
                      {sanction.montant.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mode de calcul</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getModeCalculLabel(sanction.typeSanction.modeCalcul)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date application</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(sanction.dateApplication)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Motif:</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {sanction.motif}
                  </p>
                </div>

                {sanction.datePaiement && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-400">
                      Payée le {formatDate(sanction.datePaiement)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  {sanction.statut === 'IMPAYEE' && (
                    <>
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Marquer Payée
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        Annuler
                      </button>
                    </>
                  )}
                  <button className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                    Voir Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
