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
    Chip,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Pagination,
    Autocomplete
} from '@mui/material';
import { LocationOn, Event as EventIcon, AccessTime, DirectionsCar as CarTag, Sell as Tag, ConfirmationNumber, AttachMoney, Edit} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import EventService from '../configuration/Services/EventService';
import TicketTypeService from '../configuration/Services/TicketTypeService';
import CarCategory from '../configuration/Services/CarCategoryService';
import TicketTags from '../configuration/Services/TicketTagsService';
import { useAppNotifications } from '../common/NotificationProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

const EventManagement = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const notifications = useAppNotifications();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const size = 12;
    const location = useLocation();

    // Extract query parameters from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const initialPage = parseInt(params.get('page') || '0', 10);
        setPage(initialPage);
    }, [location.search]);


    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [ticketTypes, setTicketTypes] = useState([]);

    const [category, setCategory] = useState(null);
    const [categorySearch, setCategorySearch] = useState('');
    const [allCategories, setallCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);

    const [tag, setTag] = useState([]);
    const [tagSearch, setTagSearch] = useState('');
    const [allTags, setallTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);

    const [existingImages, setExistingImages] = useState([]); // Images from the server
    const [newImages, setNewImages] = useState([]); // Newly uploaded images

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);


    
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
    
    useEffect(() => {
        if (selectedEvent?.id) {
            fetchEventImages(selectedEvent.id);
        }
    }, [selectedEvent]);

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


    const handleNewFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
    
        const newFiles = selectedFiles.map((file) => ({
            file,
            previewURL: URL.createObjectURL(file),
            name: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'), // Sanitize filename
        }));
    
        setNewImages((prevFiles) => [...prevFiles, ...newFiles]);
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
    

    const handlePageChange = (event, value) => {
        const zeroBasedPage = value - 1; // Convert 1-based to 0-based
        setPage(zeroBasedPage);

        // Update query parameters
        const params = new URLSearchParams(location.search);
        params.set('page', zeroBasedPage);
        params.set('size', size); // Add other parameters as needed
        navigate({ search: params.toString() });
    };
    
    
    

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
    
    const userDetails = sessionStorage.getItem('userDetails');

    const parsedDetails = JSON.parse(userDetails);
    const userId = parsedDetails.id;

    const { data: events = { content: [], totalPages: 0 }, isLoading, isError } = useQuery({
        queryKey: ['events', { page, size }], // Include page and size in the query key
        queryFn: ({ queryKey }) => {
            const [, { page, size }] = queryKey; // Destructure page and size from queryKey
            return EventService.findAllEvents(page, size); // Pass page and size directly
        },
    });
    

    const handleCloseEditDialog = () => {
        setSelectedEvent(null);
        setOpenEditDialog(false);
    };

    const handleEditSave = async () => {
        try {
            if (selectedEvent) {

                const formattedDate = format(new Date(selectedEvent.date), "yyyy-MM-dd'T'HH:mm:ss");

                const updatePayload = {
                    id: selectedEvent.id,
                    name: selectedEvent.name,
                    location: selectedEvent.location,
                    creatorUserId: userId, 
                    newTime: formattedDate, 
                    ticketTypes: ticketTypes, 
                    description: selectedEvent.description, 
                    highlights: selectedEvent.highlights || [],
                    tags: selectedEvent.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name)), // Map tag names
                    allowedCars: selectedEvent.allowedCars.map((car) => (typeof car === 'string' ? car : car.name)), // Map car category names
                };
    
                // Log the update payload
                console.log("Update Event Request Payload:", updatePayload);
    
                // Call the update service
                await EventService.updateEvent(updatePayload);
                notifications.show('Event was been update successfully!', {
                    autoHideDuration: 3000,
                    severity: 'success',
                });

                await saveImages();

                queryClient.invalidateQueries(['events']);
                handleCloseEditDialog();
            }
        } catch (error) {
            console.error('Error updating event:', error);
            notifications.show('Error updating event.', {
                autoHideDuration: 3000,
                severity: 'error',
            });
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

    const confirmDeleteEvent = (eventId) => {
        setEventToDelete(eventId);
        setOpenDeleteDialog(true);
    };


    const handleDeleteConfirm = async () => {
        if (!eventToDelete) {
            console.error('No event ID to delete.');
            return;
        }
    
        try {
            await EventService.deleteEvent(eventToDelete);
            notifications.show('Event deleted successfully!', {
                autoHideDuration: 3000,
                severity: 'success',
            });
    
            queryClient.invalidateQueries(['events']); // Refresh event list
        } catch (error) {
            console.error('Error deleting event:', error);
            notifications.show('Error deleting event', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    
        setOpenDeleteDialog(false); // Close dialog after deletion
        setEventToDelete(null); // Reset state
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
            setTicketTypes(response.content || []);
        } catch (error) {
            console.error('Error fetching ticket types:', error);
        }
    };

    useEffect(() => {
        const fetchTagsAndCars = async () => {
            try {
                const tagsResponse = await TicketTags.getAllTags();
                const carCategoriesResponse = await CarCategory.getAllCategories();
                setallTags(tagsResponse?.content || []);
                setallCategories(carCategoriesResponse?.content || []);
            } catch (error) {
                console.error('Error fetching tags or car categories:', error);
            }
        };
    
        fetchTagsAndCars();
    }, []);

    useEffect(() => {
        const fetchAllCarCategories = async () => {
            try {
                const response = await CarCategory.getAllCategories();
                const categories = response?.content || []; 
                setallCategories(categories);
                setFilteredCategories(categories);
            } catch (error) {
                console.error('Error fetching car categories:', error);
                setFilteredCategories([]);
            }
        };
    
        fetchAllCarCategories();
    }, []);
    
    useEffect(() => {
        const searchCategories = async () => {
            if (categorySearch.trim() === '') {
                setFilteredCategories(allCategories);
                return;
            }
    
            try {
                const response = await CarCategory.searchCategories(categorySearch);
                const searchResults = response?.content || []; // Extract the `content` array
                setFilteredCategories(searchResults);
            } catch (error) {
                console.error('Error searching categories:', error);
            }
        };
    
        searchCategories();
    }, [categorySearch, allCategories]);


    useEffect(() => {
        const fetchAllTags = async () => {
            try {
                const response = await TicketTags.getAllTags();
                const tags = response?.content || [];
                setallTags(tags);
                setFilteredTags(tags);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
    
        fetchAllTags();
    }, []);
    
    useEffect(() => {
        const searchTags = async () => {
            if (categorySearch.trim() === '') {
                setFilteredTags(allTags);
                return;
            }
    
            try {
                const response = await TicketTags.searchTags(tagSearch);
                const searchResults = response?.content || []; // Extract the `content` array
                setFilteredCategories(searchResults);
            } catch (error) {
                console.error('Error searching tag:', error);
            }
        };
    
        searchTags();
    }, [tagSearch, allTags]);
    
    const handleDeleteTicketType = async (ticketId) => {
        // Optimistically update the cache
        queryClient.setQueryData(['ticketTypes', selectedEvent.id], (oldData) => {
            if (!oldData) return oldData;
            return oldData.filter((ticket) => ticket.id !== ticketId); // Remove the ticket
        });
    
        try {
            await TicketTypeService.deleteTicketType(ticketId, 'your-auth-token');
            notifications.show('Ticket type deleted successfully!', {
                autoHideDuration: 3000,
                severity: 'success',
            });
        } catch (error) {
            // Roll back the optimistic update on error
            queryClient.invalidateQueries(['ticketTypes', selectedEvent.id]);
            console.error('Error deleting ticket type:', error);
            notifications.show('Error deleting ticket type', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
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
            if (!selectedEvent) return;
    
            const sanitizedTicketType = {
                userId:userId,
                name: DOMPurify.sanitize(newTicketType.name),
                price: newTicketType.price,
                totalTickets: newTicketType.totalTickets,
                eventId: selectedEvent.id,
                availableTickets: newTicketType.availableTickets,
            };
            
    
            await TicketTypeService.createTicketType(sanitizedTicketType);
            queryClient.invalidateQueries(['ticketTypes', selectedEvent.id]);
            setNewTicketType({ name: '', price: '', totalTickets: '', availableTickets: '' });
            await fetchTicketTypes(selectedEvent.id); // Refresh the list
            setErrors({ name: '', price: '', totalTickets: '' });
            notifications.show('Ticket type created successfully!', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            console.error('Error creating ticket type:', error);
            notifications.show('Error creating ticket type', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };
    
    const handleEditTicket = (ticketId) => {
        setTicketTypes((prevTypes) =>
            prevTypes.map((ticket) =>
                ticket.id === ticketId ? { ...ticket, isEditing: true } : ticket
            )
        );
    };

    const handleSaveTicketEdit = async (ticketId) => {
        const ticketToUpdate = ticketTypes.find((ticket) => ticket.id === ticketId);
        try {
            await TicketTypeService.updateTicketType({
                userId: userId,
                name: ticketToUpdate.name,
                price: ticketToUpdate.price,
                eventId: selectedEvent.id,
                availableTickets: ticketToUpdate.availableTickets,
                
            });
    
            notifications.show('Ticket type updated successfully!', {
                autoHideDuration: 3000,
                severity: 'success',
            });

    
            queryClient.invalidateQueries(['ticketTypes', selectedEvent.id]);
    
            // Exit edit mode
            setTicketTypes((prevTypes) =>
                prevTypes.map((ticket) =>
                    ticket.id === ticketId ? { ...ticket, isEditing: false } : ticket
                )
            );
        } catch (error) {
            console.error('Error updating ticket type:', error);
            notifications.show('Error updating ticket type.', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };
    
    const handleCancelTicketEdit = (ticketId) => {
        queryClient.invalidateQueries(['ticketTypes', selectedEvent.id]);
        setTicketTypes((prevTypes) =>
            prevTypes.map((ticket) =>
                ticket.id === ticketId ? { ...ticket, isEditing: false } : ticket
            )
        );
    };
    
    
    
    const handleEditClick = async (event) => {
        setSelectedEvent(event);
        setOpenEditDialog(true);
        await fetchEventImages(event.id);
        await fetchTicketTypes(event.id);
    };
    
    const handleHighlightChange = (index, value) => {
        setSelectedEvent((prevEvent) => {
            const updatedHighlights = [...prevEvent.highlights];
            updatedHighlights[index] = value;
            return { ...prevEvent, highlights: updatedHighlights };
        });
    };
    
    const handleAddHighlight = () => {
        setSelectedEvent((prevEvent) => ({
            ...prevEvent,
            highlights: [...(prevEvent.highlights || []), ''],
        }));
    };
    
    const handleRemoveHighlight = (index) => {
        setSelectedEvent((prevEvent) => {
            const updatedHighlights = [...prevEvent.highlights];
            updatedHighlights.splice(index, 1);
            return { ...prevEvent, highlights: updatedHighlights };
        });
    };
    

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper ,
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',}}>
            <Typography variant="h4" color="textSecondary" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
                Event Management
            </Typography>

            <Grid container spacing={3}>
                {events.content.map((event) => (
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
                                    Tickets Left: {event.totalTicketsLeft || 'N/A'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginTop: '10px' }}>
                                    <CarTag fontSize="small" />
                                    {event.allowedCars?.map((car) => (
                                        <Chip key={car.id} label={car.name} size="small" />
                                    ))}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginTop: '10px' }}>
                                <Tag fontSize="small" />
                                    {event.tags?.map((tag) => (
                                        <Chip key={tag.id} label={tag.name} size="small" />
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
                                    onClick={() => confirmDeleteEvent(event.id)}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}

                
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination
                    count={events.totalPages} // Total pages from API response
                    page={page+1} // Material-UI Pagination uses 1-indexed pages
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

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
                                variant="filled"
                                value={selectedEvent.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                variant="filled"
                                label="Location"
                                value={selectedEvent.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Date"
                                variant="filled"
                                type="datetime-local"
                                value={selectedEvent.date || ''}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                            />
                            <Typography variant="h6" sx={{ marginTop: '20px' }}>
                Add Ticket Type
            </Typography>
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
            <Button
                variant="contained"
                color="primary"
                onClick={handleCreateTicketType}
                sx={{ marginTop: '10px' }}
            >
                Add Ticket Type
            </Button>

            <Typography variant="h6" sx={{ marginTop: '20px' }}>
                Ticket Types
            </Typography>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket Name</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Total Tickets</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ticketTypes.map((ticket) => (
                            <TableRow key={ticket.id}>
                                <TableCell>
                                    {ticket.isEditing ? (
                                        <TextField
                                            variant="filled"
                                            value={ticket.name}
                                            onChange={(e) =>
                                                setTicketTypes((prevTypes) =>
                                                    prevTypes.map((t) =>
                                                        t.id === ticket.id ? { ...t, name: e.target.value } : t
                                                    )
                                                )
                                            }
                                        />
                                    ) : (
                                        <Typography>{ticket.name}</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {ticket.isEditing ? (
                                        <TextField
                                            variant="filled"
                                            type="number"
                                            value={ticket.price}
                                            onChange={(e) =>
                                                setTicketTypes((prevTypes) =>
                                                    prevTypes.map((t) =>
                                                        t.id === ticket.id ? { ...t, price: parseFloat(e.target.value) } : t
                                                    )
                                                )
                                            }
                                        />
                                    ) : (
                                        <Typography>${ticket.price}</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {ticket.isEditing ? (
                                        <TextField
                                            variant="filled"
                                            type="number"
                                            value={ticket.availableTickets}
                                            onChange={(e) =>
                                                setTicketTypes((prevTypes) =>
                                                    prevTypes.map((t) =>
                                                        t.id === ticket.id
                                                            ? { ...t, availableTickets: parseInt(e.target.value, 10) }
                                                            : t
                                                    )
                                                )
                                            }
                                        />
                                    ) : (
                                        <Typography>{ticket.availableTickets}</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {ticket.isEditing ? (
                                        <>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleSaveTicketEdit(ticket.id)}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => handleCancelTicketEdit(ticket.id)}
                                                sx={{ marginLeft: 1 }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleEditTicket(ticket.id)}
                                                startIcon={<Edit />}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleDeleteTicketType(ticket.id)}
                                                sx={{ marginLeft: 1 }}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
                    {selectedEvent.highlights?.map((highlight, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 1,
                                gap: 1,
                            }}
                        >
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
                            value={selectedEvent.description || ''}
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

            {/* Delete Event Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        Are you sure you want to permanently delete this event?
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {events.content.find((e) => e.id === eventToDelete)?.name || "Unknown Event"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                        This action <strong>cannot</strong> be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete Event
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default EventManagement;
