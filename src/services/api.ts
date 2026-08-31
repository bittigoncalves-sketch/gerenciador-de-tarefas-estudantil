import type { Assignment, ActivityLog, CategoryItem, StatsSummary, AssignmentFile } from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('escola_auth_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('escola_auth_token', token);
  } else {
    localStorage.removeItem('escola_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Erro na requisição';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {
      errorMsg = `Status ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token: string; user: { username: string; role: string } }> {
    const res = await request<{ success: boolean; token: string; user: { username: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async verifyAuth(): Promise<boolean> {
    try {
      const res = await request<{ valid: boolean }>('/auth/verify');
      return res.valid;
    } catch {
      return false;
    }
  },

  // Assignments
  async getAssignments(params?: {
    search?: string;
    category?: string;
    status?: string;
    urgency?: string;
    sort?: string;
  }): Promise<{ total: number; assignments: Assignment[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.urgency) query.set('urgency', params.urgency);
    if (params?.sort) query.set('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    try {
      const data = await request<{ total: number; assignments: Assignment[] }>(`/assignments${queryString}`);
      if (!params || (!params.search && params.category === 'todas' && params.status === 'todos')) {
        try {
          localStorage.setItem('cached_assignments', JSON.stringify(data.assignments));
        } catch {
          // Ignore localStorage quota
        }
      }
      return data;
    } catch (err) {
      // Offline / network fallback from cached storage
      const cached = localStorage.getItem('cached_assignments');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return { total: parsed.length, assignments: parsed };
        } catch {
          // ignore
        }
      }
      throw err;
    }
  },

  async getAssignment(id: string): Promise<Assignment> {
    return request<Assignment>(`/assignments/${id}`);
  },

  async createAssignment(data: Partial<Assignment>): Promise<Assignment> {
    const res = await request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  async updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment> {
    const res = await request<Assignment>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  async deleteAssignment(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteFile(assignmentId: string, fileId: string): Promise<{ success: boolean; files: AssignmentFile[] }> {
    return request<{ success: boolean; files: AssignmentFile[] }>(`/assignments/${assignmentId}/files/${fileId}`, {
      method: 'DELETE',
    });
  },

  // Stats & Activities
  async getStats(): Promise<StatsSummary> {
    try {
      const stats = await request<StatsSummary>('/stats');
      try {
        localStorage.setItem('cached_stats', JSON.stringify(stats));
      } catch {}
      return stats;
    } catch (err) {
      const cached = localStorage.getItem('cached_stats');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
      throw err;
    }
  },

  async getActivities(params?: { limit?: number; action?: string; search?: string }): Promise<{ total: number; logs: ActivityLog[] }> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.action) query.set('action', params.action);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ total: number; logs: ActivityLog[] }>(`/activities${queryString}`);
  },

  // Categories
  async getCategories(): Promise<CategoryItem[]> {
    try {
      const categories = await request<CategoryItem[]>('/categories');
      try {
        localStorage.setItem('cached_categories', JSON.stringify(categories));
      } catch {}
      return categories;
    } catch (err) {
      const cached = localStorage.getItem('cached_categories');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
      throw err;
    }
  },

  async createCategory(name: string, color?: string): Promise<CategoryItem> {
    return request<CategoryItem>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Backup & Restore
  async restoreBackup(backupData: any): Promise<{ success: boolean; count: number }> {
    return request<{ success: boolean; count: number }>('/restore', {
      method: 'POST',
      body: JSON.stringify({ backupData }),
    });
  },

  // Database Management & Metrics
  async getDatabaseStatus(): Promise<any> {
    return request<any>('/database/status');
  },

  async optimizeDatabase(): Promise<{ success: boolean; message: string; recordsProcessed: number; timestamp: string }> {
    return request<{ success: boolean; message: string; recordsProcessed: number; timestamp: string }>('/database/optimize', {
      method: 'POST',
    });
  },

  // Code Tools & Java Runtime Simulation
  async analyzeCode(code: string, language?: string): Promise<any> {
    return request<any>('/code/analyze', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  },

  async simulateCodeRun(code: string, language?: string, fileName?: string): Promise<{
    success: boolean;
    compiler: string;
    fileName: string;
    className?: string;
    compiled: boolean;
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
    analysis?: any;
  }> {
    return request<any>('/code/simulate-run', {
      method: 'POST',
      body: JSON.stringify({ code, language, fileName }),
    });
  },

  // Security Firewall & Intrusion Prevention API
  async getSecurityStatus(): Promise<any> {
    return request<any>('/security/status');
  },

  async unlockIp(ip: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/security/unlock-ip', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
  }
};
