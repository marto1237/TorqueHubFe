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
import { LocationOn, Event as EventIcon, AccessTime, DirectionsCar as CarTag, Sell as Tag, ConfirmationNumber, AttachMoney} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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
    const size = 10;

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
                    creatorUserId: userId, // Assuming `userId` is the creator's ID
                    newTime: formattedDate, // Assuming `date` is the new start time
                    ticketTypes: ticketTypes, // Ensure `ticketTypes` is populated correctly
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
                availableTickets: newTicketType.totalTickets,
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
    

    
    const handleEditClick = async (event) => {
        setSelectedEvent(event);
        setOpenEditDialog(true);
        await fetchTicketTypes(event.id);
    };
    

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
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
                                    Tickets Left: {event.ticketsAvailable || 'N/A'}
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
                                    onClick={() => handleDeleteClick(event.id)}
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
                    page={page + 1} // Material-UI Pagination uses 1-indexed pages
                    onChange={(event, value) => setPage(value - 1)} // Update the 0-indexed page state
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
                                    <TableCell>{ticket.name}</TableCell>
                                    <TableCell>${ticket.price}</TableCell>
                                    <TableCell>{ticket.availableTickets}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteTicketType(ticket.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
        
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
        </Box>
    );
};

export default EventManagement;
