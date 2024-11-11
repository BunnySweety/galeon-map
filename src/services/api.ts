import axios from 'axios';
import { Hospital } from '@/types/hospital';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const hospitalApi = {
  getAll: async (): Promise<Hospital[]> => {
    const response = await api.get('/hospitals');
    return response.data;
  },

  getById: async (id: string): Promise<Hospital> => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },

  create: async (hospital: Omit<Hospital, 'id'>): Promise<Hospital> => {
    const response = await api.post('/hospitals', hospital);
    return response.data;
  },

  update: async (id: string, hospital: Partial<Hospital>): Promise<Hospital> => {
    const response = await api.patch(`/hospitals/${id}`, hospital);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/hospitals/${id}`);
  },

  searchHospitals: async (params: {
    query?: string;
    status?: string[];
    region?: string;
    country?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/hospitals/search', { params });
    return response.data;
  }
};

export default api;