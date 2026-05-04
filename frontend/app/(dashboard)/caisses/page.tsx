'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Wallet, TrendingUp, TrendingDown, DollarSign, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Mouvement {
  id: string;
  type: string;
  montant: number;
  motif: string;
  justification?: string;
  referenceBancaire?: string;
  soldeApres: number;
  dateOperation: string;
  responsable: {
    nom: string;
    prenom: string;
  };
}

export default function CaissesPage() {
  const [selectedCaisse, setSelectedCaisse] = useState<'FONDS' | 'SANCTION' | 'EPARGNE'>('FONDS');
  const [soldes, setSoldes] = useState<Record<string, number>>({
    FONDS: 0,
    SANCTION: 0,
    EPARGNE: 0,
  });
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMouvements, setLoadingMouvements] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSoldes();
  }, []);

  useEffect(() => {
    loadMouvements();
  }, [selectedCaisse]);

   const loadSoldes = async () => {
     try {
       setLoading(true);
       setError(null);
       
       const [fondsSolde, sanctionSolde, epargneSolde] = await Promise.all([
         api.get('/caisses/FONDS/solde').catch(err => {
           console.error('Erreur /caisses/FONDS/solde:', err.message);
           return { data: { solde: 0 } };
         }),
         api.get('/caisses/SANCTION/solde').catch(err => {
           console.error('Erreur /caisses/SANCTION/solde:', err.message);
           return { data: { solde: 0 } };
         }),
         api.get('/caisses/EPARGNE/solde').catch(err => {
           console.error('Erreur /caisses/EPARGNE/solde:', err.message);
           return { data: { solde: 0 } };
         }),
       ]);

       setSoldes({
         FONDS: fondsSolde.data?.solde ?? 0,
         SANCTION: sanctionSolde.data?.solde ?? 0,
         EPARGNE: epargneSolde.data?.solde ?? 0,
       });
     } catch (err: any) {
       console.error('Erreur lors du chargement des soldes:', err);
       setError(err.response?.data?.message || 'Erreur lors du chargement des soldes');
     } finally {
       setLoading(false);
     }
   };

   const loadMouvements = async () => {
     try {
       setLoadingMouvements(true);
       const response = await api.get(`/caisses/${selectedCaisse}/historique`, {
         params: { limit: 50 }
       });
       const data = response.data;
       const mouvementsArray = Array.isArray(data?.mouvements) ? data.mouvements : [];
       setMouvements(mouvementsArray);
     } catch (err: any) {
       console.error('Erreur lors du chargement des mouvements:', err);
     } finally {
       setLoadingMouvements(false);
     }
   };

  const caisses = [
    {
      type: 'FONDS',
      nom: 'Caisse Fonds',
      solde: soldes.FONDS,
      color: 'from-green-500 to-green-600',
      icon: Wallet,
    },
    {
      type: 'SANCTION',
      nom: 'Caisse Sanctions',
      solde: soldes.SANCTION,
      color: 'from-orange-500 to-orange-600',
      icon: DollarSign,
    },
    {
      type: 'EPARGNE',
      nom: 'Caisse Épargne',
      solde: soldes.EPARGNE,
      color: 'from-green-400 to-green-500',
      icon: TrendingUp,
    },
  ];

  const caisse = caisses.find((c) => c.type === selectedCaisse);

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
            onClick={loadSoldes}
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
              Gestion des Caisses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les mouvements et soldes des caisses
            </p>
          </div>
        </div>

        {/* Caisses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caisses.map((c) => {
            const CaisseIcon = c.icon;
            const isSelected = c.type === selectedCaisse;
            return (
              <button
                key={c.type}
                onClick={() => setSelectedCaisse(c.type as any)}
                className={`text-left bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 hover:shadow-lg transition-all ${
                  isSelected
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${c.color} rounded-lg flex items-center justify-center`}>
                    <CaisseIcon className="w-6 h-6 text-white" />
                  </div>
                  {isSelected && (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {c.nom}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {c.solde.toLocaleString()} FCFA
                </p>
              </button>
            );
          })}
        </div>

        {/* Actions Rapides */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions Rapides - {caisse?.nom}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all">
              <TrendingUp className="w-5 h-5" />
              <span>Créditer</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all">
              <TrendingDown className="w-5 h-5" />
              <span>Débiter</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all">
              <FileText className="w-5 h-5" />
              <span>Décharge</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
              <DollarSign className="w-5 h-5" />
              <span>Versement Bancaire</span>
            </button>
          </div>
        </div>

        {/* Historique des Mouvements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historique des Mouvements - {caisse?.nom}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Motif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Solde Après
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Responsable
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loadingMouvements ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto" />
                    </td>
                  </tr>
                ) : mouvements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      Aucun mouvement enregistré
                    </td>
                  </tr>
                ) : (
                  mouvements.map((mouvement) => (
                    <tr key={mouvement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mouvement.type === 'ENTREE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {mouvement.type === 'ENTREE' ? '↑ Entrée' : '↓ Sortie'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          mouvement.type === 'ENTREE' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mouvement.type === 'ENTREE' ? '+' : '-'}{mouvement.montant.toLocaleString()} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {mouvement.motif}
                        {mouvement.justification && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Justif: {mouvement.justification}
                          </span>
                        )}
                        {mouvement.referenceBancaire && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ref: {mouvement.referenceBancaire}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(mouvement.dateOperation).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {mouvement.soldeApres.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {mouvement.responsable.prenom} {mouvement.responsable.nom}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
