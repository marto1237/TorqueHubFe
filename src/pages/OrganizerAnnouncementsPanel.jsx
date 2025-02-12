import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Paper, Divider, List, ListItem, ListItemText, IconButton, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventService from '../components/configuration/Services/EventService';
import TicketTypeService from '../components/configuration/Services/TicketTypeService';
import AnnouncementService from '../components/configuration/Services/GeneralAnnouncementService';
import { useAppNotifications } from '../components/common/NotificationProvider';

const OrganizerDashboardPanel = ({ userId }) => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    // Tabs State
    const [activeTab, setActiveTab] = useState(0);

    // Events State
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openEventDialog, setOpenEventDialog] = useState(false);

    // Ticket Types State
    const [ticketTypes, setTicketTypes] = useState([]);
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [openTicketDialog, setOpenTicketDialog] = useState(false);

    // Announcement State
    const [announcementText, setAnnouncementText] = useState("");
    const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchOrganizerEvents();
        }
    }, [userId]);

    const fetchOrganizerEvents = async () => {
        try {
            const response = await EventService.findAllEventsByUserId(userId);
            if (response?.content) {
                setEvents(response.content);
            }
        } catch (error) {
            notifications.show('Failed to fetch events', { severity: 'error' });
        }
    };

    const fetchTicketTypes = async (eventId) => {
        try {
            const response = await TicketTypeService.getAllByEventId(eventId);
            if (response?.content) {
                setTicketTypes(response.content);
            } else {
                setTicketTypes([]);
            }
        } catch (error) {
            notifications.show('Failed to fetch ticket types', { severity: 'error' });
        }
    };

    // --------------------------- EVENT ACTIONS ---------------------------
    const handleOpenEventDialog = (event) => {
        setSelectedEvent({ ...event });
        setOpenEventDialog(true);
    };

    const handleCloseEventDialog = () => {
        setOpenEventDialog(false);
        setSelectedEvent(null);
    };

    const handleSaveEventChanges = async () => {
        const confirmSave = window.confirm("Are you sure you want to save changes?");
        if (!confirmSave) return;

        try {
            await EventService.updateEvent(selectedEvent);
            notifications.show('Event updated successfully', { severity: 'success' });
            fetchOrganizerEvents();
        } catch (error) {
            notifications.show('Failed to update event', { severity: 'error' });
        }
        handleCloseEventDialog();
    };

    // --------------------------- TICKET TYPE ACTIONS ---------------------------
    const handleOpenTicketDialog = (ticketType) => {
        setSelectedTicketType({ ...ticketType });
        setOpenTicketDialog(true);
    };

    const handleCloseTicketDialog = () => {
        setOpenTicketDialog(false);
        setSelectedTicketType(null);
    };

    const handleSaveTicketChanges = async () => {
        const confirmSave = window.confirm("Are you sure you want to update this ticket?");
        if (!confirmSave) return;

        try {
            await TicketTypeService.updateTicketType(selectedTicketType);
            notifications.show('Ticket updated successfully', { severity: 'success' });
            fetchTicketTypes(selectedEvent.id);
        } catch (error) {
            notifications.show('Failed to update ticket type', { severity: 'error' });
        }
        handleCloseTicketDialog();
    };

    // --------------------------- ANNOUNCEMENT ACTIONS ---------------------------
    const handleOpenAnnouncementDialog = () => {
        setOpenAnnouncementDialog(true);
    };

    const handleCloseAnnouncementDialog = () => {
        setOpenAnnouncementDialog(false);
        setAnnouncementText("");
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '80px', backgroundColor: theme.palette.background.default, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper sx={{ padding: '1.5rem', maxWidth: '800px', width: '100%', backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Manage Your Events, Tickets & Announcements
                </Typography>
                <Divider sx={{ mb: '1rem' }} />

                <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} centered>
                    <Tab label="Events" />
                    <Tab label="Ticket Types" disabled={!selectedEvent} />
                    <Tab label="Announcements" />
                </Tabs>

                {/* Events Tab */}
                {activeTab === 0 && (
                    <List>
                        {events.map((event) => (
                            <ListItem key={event.id} secondaryAction={
                                <>
                                    <IconButton onClick={() => handleOpenEventDialog(event)}>
                                        <EditIcon />
                                    </IconButton>
                                </>
                            }>
                                <ListItemText
                                    primary={event.name}
                                    secondary={`Date: ${event.date}`}
                                    onClick={() => { setSelectedEvent(event); fetchTicketTypes(event.id); setActiveTab(1); }}
                                    sx={{ cursor: 'pointer' }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* Ticket Types Tab */}
                {activeTab === 1 && (
                    <List>
                        {ticketTypes.map((ticket) => (
                            <ListItem key={ticket.id} secondaryAction={
                                <IconButton onClick={() => handleOpenTicketDialog(ticket)}>
                                    <EditIcon />
                                </IconButton>
                            }>
                                <ListItemText primary={`${ticket.name} - $${ticket.price} (${ticket.availableTickets} left)`} />
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* Announcements Tab */}
                {activeTab === 2 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button variant="contained" onClick={handleOpenAnnouncementDialog}>
                            Create Announcement
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Edit Event Dialog */}
            <Dialog open={openEventDialog} onClose={handleCloseEventDialog}>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Event Name"
                        fullWidth
                        margin="dense"
                        value={selectedEvent?.name || ''}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                    />
                    <TextField
                        label="Event Date"
                        type="datetime-local"
                        fullWidth
                        margin="dense"
                        value={selectedEvent?.date || ''}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEventDialog}>Cancel</Button>
                    <Button onClick={handleSaveEventChanges} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Ticket Dialog */}
            <Dialog open={openTicketDialog} onClose={handleCloseTicketDialog}>
                <DialogTitle>Edit Ticket</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Ticket Name"
                        fullWidth
                        margin="dense"
                        value={selectedTicketType?.name || ''}
                        onChange={(e) => setSelectedTicketType({ ...selectedTicketType, name: e.target.value })}
                    />
                    <TextField
                        label="Price"
                        type="number"
                        fullWidth
                        margin="dense"
                        value={selectedTicketType?.price || ''}
                        onChange={(e) => setSelectedTicketType({ ...selectedTicketType, price: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTicketDialog}>Cancel</Button>
                    <Button onClick={handleSaveTicketChanges} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrganizerDashboardPanel;
