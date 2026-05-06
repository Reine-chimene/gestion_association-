'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    role: 'MEMBRE',
    associationNom: '',
    associationSlug: '',
    associationDevise: 'FCFA',
    associationLangue: 'fr',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!formData.associationNom || !formData.associationSlug) {
      setError('Veuillez remplir les informations de l\'association');
      return;
    }

    setIsLoading(true);

    try {
      // Générer tenantId à partir du slug
      const tenantId = formData.associationSlug.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      await register(
        formData.email,
        formData.password,
        formData.role,
        tenantId,
        formData.associationNom,
        formData.associationSlug,
        formData.associationDevise,
        formData.associationLangue
      );
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      {/* En-tête */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Gest'Assoc
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                Tarifs
              </a>
              <a href="#contact" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                Contact
              </a>
            </nav>
            <button
              onClick={() => setShowRegister(!showRegister)}
              className="px-6 py-2.5 bg-white text-slate-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all"
            >
              {showRegister ? 'Retour' : 'Commencer'}
            </button>
          </div>
        </div>
      </header>

      {/* Section principale avec formulaire intégré */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Texte et features */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold mb-2">
                🚀 Version 2.0 - Nouvelle expérience
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Gérez votre association
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  en toute simplicité
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
                La plateforme complète qui centralise tous les aspects de votre association : 
                finances, membres, tontines, prêts et bien plus encore.
              </p>
            </div>

            {/* Liste des avantages */}
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {[
                { icon: '💰', title: 'Gestion financière complète', desc: 'Suivi des caisses, bilans automatiques' },
                { icon: '👥', title: 'Gestion des membres', desc: 'Profils complets et historiques' },
                { icon: '🏦', title: 'Tontines & Épargnes', desc: 'Automatisation des cotisations' },
                { icon: '📊', title: 'Tableaux de bord', desc: 'Analyses et rapports en temps réel' },
              ].map((feature, i) => (
                <div key={i} className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                    <p className="text-gray-400 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats ou CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowRegister(true)}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all"
              >
                <span className="flex items-center gap-2">
                  Créer gratuitement
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </button>
              <span className="text-sm text-gray-400">
                Essai gratuit de 30 jours • Pas de carte bancaire requise
              </span>
            </div>
          </div>

          {/* Formulaire d'inscription */}
          <div className={`relative transition-all duration-500 ${showRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              {/* Titre */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {success ? 'Inscription réussie !' : 'Créer votre association'}
                </h2>
                <p className="text-gray-300">
                  {success ? 'Redirection vers la connexion...' : 'Commencez gratuitement en quelques minutes'}
                </p>
              </div>

              {/* Formulaire */}
              {!success && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Infos association */}
                  <div className="space-y-4 pb-4 border-b border-white/10">
                    <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Votre association</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="associationNom" className="block text-sm font-medium text-gray-300 mb-2">
                          Nom de l'association
                        </label>
                        <input
                          id="associationNom"
                          name="associationNom"
                          type="text"
                          required
                          value={formData.associationNom}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Ex: Association des Parents d'Élèves"
                        />
                      </div>
                      <div>
                        <label htmlFor="associationSlug" className="block text-sm font-medium text-gray-300 mb-2">
                          Identifiant (slug)
                        </label>
                        <input
                          id="associationSlug"
                          name="associationSlug"
                          type="text"
                          required
                          value={formData.associationSlug}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="mon-association"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Infos utilisateur */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Vos informations</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="prenom" className="block text-sm font-medium text-gray-300 mb-2">
                          Prénom
                        </label>
                        <input
                          id="prenom"
                          name="prenom"
                          type="text"
                          required
                          value={formData.prenom}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Jean"
                        />
                      </div>
                      <div>
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-2">
                          Nom
                        </label>
                        <input
                          id="nom"
                          name="nom"
                          type="text"
                          required
                          value={formData.nom}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email professionnel
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="jean.dupont@association.org"
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Sécurité</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                          Mot de passe
                        </label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Min. 8 caractères"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                          Confirmer
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Confirmez"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rôle */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                      Votre rôle dans l'association
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="MEMBRE" className="bg-slate-800">Membre</option>
                      <option value="SECRETAIRE" className="bg-slate-800">Secrétaire</option>
                      <option value="TRESORIER" className="bg-slate-800">Trésorier</option>
                      <option value="PRESIDENT" className="bg-slate-800">Président</option>
                    </select>
                  </div>

                  {/* Affichage erreur */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {/* Bouton submit */}
                  <button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Créer mon association
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Footer du formulaire */}
              {!success && (
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    Déjà inscrit ?{' '}
                    <button 
                      onClick={() => router.push('/login')}
                      className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                    >
                      Se connecter
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Section fonctionnalités */}
      <section id="features" className="relative z-10 bg-black/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Une solution intégrée pour simplifier la gestion de votre association
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Gestion Financière',
                desc: 'Suivez vos caisses, transactions et générez des rapports détaillés.',
                icon: '💎',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Tontines & Épargnes',
                desc: 'Automatisez les cotisations, distribuez les cagnottes.',
                icon: '🏦',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                title: 'Prêts & Aides',
                desc: 'Gérez les prêts, échéanciers et aides sociales.',
                icon: '🤝',
                gradient: 'from-orange-500 to-red-500',
              },
            ].map((feature, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl" className={`bg-gradient-to-r ${feature.gradient}`}></div>
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Gest'Assoc. Fait avec ❤️ pour les associations.
          </p>
        </div>
      </footer>
    </div>
  );
}