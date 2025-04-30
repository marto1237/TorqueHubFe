import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FlagIcon from '@mui/icons-material/Flag';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import TagIcon from '@mui/icons-material/Tag';
import HistoryIcon from '@mui/icons-material/History';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';

const ModeratorPanel = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    // Define the moderator options with their routes, labels, and icons
    const moderatorOptions = [
        {
            label: 'Report Management',
            icon: <FlagIcon fontSize="large" />,
            route: '/report-management',
            description: 'Review and handle user reports'
        },
        {
            label: 'Moderation Logs',
            icon: <HistoryIcon fontSize="large" />,
            route: '/moderation-logs',
            description: 'View history of moderation activities'
        },
        {
            label: 'Report Configuration',
            icon: <SettingsIcon fontSize="large" />,
            route: '/report-config',
            description: 'Manage report types, reasons and statuses'
        },
        {
            label: 'Manage Event Announcements',
            icon: <AnnouncementIcon fontSize="large" />,
            route: '/manage-event-announcements',
            description: 'Manage announcements for events'
        },
        {
            label: 'Manage Events',
            icon: <EventIcon fontSize="large" />,
            route: '/manage-events',
            description: 'Review and manage community events'
        },
        {
            label: 'Create Tags',
            icon: <TagIcon fontSize="large" />,
            route: '/create-tag',
            description: 'Create and manage content tags'
        },
        {
            label: 'Manage Event Tags',
            icon: <LocalOfferIcon fontSize="large" />,
            route: '/eventTicketsTags',
            description: 'Manage tags for event tickets'
        }
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
            <Typography variant="h3" sx={{ marginBottom: '20px', fontWeight: 'bold', color: 'text.primary' }}>
                Moderator Panel
            </Typography>
            <Typography variant="subtitle1" sx={{ marginBottom: '40px', color: 'text.secondary' }}>
                Manage community content and reports
            </Typography>

            {/* Options Grid */}
            <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '1200px' }}>
                {moderatorOptions.map((option) => (
                    <Grid item xs={12} sm={6} md={4} key={option.label}>
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '250px',
                                padding: '20px',
                                boxShadow: 3,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-5px)',
                                },
                                backgroundColor: theme.palette.background.paper,
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '15px',
                                    flexGrow: 1,
                                }}
                            >
                                {/* Icon */}
                                <Box 
                                    sx={{ 
                                        backgroundColor: theme.palette.primary.main,
                                        color: '#fff',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mb: 1,
                                    }}
                                >
                                    {option.icon}
                                </Box>
                                
                                {/* Label */}
                                <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                    {option.label}
                                </Typography>
                                
                                {/* Description */}
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                                    {option.description}
                                </Typography>
                            </CardContent>
                            
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(option.route)}
                                sx={{ 
                                    width: '80%',
                                    borderRadius: '20px',
                                    mb: 2,
                                }}
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

export default ModeratorPanel; 