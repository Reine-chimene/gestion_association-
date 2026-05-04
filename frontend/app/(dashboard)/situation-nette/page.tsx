'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export default function SituationNettePage() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSituationNette = async () => {
      if (!user) {
        setError('Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/membres/${user.id}/situation-nette`);
        
        // Gestion défensive de la réponse
        let responseData = response.data;
        if (!responseData) {
          responseData = {
            avoir: 0,
            dette: 0,
            soldeNet: 0,
            details: {
              cotisationsTontines: 0,
              epargnes: 0,
              pretsEnCours: 0,
              sanctionsImpayees: 0,
              complementFonds: 0,
            }
          };
        }
        
        setData(responseData);
      } catch (err: any) {
        console.error('Erreur lors de la récupération de la situation nette:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
        // En cas d'erreur, on montre quand même une vue vide plutôt que de bloquer
        setData({
          avoir: 0,
          dette: 0,
          soldeNet: 0,
          details: {
            cotisationsTontines: 0,
            epargnes: 0,
            pretsEnCours: 0,
            sanctionsImpayees: 0,
            complementFonds: 0,
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSituationNette();
  }, [user]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!data) return <div>Aucune donnée disponible</div>;

  // S'assurer que les données ont bien la structure attendue
  const safeData = {
    avoir: data.avoir || 0,
    dette: data.dette || 0,
    soldeNet: data.soldeNet || 0,
    details: {
      cotisationsTontines: data.details?.cotisationsTontines || 0,
      epargnes: data.details?.epargnes || 0,
      pretsEnCours: data.details?.pretsEnCours || 0,
      sanctionsImpayees: data.details?.sanctionsImpayees || 0,
      complementFonds: data.details?.complementFonds || 0,
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Situation Nette</h1>
      
      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Avoir */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Avoir Total</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {safeData.avoir.toLocaleString()} <span className="text-lg text-gray-500">FCFA</span>
          </p>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Tontines:</span>
              <span className="font-semibold">{safeData.details.cotisationsTontines.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span>Épargnes:</span>
              <span className="font-semibold">{safeData.details.epargnes.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Dette */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Dette Totale</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {safeData.dette.toLocaleString()} <span className="text-lg text-gray-500">FCFA</span>
          </p>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Prêts:</span>
              <span className="font-semibold">{safeData.details.pretsEnCours.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span>Sanctions:</span>
              <span className="font-semibold">{safeData.details.sanctionsImpayees.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Solde Net */}
        <div className="bg-gradient-to-br from-green-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-semibold uppercase opacity-90 mb-3">Situation Nette</h3>
          <p className="text-4xl font-bold mb-2">
            {safeData.soldeNet.toLocaleString()} <span className="text-lg opacity-80">FCFA</span>
          </p>
          <p className="text-sm opacity-80">Avoir - Dette</p>
        </div>
      </div>

      {/* Détails supplémentaires */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Détails de la Situation Nette</h2>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Creances (Avoir):</strong> {safeData.avoir.toLocaleString()} FCFA
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Dettes:</strong> {safeData.dette.toLocaleString()} FCFA
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Solde Net:</strong> 
            <span className={safeData.soldeNet >= 0 ? 'text-green-600' : 'text-red-600'}>
              {safeData.soldeNet.toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}