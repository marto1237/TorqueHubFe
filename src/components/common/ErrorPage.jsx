import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

/**
 * ErrorPage component for displaying error states
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {boolean} props.showRetry - Whether to show retry button
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {boolean} props.isBadGateway - Whether this is a Bad Gateway (502) error
 */
const ErrorPage = ({ 
    title = 'Connection Error', 
    message = 'Unable to connect to the server. Please check your internet connection and try again.',
    showRetry = true,
    onRetry = () => window.location.reload(),
    isBadGateway = false
}) => {
    // If it's a bad gateway error, override the title and message
    const displayTitle = isBadGateway ? 'Server Temporarily Unavailable (502 Bad Gateway)' : title;
    const displayMessage = isBadGateway ? 
        'The server is currently unavailable or under maintenance. Please try again later or contact support if the issue persists.' : 
        message;
    
    return (
        <Box sx={{ 
            padding: '40px', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh'
        }}>
            <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
                {displayTitle}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                {displayMessage}
            </Typography>
            {showRetry && (
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={onRetry}
                >
                    Retry Connection
                </Button>
            )}
        </Box>
    );
};

export default ErrorPage; 