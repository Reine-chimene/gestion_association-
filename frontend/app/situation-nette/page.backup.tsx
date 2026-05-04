'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { BarChart3, Search, Loader2, Users, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import api from '@/lib/api';

interface MemberSituation {
  id: string;
  numeroMembre: string;
  nom: string;
  prenom: string;
  avoir: number;
  dette: number;
  soldeNet: number;
}

export default function SituationNetteRedirect() {
  const [situations, setSituations] = useState<MemberSituation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSituations();
  }, []);

  const loadSituations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/membres');
      const membres = Array.isArray(response.data) ? response.data : (response.data.membres || []);
      
      // Récupérer la situation de chaque membre
      const situationPromises = membres.map(async (m: any) => {
        try {
          const res = await api.get(`/membres/${m.id}/situation-nette`);
          return {
            id: m.id,
            numeroMembre: m.numeroMembre,
            nom: m.nom,
            prenom: m.prenom,
            ...res.data
          };
        } catch {
          return {
            id: m.id,
            numeroMembre: m.numeroMembre,
            nom: m.nom,
            prenom: m.prenom,
            avoir: 0,
            dette: 0,
            soldeNet: 0
          };
        }
      });

      const results = await Promise.all(situationPromises);
      setSituations(results);
    } catch (error) {
      console.error('Erreur lors du chargement des situations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSituations = situations.filter(s => 
    s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.numeroMembre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = filteredSituations.reduce((acc, curr) => ({
    avoir: acc.avoir + (curr.avoir || 0),
    dette: acc.dette + (curr.dette || 0),
    solde: acc.solde + (curr.soldeNet || 0)
  }), { avoir: 0, dette: 0, solde: 0 });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-green-600" />
            Situation Nette Globale
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Récapitulatif financier de tous les membres</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 flex items-center justify-between">Avoir Total <ArrowUpRight className="text-green-500 w-4 h-4" /></p>
            <p className="text-2xl font-bold text-green-600">{totals.avoir.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 flex items-center justify-between">Dette Totale <ArrowDownRight className="text-orange-500 w-4 h-4" /></p>
            <p className="text-2xl font-bold text-orange-600">{totals.dette.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-orange-500 rounded-xl p-4 shadow-md text-white">
            <p className="text-sm opacity-90 flex items-center justify-between">Solde Net <Wallet className="w-4 h-4" /></p>
            <p className="text-2xl font-bold">{totals.solde.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin mr-2" /> Calcul en cours...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Membre</th>
                    <th className="px-6 py-3 text-right">Avoir</th>
                    <th className="px-6 py-3 text-right">Dette</th>
                    <th className="px-6 py-3 text-right">Solde Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSituations.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {s.nom} {s.prenom}
                        <div className="text-xs text-gray-500">{s.numeroMembre}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-green-600">{s.avoir.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-orange-600">{s.dette.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold">{s.soldeNet.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}