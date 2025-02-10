import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Paper, Divider, List, ListItem, ListItemText, IconButton, Pagination, Autocomplete
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useAppNotifications } from '../common/NotificationProvider';
import GeneralAnnouncementService from '../configuration/Services/GeneralAnnouncementService';
import UserAnnouncementService from '../configuration/Services/UserAnnouncementService';
import TicketTypeService from '../configuration/Services/TicketTypeService';

const ITEMS_PER_PAGE = 5;

const EventAnnouncementsPage = ({ eventId, userId, isOrganizer }) => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    const [announcements, setAnnouncements] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (eventId) {
            fetchEventAnnouncements();
            fetchTicketTypes();
        }
    }, [eventId, page]); // Ensure eventId is valid before calling APIs

    const fetchEventAnnouncements = async () => {
        if (!eventId) return; // Prevent API calls if eventId is undefined

        setLoading(true);
        try {
            let response;
            if (isSearching && searchTerm.trim()) {
                response = await GeneralAnnouncementService.searchGeneralAnnouncements(searchTerm, page - 1, ITEMS_PER_PAGE);
            } else if (selectedTicketType) {
                response = await GeneralAnnouncementService.getAnnouncementsByEventAndTicketType(eventId, selectedTicketType.id, page - 1, ITEMS_PER_PAGE);
            } else {
                response = await GeneralAnnouncementService.getAnnouncementsByEvent(eventId, page - 1, ITEMS_PER_PAGE);
            }

            setAnnouncements(response.content || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            notifications.show('Failed to fetch event announcements', { autoHideDuration: 3000, severity: 'error' });
            console.error('Error fetching announcements:', error);
        }
        setLoading(false);
    };

    const fetchTicketTypes = async () => {
        if (!eventId) return;

        try {
            const response = await TicketTypeService.getAllByEventId(eventId);
            setTicketTypes(response.content || []);
        } catch (error) {
            console.error('Error fetching ticket types:', error);
        }
    };

    const handleSearch = () => {
        setIsSearching(true);
        setPage(1);
        fetchEventAnnouncements();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        setPage(1);
        fetchEventAnnouncements();
    };

    const markAsRead = async (announcementId) => {
        try {
            await UserAnnouncementService.markAnnouncementAsRead(announcementId, userId);
            setAnnouncements(announcements.map(ann =>
                ann.id === announcementId ? { ...ann, read: true } : ann
            ));
            notifications.show('Marked as read', { autoHideDuration: 2000, severity: 'success' });
        } catch (error) {
            notifications.show('Failed to mark as read', { autoHideDuration: 3000, severity: 'error' });
            console.error('Error marking announcement as read:', error);
        }
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '80px', backgroundColor: theme.palette.background.default, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper sx={{ padding: '1.5rem', maxWidth: '600px', width: '100%', backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: 'text.primary' }}>
                    Event Announcements
                </Typography>
                <Divider sx={{ mb: '1rem' }} />

                {/* Prevent fetching announcements if eventId is undefined */}
                {!eventId ? (
                    <Typography color="error">Event ID is missing. Please select an event.</Typography>
                ) : (
                    <>
                        {/* Ticket Type Selection */}
                        <Autocomplete
                            options={ticketTypes}
                            getOptionLabel={(option) => option.name}
                            onChange={(event, value) => {
                                setSelectedTicketType(value);
                                fetchEventAnnouncements();
                            }}
                            renderInput={(params) => <TextField {...params} label="Filter by Ticket Type" variant="filled" />}
                            sx={{ marginBottom: '1rem' }}
                        />

                        <TextField
                            label="Search Announcements"
                            fullWidth
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            sx={{ marginBottom: '1rem' }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, marginBottom: '1rem' }}>
                            <Button variant="contained" color="primary" onClick={handleSearch}>
                                Search
                            </Button>
                            {isSearching && (
                                <Button variant="outlined" color="secondary" onClick={handleClearSearch}>
                                    Clear Search
                                </Button>
                            )}
                        </Box>

                        {/* List of Announcements */}
                        {loading ? (
                            <Typography>Loading announcements...</Typography>
                        ) : (
                            <List>
                                {announcements.map((announcement) => (
                                    <ListItem key={announcement.id} secondaryAction={
                                        !announcement.read && (
                                            <IconButton edge="end" onClick={() => markAsRead(announcement.id)}>
                                                <MarkEmailReadIcon />
                                            </IconButton>
                                        )
                                    }>
                                        <ListItemText
                                            primary={<Typography variant="body1"><b>{announcement.type}</b>: {announcement.message}</Typography>}
                                            secondary={<Typography variant="caption">Ticket Type: {announcement.targetTicketTypeId || 'All'}</Typography>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        {/* Pagination Component */}
                        {totalPages > 1 && (
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                            />
                        )}

                        {/* Organizer-only Section */}
                        {isOrganizer && (
                            <Box sx={{ mt: 3 }}>
                                <Button variant="contained" color="primary">
                                    Create New Announcement
                                </Button>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                    As an event organizer, you can create new announcements for this event.
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default EventAnnouncementsPage;
