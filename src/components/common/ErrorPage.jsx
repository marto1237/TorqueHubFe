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
 */
const ErrorPage = ({ 
    title = 'Connection Error', 
    message = 'Unable to connect to the server. Please check your internet connection and try again.',
    showRetry = true,
    onRetry = () => window.location.reload()
}) => {
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
                {title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                {message}
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