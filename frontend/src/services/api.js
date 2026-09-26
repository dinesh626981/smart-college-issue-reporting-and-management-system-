import axios from 'axios';

// Base URL for Python Flask API
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401)) {
      // Clear local storage and redirect to login if token is expired/invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (identifier, password) => {
    const res = await api.post('/login', { email: identifier, identifier, password });
    return res.data;
  },
  register: async (name, email, password, phone, role = 'student', adminCode = '') => {
    const res = await api.post('/register', { name, email, password, phone, role, admin_code: adminCode });
    return res.data;
  },
  registerAdmin: async (name, email, password, phone, adminCode) => {
    const res = await api.post('/register-admin', { name, email, password, phone, admin_code: adminCode });
    return res.data;
  },
  forgotPassword: async (identifier) => {
    const res = await api.post('/forgot-password', { email: identifier, identifier });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.put('/profile', profileData);
    return res.data;
  }
};

export const complaintsService = {
  createComplaint: async (formData) => {
    // Requires multipart/form-data for image uploads
    const res = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getComplaints: async (params) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },
  getComplaintDetails: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },
  updateComplaint: async (id, data, isMultipart = false) => {
    const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await api.put(`/complaints/${id}`, data, { headers });
    return res.data;
  },
  deleteComplaint: async (id) => {
    const res = await api.delete(`/complaints/${id}`);
    return res.data;
  }
};

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const res = await api.post('/feedback', feedbackData);
    return res.data;
  },
  getAllFeedback: async () => {
    const res = await api.get('/feedback');
    return res.data;
  }
};

export const adminService = {
  getDepartments: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  createDepartment: async (departmentName) => {
    const res = await api.post('/departments', { department_name: departmentName });
    return res.data;
  },
  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
  getStudents: async () => {
    const res = await api.get('/students');
    return res.data;
  },
  getAdmins: async () => {
    const res = await api.get('/admins');
    return res.data;
  },
  getStaff: async () => {
    const res = await api.get('/staff');
    return res.data;
  },
  createStaff: async (staffData) => {
    const res = await api.post('/staff', staffData);
    return res.data;
  },
  getReports: async (params) => {
    const res = await api.get('/reports', { params });
    return res.data;
  },
  getCSVDownloadURL: () => {
    const token = localStorage.getItem('token');
    return `${API_URL}/reports?format=csv&Authorization=Bearer ${token}`; // Authorization parameter or header fallback
  }
};

export const aiService = {
  predictCategory: async (text) => {
    const res = await api.post('/predict-category', { text });
    return res.data;
  },
  chat: async (messages, context = null) => {
    const res = await api.post('/chat', { messages, context });
    return res.data;
  },
  analyzeIssue: async (description) => {
    const res = await api.post('/analyze-issue', { description });
    return res.data;
  },
  checkDuplicate: async (description) => {
    const res = await api.post('/check-duplicate', { description });
    return res.data;
  },
  reportQuality: async (description) => {
    const res = await api.post('/report-quality', { description });
    return res.data;
  },
  getSummary: async (issueId) => {
    const res = await api.get(`/issues/${issueId}/ai-summary`);
    return res.data;
  },
  getResolutionSuggestions: async (issueId) => {
    const res = await api.post(`/issues/${issueId}/resolution-suggestions`);
    return res.data;
  },
  explainStatus: async (issueId) => {
    const res = await api.post(`/issues/${issueId}/status-explanation`);
    return res.data;
  }
};

export const dashboardService = {
  getDashboardData: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  }
};

export default api;
