import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Paper, Divider, IconButton, List, ListItem, ListItemText,
    ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Autocomplete
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAppNotifications } from '../common/NotificationProvider';
import GeneralAnnouncementService from '../configuration/Services/GeneralAnnouncementService';
import EventService from '../configuration/Services/EventService';
import TicketTypeService from '../configuration/Services/TicketTypeService';

const ITEMS_PER_PAGE = 5;

const ManageGeneralAnnouncements = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    const [announcements, setAnnouncements] = useState([]);
    const [announcementText, setAnnouncementText] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [page, setPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventOptions, setEventOptions] = useState([]);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAnnouncements();
        fetchEvents();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await GeneralAnnouncementService.getGeneralAnnouncements(page - 1, ITEMS_PER_PAGE);
            setAnnouncements(response.content || []);  
        } catch (error) {
            notifications.show('Failed to fetch announcements', { autoHideDuration: 3000, severity: 'error' });
            console.error('Failed to fetch announcements:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await EventService.findAllEvents(0, 50); // Fetch all events initially
            setEventOptions(response.content || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchTicketTypes = async (eventId) => {
        try {
            const response = await TicketTypeService.getAllByEventId(eventId);
            setTicketTypes(response.content || []);
        } catch (error) {
            console.error('Error fetching ticket types:', error);
        }
    };

    const handleCreateOrUpdate = async () => {
        if (!announcementText.trim()) {
            notifications.show('Announcement text cannot be empty.', { autoHideDuration: 3000, severity: 'error' });
            return;
        }

        try {
            const announcementData = {
                message: announcementText,
                eventId: selectedEvent ? selectedEvent.id : null,
                targetTicketTypeId: selectedTicketType ? selectedTicketType.id : null,
                type: selectedEvent ? 'EVENT' : 'GENERAL'
            };

            if (selectedAnnouncement) {
                await GeneralAnnouncementService.updateAnnouncement(selectedAnnouncement.id, announcementData);
                setAnnouncements(announcements.map(ann =>
                    ann.id === selectedAnnouncement.id ? { ...ann, ...announcementData } : ann
                ));
                notifications.show('Announcement updated successfully.', { autoHideDuration: 3000, severity: 'success' });
            } else {
                const newAnnouncement = await GeneralAnnouncementService.createAnnouncement(announcementData);
                setAnnouncements([...announcements, newAnnouncement]);
                notifications.show('Announcement created successfully.', { autoHideDuration: 3000, severity: 'success' });
            }

            fetchAnnouncements();
        } catch (error) {
            notifications.show('Failed to save announcement.', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            setAnnouncementText('');
            setSelectedAnnouncement(null);
            setSelectedEvent(null);
            setSelectedTicketType(null);
            setIsEditDialogOpen(false);
        }
    };

    const handleEdit = (announcement) => {
        setSelectedAnnouncement(announcement);
        setAnnouncementText(announcement.message);
        setSelectedEvent(eventOptions.find(event => event.id === announcement.eventId) || null);
        setSelectedTicketType(ticketTypes.find(ticket => ticket.id === announcement.targetTicketTypeId) || null);
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (announcement) => {
        setAnnouncementToDelete(announcement);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setAnnouncementToDelete(null);
    };

    const handleDelete = async () => {
        if (!announcementToDelete) return;
        try {
            await GeneralAnnouncementService.deleteAnnouncement(announcementToDelete.id);
            setAnnouncements(announcements.filter(ann => ann.id !== announcementToDelete.id));
            notifications.show('Announcement deleted successfully.', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Failed to delete announcement.', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            closeDeleteDialog();
        }
    };

    const resetDialog = () => {
        setAnnouncementText('');
        setSelectedAnnouncement(null);
        setSelectedEvent(null);
        setSelectedTicketType(null);
        setIsEditDialogOpen(false);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const paginatedAnnouncements = announcements.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <Box sx={{ padding: '20px', paddingTop: '80px', backgroundColor: theme.palette.background.default, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper sx={{ padding: '1.5rem', maxWidth: '600px', width: '100%', backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: 'text.primary' }}>
                    Manage General Announcements
                </Typography>
                <Divider sx={{ mb: '1rem' }} />

                {/* Search Event */}
                <Autocomplete
                    options={eventOptions}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                        setSelectedEvent(value);
                        if (value) fetchTicketTypes(value.id);
                    }}
                    renderInput={(params) => <TextField {...params} label="Search Event" variant="filled" />}
                    sx={{ marginBottom: '1rem' }}
                />

                <Autocomplete
                    options={ticketTypes}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => setSelectedTicketType(value)}
                    renderInput={(params) => <TextField {...params} label="Select Ticket Type" variant="filled" />}
                    sx={{ marginBottom: '1rem' }}
                    disabled={!selectedEvent}
                />

                <TextField
                    label="Announcement Message"
                    fullWidth
                    variant="filled"
                    placeholder="Enter announcement message"
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                    sx={{ marginBottom: '1rem' }}
                />
                <Button variant="contained" color="primary" onClick={handleCreateOrUpdate} startIcon={<AddCircleOutlineIcon />}>
                    {selectedAnnouncement ? 'Edit' : 'Create'}
                </Button>

                {/* List of Announcements */}
                <List>
                    {announcements.map((announcement) => (
                        <ListItem key={announcement.id} secondaryAction={
                            <>
                                <IconButton edge="end" onClick={() => handleEdit(announcement)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" onClick={() => openDeleteDialog(announcement)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }>
                            <ListItemText
                                primary={<Typography variant="body1"><b>{announcement.type}</b>: {announcement.message}</Typography>}
                                secondary={<Typography variant="caption">Event: {announcement.eventId || 'General'}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Edit Announcement Dialog */}
            <Dialog open={isEditDialogOpen} onClose={resetDialog} fullWidth maxWidth="sm">
                <DialogTitle>{selectedAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth margin="normal" label="Message" variant="filled" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleCreateOrUpdate} color="primary" variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this announcement?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default ManageGeneralAnnouncements;
