'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { FolderKanban, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Projet {
  id: string;
  nom: string;
  description: string;
  duree: string;
  objectif: number;
  montantCollecte: number;
  ephemere: boolean;
  obligatoire: boolean;
  statut: string;
  dateDebut: string;
  dateFin?: string;
  pourcentageAvancement: number;
  nombreContributeurs: number;
  contributions: any[];
  phases: any[];
}

interface Stats {
  total: number;
  actifs: number;
  termines: number;
  montantTotalObjectif: number;
  montantTotalCollecte: number;
  nombreContributions: number;
  tauxReussite: number;
}

export default function ProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

   const loadData = async () => {
     try {
       setLoading(true);
       setError(null);
       
       const [projetsRes, statsRes] = await Promise.all([
         api.get('/projets').catch(err => {
           console.error('Erreur /projets:', err.message);
           return { data: [] };
         }),
         api.get('/projets/statistiques/global').catch(err => {
           console.error('Erreur /projets/statistiques/global:', err.message);
           return { data: null };
         }),
       ]);
       
       setProjets(Array.isArray(projetsRes.data) ? projetsRes.data : []);
       setStats(statsRes.data);
     } catch (err: any) {
       console.error('Erreur lors du chargement des projets:', err);
       setError(err.response?.data?.message || 'Erreur lors du chargement des données');
     } finally {
       setLoading(false);
     }
   };

  const getDureeLabel = (duree: string) => {
    const labels = {
      COURT: 'Court terme',
      MOYEN: 'Moyen terme',
      LONG: 'Long terme',
    };
    return labels[duree as keyof typeof labels] || duree;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
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
              <FolderKanban className="w-8 h-8 mr-3" />
              Projets Communautaires
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les projets et contributions
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            <span>Nouveau Projet</span>
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Projets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.actifs}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Objectif Total</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {Number(stats.montantTotalObjectif).toLocaleString()} FCFA
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Collecté</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {Number(stats.montantTotalCollecte).toLocaleString()} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Projets List */}
        {projets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun projet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par créer votre premier projet communautaire
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
              Créer un projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projets.map((projet) => {
              const progress = projet.pourcentageAvancement;
              const montantRestant = Number(projet.objectif) - Number(projet.montantCollecte);

              return (
                <div
                  key={projet.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <FolderKanban className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {projet.nom}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getDureeLabel(projet.duree)}
                            {projet.obligatoire && ' • Obligatoire'}
                            {projet.ephemere && ' • Éphémère'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-15">
                        {projet.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Objectif</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {Number(projet.objectif).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Collecté</p>
                      <p className="text-lg font-semibold text-green-600">
                        {Number(projet.montantCollecte).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Contributeurs</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {projet.nombreContributeurs}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phases</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {projet.phases?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progression</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-orange-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                      <span>Début: {formatDate(projet.dateDebut)}</span>
                      <span>Restant: {montantRestant.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                      Contribuer
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                      Voir Détails
                    </button>
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
