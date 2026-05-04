'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  Users,
  Coins,
  CreditCard,
  PiggyBank,
  Wallet,
  HandHeart,
  FolderKanban,
  Gavel,
  Calendar,
  Vote,
  Settings,
  BarChart3,
  FileText,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: any;
  href: string;
  roles?: string[];
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const menuSections: MenuSection[] = [
    {
      title: 'Tableau de Bord',
      items: [
        { title: 'Accueil', icon: Home, href: '/dashboard' },
      ],
    },
    {
      title: 'Gestion des Membres',
      items: [
        { title: 'Membres', icon: Users, href: '/membres', roles: ['PRESIDENT', 'SECRETAIRE', 'TRESORIER'] },
         { title: 'Situation Nette', icon: BarChart3, href: '/dashboard/situation-nette', roles: ['PRESIDENT', 'TRESORIER'] },
        { title: 'Mon Espace', icon: BarChart3, href: '/membre', roles: ['PRESIDENT', 'TRESORIER', 'MEMBRE'] },
      ],
    },
    {
      title: 'Modules Financiers',
      items: [
        { title: 'Tontines', icon: Coins, href: '/tontines', roles: ['PRESIDENT', 'TRESORIER', 'SECRETAIRE'] },
        { title: 'Prêts', icon: CreditCard, href: '/prets', roles: ['PRESIDENT', 'TRESORIER'] },
        { title: 'Épargnes', icon: PiggyBank, href: '/epargnes', roles: ['PRESIDENT', 'TRESORIER'] },
        { title: 'Caisses', icon: Wallet, href: '/caisses', roles: ['PRESIDENT', 'TRESORIER'] },
        { title: 'Validation Dépôts', icon: CheckCircle, href: '/depots-validation', roles: ['PRESIDENT', 'TRESORIER'] },
      ],
    },
    {
      title: 'Gestion & Aides',
      items: [
        { title: 'Aides', icon: HandHeart, href: '/aides', roles: ['PRESIDENT', 'TRESORIER', 'SECRETAIRE'] },
        { title: 'Projets', icon: FolderKanban, href: '/projets', roles: ['PRESIDENT', 'TRESORIER'] },
        { title: 'Sanctions', icon: Gavel, href: '/sanctions', roles: ['PRESIDENT', 'TRESORIER'] },
        { title: 'Complément Fonds', icon: Wallet, href: '/complement-fonds', roles: ['PRESIDENT', 'TRESORIER'] },
      ],
    },
    {
      title: 'Séances & Votes',
      items: [
        { title: 'Séances', icon: Calendar, href: '/seances', roles: ['PRESIDENT', 'SECRETAIRE', 'TRESORIER'] },
        { title: 'Votes & Décisions', icon: Vote, href: '/votes', roles: ['PRESIDENT', 'SECRETAIRE'] },
      ],
    },
    {
      title: 'Rapports & Statistiques',
      items: [
        { title: 'Rapports', icon: FileText, href: '/rapports', roles: ['PRESIDENT', 'TRESORIER', 'COMMISSAIRE'] },
        { title: 'Statistiques', icon: BarChart3, href: '/statistiques', roles: ['PRESIDENT', 'TRESORIER'] },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { title: 'Paramètres', icon: Settings, href: '/parametres', roles: ['PRESIDENT'] },
        { title: 'Notifications', icon: Bell, href: '/notifications' },
      ],
    },
  ];

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(user?.role || '');
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">GestAsso</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Multi-Tenant</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.nom} {user?.prenom}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter((item) => hasAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg shadow-green-500/50'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        } ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? item.title : ''}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-sm font-medium">{item.title}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Déconnexion' : ''}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
