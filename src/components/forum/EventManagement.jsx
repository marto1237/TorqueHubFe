import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import EventService from '../configuration/Services/EventService';

const EventManagement = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await EventService.findAllEvents();
            setEvents(response.content || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleEditClick = (event) => {
        setSelectedEvent(event);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setSelectedEvent(null);
        setOpenEditDialog(false);
    };

    const handleEditSave = async () => {
        try {
            if (selectedEvent) {
                await EventService.updateEvent(selectedEvent);
                fetchEvents(); // Refresh the list
                handleCloseEditDialog();
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDeleteClick = async (eventId) => {
        try {
            await EventService.deleteEvent(eventId);
            fetchEvents(); // Refresh the list
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setSelectedEvent((prevEvent) => ({
            ...prevEvent,
            [field]: value,
        }));
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
                Event Management
            </Typography>

            <Grid container spacing={3}>
                {events.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {event.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {event.date}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Location: {event.location}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Tickets Left: {event.ticketsAvailable || 'N/A'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginTop: '10px' }}>
                                    {event.tags?.map((tag, index) => (
                                        <Chip key={index} label={tag} size="small" />
                                    ))}
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleEditClick(event)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleDeleteClick(event.id)}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Edit Event Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
                <DialogTitle>Edit Event</DialogTitle>
                <DialogContent>
                    {selectedEvent && (
                        <>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Event Name"
                                value={selectedEvent.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                value={selectedEvent.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Date"
                                type="date"
                                value={selectedEvent.date?.split('T')[0] || ''}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Description"
                                multiline
                                rows={3}
                                value={selectedEvent.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditSave} color="primary" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EventManagement;
