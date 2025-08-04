// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging or adding auth tokens
API.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle different error scenarios
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error - please try again later');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Service not found - please check your configuration');
    }
    
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw error;
  }
);

// API service methods
export const apiService = {
  // Health check endpoint
  healthCheck: async () => {
    try {
      const response = await API.get('/');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Get schedule based on user preferences
  getSchedule: async (userPreferences) => {
    try {
      const response = await API.post('/chat', userPreferences);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get schedule: ${error.message}`);
    }
  },

  // Additional endpoints that might be useful
  getCourses: async (filters = {}) => {
    try {
      const response = await API.get('/courses', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get courses: ${error.message}`);
    }
  },

  // Save user preferences (if backend supports it)
  savePreferences: async (preferences) => {
    try {
      const response = await API.post('/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to save preferences: ${error.message}`);
    }
  },
};

// Utility function for handling API calls with loading states
export const withLoading = async (apiCall, setLoading) => {
  if (setLoading) setLoading(true);
  
  try {
    const result = await apiCall();
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error('API call failed:', error);
    return { success: false, data: null, error: error.message };
  } finally {
    if (setLoading) setLoading(false);
  }
};

export default API;