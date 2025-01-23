import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import EventIcon from '@mui/icons-material/Event';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import CategoryIcon from '@mui/icons-material/Category';
import TagIcon from '@mui/icons-material/Tag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LanguageIcon from '@mui/icons-material/Language';

const AdminPanel = ({ userDetails }) => {
    const navigate = useNavigate();

    // Define the admin options with their routes, labels, and icons
    const adminOptions = [
        {
            label: 'Manage Models',
            icon: <ManageAccountsIcon fontSize="large" />,
            route: '/manage-carModels',
        },
        {
            label: 'Manage Events',
            icon: <EventIcon fontSize="large" />,
            route: '/manage-events',
        },
        {
            label: 'Create Tag Category',
            icon: <CategoryIcon fontSize="large" />,
            route: '/create-category',
        },
        {
            label: 'Create Tag',
            icon: <TagIcon fontSize="large" />,
            route: '/create-tag',
        },
        {
            label: 'Manage Brands',
            icon: <CarRepairIcon fontSize="large" />,
            route: '/create-brand',
        },
        {
            label: 'Manage Event tags',
            icon: <LocalOfferIcon fontSize="large" />,
            route: '/eventTicketsTags',
        },
        {
            label: 'Manage Cars category',
            icon: <LocalOfferIcon fontSize="large" />,
            route: '/carCategory',
        },
        {
            label: 'Manage Countries',
            icon: <LanguageIcon fontSize="large" />,
            route: '/countries',
        },

    ];

    return (
        <Box
            sx={{
                padding: '40px',
                paddingTop: '100px',
                minHeight: '100vh',
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {/* Header Section */}
            <Typography variant="h3" sx={{ marginBottom: '30px', fontWeight: 'bold', color: 'text.primary' }}>
                Admin Panel
            </Typography>
            <Typography variant="subtitle1" sx={{ marginBottom: '40px', color: 'text.secondary' }}>
                Manage all administrative tasks and settings from here
            </Typography>

            {/* Options Grid */}
            <Grid container spacing={4} justifyContent="center">
                {adminOptions.map((option) => (
                    <Grid item xs={12} sm={6} md={4} key={option.label}>
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '200px',
                                padding: '20px',
                                boxShadow: 3,
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '15px',
                                }}
                            >
                                {/* Icon */}
                                {option.icon}
                                {/* Label */}
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {option.label}
                                </Typography>
                            </CardContent>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(option.route)}
                                sx={{ width: '80%' }}
                            >
                                Go
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default AdminPanel;
