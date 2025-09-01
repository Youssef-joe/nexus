import { create } from 'zustand';
import { apiClient } from '../lib/api';

export type UserRole = 'organization' | 'professional' | 'admin';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  status: string;
  phone?: string;
  location?: string;
  bio?: string;
  languages?: string[];
  // Organization fields
  companyName?: string;
  companySize?: string;
  industry?: string;
  // Professional fields
  skills?: string[];
  certifications?: string[];
  experience?: number;
  hourlyRate?: number;
  rating?: number;
  totalReviews?: number;
  completedProjects?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email: string, password: string, role: UserRole) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.login({ email, password, role });
      localStorage.setItem('auth_token', response.access_token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.register(userData);
      // Don't auto-login after signup, user needs to verify email
      set({ user: null, isAuthenticated: false });
      return response;
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
  },
  
  updateProfile: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const user = await apiClient.getProfile();
      set({ user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  forgotPassword: async (email: string) => {
    return apiClient.forgotPassword(email);
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiClient.resetPassword(token, newPassword);
  },

  verifyEmail: async (token: string) => {
    return apiClient.verifyEmail(token);
  },
}));