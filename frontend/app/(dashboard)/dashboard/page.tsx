'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Users, 
  Coins, 
  CreditCard, 
  AlertCircle,
  DollarSign,
  Activity
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    membresActifs: 0,
    tontinesActives: 0,
    pretsEnCours: 0,
    caissePrincipale: 0,
  });

  // Utilisation de useCallback pour stabiliser la fonction
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Promise.all avec des catch individuels pour éviter qu'une seule erreur 404 ne bloque tout
      const [membresRes, tontinesRes, caissesRes] = await Promise.all([
        api.get('/membres').catch(err => {
            console.warn("Erreur /membres:", err.message);
            return { data: [] };
        }),
        api.get('/tontines').catch(err => {
            console.warn("Erreur /tontines:", err.message);
            return { data: [] };
        }),
        api.get('/caisses/FONDS/solde').catch(err => {
            console.warn("Erreur /caisses:", err.message);
            return { data: { solde: 0 } };
        }),
      ]);

      // --- SÉCURISATION DES DONNÉES (Anti-crash .filter) ---
      
      // Extraction membres
      const rawMembres = membresRes?.data;
      const membresData = Array.isArray(rawMembres) 
        ? rawMembres 
        : (rawMembres?.membres && Array.isArray(rawMembres.membres) ? rawMembres.membres : []);

      // Extraction tontines
      const rawTontines = tontinesRes?.data;
      const tontinesData = Array.isArray(rawTontines) 
        ? rawTontines 
        : (rawTontines?.tontines && Array.isArray(rawTontines.tontines) ? rawTontines.tontines : []);

      // Calcul sécurisé des stats
      const membresActifs = membresData.filter((m: any) => m && m.statut === 'ACTIF').length;
      const tontinesActives = tontinesData.filter((t: any) => t && t.statut === 'ACTIVE').length;
      const caissePrincipale = Number(caissesRes?.data?.solde) || 0;

      setStats({
        membresActifs,
        tontinesActives,
        pretsEnCours: 0, 
        caissePrincipale,
      });

    } catch (error) {
      console.error('Erreur critique Dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statsCards = [
    {
      title: 'Membres Actifs',
      value: loading ? '...' : stats.membresActifs.toString(),
      icon: Users,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Tontines Actives',
      value: loading ? '...' : stats.tontinesActives.toString(),
      icon: Coins,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Prêts en Cours',
      value: loading ? '...' : stats.pretsEnCours.toString(),
      change: 'Module à implémenter',
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Caisse Principale',
      value: loading ? '...' : `${stats.caissePrincipale.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de Bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bienvenue <span className="font-semibold">{user?.email}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.change && (
                  <p className="text-[10px] text-orange-500 mt-2 italic">
                    {stat.change}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Activités Récentes
            </h2>
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Aucune donnée disponible</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Alertes
            </h2>
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Tout est en ordre</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}