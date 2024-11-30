import api from '../api';

const AuthService = {
    login: (loginData) => {
        return api.post(`/auth/login`, loginData, { withCredentials: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    loginWithGoogle: (token) => {
    return fetch('/oauth2/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Google login failed');
            }
            return response.json();
        });
},

    register: (userData) => {
        return api.post(`/auth/register`, userData)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    refreshToken: () => {
        return api.post(`/auth/refresh-token`, {}, { withCredentials: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    logout: () => {
        return api.post(`/auth/logout`, {}, { withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Logout error:', error.response || error.message || error);
                return Promise.reject(error);
            });
    },

    checkSession: () => {
        return api.get(`/auth/check-session`, { withCredentials: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
};



export default AuthService;

