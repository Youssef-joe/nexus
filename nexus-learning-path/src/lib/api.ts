const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string; role: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any) {
    return this.request<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string }>(`/auth/verify-email?token=${token}`);
  }

  // Projects endpoints
  async getProjects(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<{ projects: any[]; pagination: any }>(`/projects${queryString}`);
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async createProject(projectData: any) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyProjects() {
    return this.request<any[]>('/projects/my-projects');
  }

  async getRecommendedProjects() {
    return this.request<any[]>('/projects/recommended');
  }

  async searchProjects(query: string, filters?: any) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request<any[]>(`/projects/search?${params.toString()}`);
  }

  // Applications endpoints
  async getApplications(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<{ applications: any[]; pagination: any }>(`/applications${queryString}`);
  }

  async getApplication(id: string) {
    return this.request<any>(`/applications/${id}`);
  }

  async createApplication(applicationData: any) {
    return this.request<any>('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplicationStatus(id: string, status: string, message?: string) {
    return this.request<any>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message }),
    });
  }

  async withdrawApplication(id: string) {
    return this.request<{ message: string }>(`/applications/${id}/withdraw`, {
      method: 'DELETE',
    });
  }

  async getMyApplications() {
    return this.request<any[]>('/applications/my-applications');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  // Payment endpoints
  async createPaymentIntent(projectId: string) {
    return this.request<{ clientSecret: string; paymentId: string }>('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.request<any>('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async getPaymentHistory() {
    return this.request<any[]>('/payments/history');
  }

  async setupPayoutAccount() {
    return this.request<{ accountId: string; onboardingUrl: string }>('/payments/setup-payout-account', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);