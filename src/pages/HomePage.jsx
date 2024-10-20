import React, {useEffect, useState} from 'react';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import { useAppNotifications } from '../components/common/NotificationProvider';

import '../styles/HomePage.css';


const HomePage = () => {
    const notifications = useAppNotifications();
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
        const storedUserDetails = JSON.parse(sessionStorage.getItem('userDetails'));
        if (storedUserDetails?.username) {
            setUsername(storedUserDetails.username);
        }
        const loginSuccess = sessionStorage.getItem('loginSuccess');
        if (loginSuccess) {
            // Show success notification
            notifications.show('Welcome back, ' + storedUserDetails.username + '!', { autoHideDuration: 3000, severity: 'success' });

            // Clear the login success flag
            sessionStorage.removeItem('loginSuccess');
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

export default HomePage;
