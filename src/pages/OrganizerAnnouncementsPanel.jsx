import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Paper, Divider, List, ListItem, ListItemText, IconButton, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Autocomplete
} from '@mui/material';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventService from '../components/configuration/Services/EventService';
import TicketTypeService from '../components/configuration/Services/TicketTypeService';
import AnnouncementService from '../components/configuration/Services/GeneralAnnouncementService';
import { useAppNotifications } from '../components/common/NotificationProvider';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const OrganizerDashboardPanel = ({ userId }) => {
    const theme = useTheme();
    const notifications = useAppNotifications();
    const queryClient = useQueryClient();

    // Tabs State
    const [activeTab, setActiveTab] = useState(0);

    const [openEditDialog, setOpenEditDialog] = useState(false);

    // Events State
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openEventDialog, setOpenEventDialog] = useState(false);

    const [existingImages, setExistingImages] = useState([]); // Images from the server
    const [newImages, setNewImages] = useState([]); // Newly uploaded images
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);


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

    const fetchEventImages = async (eventId) => {
        try {

            const imageRef = ref(storage, `eventImages/${eventId}/`);
            const imageList = await listAll(imageRef);
            const imageUrls = await Promise.all(imageList.items.map(item => getDownloadURL(item)));
            setExistingImages(imageUrls.map((url, index) => ({ id: index, url })));
        } catch (error) {
            console.error('Error fetching event images:', error);
        }
    };

    const handleSetFirstImage = (index) => {
        setExistingImages((prevImages) => {
            const updatedImages = [...prevImages];
            const [selectedImage] = updatedImages.splice(index, 1);
            updatedImages.unshift(selectedImage); // Move to the first position
            return updatedImages;
        });
    };

    const handleRemoveImage = (index, isExisting) => {
        if (isExisting) {
            setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
        } else {
            setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
        }
    };

    const saveImages = async () => {
        if (!selectedEvent) {
            console.error("No event selected for saving images.");
            return;
        }
    
        const uploadPromises = newImages.map(async ({ file, name }) => {
            try {
                const timestamp = new Date().getTime(); // Unique timestamp
                const sanitizedFileName = `${selectedEvent.id}_${timestamp}_${name}`; // Rename file
                const fileRef = ref(storage, `eventImages/${selectedEvent.id}/${sanitizedFileName}`);
                const uploadTask = uploadBytesResumable(fileRef, file);
    
                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        null, // Optional progress function
                        (error) => {
                            console.error('Error uploading file:', error);
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(fileRef);
                            resolve(downloadURL); // Resolve with the file's download URL
                        }
                    );
                });
            } catch (error) {
                console.error("Error uploading image:", error);
                return null;
            }
        });
    
        try {
            const imageUrls = await Promise.all(uploadPromises);
            const validUrls = imageUrls.filter(Boolean); // Exclude any failed uploads
            console.log("Uploaded Image URLs:", validUrls);
    
            // Refresh images after successful upload
            await fetchEventImages(selectedEvent.id);
            setNewImages([]); // Clear the new images
            notifications.show("Images saved successfully!", {autoHideDuration: 3000, severity: "success" });
        } catch (error) {
            console.error("Error saving images:", error);
            notifications.show("Error saving images. Please try again.", {autoHideDuration: 3000, severity: "error" });
        }
    };
        

    const handleNewFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
    
        const newFiles = selectedFiles.map((file) => ({
            file,
            previewURL: URL.createObjectURL(file),
            name: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'), // Sanitize filename
        }));
    
        setNewImages((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleHighlightChange = (index, value) => {
        setSelectedEvent((prevEvent) => {
            const updatedHighlights = [...prevEvent.highlights];
            updatedHighlights[index] = value;
            return { ...prevEvent, highlights: updatedHighlights };
        });
    };

    const handleRemoveHighlight = (index) => {
        setSelectedEvent((prevEvent) => {
            const updatedHighlights = [...prevEvent.highlights];
            updatedHighlights.splice(index, 1);
            return { ...prevEvent, highlights: updatedHighlights };
        });
    };

    const handleAddHighlight = () => {
        setSelectedEvent((prevEvent) => ({
            ...prevEvent,
            highlights: [...(prevEvent.highlights || []), ''],
        }));
    };

    const handleInputChange = (field, value) => {
        setSelectedEvent((prevEvent) => ({
            ...prevEvent,
            [field]: value,
        }));
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

    const handleCloseEditDialog = () => {
        setSelectedEvent(null);
        setOpenEditDialog(false);
    };

    // --------------------------- EVENT ACTIONS ---------------------------
    const handleOpenEventDialog = (event) => {
        setSelectedEvent({
            ...event,
            highlights: event.highlights || [], // Ensure highlights is always an array
        });
        setOpenEventDialog(true);
    };

    const handleCloseEventDialog = () => {
        setOpenEventDialog(false);
        setSelectedEvent(null);
    };


    const handleEditSave = async () => {
        try {
            if (!selectedEvent) return;

            const formattedDate = format(new Date(selectedEvent.date), "yyyy-MM-dd'T'HH:mm:ss");

            const updatePayload = {
                id: selectedEvent.id,
                name: selectedEvent.name,
                location: selectedEvent.location,
                creatorUserId: userId,
                newTime: formattedDate,
                description: selectedEvent.description,
                highlights: selectedEvent.highlights || [],
                tags: selectedEvent.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name)), // Map tag names
                allowedCars: selectedEvent.allowedCars.map((car) => (typeof car === 'string' ? car : car.name)), // Map car names
            };

            console.log("Update Event Request Payload:", updatePayload);

            await EventService.updateEvent(updatePayload);
            notifications.show('Event was been update successfully!', {
                autoHideDuration: 3000,
                severity: 'success',
            });

            queryClient.invalidateQueries(['events']);
            fetchOrganizerEvents();
            handleCloseEditDialog();
        } catch (error) {
            console.error('Error updating event:', error);
            notifications.show('Error updating event.', { severity: 'error' });
        }
    };

    const handleDeleteClick = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
    
        try {
            await EventService.deleteEvent(eventId);
            notifications.show('Event deleted successfully!', {
                autoHideDuration: 3000,
                severity: 'success',
            });
            queryClient.invalidateQueries(['events']);
        } catch (error) {
            console.error('Error deleting event:', error);
            notifications.show('Error deleting event', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
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
                                    <IconButton onClick={() => handleOpenEventDialog(event)}>
                                        <DeleteIcon />
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
                        variant="filled"
                        value={selectedEvent?.name || ''}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        variant="filled"
                        label="Location"
                        value={selectedEvent?.location || ''}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                    />

                    <TextField
                        label="Event Date"
                        type="datetime-local"
                        fullWidth
                        margin="dense"
                        variant="filled"
                        value={selectedEvent?.date || ''}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                    />
                     <Typography variant="h6">Manage Images:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', mb: 2 }}>
                                            {existingImages.map((img, index) => (
                                                <Box key={index} sx={{ position: 'relative' }}>
                                                    <img
                                                        src={img.url}
                                                        alt={`Existing Image ${index}`}
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                                    />
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ position: 'absolute', top: 5, right: 5 }}
                                                        onClick={() => handleRemoveImage(index, true)}
                                                    >
                                                        Remove
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        sx={{ position: 'absolute', bottom: 5, right: 5 }}
                                                        onClick={() => handleSetFirstImage(index)}
                                                    >
                                                        Set as First
                                                    </Button>
                                                </Box>
                                            ))}
                    
                                            {newImages.map(({ previewURL }, index) => (
                                                <Box key={index} sx={{ position: 'relative' }}>
                                                    <img
                                                        src={previewURL}
                                                        alt={`New Image ${index}`}
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                                    />
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ position: 'absolute', top: 5, right: 5 }}
                                                        onClick={() => handleRemoveImage(index, false)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                    
                                        {/* Highlights Section */}
                                        <Typography variant="h6" sx={{ marginTop: '20px' }}>
                                            Highlights
                                        </Typography>
                                        <Box>
                                            {selectedEvent?.highlights?.map((highlight, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1, gap: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        variant="filled"
                                                        value={highlight}
                                                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                                                    />
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleRemoveHighlight(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            ))}

                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={handleAddHighlight}
                                                sx={{ marginTop: 1 }}
                                            >
                                                Add Highlight
                                            </Button>
                                        </Box>
                    
                                        <Button variant="contained" component="label" sx={{ marginBottom: '1rem' }}>
                                            Add New Images
                                            <input type="file" hidden multiple accept="image/*" onChange={handleNewFileChange} />
                                        </Button>
                    
                    
                            
                                            <TextField
                                                fullWidth
                                                margin="normal"
                                                variant="filled"
                                                label="Description"
                                                multiline
                                                rows={3}
                                                value={selectedEvent?.description || ''}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                            />
                                            <Autocomplete
                                                multiple
                                                options={filteredCategories || []}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedEvent?.allowedCars || []}
                                                onChange={(event, newValue) =>
                                                    setSelectedEvent({ ...selectedEvent, allowedCars: newValue })
                                                }
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Allowed Car Categories" variant="filled" />
                                                )}
                                            />
                    
                                            <Autocomplete
                                                multiple
                                                options={filteredTags}
                                                getOptionLabel={(option) => option.name}
                                                value={selectedEvent?.tags || []}
                                                onChange={(event, newValue) =>
                                                    setSelectedEvent({ ...selectedEvent, tags: newValue })
                                                }
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Tags" variant="filled" />
                                                )}
                                            />
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEventDialog}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained">Save</Button>
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
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrganizerDashboardPanel;
