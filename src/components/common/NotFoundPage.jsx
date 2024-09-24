import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("https://www.danella.com/wp-content/uploads/2017/10/AdobeStock_53778962.jpeg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                textAlign: 'center',
                color: 'white',
            }}
        >
            <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                404
            </Typography>
            <Typography variant="h4" color="textSecondary" sx={{ marginBottom: '20px' }}>
                Oops! Page Not Found
            </Typography>
            <Button
                component={Link}
                to="/"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none' }}
            >
                Go Back to Home
            </Button>
        </Box>
    );
};

export default NotFoundPage;
