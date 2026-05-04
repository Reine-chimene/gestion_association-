'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Coins, Users, ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface Participant {
  id: string;
  membreId: string;
  nombreParts: number;
  ordre: number;
  membre: {
    id: string;
    nom: string;
    prenom: string;
    numeroMembre: string;
  };
}

interface Tontine {
  id: string;
  nom: string;
  montantCotisation: number;
  participants: Participant[];
}

export default function VendreTourPage() {
  const params = useParams();
  const router = useRouter();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTour, setSelectedTour] = useState<number>(1);
  const [acheteurId, setAcheteurId] = useState<string>('');
  const [montantOffre, setMontantOffre] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      loadTontine();
    }
  }, [params.id]);

  const loadTontine = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tontines/${params.id}`);
      setTontine(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!tontine || !acheteurId || !montantOffre) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/tontines/${params.id}/vendre-tour`, {
        acheteurId,
        tourOriginal: selectedTour,
        montantOffre: parseFloat(montantOffre),
      });

      alert('Tour vendu avec succès!');
      router.push(`/tontines/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la vente');
    } finally {
      setSubmitting(false);
    }
  };

  const totalParts = (tontine?.participants || []).reduce((sum, p) => sum + p.nombreParts, 0);
  const cagnotteComplete = (tontine?.montantCotisation || 0) * totalParts;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push(`/tontines/${params.id}`)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Vendre un Tour - {tontine?.nom}
          </h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p className="font-semibold text-gray-900 dark:text-white">
              Cagnotte complète: {cagnotteComplete.toLocaleString()} FCFA
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Les intérêts seront calculés automatiquement</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                Tour à vendre (numéro d'ordre)
              </label>
              <select
                value={selectedTour}
                onChange={(e) => setSelectedTour(parseInt(e.target.value))}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {(tontine?.participants || []).map((p) => (
                  <option key={p.ordre} value={p.ordre} className="bg-white dark:bg-gray-700">
                    Tour #{p.ordre} - {p.membre?.nom} {p.membre?.prenom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">Acheteur</label>
              <select
                value={acheteurId}
                onChange={(e) => setAcheteurId(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" className="bg-white dark:bg-gray-700">-- Sélectionner --</option>
                {(tontine?.participants || []).map((p) => (
                  <option key={p.membre.id} value={p.membre.id} className="bg-white dark:bg-gray-700">
                    {p.membre.numeroMembre} - {p.membre.nom} {p.membre.prenom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                Montant de l'offre (FCFA)
              </label>
              <input
                type="number"
                value={montantOffre}
                onChange={(e) => setMontantOffre(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: 900000"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Les intérêts = Cagnotte - Offre = {(cagnotteComplete - (parseFloat(montantOffre) || 0)).toLocaleString()} FCFA
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !acheteurId || !montantOffre}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Vendre le Tour'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}