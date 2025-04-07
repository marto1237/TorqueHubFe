import React from 'react';
import { Typography, Box } from '@mui/material';
import LoadingComponent from './Loader'; // Your custom spinner
import NotFoundPage from './NotFoundPage'; // Optional

const QueryWrapper = ({ isLoading, isError, notFound, error, children }) => {
    if (isLoading) return <LoadingComponent />;

    if (notFound) return <NotFoundPage />;

    if (isError) {
        const message = error?.message || 'Something went wrong.';
        return (
            <Box sx={{ padding: '40px', textAlign: 'center' }}>
                <Typography variant="h6" color="error">{message}</Typography>
            </Box>
        );
    }

    return <>{children}</>;
};

export default QueryWrapper;
