const API_BASE = '/api';

export const apiClient = {
  getToken: () => localStorage.getItem('drainx_token'),
  setToken: (token: string) => localStorage.setItem('drainx_token', token),
  clearToken: () => localStorage.removeItem('drainx_token'),
  
  async get(endpoint: string) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!res.ok) {
      throw new Error(`API GET ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network Error' }));
      throw new Error(err.detail || `API POST ${endpoint} failed`);
    }
    return res.json();
  },

  async patch(endpoint: string, data?: any) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      throw new Error(`API PATCH ${endpoint} failed`);
    }
    return res.json();
  }
};
