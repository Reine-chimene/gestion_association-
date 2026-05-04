'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Upload, X, Check, Clock, AlertCircle, Wallet, TrendingUp, 
  TrendingDown, History, CreditCard, Users, Calendar, DollarSign 
} from 'lucide-react';
import api from '@/lib/api';
import type { ReactNode } from 'react';

// --- Interfaces ---
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

  const [depotForm, setDepotForm] = useState({
    type: 'TONTINE',
    montant: '',
    operateur: 'ORANGE_MONEY',
    motifAbsence: '',
    preuveUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // --- Chargement des données (Sécurisé) ---
  const loadMemberData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingData(true);
      
      // 1. Récupérer le profil
      const profilResponse = await api.get('/membres/me/profil').catch(() => null);
      if (!profilResponse?.data) {
         console.warn("Profil non trouvé");
         return;
      }
      setProfil(profilResponse.data);
      const membreId = profilResponse.data.id;

      // 2. Récupérer Situation et Dépôts en parallèle pour gagner du temps
      const [situationRes, depotsRes] = await Promise.all([
        // Protection contre la 404 sur situation-nette
        api.get(`/membres/${membreId}/situation-nette`).catch(err => {
            console.error("Erreur 404 sur situation-nette:", err.message);
            return { data: { avoir: 0, dette: 0, soldeNet: 0, details: {} } };
        }),
        api.get(`/depots-en-ligne/membre/${membreId}`).catch(() => ({ data: [] }))
      ]);

      setSituationNette(situationRes.data);

      // Sécurité sur le tableau des dépôts
      const rawDepots = depotsRes?.data;
      const depotsData = Array.isArray(rawDepots) 
        ? rawDepots 
        : (rawDepots?.depots && Array.isArray(rawDepots.depots) ? rawDepots.depots : []);
      
      setDepots(depotsData);

    } catch (error) {
      console.error('Erreur globale chargement membre:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMemberData();
    }
  }, [isAuthenticated, user, loadMemberData]);

  // --- Handlers ---
  const handleDepotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil) return;
    
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

      setDepotForm({ type: 'TONTINE', montant: '', operateur: 'ORANGE_MONEY', motifAbsence: '', preuveUrl: '' });
      setShowDepotModal(false);
      await loadMemberData();
      alert('Dépôt soumis avec succès !');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, ReactNode> = {
      EN_ATTENTE_VALIDATION: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" /> En attente</span>,
      VALIDE: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><Check className="w-3 h-3 mr-1" /> Validé</span>,
      REJETE: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><X className="w-3 h-3 mr-1" /> Rejeté</span>
    };
    return badges[statut] || null;
  };

  if (isLoading || loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Profil */}
        <div className="bg-gradient-to-r from-green-600 to-orange-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 text-3xl font-black">
                {profil?.nom?.charAt(0)}{profil?.prenom?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profil?.nom} {profil?.prenom}</h1>
                <div className="flex items-center gap-4 mt-2 opacity-90 text-sm">
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> {profil?.numeroMembre}</span>
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {profil?.statut}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowDepotModal(true)}
              className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Upload className="w-5 h-5" /> Nouveau Dépôt
            </button>
          </div>
        </div>

        {/* Cartes Situation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avoir Total</p>
              <TrendingUp className="text-green-500" />
            </div>
            <p className="text-3xl font-black">{situationNette?.avoir?.toLocaleString() || '0'} <span className="text-sm font-normal">FCFA</span></p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Dette Totale</p>
              <TrendingDown className="text-orange-500" />
            </div>
            <p className="text-3xl font-black">{situationNette?.dette?.toLocaleString() || '0'} <span className="text-sm font-normal">FCFA</span></p>
          </div>

          <div className="bg-green-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Situation Nette</p>
              <Wallet className="opacity-80" />
            </div>
            <p className="text-3xl font-black">{situationNette?.soldeNet?.toLocaleString() || '0'} <span className="text-sm font-normal">FCFA</span></p>
          </div>
        </div>

        {/* Historique */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-lg flex items-center gap-2"><History className="text-green-600"/> Historique des dépôts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {depots.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">Aucun dépôt enregistré</td></tr>
                ) : (
                  depots.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                      <td className="px-6 py-4 text-sm">{new Date(d.dateDepot).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium">{d.type}</td>
                      <td className="px-6 py-4 text-sm font-bold">{d.montant.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4">{getStatutBadge(d.statut)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal simplifiée */}
      {showDepotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-green-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Nouveau Dépôt</h2>
              <X className="cursor-pointer" onClick={() => setShowDepotModal(false)} />
            </div>
            <form onSubmit={handleDepotSubmit} className="p-6 space-y-4">
              <select className="w-full p-3 border rounded-xl dark:bg-gray-800" value={depotForm.type} onChange={e => setDepotForm({...depotForm, type: e.target.value})}>
                <option value="TONTINE">Tontine</option>
                <option value="EPARGNE">Épargne</option>
              </select>
              <input type="number" className="w-full p-3 border rounded-xl dark:bg-gray-800" placeholder="Montant" value={depotForm.montant} onChange={e => setDepotForm({...depotForm, montant: e.target.value})} required />
              <textarea className="w-full p-3 border rounded-xl dark:bg-gray-800" placeholder="Motif d'absence" value={depotForm.motifAbsence} onChange={e => setDepotForm({...depotForm, motifAbsence: e.target.value})} required />
              <input type="url" className="w-full p-3 border rounded-xl dark:bg-gray-800" placeholder="Lien de la preuve (Imgur/Drive)" value={depotForm.preuveUrl} onChange={e => setDepotForm({...depotForm, preuveUrl: e.target.value})} required />
              
              <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-700 transition-all">
                {submitting ? "Envoi..." : "Soumettre le paiement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}