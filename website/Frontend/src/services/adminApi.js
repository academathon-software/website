import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Statistics endpoints
  getStatistics: () => api.get('/api/admin/statistics'),
  getUserStatistics: () => api.get('/api/admin/statistics/users'),
  getBookingStatistics: () => api.get('/api/admin/statistics/bookings'),
  
  // User management endpoints
  getUsers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.enabled !== undefined) params.append('enabled', filters.enabled);
    if (filters.search) params.append('search', filters.search);
    return api.get(`/api/admin/users?${params.toString()}`);
  },
  
  getUserDetails: (id) => api.get(`/api/admin/users/${id}`),
  
  updateUserStatus: (id, enabled) => 
    api.put(`/api/admin/users/${id}/status`, { enabled }),
  
  // Booking management endpoints
  getBookings: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.tutorId) params.append('tutorId', filters.tutorId);
    return api.get(`/api/admin/bookings?${params.toString()}`);
  },
  
  getBookingDetails: (id) => api.get(`/api/admin/bookings/${id}`),
  
  // Tutor invitation endpoints (reusing existing from api.js)
  getInvitations: () => api.get('/api/tutor-invitations'),
  sendInvitation: (email) => api.post('/api/tutor-invitations', { email }),
  resendInvitation: (id) => api.post(`/api/tutor-invitations/${id}/resend`),
  deleteInvitation: (id) => api.delete(`/api/tutor-invitations/${id}`),
};

export default adminAPI;

