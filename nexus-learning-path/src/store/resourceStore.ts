import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'article' | 'webinar' | 'course';
  status: 'draft' | 'published' | 'archived';
  content?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  categories: string[];
  authorId: any;
  duration?: number;
  difficulty?: string;
  viewsCount: number;
  likesCount: number;
  externalUrl?: string;
  scheduledDate?: string;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResourceStore {
  resources: Resource[];
  featuredResources: Resource[];
  categories: string[];
  loading: boolean;
  error: string | null;
  fetchResources: (type?: string, category?: string) => Promise<void>;
  fetchFeatured: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchResourceById: (id: string) => Promise<Resource>;
  searchResources: (query: string) => Promise<void>;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: [],
  featuredResources: [],
  categories: [],
  loading: false,
  error: null,

  fetchResources: async (type?, category?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (category) params.append('category', category);
      
      const response = await api.get(`/resources?${params.toString()}`);
      set({ resources: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch resources', loading: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const response = await api.get('/resources/featured');
      set({ featuredResources: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch featured resources' });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get('/resources/categories');
      set({ categories: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch categories' });
    }
  },

  fetchResourceById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/resources/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch resource', loading: false });
      throw error;
    }
  },

  searchResources: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/resources/search?q=${encodeURIComponent(query)}`);
      set({ resources: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to search resources', loading: false });
    }
  },
}));