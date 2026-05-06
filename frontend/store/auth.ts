import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  nom?: string;
  prenom?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  register: (
    email: string, 
    password: string, 
    role: string, 
    tenantId: string,
    associationNom?: string,
    associationSlug?: string,
    associationDevise?: string,
    associationLangue?: string
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password, tenantId) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        tenantId,
      });

      const { user, accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, role, tenantId, associationNom, associationSlug, associationDevise, associationLangue) => {
    try {
      const data: any = {
        email,
        password,
        role,
        tenantId,
      };
      
      if (associationNom) data.associationNom = associationNom;
      if (associationSlug) data.associationSlug = associationSlug;
      if (associationDevise) data.associationDevise = associationDevise;
      if (associationLangue) data.associationLangue = associationLangue;
      
      await api.post('/auth/register', data);
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      // Vous pouvez ajouter un endpoint /auth/me pour vérifier le token
      set({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
