import React from 'react';
import { Box, Typography } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';

/**
 * EmptyState component for displaying when no data is available
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Empty state title
 * @param {string} props.message - Empty state message
 * @param {React.ReactNode} props.icon - Custom icon to display
 * @param {Object} props.sx - Additional styles to apply to the container
 */
const EmptyState = ({ 
    title = 'No data found',
    message = 'Try adjusting your filters or check back later.',
    icon = <SentimentDissatisfied color="action" sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />,
    sx = {}
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
                textAlign: "center",
                padding: "20px",
                ...sx
            }}
        >
            {icon}
            <Typography variant="h5" color="error" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
                {message}
            </Typography>
        </Box>
    );
};

export default EmptyState; 