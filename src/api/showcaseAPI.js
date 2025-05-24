import axios from 'axios';
import {API_BASE_URL_SHOWCASE } from './config';
import EventBus from './utils/EventBus';

const showcaseAPI = axios.create({
    baseURL: API_BASE_URL_SHOWCASE,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptor to include the token if the request requires authentication
showcaseAPI.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('jwtToken');
        // Fix: Remove redundant token setting
        if (token && config.requiresAuth) {
            config.headers['Authorization'] = `Bearer ${token}`;
            
            // Log the request for debugging
            console.log(`Showcase API ${config.method.toUpperCase()} request to: ${config.url}`);
            if (config.method === 'post' || config.method === 'put') {
                console.log('Request data:', config.data);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

showcaseAPI.interceptors.response.use(
    (response) => {
        // Log successful responses for debugging
        console.log(`Showcase API response from ${response.config.url}:`, response.status);
        return response;
    },
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
            console.error("Showcase API connection error:", error);
            // Create a custom error with more helpful information
            const customError = new Error("Server connection error");
            customError.isConnectionError = true;
            customError.originalError = error;
            return Promise.reject(customError);
        }
      
        // Log detailed error information
        console.error("Showcase API error:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
      
        return Promise.reject(error);
    }
);

export default showcaseAPI; 