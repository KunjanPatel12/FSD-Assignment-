const API_BASE = '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('fitpulse_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (netErr) {
    const error = new Error('Cannot connect to FitPulse API server. Please ensure the backend is running on port 5000.');
    error.status = 503;
    throw error;
  }

  let data = null;
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || `Server error (${response.status})` };
    }
  } catch {
    data = { message: `Server returned status ${response.status}` };
  }

  if (!response.ok) {
    let errorMsg = (data && data.message) ? data.message : null;
    if (!errorMsg || typeof errorMsg !== 'string' || errorMsg.trim() === '') {
      if (response.status === 401) {
        errorMsg = 'Invalid email or password. Please verify credentials or create a new account.';
      } else if (response.status === 404) {
        errorMsg = 'Requested resource not found.';
      } else if (response.status === 409) {
        errorMsg = 'An account with this email address already exists.';
      } else {
        errorMsg = `Server error (${response.status}). Please try again.`;
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Authentication
export const authApi = {
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiClient('/auth/register', { method: 'POST', body: userData }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  getMe: () => apiClient('/auth/me'),
  updatePreferences: (prefs) => apiClient('/auth/preferences', { method: 'PATCH', body: prefs }),
};

// Fitness Profile
export const profileApi = {
  getProfile: () => apiClient('/profile'),
  updateProfile: (profileData) => apiClient('/profile', { method: 'POST', body: profileData }),
};

// Exercises
export const exerciseApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/exercises${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiClient(`/exercises/${id}`),
  create: (data) => apiClient('/exercises', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/exercises/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiClient(`/exercises/${id}`, { method: 'DELETE' }),
};

// Workout Plans & Sessions
export const workoutApi = {
  getCurrentPlan: (memberId) =>
    apiClient(`/workout-plans/current${memberId ? `?memberId=${memberId}` : ''}`),
  generatePlan: () => apiClient('/workout-plans/generate', { method: 'POST' }),
  assignPlan: (planData) => apiClient('/workout-plans/assign', { method: 'POST', body: planData }),
  logSession: (sessionData) =>
    apiClient('/workout-sessions', { method: 'POST', body: sessionData }),
  getSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/workout-sessions${query ? `?${query}` : ''}`);
  },
};

// Attendance
export const attendanceApi = {
  getStatus: () => apiClient('/attendance/status'),
  checkIn: (data = {}) => apiClient('/attendance/checkin', { method: 'POST', body: data }),
  checkOut: () => apiClient('/attendance/checkout', { method: 'POST', body: {} }),
  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/attendance/history${query ? `?${query}` : ''}`);
  },
  manualStaffEntry: (entryData) =>
    apiClient('/attendance/manual-entry', { method: 'POST', body: entryData }),
};

// Analytics & Consistency
export const analyticsApi = {
  getDashboard: () => apiClient('/analytics/dashboard'),
  getConsistency: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/analytics/consistency${query ? `?${query}` : ''}`);
  },
};

// Supplements
export const supplementApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/supplements${query ? `?${query}` : ''}`);
  },
  create: (data) => apiClient('/supplements', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/supplements/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiClient(`/supplements/${id}`, { method: 'DELETE' }),
};

// Trainer
export const trainerApi = {
  getMembers: () => apiClient('/trainer/members'),
  getMemberDetails: (memberId) => apiClient(`/trainer/members/${memberId}`),
};

// Admin
export const adminApi = {
  getStats: () => apiClient('/admin/stats'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserRole: (id, data) =>
    apiClient(`/admin/users/${id}/role`, { method: 'PATCH', body: data }),
  getSchedule: () => apiClient('/admin/schedule'),
  updateSchedule: (data) => apiClient('/admin/schedule', { method: 'PUT', body: data }),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};
