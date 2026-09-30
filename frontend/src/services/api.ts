const rawBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
export const API_BASE = rawBase 
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`)
  : '/api';


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
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const err = await res.json();
        errMsg = err.detail || err.message || errMsg;
      } catch {
        const text = await res.text().catch(() => '');
        if (text) errMsg = text;
      }
      throw new Error(errMsg);
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
