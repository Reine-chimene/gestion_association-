'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { CreditCard, Plus, Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Pret {
  id: string;
  type: string;
  montant: number;
  tauxInteret: number;
  dureeEnMois: number;
  montantTotal: number;
  soldeRestant: number;
  statut: string;
  dateOctroi: string;
  emprunteur: {
    numeroMembre: string;
    nom: string;
    prenom: string;
  };
  garanties: Array<{
    type: string;
    description: string;
  }>;
  _count: {
    echeances: number;
    paiements: number;
  };
}

export default function PretsPage() {
  const [prets, setPrets] = useState<Pret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('');

  useEffect(() => {
    loadPrets();
  }, [filterStatut]);

  const loadPrets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filterStatut) params.statut = filterStatut;
      
      const response = await api.get('/prets', { params });
      setPrets(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des prêts:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des prêts');
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      EN_COURS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      SOLDE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      EN_RETARD: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      RECOUVREMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return styles[statut as keyof typeof styles] || styles.EN_COURS;
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      EN_COURS: 'En cours',
      SOLDE: 'Soldé',
      EN_RETARD: 'En retard',
      RECOUVREMENT: 'Recouvrement',
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      ORDINAIRE: 'Ordinaire',
      SOCIAL: 'Social',
      URGENT: 'Urgent',
      INVESTISSEMENT: 'Investissement',
      SOLIDARITE: 'Solidarité',
      SUR_FONDS: 'Sur Fonds',
      TONTINE: 'Tontine',
      MENSUEL: 'Mensuel',
      COLLECTIF: 'Collectif',
      SUR_EPARGNE: 'Sur Épargne',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const calculateProgress = (pret: Pret) => {
    const montantPaye = Number(pret.montantTotal) - Number(pret.soldeRestant);
    return (montantPaye / Number(pret.montantTotal)) * 100;
  };

  const totalPrets = prets.length;
  const totalEnCours = prets.filter(p => p.statut === 'EN_COURS').length;
  const totalSoldes = prets.filter(p => p.statut === 'SOLDE').length;
  const totalEnRetard = prets.filter(p => p.statut === 'EN_RETARD' || p.statut === 'RECOUVREMENT').length;

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
            onClick={loadPrets}
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
              <CreditCard className="w-8 h-8 mr-3" />
              Gestion des Prêts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les prêts et les remboursements
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            <span>Nouveau Prêt</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Prêts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalPrets}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">En Cours</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalEnCours}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Soldés</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalSoldes}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">En Retard</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalEnRetard}</p>
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
              <option value="SOLDE">Soldés</option>
              <option value="EN_RETARD">En retard</option>
              <option value="RECOUVREMENT">Recouvrement</option>
            </select>
          </div>
        </div>

        {/* Prêts List */}
        {prets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun prêt
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer votre premier prêt
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
              Créer un prêt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {prets.map((pret) => {
              const progress = calculateProgress(pret);
              const montantPaye = Number(pret.montantTotal) - Number(pret.soldeRestant);

              return (
                <div
                  key={pret.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {pret.emprunteur.prenom} {pret.emprunteur.nom}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {pret.emprunteur.numeroMembre} • {getTypeLabel(pret.type)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatutBadge(pret.statut)}`}>
                      {getStatutLabel(pret.statut)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Montant prêté</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pret.montant.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Montant total</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {Number(pret.montantTotal).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Solde restant</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {Number(pret.soldeRestant).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Taux d'intérêt</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {Number(pret.tauxInteret)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progression du remboursement</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-orange-500 h-3 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                      <span>{montantPaye.toLocaleString()} FCFA payés</span>
                      <span>{pret._count.echeances} échéances • {pret._count.paiements} paiements</span>
                    </div>
                  </div>

                  {/* Garanties */}
                  {pret.garanties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Garanties:</p>
                      <div className="flex flex-wrap gap-2">
                        {pret.garanties.map((garantie, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                          >
                            {garantie.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                      Enregistrer Paiement
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                      Voir Détails
                    </button>
                    {pret.statut === 'EN_RETARD' && (
                      <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        Recouvrement
                      </button>
                    )}
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
