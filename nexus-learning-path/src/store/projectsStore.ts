import { create } from 'zustand';
import { apiClient } from '../lib/api';

export interface Project {
  _id: string;
  title: string;
  description: string;
  organizationId: any;
  professionalId?: any;
  type: 'short_term' | 'long_term' | 'project_based';
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  requiredSkills: string[];
  budget: number;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  deliverables: string[];
  location?: string;
  isRemote: boolean;
  languages: string[];
  applicationsCount: number;
  viewsCount: number;
  aiMatchingScore?: number;
  aiInsights?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectsState {
  projects: Project[];
  myProjects: Project[];
  recommendedProjects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  
  // Actions
  fetchProjects: (params?: any) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (projectData: any) => Promise<Project>;
  updateProject: (id: string, projectData: any) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  fetchMyProjects: () => Promise<void>;
  fetchRecommendedProjects: () => Promise<void>;
  searchProjects: (query: string, filters?: any) => Promise<Project[]>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  myProjects: [],
  recommendedProjects: [],
  currentProject: null,
  isLoading: false,
  pagination: null,

  fetchProjects: async (params = {}) => {
    set({ isLoading: true });
    try {
      console.log('Fetching projects with params:', params);
      const response = await apiClient.getProjects(params);
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array?', Array.isArray(response));
      
      // Handle different response formats
      let projects = [];
      if (Array.isArray(response)) {
        projects = response;
      } else if (response && response.projects) {
        projects = response.projects;
      } else if (response && Array.isArray(response.data)) {
        projects = response.data;
      }
      
      console.log('Final projects array:', projects);
      set({ 
        projects: projects,
        pagination: response.pagination || null,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      set({ isLoading: false, projects: [] });
      throw error;
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const project = await apiClient.getProject(id);
      set({ currentProject: project, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createProject: async (projectData: any) => {
    set({ isLoading: true });
    try {
      const project = await apiClient.createProject(projectData);
      set(state => ({ 
        myProjects: [project, ...state.myProjects],
        isLoading: false 
      }));
      return project;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, projectData: any) => {
    set({ isLoading: true });
    try {
      const project = await apiClient.updateProject(id, projectData);
      set(state => ({
        myProjects: state.myProjects.map(p => p._id === id ? project : p),
        projects: state.projects.map(p => p._id === id ? project : p),
        currentProject: state.currentProject?._id === id ? project : state.currentProject,
        isLoading: false
      }));
      return project;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true });
    try {
      await apiClient.deleteProject(id);
      set(state => ({
        myProjects: state.myProjects.filter(p => p._id !== id),
        projects: state.projects.filter(p => p._id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMyProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await apiClient.getMyProjects();
      set({ myProjects: projects, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchRecommendedProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await apiClient.getRecommendedProjects();
      set({ recommendedProjects: projects, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  searchProjects: async (query: string, filters = {}) => {
    try {
      const projects = await apiClient.searchProjects(query, filters);
      return projects;
    } catch (error) {
      throw error;
    }
  },
}));