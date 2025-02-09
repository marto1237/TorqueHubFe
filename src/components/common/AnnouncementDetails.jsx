import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UserAnnouncementService from '../configuration/Services/UserAnnouncementService';
import GeneralAnnouncementService from '../configuration/Services/GeneralAnnouncementService';
import { timeAgo } from '../configuration/utils/TimeFormating';

const AnnouncementDetails = ({ userId }) => {
    const theme = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const response = await GeneralAnnouncementService.getAnnouncementById(id);
            if (response) {
                setAnnouncement(response);
            }
        } catch (error) {
            console.error('Error fetching announcement:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        if (!userId) {
            console.error("User ID is missing. Cannot mark announcement as read.");
            return;
        }
        
        try {
            await GeneralAnnouncementService.markAnnouncementAsRead(id, userId);
            navigate(-1); // Go back after marking as read
        } catch (error) {
            console.error('Error marking announcement as read:', error);
        }
    };

    if (loading) {
        return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
    }

    return (
        <Box
            sx={{
                padding: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                paddingTop: { xs: '4rem', sm: '6rem', md: '8rem' },
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Box sx={{ maxWidth: '800px', width: '100%' }}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: { xs: '1rem', md: '2rem' },
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '8px',
                        boxShadow: theme.shadows[3],
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: '1rem',
                        }}
                    >
                        {announcement?.type}
                    </Typography>
                    <Divider sx={{ mb: '1.5rem' }} />
                    
                    <Typography
                        variant="body1"
                        sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, textAlign: 'justify' }}
                    >
                        {announcement?.message}
                    </Typography>

                    <Typography
                        variant="caption"
                        color="gray"
                        sx={{ display: 'block', mt: 2, textAlign: 'right' }}
                    >
                        {timeAgo(announcement?.createdAt)}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button variant="contained" color="primary" onClick={markAsRead}>
                            Mark as Read
                        </Button>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default AnnouncementDetails;
