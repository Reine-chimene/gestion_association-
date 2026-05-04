'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Upload, X, Check, Clock, AlertCircle, Wallet, TrendingUp, 
  TrendingDown, History, CreditCard, Users, Calendar, DollarSign 
} from 'lucide-react';
import api from '@/lib/api';

interface MembreProfil {
  id: string;
  numeroMembre: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  statut: string;
  dateAdhesion: string;
}

interface SituationNette {
  avoir: number;
  dette: number;
  soldeNet: number;
  details: {
    cotisationsTontines: number;
    epargnes: number;
    pretsEnCours: number;
    sanctionsImpayees: number;
    complementFonds: number;
  };
}

interface Depot {
  id: string;
  type: string;
  montant: number;
  operateur: string;
  statut: string;
  dateDepot: string;
  preuveUrl: string;
  motifAbsence: string;
  dateValidation?: string;
  commentaireValidation?: string;
}

export default function MembreDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [showDepotModal, setShowDepotModal] = useState(false);
  const [profil, setProfil] = useState<MembreProfil | null>(null);
  const [situationNette, setSituationNette] = useState<SituationNette | null>(null);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // État du formulaire de dépôt
  const [depotForm, setDepotForm] = useState({
    type: 'TONTINE',
    montant: '',
    operateur: 'ORANGE_MONEY',
    motifAbsence: '',
    preuveUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Charger les données du membre
  useEffect(() => {
    if (isAuthenticated && user) {
      loadMemberData();
    }
  }, [isAuthenticated, user]);

  const loadMemberData = async () => {
    try {
      setLoadingData(true);
      
      // Récupérer le profil du membre connecté
      const profilResponse = await api.get('/membres/me/profil').catch(() => null);
      if (!profilResponse?.data) {
        throw new Error("Impossible de charger le profil");
      }

      setProfil(profilResponse.data);
      const membreId = profilResponse.data.id;
      
      // Récupérer la situation nette
      const situationResponse = await api.get(`/membres/${membreId}/situation-nette`);
      setSituationNette(situationResponse.data);
      
      // Récupérer les dépôts
      const depotsResponse = await api.get(`/depots-en-ligne/membre/${membreId}`);
      const depotsData = Array.isArray(depotsResponse.data) ? depotsResponse.data : (depotsResponse.data.depots || []);
      setDepots(depotsData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      if (error.response?.status === 404) {
        alert('Profil membre non trouvé. Veuillez contacter un administrateur.');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleDepotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profil) {
      alert('Profil membre non chargé');
      return;
    }
    
    setSubmitting(true);

    try {
      await api.post('/depots-en-ligne', {
        membreId: profil.id,
        type: depotForm.type,
        montant: parseFloat(depotForm.montant),
        operateur: depotForm.operateur,
        motifAbsence: depotForm.motifAbsence,
        preuveUrl: depotForm.preuveUrl,
      });

      // Réinitialiser le formulaire
      setDepotForm({
        type: 'TONTINE',
        montant: '',
        operateur: 'ORANGE_MONEY',
        motifAbsence: '',
        preuveUrl: '',
      });
      setShowDepotModal(false);
      
      // Recharger les dépôts
      await loadMemberData();
      
      alert('Dépôt soumis avec succès ! Il sera validé par le trésorier.');
    } catch (error: any) {
      console.error('Erreur lors de la soumission du dépôt:', error);
      alert(error.response?.data?.message || 'Erreur lors de la soumission du dépôt');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE_VALIDATION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case 'VALIDE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <Check className="w-3 h-3 mr-1" />
            Validé
          </span>
        );
      case 'REJETE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <X className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TONTINE: 'Tontine',
      EPARGNE: 'Épargne',
      PROJET: 'Projet',
      COMPLEMENT_FONDS: 'Complément Fonds',
    };
    return labels[type] || type;
  };

  if (isLoading || loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de votre espace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec profil */}
        <div className="bg-gradient-to-r from-green-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <span className="text-3xl font-bold">
                  {profil?.prenom?.charAt(0)}{profil?.nom?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {profil?.nom} {profil?.prenom}
                </h1>
                <p className="text-white/90 mt-1 flex items-center space-x-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {profil?.numeroMembre}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Membre depuis {profil?.dateAdhesion ? new Date(profil.dateAdhesion).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border-2 border-white/30">
                {profil?.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Situation financière */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Avoir Total</h3>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {situationNette?.avoir?.toLocaleString() || '0'} <span className="text-lg text-gray-500">FCFA</span>
            </p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Tontines:</span>
                <span className="font-semibold">{situationNette?.details?.cotisationsTontines?.toLocaleString() || '0'} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Épargnes:</span>
                <span className="font-semibold">{situationNette?.details?.epargnes?.toLocaleString() || '0'} FCFA</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Dette Totale</h3>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {situationNette?.dette?.toLocaleString() || '0'} <span className="text-lg text-gray-500">FCFA</span>
            </p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Prêts:</span>
                <span className="font-semibold">{situationNette?.details?.pretsEnCours?.toLocaleString() || '0'} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Sanctions:</span>
                <span className="font-semibold">{situationNette?.details?.sanctionsImpayees?.toLocaleString() || '0'} FCFA</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase opacity-90">Situation Nette</h3>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2">
              {situationNette?.soldeNet?.toLocaleString() || '0'} <span className="text-lg opacity-80">FCFA</span>
            </p>
            <p className="text-sm opacity-80">Avoir - Dette</p>
          </div>
        </div>

        {/* Bouton Dépôt en Ligne */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-green-600" />
                Cotiser en Ligne
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Effectuez vos cotisations via <span className="font-semibold text-orange-600">Orange Money</span> ou <span className="font-semibold text-yellow-600">MTN Mobile Money</span>
              </p>
            </div>
            <button
              onClick={() => setShowDepotModal(true)}
              className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              Nouveau Dépôt
            </button>
          </div>
        </div>

        {/* Historique des dépôts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <History className="w-5 h-5 mr-2 text-green-600" />
              Historique des Dépôts en Ligne
            </h2>
          </div>
          <div className="overflow-x-auto">
            {depots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Aucun dépôt pour le moment</p>
                <p className="text-sm mt-1">Cliquez sur "Nouveau Dépôt" pour effectuer votre première cotisation en ligne</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Opérateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Preuve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {depots.map((depot) => (
                    <tr key={depot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(depot.dateDepot).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getTypeLabel(depot.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {depot.montant.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          depot.operateur === 'ORANGE_MONEY' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {depot.operateur === 'ORANGE_MONEY' ? 'Orange Money' : 'MTN Money'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatutBadge(depot.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={depot.preuveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                        >
                          Voir
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal de dépôt */}
      {showDepotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center">
                <DollarSign className="w-7 h-7 mr-2" />
                Nouveau Dépôt en Ligne
              </h2>
              <button
                onClick={() => setShowDepotModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleDepotSubmit} className="p-6 space-y-6">
              {/* Type de cotisation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type de Cotisation *
                </label>
                <select
                  value={depotForm.type}
                  onChange={(e) => setDepotForm({ ...depotForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="TONTINE">Tontine</option>
                  <option value="EPARGNE">Épargne</option>
                  <option value="PROJET">Projet</option>
                  <option value="COMPLEMENT_FONDS">Complément Fonds</option>
                </select>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Montant (FCFA) *
                </label>
                <input
                  type="number"
                  value={depotForm.montant}
                  onChange={(e) => setDepotForm({ ...depotForm, montant: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: 50000"
                  required
                  min="1"
                />
              </div>

              {/* Opérateur */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Opérateur de Paiement *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDepotForm({ ...depotForm, operateur: 'ORANGE_MONEY' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      depotForm.operateur === 'ORANGE_MONEY'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">Orange Money</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Paiement mobile</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepotForm({ ...depotForm, operateur: 'MTN_MONEY' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      depotForm.operateur === 'MTN_MONEY'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">MTN Money</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Paiement mobile</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Motif d'absence */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Motif d'Absence à la Séance *
                </label>
                <textarea
                  value={depotForm.motifAbsence}
                  onChange={(e) => setDepotForm({ ...depotForm, motifAbsence: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: Voyage professionnel, maladie, urgence familiale..."
                  rows={3}
                  required
                />
              </div>

              {/* Preuve de paiement */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preuve de Paiement (URL) *
                </label>
                <input
                  type="url"
                  value={depotForm.preuveUrl}
                  onChange={(e) => setDepotForm({ ...depotForm, preuveUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://exemple.com/preuve.jpg"
                  required
                />
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-400 flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Comment obtenir le lien:</strong><br />
                      1. Prenez une capture d'écran de votre reçu de paiement<br />
                      2. Téléchargez-la sur <a href="https://imgur.com" target="_blank" className="underline">Imgur.com</a> ou Google Drive<br />
                      3. Copiez le lien et collez-le ici
                    </span>
                  </p>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDepotModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Soumettre le Dépôt
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
