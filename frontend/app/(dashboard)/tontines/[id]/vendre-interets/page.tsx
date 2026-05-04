'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Coins, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Participant {
  id: string;
  membreId: string;
  nombreParts: number;
  interetsPrimairesAccumules?: number;
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
  type: string;
  participants: Participant[];
}

export default function VendreInteretsPage() {
  const params = useParams();
  const router = useRouter();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vendeurId, setVendeurId] = useState<string>('');
  const [acheteurId, setAcheteurId] = useState<string>('');
  const [montantInterets, setMontantInterets] = useState<string>('');
  const [montantOffre, setMontantOffre] = useState<string>('');
  const [modalite, setModalite] = useState<'LOT_UNIQUE' | 'MULTI_PARTS'>('LOT_UNIQUE');

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
    if (!tontine || !vendeurId || !acheteurId || !montantInterets || !montantOffre) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/tontines/${params.id}/vendre-interets`, {
        vendeurId,
        acheteurId,
        montantInterets: parseFloat(montantInterets),
        montantOffre: parseFloat(montantOffre),
        modalite,
      });

      alert('Intérêts vendus avec succès!');
      router.push(`/tontines/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la vente');
    } finally {
      setSubmitting(false);
    }
  };

  const interetsCalcules = (parseFloat(montantInterets) || 0) - (parseFloat(montantOffre) || 0);

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
            Vendre des Intérêts - {tontine?.nom}
          </h1>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="font-semibold text-gray-900 dark:text-white">
              Type: {tontine?.type === 'VENTE_INTERETS' ? "Vente d'Intérêts" : 'Hybride'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vendez vos intérêts accumulés à un autre membre
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                Vendeur d'Intérêts
              </label>
              <select
                value={vendeurId}
                onChange={(e) => setVendeurId(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" className="bg-white dark:bg-gray-700">-- Sélectionner --</option>
                {(tontine?.participants || []).map((p) => (
                  <option key={p.membre.id} value={p.membre.id} className="bg-white dark:bg-gray-700">
                    {p.membre.numeroMembre} - {p.membre.nom} {p.membre.prenom} (Intérêts: {(p.interetsPrimairesAccumules || 0).toLocaleString()} FCFA)
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
                {(tontine?.participants || [])
                  .filter(p => p.membre.id !== vendeurId)
                  .map((p) => (
                    <option key={p.membre.id} value={p.membre.id} className="bg-white dark:bg-gray-700">
                      {p.membre.numeroMembre} - {p.membre.nom} {p.membre.prenom}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                Montant des Intérêts (FCFA)
              </label>
              <input
                type="number"
                value={montantInterets}
                onChange={(e) => setMontantInterets(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: 50000"
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                Montant de l'Offre (FCFA)
              </label>
              <input
                type="number"
                value={montantOffre}
                onChange={(e) => setMontantOffre(e.target.value)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: 40000"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Intérêts secondaires pour l'acheteur: {interetsCalcules.toLocaleString()} FCFA
              </p>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-900 dark:text-white">Modalité</label>
              <select
                value={modalite}
                onChange={(e) => setModalite(e.target.value as any)}
                className="w-full border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="LOT_UNIQUE" className="bg-white dark:bg-gray-700">Lot unique</option>
                <option value="MULTI_PARTS" className="bg-white dark:bg-gray-700">Multi-parts</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !vendeurId || !acheteurId || !montantInterets || !montantOffre}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 rounded hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Vendre les Intérêts'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}