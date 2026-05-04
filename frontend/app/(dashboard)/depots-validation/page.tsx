'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { CheckCircle, XCircle, Loader2, ExternalLink, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Depot {
  id: string;
  montant: number;
  operateur: string;
  numeroTransaction: string;
  preuveUrl: string;
  raisonAbsence: string;
  statut: string;
  dateDepot: string;
  membre: {
    numeroMembre: string;
    nom: string;
    prenom: string;
  };
}

export default function DepotsValidationPage() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadDepots();
  }, []);

   const loadDepots = async () => {
     try {
       setLoading(true);
       setError(null);
       const response = await api.get('/depots-en-ligne/en-attente');
       setDepots(Array.isArray(response.data) ? response.data : []);
     } catch (err: any) {
       console.error('Erreur lors du chargement des dépôts:', err);
       setError(err.response?.data?.message || 'Erreur lors du chargement des dépôts');
     } finally {
       setLoading(false);
     }
   };

  const handleValider = async (depotId: string) => {
    try {
      setProcessingId(depotId);
      await api.post(`/depots-en-ligne/${depotId}/valider`, {
        valide: true,
      });
      
      // Reload the list
      await loadDepots();
    } catch (err: any) {
      console.error('Erreur lors de la validation:', err);
      alert(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeter = async (depotId: string) => {
    const motif = prompt('Motif du rejet:');
    if (!motif) return;

    try {
      setProcessingId(depotId);
      await api.post(`/depots-en-ligne/${depotId}/valider`, {
        valide: false,
        motifRejet: motif,
      });
      
      // Reload the list
      await loadDepots();
    } catch (err: any) {
      console.error('Erreur lors du rejet:', err);
      alert(err.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
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
            onClick={loadDepots}
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
              <Clock className="w-8 h-8 mr-3" />
              Validation des Dépôts en Ligne
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Validez ou rejetez les dépôts effectués par les membres
            </p>
          </div>
          <button 
            onClick={loadDepots}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">En Attente</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{depots.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Montant Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {depots.reduce((sum, d) => sum + d.montant, 0).toLocaleString()} FCFA
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Opérateurs</p>
            <div className="flex space-x-2 mt-1">
              <span className="text-sm font-semibold text-orange-600">
                Orange: {depots.filter(d => d.operateur === 'ORANGE_MONEY').length}
              </span>
              <span className="text-sm font-semibold text-yellow-600">
                MTN: {depots.filter(d => d.operateur === 'MTN_MOBILE_MONEY').length}
              </span>
            </div>
          </div>
        </div>

        {/* Dépôts List */}
        {depots.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun dépôt en attente
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tous les dépôts ont été traités
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {depots.map((depot) => (
              <div
                key={depot.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {depot.membre.prenom} {depot.membre.nom}
                      </h3>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {depot.membre.numeroMembre}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(depot.dateDepot).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {depot.montant.toLocaleString()} FCFA
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      depot.operateur === 'ORANGE_MONEY'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {depot.operateur === 'ORANGE_MONEY' ? 'Orange Money' : 'MTN Mobile Money'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">N° Transaction:</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {depot.numeroTransaction}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Raison d'absence:</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {depot.raisonAbsence}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preuve de paiement:</p>
                  <a
                    href={depot.preuveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Voir la preuve</span>
                  </a>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleValider(depot.id)}
                    disabled={processingId === depot.id}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === depot.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Valider</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRejeter(depot.id)}
                    disabled={processingId === depot.id}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === depot.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <span>Rejeter</span>
                      </>
                    )}
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
