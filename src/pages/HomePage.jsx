import React, {useEffect, useState} from 'react';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { useNotifications, NotificationsProvider } from '@toolpad/core/useNotifications';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';

import '../styles/HomePage.css';

const notificationsProviderSlots = {
    snackbar: styled(Snackbar)({ position: 'absolute' }),
};

const HomePage = () => {
    const notifications = useNotifications();
    const [username, setUsername] = useState('');
    const [text] = useTypewriter({
        words: ['Welcome to Torque Hub'],
        loop: 0, // Infinite loop
        typeSpeed: 200,
        deleteSpeed: 0,
        delaySpeed: 1200,
    });

    useEffect(() => {
        // Check if the user just logged in
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
        const loginSuccess = localStorage.getItem('loginSuccess');
        if (loginSuccess) {
            // Show success notification
            notifications.show('Welcome back, ' + storedUsername + '!', { autoHideDuration: 3000, severity: 'success' });

            // Clear the login success flag
            localStorage.removeItem('loginSuccess');
        }
    }, [notifications]);



    return (
        <div className="background" >
            <div className="navbar">

            </div>
            {/* Wrap the Typewriter text in a span and apply inline styles */}
            <span className="typewriter-text">
                {text}
                {/* Apply cursor style */}
                <Cursor cursorStyle="|" className="cursor" />
            </span>
        </div>
    );
};

export default function HomePageWithNotifications() {
    return (
        <NotificationsProvider slots={notificationsProviderSlots}>
            <HomePage />
        </NotificationsProvider>
    );
}
