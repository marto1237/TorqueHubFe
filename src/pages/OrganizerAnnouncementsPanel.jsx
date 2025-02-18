import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Paper, Divider, List, ListItem, ListItemText, IconButton, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Autocomplete,
    Pagination
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
import EventFilterPanel from '../components/common/EventFilterPanel';
import EventFilterService from '../components/configuration/Services/EventFilterService';
import GeneralAnnouncementService from '../components/configuration/Services/GeneralAnnouncementService';
import DOMPurify from 'dompurify';

const OrganizerDashboardPanel = ({ userId }) => {
    const theme = useTheme();
    const notifications = useAppNotifications();
    const queryClient = useQueryClient();

    // Pagination state
    const [page, setPage] = useState(0);
    const [size] = useState(12);

    // Tabs State
    const [activeTab, setActiveTab] = useState(0);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);


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
    const [openDeleteTicketDialog, setOpenDeleteTicketDialog] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [openTicketCreateDialog, setOpenTicketCreateDialog] = useState(false);
    const [newTicketType, setNewTicketType] = useState({
        name: '',
        price: '',
        totalTickets: '',
        availableTickets: '',
    });
    
    const [errors, setErrors] = useState({
        name: '',
        price: '',
        totalTickets: '',
    });
    

    // Announcement State
    const [announcementType, setAnnouncementType] = useState("general");
    const [announcementText, setAnnouncementText] = useState("");
    const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (userId) {
            fetchOrganizerEvents();
        }
    }, [userId, page]);

    const openDeleteDialog = (event) => {
        setEventToDelete(event);
        setIsDeleteDialogOpen(true);
    };
    
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
    };
    
    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;
    
        try {
            await EventService.deleteEvent(eventToDelete.id);
            notifications.show('Event deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
    
            queryClient.invalidateQueries(['events']); // Refresh event list
            setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete.id));
    
        } catch (error) {
            notifications.show('Failed to delete event', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            closeDeleteDialog(); // Close dialog regardless of success/failure
        }
    };
    
    

    const fetchOrganizerEvents = async () => {
        try {
            const response = await EventService.findAllEventsByUserId(userId, page, size);
            if (response?.content) {
                setEvents(response.content);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            notifications.show('Failed to fetch events', {autoHideDuration: 3000, severity: 'error' });
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value - 1);
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
            notifications.show('Failed to fetch ticket types', {autoHideDuration: 3000, severity: 'error' });
        }
    };

    const handleCloseEditDialog = () => {
        setSelectedEvent(null);
        setOpenEditDialog(false);
    };

    const handleFilter = async (filters) => {
    
        setIsLoading(true);
        setIsFiltered(true);
    
        try {
            const response = await EventFilterService.filterEvents(filters);
    
            setFilteredEvents(response.content);
        } catch (error) {
            console.error("Error filtering events:", error);
            notifications.show("Failed to filter events", { autoHideDuration: 3000, severity: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilteredEvents([]);
        setIsFiltered(false); 
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


            await EventService.updateEvent(updatePayload);
            notifications.show('Event was been update successfully!', {
                autoHideDuration: 3000,
                severity: 'success',
            });

            queryClient.invalidateQueries(['events']);
            fetchOrganizerEvents();

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === selectedEvent.id ? { ...event, ...updatePayload } : event
                )
            );

            setSelectedEvent(prev => ({ ...prev, ...updatePayload }));
            setOpenEventDialog(false); 
        } catch (error) {
            console.error('Error updating event:', error);
            notifications.show('Error updating event.', {autoHideDuration: 3000, severity: 'error' });
        }
    };

    const handleDeleteClick = async (eventId) => {
        try {
            await EventService.deleteEvent(eventId);
            notifications.show('The event was been deleted successfully!', {
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
        console.log("Selected Ticket Type:", ticketType);
        setOpenTicketDialog(true);
    };

    const handleCloseTicketDialog = () => {
        setOpenTicketDialog(false);
        setSelectedTicketType(null);
    };

    const handleSaveTicketChanges = async () => {
        if (!selectedTicketType) return;
        
    
        try {
    
            const updatePayload = {
                userId: userId,
                name: selectedTicketType.name,
                price: selectedTicketType.price,
                eventId: selectedEvent.id,
                availableTickets: selectedTicketType.availableTickets
            };
    
            await TicketTypeService.updateTicketType(updatePayload);
            notifications.show("Ticket updated successfully!", { severity: "success" });
    
            queryClient.invalidateQueries(['ticketTypes', selectedEvent.id]);
            fetchTicketTypes(selectedEvent.id);
    
            handleCloseTicketDialog();
        } catch (error) {
            console.error("Error updating ticket type:", error);
            notifications.show("Failed to update ticket type.", {autoHideDuration: 3000, severity: "error" });
        }
    };

    const openDeleteTicketDialogHandler = (ticket) => {
        setTicketToDelete(ticket);
        setOpenDeleteTicketDialog(true);
    };

    const handleDeleteTicketConfirm = async () => {
        if (!ticketToDelete) return;
    
        try {
            await TicketTypeService.deleteTicketType(ticketToDelete.id);
            notifications.show("Ticket type deleted successfully!", {autoHideDuration: 3000, severity: "success" });
    
            // Refresh ticket list after deletion
            queryClient.invalidateQueries(['ticketTypes', selectedEvent.id]);
            setTicketTypes(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketToDelete.id));
            
        } catch (error) {
            notifications.show("Failed to delete ticket type.", {autoHideDuration: 3000, severity: "error" });
        }
    
        // Close dialog
        setOpenDeleteTicketDialog(false);
        setTicketToDelete(null);
    };

    const handleCreateTicketType = async () => {
        let hasError = false;
        const newErrors = { name: '', price: '', totalTickets: '' };
    
        if (!newTicketType.name.trim()) {
            newErrors.name = 'Ticket Name is required';
            hasError = true;
        }
        if (!newTicketType.price || isNaN(newTicketType.price) || newTicketType.price <= 0) {
            newErrors.price = 'Price must be a positive number';
            hasError = true;
        }
        if (!newTicketType.totalTickets || isNaN(newTicketType.totalTickets) || newTicketType.totalTickets <= 0) {
            newErrors.totalTickets = 'Total Tickets must be a positive number';
            hasError = true;
        }
    
        setErrors(newErrors);
    
        if (hasError) return;
    
        try {
            if (!selectedEvent) {
                notifications.show("Please select an event before creating a ticket type.", { severity: "warning" });
                return;
            }
    
            const sanitizedTicketType = {
                userId: userId,
                name: DOMPurify.sanitize(newTicketType.name),
                price: newTicketType.price,
                totalTickets: newTicketType.totalTickets,
                eventId: selectedEvent.id,
                availableTickets: newTicketType.availableTickets,
            };
    
            await TicketTypeService.createTicketType(sanitizedTicketType);
            queryClient.invalidateQueries(['ticketTypes', selectedEvent.id]);
            setNewTicketType({ name: '', price: '', totalTickets: '', availableTickets: '' });
            await fetchTicketTypes(selectedEvent.id);
            setErrors({ name: '', price: '', totalTickets: '' });
    
            notifications.show('Ticket type created successfully!', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            console.error('Error creating ticket type:', error);
            notifications.show('Error creating ticket type', { autoHideDuration: 3000, severity: 'error' });
        }
    };
    
    // --------------------------- ANNOUNCEMENT ACTIONS ---------------------------

    useEffect(() => {
        fetchGeneralAnnouncements();
    }, []);
    
    const fetchGeneralAnnouncements = async () => {
        try {
            const response = await GeneralAnnouncementService.getGeneralAnnouncements();
            setAnnouncements(response.content || []);
        } catch (error) {
            notifications.show("Failed to fetch announcements", {autoHideDuration: 3000, severity: "error" });
        }
    };

    const handleSaveAnnouncement = async () => {
        if (!announcementText) {
            notifications.show("Please enter an announcement message", {autoHideDuration: 3000, severity: "warning" });
            return;
        }
    
        const announcementData = {
            eventId: selectedEvent?.id,
            message: announcementText,
            type: announcementType,
            ticketTypeId: announcementType === "ticket" ? selectedTicketType?.id : null,
            recipientUserId: announcementType === "personal" ? selectedUser?.id : null,
        };
    
        try {
            if (editingAnnouncement) {
                await GeneralAnnouncementService.updateAnnouncement(editingAnnouncement.id, announcementData);
                notifications.show("Announcement updated successfully!", {autoHideDuration: 3000, severity: "success" });
            } else {
                await GeneralAnnouncementService.createAnnouncement(announcementData);
                notifications.show("Announcement created successfully!", {autoHideDuration: 3000, severity: "success" });
            }
    
            fetchGeneralAnnouncements(); // Refresh announcements
            setOpenAnnouncementDialog(false);
            setAnnouncementText("");
            setEditingAnnouncement(null);
        } catch (error) {
            notifications.show("Failed to save announcement", {autoHideDuration: 3000, severity: "error" });
        }
    };

    const handleEditAnnouncement = (announcement) => {
        setEditingAnnouncement(announcement);
        setAnnouncementText(announcement.message);
        setAnnouncementType(announcement.type);
        setOpenAnnouncementDialog(true);
    };
    
    const handleDeleteAnnouncement = async (announcementId) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    
        try {
            await GeneralAnnouncementService.deleteAnnouncement(announcementId);
            notifications.show("Announcement deleted successfully!", {autoHideDuration: 3000, severity: "success" });
            fetchGeneralAnnouncements();
        } catch (error) {
            notifications.show("Failed to delete announcement", {autoHideDuration: 3000, severity: "error" });
        }
    };
    
    
    
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

                <EventFilterPanel onFilter={handleFilter} />

                <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} centered>
                    <Tab label="Events" />
                    <Tab label="Ticket Types" disabled={!selectedEvent} />
                    <Tab label="Announcements" />
                </Tabs>

                {/* Events Tab */}
                {activeTab === 0 && (
                    <List>
                    {isLoading ? (
                        <Typography sx={{ textAlign: "center", padding: "10px" }}>Loading events...</Typography>
                    ) : isFiltered && filteredEvents.length === 0 ? (
                        <Typography sx={{ textAlign: "center", padding: "10px" }}>No events found. Try adjusting filters.</Typography>
                    ) : (
                        (isFiltered ? filteredEvents : events).map((event) => (
                            <ListItem
                                key={event.id}
                                onClick={() => {
                                    setSelectedEvent(event); 
                                    fetchTicketTypes(event.id); 
                                }}
                            >
                                <ListItemText primary={event.name} secondary={`Date: ${event.date}`} />
                                
                                {/* Edit Button */}
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEventDialog(event);
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                
                                {/* Delete Button */}
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        openDeleteDialog(event);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))
                    )}
                </List>
                
                )}

                {/* Ticket Types Tab */}
                {activeTab === 1 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <List>
                        {ticketTypes.map((ticket) => (
                            <ListItem key={ticket.id} secondaryAction={
                                <>
                                    <IconButton onClick={() => handleOpenTicketDialog(ticket)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => openDeleteTicketDialogHandler(ticket)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            }>
                                <ListItemText primary={`${ticket.name} - $${ticket.price} (${ticket.availableTickets} left)`} />
                            </ListItem>
                            
                        ))}
                    </List>
                    

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenTicketCreateDialog(true)}
                        sx={{ mt: 2 }}
                    >
                        Create Ticket Type
                    </Button>
                </Box>
                )}
                

                {/* Announcements Tab */}
                {activeTab === 2 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button variant="contained" onClick={() => setOpenAnnouncementDialog(true)}>
                            Create Announcement
                        </Button>
                        <List sx={{ mt: 2 }}>
                            {announcements.length === 0 ? (
                                <Typography sx={{ textAlign: "center", padding: "10px" }}>
                                    No announcements yet.
                                </Typography>
                            ) : (
                                announcements.map((announcement) => (
                                    <ListItem key={announcement.id} secondaryAction={
                                        <>
                                            <IconButton onClick={() => handleEditAnnouncement(announcement)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteAnnouncement(announcement.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    }>
                                        <ListItemText
                                            primary={announcement.message}
                                            secondary={`Type: ${announcement.type}`}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
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
                        variant="filled"
                        margin="dense"
                        value={selectedTicketType?.name || ''}
                        onChange={(e) => setSelectedTicketType({ ...selectedTicketType, name: e.target.value })}
                    />
                    <TextField
                        label="Price"
                        type="number"
                        variant="filled"
                        fullWidth
                        margin="dense"
                        value={selectedTicketType?.price || ''}
                        onChange={(e) => setSelectedTicketType({ ...selectedTicketType, price: e.target.value })}
                    />
                    <TextField
                        label="Avaible tickets"
                        type="number"
                        variant="filled"
                        fullWidth
                        margin="dense"
                        value={selectedTicketType?.availableTickets || ''}
                        onChange={(e) => setSelectedTicketType({ ...selectedTicketType, availableTickets: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={handleSaveTicketChanges} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to permanently delete this event?
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {eventToDelete?.name || "Unknown Event"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                        This action <strong>cannot</strong> be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete Event
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination
                    count={totalPages} // Total pages from API response
                    page={page + 1} // Material-UI Pagination uses 1-indexed pages
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

            <Dialog open={openAnnouncementDialog} onClose={() => setOpenAnnouncementDialog(false)}>
                <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Announcement Message"
                        variant="filled"
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <Autocomplete
                        options={["general", "ticket", "personal"]}
                        getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                        value={announcementType}
                        onChange={(event, newValue) => setAnnouncementType(newValue)}
                        renderInput={(params) => <TextField {...params} label="Announcement Type" variant="filled" />}
                        sx={{ mb: 2 }}
                    />

                    {announcementType === "ticket" && (
                        <Autocomplete
                            options={ticketTypes}
                            getOptionLabel={(option) => option.name}
                            value={selectedTicketType}
                            onChange={(event, newValue) => setSelectedTicketType(newValue)}
                            renderInput={(params) => <TextField {...params} label="Ticket Type" variant="filled" />}
                        />
                    )}

                    {announcementType === "personal" && (
                        <Autocomplete
                            /*options={users}*/ 
                            getOptionLabel={(option) => option.name}
                            value={selectedUser}
                            onChange={(event, newValue) => setSelectedUser(newValue)}
                            renderInput={(params) => <TextField {...params} label="Select User" variant="filled" />}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAnnouncementDialog(false)} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveAnnouncement} color="primary" variant="contained">
                        {editingAnnouncement ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteTicketDialog} onClose={() => setOpenDeleteTicketDialog(false)}>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Confirm Ticket Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this ticket type?
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {ticketToDelete?.name || "Unknown Ticket"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                        This action <strong>cannot</strong> be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteTicketDialog(false)} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteTicketConfirm} color="error" variant="contained">
                        Delete Ticket
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Create Ticket Type Dialog */}
            <Dialog open={openTicketCreateDialog} onClose={() => setOpenTicketCreateDialog(false)}>
                <DialogTitle>Create Ticket Type</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ticket Name"
                        variant="filled"
                        value={newTicketType.name}
                        error={!!errors.name}
                        helperText={errors.name}
                        onChange={(e) => setNewTicketType({ ...newTicketType, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Price"
                        variant="filled"
                        type="number"
                        value={newTicketType.price}
                        error={!!errors.price}
                        helperText={errors.price}
                        onChange={(e) => setNewTicketType({ ...newTicketType, price: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Total Tickets"
                        variant="filled"
                        type="number"
                        value={newTicketType.totalTickets}
                        error={!!errors.totalTickets}
                        helperText={errors.totalTickets}
                        onChange={(e) => setNewTicketType({ ...newTicketType, totalTickets: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTicketCreateDialog(false)} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateTicketType} color="primary" variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
};

export default OrganizerDashboardPanel;
