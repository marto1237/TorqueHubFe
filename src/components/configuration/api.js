import axios from 'axios';
import { API_BASE_URL, API_BASE_URL_SHOWCASE } from './config';
import EventBus from './utils/EventBus';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptor to include the token if the request requires authentication
api.interceptors.request.use(
    (config) => {
        // Ensure config.requiresAuth exists (defaults to true for most requests)
        const requiresAuth = config.requiresAuth !== false;
        
        if (requiresAuth) {
            const token = sessionStorage.getItem('jwtToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to automatically refresh the token when a 401 Unauthorized occurs
api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Call the refresh token endpoint
                await api.post('/auth/refresh-token');

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Interceptor to handle authentication and server errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle JWT expiration
      if (error.response?.status === 401) {
        const message = error.response.data?.message || "";
        if (message.includes("JWT expired")) {
          EventBus.dispatch("logout"); // Fire logout event
        }
      }
      
      // Handle Bad Gateway errors (502)
      if (error.response?.status === 502 || !error.response) {
        // Create a custom error with more helpful information
        const customError = new Error("Server connection error");
        customError.isConnectionError = true;
        customError.originalError = error;
        return Promise.reject(customError);
      }
      
      return Promise.reject(error);
    }
  );

export default api;
