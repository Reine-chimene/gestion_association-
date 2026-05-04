'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Coins, Users, Calendar, TrendingUp, ArrowLeft, Loader2, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Tontine {
  id: string;
  nom: string;
  type: string;
  montantCotisation: number;
  frequence: string;
  statut: string;
  cycleActuel: number;
  dateDebut: string;
  participants: Array<{
    id: string;
    membreId: string;
    membre: {
      nom: string;
      prenom: string;
      numeroMembre: string;
    };
    nombreParts: number;
    ordre: number;
    aBeneficie?: boolean;
  }>;
}

export default function TontineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadTontine();
    }
  }, [params.id]);

  const loadTontine = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tontines/${params.id}`);
      setTontine(response.data);
    } catch (err: any) {
      console.error('Erreur lors du chargement de la tontine:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la tontine');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      CLASSIQUE_NON_VENDABLE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      VENDABLE_ENCHERE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      VENTE_INTERETS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      HYBRIDE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return styles[type as keyof typeof styles] || styles.CLASSIQUE_NON_VENDABLE;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      CLASSIQUE_NON_VENDABLE: 'Classique (Non Vendable)',
      VENDABLE_ENCHERE: 'Vendable aux Enchères',
      VENTE_INTERETS: 'Vente d\'Intérêts',
      HYBRIDE: 'Hybride',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getFrequenceLabel = (frequence: string) => {
    const labels = {
      JOURNALIERE: 'Journalière',
      HEBDOMADAIRE: 'Hebdomadaire',
      MENSUELLE: 'Mensuelle',
    };
    return labels[frequence as keyof typeof labels] || frequence;
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

  if (error || !tontine) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/tontines')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux tontines</span>
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-400">{error || 'Tontine introuvable'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalParts = (tontine.participants || []).reduce((sum, p) => sum + p.nombreParts, 0);
  const montantTotal = tontine.montantCotisation * totalParts;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/tontines')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux tontines</span>
          </button>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          </div>
        </div>

        {/* Titre et Badge */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tontine.nom}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Créée le {new Date(tontine.dateDebut).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTypeBadge(tontine.type)}`}>
              {getTypeLabel(tontine.type)}
            </span>
          </div>

          {/* Stats principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-400 mb-1">Cotisation</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                {tontine.montantCotisation.toLocaleString()} FCFA
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
              <p className="text-sm text-orange-700 dark:text-orange-400 mb-1">Fréquence</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                {getFrequenceLabel(tontine.frequence)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
              <p className="text-sm text-purple-700 dark:text-purple-400 mb-1">Cycle Actuel</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                {tontine.cycleActuel}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Statut</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {tontine.statut}
              </p>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Participants ({(tontine.participants || []).length})
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total des parts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalParts}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ordre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Numéro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Membre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Parts</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant/Tour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(tontine.participants || [])
                  .sort((a, b) => a.ordre - b.ordre)
                  .map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                        #{participant.ordre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {participant.membre.numeroMembre}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-semibold text-xs">
                              {participant.membre.prenom?.charAt(0)}{participant.membre.nom?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {participant.membre.nom} {participant.membre.prenom}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {participant.nombreParts}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">
                        {(tontine.montantCotisation * participant.nombreParts).toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    {totalParts}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-gray-900 dark:text-white">
                    {montantTotal.toLocaleString()} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Actions Rapides</h2>

          {/* Bénéficiaire actuel */}
          {tontine.statut === 'ACTIVE' && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>Prochain bénéficiaire:</strong> {tontine.participants?.find(p => !p.aBeneficie)?.membre?.nom || 'Calcul en cours...'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/tontines/${params.id}/collecter`)}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span>Collecter Cotisations</span>
            </button>

            {tontine.type === 'VENDABLE_ENCHERE' && (
              <>
                <button
                  onClick={() => router.push(`/tontines/${params.id}/vendre-tour`)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Vendre un Tour</span>
                </button>
                <button
                  onClick={() => router.push(`/tontines/${params.id}/vendre-interets`)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Coins className="w-5 h-5" />
                  <span>Vendre Intérêts</span>
                </button>
              </>
            )}

            {tontine.type === 'VENTE_INTERETS' && (
              <button
                onClick={() => router.push(`/tontines/${params.id}/vendre-interets`)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Coins className="w-5 h-5" />
                <span>Vendre Intérêts</span>
              </button>
            )}

            {(tontine.type === 'CLASSIQUE_NON_VENDABLE' || tontine.type === 'HYBRIDE') && (
              <button
                onClick={() => router.push(`/tontines/${params.id}/distribuer`)}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Distribuer Cagnotte</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}