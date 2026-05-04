'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Coins, ArrowLeft, Loader2, Check } from 'lucide-react';
import api from '@/lib/api';

interface Participant {
  id: string;
  membreId: string;
  nombreParts: number;
  ordre: number;
  aBeneficie?: boolean;
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
  cycleActuel: number;
}

export default function DistribuerPage() {
  const params = useParams();
  const router = useRouter();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [retenuesPrets, setRetenuesPrets] = useState<string>('0');
  const [retenuesSanctions, setRetenuesSanctions] = useState<string>('0');
  const [retenuesComplement, setRetenuesComplement] = useState<string>('0');

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
    if (!tontine) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/tontines/${params.id}/distribuer-cagnotte`, {
        retenuesPrets: parseFloat(retenuesPrets) || 0,
        retenuesSanctions: parseFloat(retenuesSanctions) || 0,
        retenuesComplementFonds: parseFloat(retenuesComplement) || 0,
      });

      alert('Cagnotte distribuée avec succès!');
      router.push(`/tontines/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la distribution');
    } finally {
      setSubmitting(false);
    }
  };

  const totalParts = (tontine?.participants || []).reduce((sum, p) => sum + p.nombreParts, 0);
  const cagnotteComplete = (tontine?.montantCotisation || 0) * totalParts;
  const totalRetenues = (parseFloat(retenuesPrets) || 0) + (parseFloat(retenuesSanctions) || 0) + (parseFloat(retenuesComplement) || 0);
  const montantNet = cagnotteComplete - totalRetenues;

  // Trouver le bénéficiaire (premier qui n'a pas bénéficié)
  const beneficiaire = (tontine?.participants || []).find(p => !p.aBeneficie);

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
          <h1 className="text-2xl font-bold mb-4">Distribuer la Cagnotte - {tontine?.nom}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {beneficiaire && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="font-semibold text-gray-900 dark:text-white">
                Bénéficiaire: {beneficiaire.membre?.nom} {beneficiaire.membre?.prenom}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tour #{beneficiaire.ordre} - Cycle {tontine?.cycleActuel}
              </p>
            </div>
          )}

          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p className="font-semibold text-gray-900 dark:text-white">
              Cagnotte totale: {cagnotteComplete.toLocaleString()} FCFA
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Net à distribuer: {montantNet.toLocaleString()} FCFA
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">Retenues Prêts (FCFA)</label>
              <input
                type="number"
                value={retenuesPrets}
                onChange={(e) => setRetenuesPrets(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">Retenues Sanctions (FCFA)</label>
              <input
                type="number"
                value={retenuesSanctions}
                onChange={(e) => setRetenuesSanctions(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">Complément Fonds (FCFA)</label>
              <input
                type="number"
                value={retenuesComplement}
                onChange={(e) => setRetenuesComplement(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="font-bold text-gray-900 dark:text-white">
                Total retenues: {totalRetenues.toLocaleString()} FCFA
              </p>
              <p className="font-bold text-green-600">
                Net à verser: {montantNet.toLocaleString()} FCFA
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || montantNet < 0}
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white p-3 rounded hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /><span>Distribuer</span></>}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}