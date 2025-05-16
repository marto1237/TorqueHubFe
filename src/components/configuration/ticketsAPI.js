import axios from 'axios';
import {API_BASE_URL_TICKETS } from './config';
import EventBus from './utils/EventBus';

const ticktsAPI = axios.create({
    baseURL: API_BASE_URL_TICKETS,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptor to include the token if the request requires authentication
ticktsAPI.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('jwtToken');
        if (token && config.requiresAuth) {
            config.headers['Authorization'] = `Bearer ${token}`;
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

ticktsAPI.interceptors.response.use(
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
export default ticktsAPI;
