import api from '../api';

const AuthService = {
    login: (loginData) => {
        return api.post(`/auth/login`, loginData, { withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                // Check if this is a banned user error
                if (error.response && error.response.status === 403) {
                    const banData = error.response.data;
                    if (banData && banData.error === 'Account banned') {
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            });
    },

    register: (userData) => {
        return api.post(`/auth/register`, userData)
            .then(response => response.data)
            .catch(error => {
                // Add specific error details if available
                if (error.response) {
                    const errorData = {
                        status: error.response.status,
                        message: error.response.data.message || 'Registration failed',
                        field: null
                    };
                    
                    // Check for conflict errors (409) - duplicate username/email
                    if (error.response.status === 409) {
                        // Try to determine which field caused the conflict
                        const errorMessage = error.response.data.message || '';
                        if (errorMessage.toLowerCase().includes('username')) {
                            errorData.field = 'username';
                        } else if (errorMessage.toLowerCase().includes('email')) {
                            errorData.field = 'email';
                        }
                    }
                    
                    return Promise.reject(errorData);
                }
                return Promise.reject(error);
            });
    } ,

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
    
    /**
     * Check if a user is currently banned
     * @param {number} userId - The user ID to check
     * @returns {Promise<Object>} - Ban details if banned, empty object if not banned
     */
    checkUserBanStatus: (userId) => {
        return api.get(`/bans/user/${userId}`)
            .then(response => response.data)
            .catch(error => {
                // If 404, user is not banned
                if (error.response && error.response.status === 404) {
                    return {};
                }
                return Promise.reject(error);
            });
    }
};

export default AuthService; 