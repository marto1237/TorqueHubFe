import React from 'react';
import { Grid } from 'react-loader-spinner';
import { Box, Typography } from '@mui/material';
import '../../styles/LoadingComponent.css';
import { useTheme } from '@mui/material';

const LoadingComponent = () => {
    const theme = useTheme(); // ✅ useTheme inside function body

    return (
        <Box
            className="loading-container"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
            }}
        >
            <Grid color={theme.palette.primary.main} height={80} width={80} />
            <Typography variant="body2" sx={{ marginTop: 2 }}>
                Loading, please wait...
            </Typography>
        </Box>
    );
};

export default LoadingComponent;
