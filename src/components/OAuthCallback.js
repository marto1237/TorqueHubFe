import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuthService from './configuration/Services/OAuthService';

function OAuthCallback({ setLoggedIn }) {
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data or token after OAuth callback
        OAuthService.fetchOAuthCallbackData()
            .then(data => {
                // Store the token and user data
                sessionStorage.setItem('jwtToken', data.jwtToken);
                setLoggedIn(true, data.user);
                navigate('/'); // Redirect to home page
            })
            .catch(error => {
                console.error('OAuth Callback Error:', error);
                navigate('/login'); // Redirect to login page on error
            });
    }, []);

    return <div>Loading...</div>;
}

export default OAuthCallback;
