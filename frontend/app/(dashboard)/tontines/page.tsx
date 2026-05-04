'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Coins, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Tontine {
  id: string;
  nom: string;
  type: string;
  montantCotisation: number;
  frequence: string;
  statut: string;
  cycleActuel: number;
  dateDebut: string;
  participants: Array<{
    id: string;
    membreId: string;
    membre: {
      nom: string;
      prenom: string;
    };
    nombreParts: number;
  }>;
}

interface Membre {
  id: string;
  nom: string;
  prenom: string;
  numeroMembre: string;
  statut: string;
}

interface Participant {
  membreId: string;
  nombreParts: number;
  ordre: number;
}

type TontineType = 'CLASSIQUE_NON_VENDABLE' | 'VENDABLE_ENCHERE' | 'VENTE_INTERETS' | 'HYBRIDE';
type FrequenceType = 'JOURNALIERE' | 'HEBDOMADAIRE' | 'MENSUELLE';

interface FormData {
  nom: string;
  type: TontineType;
  montantCotisation: string;
  frequence: FrequenceType;
  dateDebut: string;
}

export default function TontinesPage() {
  const router = useRouter();
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    type: 'CLASSIQUE_NON_VENDABLE',
    montantCotisation: '',
    frequence: 'MENSUELLE',
    dateDebut: new Date().toISOString().split('T')[0],
  });
  const [participants, setParticipants] = useState<Participant[]>([]);

  const showFrequence = formData.type !== 'VENDABLE_ENCHERE';

  useEffect(() => {
    loadTontines();
    loadMembres();
  }, []);

  const loadTontines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tontines');
      const data = response.data;
      // Gérer les deux formats de réponse API
      const tontinesArray = Array.isArray(data) ? data : (Array.isArray(data?.tontines) ? data.tontines : []);
      setTontines(tontinesArray);
    } catch (err: any) {
      console.error('Erreur lors du chargement des tontines:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des tontines');
      setTontines([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMembres = async () => {
    try {
      const response = await api.get('/membres');
      const data = response.data;
      const membresArray = Array.isArray(data) ? data : (Array.isArray(data?.membres) ? data.membres : []);
      // Filtrer uniquement les membres actifs
      setMembres(membresArray.filter((m: Membre) => m.statut === 'ACTIF'));
    } catch (err) {
      console.error('Erreur lors du chargement des membres:', err);
      setMembres([]);
    }
  };

  const handleAddParticipant = (membreId: string) => {
    if (participants.find(p => p.membreId === membreId)) {
      alert('Ce membre est déjà participant');
      return;
    }
    setParticipants([...participants, {
      membreId,
      nombreParts: 1,
      ordre: participants.length + 1,
    }]);
  };

  const handleRemoveParticipant = (membreId: string) => {
    const newParticipants = participants.filter(p => p.membreId !== membreId);
    setParticipants(newParticipants.map((p, index) => ({ ...p, ordre: index + 1 })));
  };

  const handleUpdateParticipant = (membreId: string, field: 'nombreParts' | 'ordre', value: number) => {
    setParticipants(participants.map(p => 
      p.membreId === membreId ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (participants.length === 0) {
      alert('Veuillez ajouter au moins un participant');
      return;
    }

    try {
      setSubmitting(true);
      
      const dataToSend: any = {
        nom: formData.nom,
        type: formData.type,
        montantCotisation: parseFloat(formData.montantCotisation),
        dateDebut: formData.dateDebut,
        participants,
      };
      
      if (formData.type !== 'VENDABLE_ENCHERE') {
        dataToSend.frequence = formData.frequence;
      } else {
        dataToSend.frequence = 'MENSUELLE';
      }
      
      const response = await api.post('/tontines', dataToSend);
      const newTontine = response.data;
      
      setFormData({
        nom: '',
        type: 'CLASSIQUE_NON_VENDABLE',
        montantCotisation: '',
        frequence: 'MENSUELLE',
        dateDebut: new Date().toISOString().split('T')[0],
      });
      setParticipants([]);
      setShowCreateModal(false);
      
      alert('Tontine créée avec succès!');
      
      if (newTontine && newTontine.id) {
        router.push(`/tontines/${newTontine.id}`);
      } else {
        await loadTontines();
      }
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      alert(err.response?.data?.message || 'Erreur lors de la création de la tontine');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      CLASSIQUE_NON_VENDABLE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      VENDABLE_ENCHERE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      VENTE_INTERETS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      HYBRIDE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return styles[type as keyof typeof styles] || styles.CLASSIQUE_NON_VENDABLE;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      CLASSIQUE_NON_VENDABLE: 'Classique',
      VENDABLE_ENCHERE: 'Vendable',
      VENTE_INTERETS: 'Vente Intérêts',
      HYBRIDE: 'Hybride',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getFrequenceLabel = (frequence: string) => {
    const labels = {
      JOURNALIERE: 'Journalière',
      HEBDOMADAIRE: 'Hebdomadaire',
      MENSUELLE: 'Mensuelle',
    };
    return labels[frequence as keyof typeof labels] || frequence;
  };

  // Calculs sécurisés : vérifie que les données sont bien des tableaux
  const totalParts = (tontines || []).reduce((sum, t) => {
    const participants = t?.participants && Array.isArray(t.participants) ? t.participants : [];
    const parts = participants.reduce((pSum, p) => pSum + (p.nombreParts || 0), 0);
    return sum + parts;
  }, 0);

  const tontinesActives = (tontines || []).filter(t => t && t.statut === 'ACTIVE').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
            onClick={loadTontines}
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
              <Coins className="w-8 h-8 mr-3" />
              Gestion des Tontines
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les tontines et les distributions
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Tontine</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tontines Actives</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tontinesActives}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tontines</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{tontines?.length || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Participants</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalParts}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cycles en cours</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {Array.isArray(tontines) ? tontines.reduce((sum, t) => sum + (t?.cycleActuel || 0), 0) : 0}
            </p>
          </div>
        </div>

        {/* Tontines Grid */}
        {tontines.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune tontine
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer votre première tontine
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Créer une tontine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tontines.map((tontine) => {
              const tontineParticipants = tontine.participants || [];
              const partsTotal = tontineParticipants.reduce((sum, p) => sum + p.nombreParts, 0);
              
              return (
                <div
                  key={tontine.id}
                  onClick={() => router.push(`/tontines/${tontine.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(tontine.type)}`}>
                      {getTypeLabel(tontine.type)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {tontine.nom}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Cotisation:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {tontine.montantCotisation.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {tontineParticipants.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Cycle:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {tontine.cycleActuel}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Fréquence:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {tontine.frequence === 'JOURNALIERE' ? 'Journalière' : 
                         tontine.frequence === 'HEBDOMADAIRE' ? 'Hebdo' : 'Mensuelle'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        tontine.statut === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {tontine.statut}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Début:</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      {new Date(tontine.dateDebut).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tontines/${tontine.id}/collecter`);
                      }}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                    >
                      Collecter
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tontines/${tontine.id}`);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de création */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Créer une Tontine
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom de la tontine *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: Tontine Mensuelle 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de tontine *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="CLASSIQUE_NON_VENDABLE">Classique (Non Vendable)</option>
                        <option value="VENDABLE_ENCHERE">Vendable aux Enchères</option>
                        <option value="VENTE_INTERETS">Vente d'Intérêts</option>
                        <option value="HYBRIDE">Hybride</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Montant de cotisation (FCFA) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.montantCotisation}
                        onChange={(e) => setFormData({ ...formData, montantCotisation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: 10000"
                      />
                    </div>

                    {showFrequence && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fréquence *
                        </label>
                        <select
                          required={showFrequence}
                          value={formData.frequence}
                          onChange={(e) => setFormData({ ...formData, frequence: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="JOURNALIERE">Journalière</option>
                          <option value="HEBDOMADAIRE">Hebdomadaire</option>
                          <option value="MENSUELLE">Mensuelle</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          La fréquence détermine le rythme des cotisations
                        </p>
                      </div>
                    )}

                    {!showFrequence && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 col-span-2">
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          <strong>Tontine Vendable:</strong> Les tours sont vendus aux enchères selon les besoins, pas de fréquence fixe.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de début *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateDebut}
                        onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Participants ({participants.length})
                    </h3>
                    
                    {/* Ajouter un participant */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ajouter un membre
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddParticipant(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">-- Sélectionner un membre --</option>
                        {membres
                          .filter(m => !participants.find(p => p.membreId === m.id))
                          .map(membre => (
                            <option key={membre.id} value={membre.id}>
                              {membre.numeroMembre} - {membre.nom} {membre.prenom}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Liste des participants */}
                    {participants.length > 0 ? (
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Membre</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Parts</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Ordre</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {participants.map((participant) => {
                              const membre = membres.find(m => m.id === participant.membreId);
                              return (
                                <tr key={participant.membreId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                    {membre ? `${membre.numeroMembre} - ${membre.nom} ${membre.prenom}` : 'Inconnu'}
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      min="1"
                                      value={participant.nombreParts}
                                      onChange={(e) => handleUpdateParticipant(participant.membreId, 'nombreParts', parseInt(e.target.value))}
                                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      min="1"
                                      value={participant.ordre}
                                      onChange={(e) => handleUpdateParticipant(participant.membreId, 'ordre', parseInt(e.target.value))}
                                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveParticipant(participant.membreId)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                    >
                                      Retirer
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <p>Aucun participant ajouté</p>
                        <p className="text-sm mt-1">Sélectionnez des membres ci-dessus</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || participants.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <span>Créer la tontine</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
