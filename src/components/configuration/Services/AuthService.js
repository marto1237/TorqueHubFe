import api from '../api';

const AuthService = {
    login: (loginData) => {
        return api.post(`/auth/login`, loginData)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    register: (userData) => {
        return api.post(`/auth/register`, userData)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    refreshToken: (refreshToken) => {
        return api.post(`/auth/refresh-token`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    logout: () => {
        return api.post(`/auth/logout`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    checkSession: () => {
        return api.get(`/auth/check-session`, { withCredentials: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
};

export default AuthService;
