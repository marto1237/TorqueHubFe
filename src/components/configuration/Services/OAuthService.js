import api from '../api';

const OAuthService = {
    loginWithProvider: (provider) => {
        // Redirects the user to the backend's OAuth authorization endpoint
        window.location.href = `/oauth2/authorization/${provider}`;
    },

    fetchOAuthCallbackData: () => {
        // Fetches any callback response after the OAuth process
        return api.get(`/auth/oauth/callback`, { withCredentials: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }
};

export default OAuthService;
