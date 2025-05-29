import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Home, ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * AccessDeniedPage - Shown when users try to access pages they don't have permission for
 * Similar design to 404 page but for access control violations
 */
const AccessDeniedPage = ({ requiredRole, userRole }) => {
    const theme = useTheme();
    const navigate = useNavigate();

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
                position: 'relative'
            }}
        >
            {/* Dark overlay for better text readability */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 1
                }}
            />
            
            {/* Content */}
            <Paper
                elevation={8}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2,
                    maxWidth: 500,
                    mx: 2
                }}
            >
                {/* Lock Icon */}
                <Lock 
                    sx={{ 
                        fontSize: '4rem', 
                        color: theme.palette.error.main,
                        mb: 2
                    }} 
                />
                
                {/* Access Denied Title */}
                <Typography 
                    variant="h1" 
                    color="error.main" 
                    sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '3rem', sm: '4rem' },
                        mb: 1
                    }}
                >
                    403
                </Typography>
                
                {/* Main Message */}
                <Typography 
                    variant="h4" 
                    color="primary" 
                    sx={{ 
                        marginBottom: '16px',
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                >
                    Access Restricted
                </Typography>
                
                {/* Detailed Message */}
                <Typography 
                    variant="body1" 
                    color="primary"  
                    sx={{ marginBottom: '24px', lineHeight: 1.6 }}
                >
                    You don't have permission to access this page. 
                    {requiredRole && (
                        <>
                            <br />
                            <strong>Required role:</strong> {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}
                        </>
                    )}
                    {userRole && (
                        <>
                            <br />
                            <strong>Your role:</strong> {userRole}
                        </>
                    )}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        sx={{ 
                            textTransform: 'none',
                            borderRadius: 2
                        }}
                    >
                        Go Back
                    </Button>
                    
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        color="primary"
                        startIcon={<Home />}
                        sx={{ 
                            textTransform: 'none',
                            borderRadius: 2
                        }}
                    >
                        Go to Home
                    </Button>
                </Box>

                {/* Additional Help Text */}
                <Typography 
                    variant="caption" 
                    color="primary"  
                    sx={{ 
                        display: 'block',
                        mt: 3,
                        fontStyle: 'italic'
                    }}
                >
                    If you believe this is an error, please contact an administrator.
                </Typography>
            </Paper>
        </Box>
    );
};

export default AccessDeniedPage; 