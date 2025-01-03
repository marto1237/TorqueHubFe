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
      if (error.response?.status === 401) {
        const message = error.response.data?.message || "";
        if (message.includes("JWT expired")) {
          EventBus.dispatch("logout"); // Fire logout event
        }
      }
      return Promise.reject(error);
    }
  );
export default ticktsAPI;
