'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Coins, Users, Calendar, ArrowLeft, Loader2, Check, X } from 'lucide-react';
import api from '@/lib/api';

interface Participant {
  id: string;
  membreId: string;
  membre: {
    nom: string;
    prenom: string;
    numeroMembre: string;
  };
  nombreParts: number;
  ordre: number;
}

interface Tontine {
  id: string;
  nom: string;
  type: string;
  montantCotisation: number;
  frequence: string;
  statut: string;
  cycleActuel: number;
  participants: Participant[];
}

export default function CollecterCotisationsPage() {
  const params = useParams();
  const router = useRouter();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cotisations, setCotisations] = useState<Record<string, boolean>>({});

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
      // Initialiser toutes les cotisations à false
      const initialCotisations: Record<string, boolean> = {};
      (response.data.participants || []).forEach((p: Participant) => {
        initialCotisations[p.membreId] = false;
      });
      setCotisations(initialCotisations);
    } catch (err: any) {
      console.error('Erreur lors du chargement de la tontine:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la tontine');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!tontine) return;

    try {
      setSubmitting(true);
      setError(null);

      const cotisationsData = Object.entries(cotisations).map(([membreId, paye]) => ({
        membreId,
        paye,
      }));

      await api.post(`/tontines/${params.id}/collecter-cotisations`, {
        cotisations: cotisationsData,
      });

      router.push(`/tontines/${params.id}`);
    } catch (err: any) {
      console.error('Erreur lors de la collecte:', err);
      setError(err.response?.data?.message || 'Erreur lors de la collecte');
    } finally {
      setSubmitting(false);
    }
  };

  const getFrequenceLabel = (frequence: string) => {
    const labels = {
      JOURNALIERE: 'Journalière',
      HEBDOMADAIRE: 'Hebdomadaire',
      MENSUELLE: 'Mensuelle',
    };
    return labels[frequence as keyof typeof labels] || frequence;
  };

  const totalParts = (tontine?.participants || []).reduce((sum, p) => sum + p.nombreParts, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !tontine) {
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
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/tontines/${params.id}`)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux détails</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tontine?.nom}</h1>
              <p className="text-gray-600 dark:text-gray-400">Cycle {tontine?.cycleActuel} - {getFrequenceLabel(tontine?.frequence || '')}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Marquer les cotisations</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ordre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Membre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Parts</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(tontine?.participants || [])
                  .sort((a, b) => a.ordre - b.ordre)
                  .map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                        #{participant.ordre}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {participant.membre.nom} {participant.membre.prenom}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">{participant.membre.numeroMembre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {participant.nombreParts}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">
                        {(tontine?.montantCotisation || 0) * participant.nombreParts} FCFA
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            setCotisations({
                              ...cotisations,
                              [participant.membreId]: !cotisations[participant.membreId],
                            })
                          }
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            cotisations[participant.membreId]
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {cotisations[participant.membreId] ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{totalParts}</td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-gray-900 dark:text-white">
                    {(tontine?.montantCotisation || 0) * totalParts} FCFA
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => router.push(`/tontines/${params.id}`)}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Collecter les cotisations'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}