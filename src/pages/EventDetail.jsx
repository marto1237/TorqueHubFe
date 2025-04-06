import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Chip, Card, CardMedia, CardContent, Grid, MenuItem, FormControl, Select,
    InputLabel, Divider, Paper, Avatar, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { LocationOn, Event as EventIcon, AccessTime, AttachMoney, Map, ContactMail, ShoppingCart, DirectionsCar, Star,Sell as Tag, ExpandMore } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import EventService from '../components/configuration/Services/EventService';
import TicketTypeService from '../components/configuration/Services/TicketTypeService';
import { format } from 'date-fns';
import NotFoundPage from '../components/common/NotFoundPage';


const carDetails = {
    'JDM Only': {
        title: 'JDM Cars',
        description: 'JDM stands for Japanese Domestic Market, referring to vehicles that are produced specifically for Japan’s market and follow Japanese standards and regulations. These cars are known for their performance, engineering, and unique designs.'
    },
    'Euro Only': {
        title: 'European Cars',
        description: 'Euro cars refer to vehicles designed and produced by European manufacturers. These cars often focus on luxury, precision engineering, and high performance, including brands such as BMW, Audi, and Mercedes-Benz.'
    },
    'Sports cars': {
        title: 'Sports Cars',
        description: 'Sports cars are designed with performance and handling in mind. They are known for their fast acceleration, high top speeds, and sleek designs. Sports cars can come from many manufacturers across the globe.'
    }
};

const events = [
    {
        id: 1,
        name: 'Wonderland #3',
        location: 'Ainterexpo, Bourg en Bresse (FR)',
        date: 'September 21, 2024 - September 22, 2024',
        hour: "10:00 AM - 6:00 PM",
        ticketsLeft: 50,
        price: '$25',
        imageUrl: 'https://www.auto-evenementen.be/img/events/1801.jpg?uncache=1718278097',
        carsAllowed: ['Sports cars', 'JDM Only'],
        tags: ['Tuning', 'Expo', 'Happening', 'FR'],
        description: 'Join us at Wonderland #3, a thrilling two-day event featuring car shows, tuning expos, and much more! Enjoy an exciting atmosphere filled with stunning cars, expert talks, and fun for all ages. Located at the iconic Ainterexpo in Bourg en Bresse, this is the place to be for all car enthusiasts.',
        highlights: ['Live Tuning Demonstrations', 'Exclusive Merchandise', 'Meet the Experts', 'Food and Beverages'],
        organizer: {
            name: 'Auto Event Organizers',
            contact: 'autoevents@example.com',
            avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
        },
        mapUrl: 'https://maps.google.com/maps?q=Ainterexpo,+Bourg+en+Bresse,+France&t=&z=13&ie=UTF8&iwloc=&output=embed'
    },
];

const EventDetail = () => {
    const theme = useTheme();
    const { id } = useParams(); // Get the event ID from the URL
    const [ticketCount, setTicketCount] = useState(1); // For ticket quantity selection
    const navigate = useNavigate();
    const [selectedCar, setSelectedCar] = useState(null);
    const [eventImages, setEventImages] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const [selectedTags, setSelectedTags] = useState([]); // Initialize as empty array

    const { data: event, isLoading, isError } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            try {
            const response =  await EventService.getEventById(id);
            console.log(response);
            return response;
            }
            catch (error) {
                if (error?.response?.status === 404) {
                    setNotFound(true);
                }
                throw error;
            }
        },
    });

    const { data: ticketTypes, isLoading: isTicketTypesLoading, isError: isTicketTypesError } = useQuery({
        queryKey: ['ticketTypes', id],
        queryFn: async () => {
            const response = await TicketTypeService.getAllByEventId(id);
            console.log(response);
            return response.content; // Assuming the API returns a paginated response
        },
        enabled: !!id, // Fetch only when `id` is available
    });

    useEffect(() => {
        const fetchEventImages = async () => {
            try {
                const storage = getStorage();
                const folderRef = ref(storage, `eventImages/${id}/`);
                const folderContents = await listAll(folderRef);
    
                if (folderContents.items.length > 0) {
                    const imageUrls = await Promise.all(
                        folderContents.items.map(item => getDownloadURL(item))
                    );
                    console.log("Fetched Image URLs: ", imageUrls); // Log the fetched URLs
                    setEventImages(imageUrls);
                } else {
                    console.warn(`No images found for event ID ${id}`);
                    setEventImages([]); // Fallback to empty array
                }
            } catch (error) {
                console.error(`Error fetching images for event ID ${id}:`, error);
                setEventImages([]); // Fallback to empty array
            }
        };
    
        fetchEventImages();
    }, [id]);
    
    const { 
        data: avatarURL, 
        isLoading: isAvatarLoading 
    } = useQuery({
        queryKey: ['profileAvatar', event?.creatorUserId],
        queryFn: async () => {
            if (!event?.creatorUserId) return null;
            const imageRef = ref(storage, `profileImages/${event.creatorUserId}/profile.jpg`);
            return await getDownloadURL(imageRef);
        },
        enabled: !!event, // Fetch only when the event is available
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        retry: 1
    });

    function stringToColor(string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    const stringAvatar = (name) => {
        if (!name) {
            return { sx: { bgcolor: '#ccc' }, children: '?' };
        }
        return {
            sx: { bgcolor: stringToColor(name), width: 50, height: 50 },
            children: `${name[0].toUpperCase()}`,
        };
    };

    if (!event) {
        return <NotFoundPage />;
    }

    const handleBuyTicket = () => {
        navigate('/payment');
    };

    const handleTicketCountChange = (event) => {
        setTicketCount(event.target.value);
    };

    const handleChipClick = (carType) => {
        setSelectedCar(carType); // Show modal when chip is clicked
    };

    const handleCloseDialog = () => {
        setSelectedCar(null); // Close modal
    };

    const handleSelectTicket = (ticketType) => {
        setSelectedTicket(ticketType);
        setTicketCount(1); // Reset ticket quantity
    };

    const formatDateRange = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
    
        if (start.toDateString() === end.toDateString()) {
            // Same day: Show only the time
            return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
        } else {
            // Different days: Show date and time
            return `${format(start, 'MMM d, h:mm a')} - ${format(end, 'MMM d, h:mm a')}`;
        }
    };

    
    

    
    

    if (isLoading) {
        return <Typography>Loading event details...</Typography>;
    }

    if (isError) {
        return <Typography color="error">Failed to load event details. Please try again later.</Typography>;
    }

    if (!event) {
        return <Typography variant="h6">Event not found</Typography>;
    }

    
    const handleTagClick = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
        );
    };

    const getEmbedUrl = (mapUrl) => {
        if (!mapUrl) {
            // Fallback to default embed link if `mapUrl` is null or undefined
            return 'https://www.google.com/maps/embed/v1/view?key=AIzaSyDJ45-gWiL5XEnw_xLmqT8kHuZe9XDeQNs&center=0,0&zoom=2';
        }
        // Extract the latitude and longitude from the mapUrl
        const regex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = mapUrl.match(regex);
    
        if (match && match[1] && match[2]) {
            const latitude = match[1];
            const longitude = match[2];
            return `https://www.google.com/maps/embed/v1/view?key=AIzaSyDJ45-gWiL5XEnw_xLmqT8kHuZe9XDeQNs&center=${latitude},${longitude}&zoom=15`;
        }
    
        // Fallback to default embed link if parsing fails
        return 'https://www.google.com/maps/embed?pb=!1m18&center=0,0&zoom=2';
    };
    
    if (!event) {
        return <NotFoundPage />;
    }

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            <Grid container spacing={4}>
                {/* Event Details and Highlights Section */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: theme.shadows[4] }}>
                    <Card>
                        <Carousel showThumbs={false} showArrows infiniteLoop emulateTouch>
                            {eventImages && eventImages.length > 0 ? (
                                eventImages.map((img, index) => (
                                    <Box key={index}>
                                        <CardMedia
                                            component="img"
                                            image={img}
                                            alt={`Event Image ${index + 1}`}
                                            sx={{ maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                                        />
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', padding: 2 }}>
                                    No images available for this event.
                                </Typography>
                            )}
                        </Carousel>
                    </Card>

                        <CardContent>
                            {/* Event Name and Main Info */}
                            <Typography variant="h4" color="primary" gutterBottom>{event.name}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon fontSize="small" /> {new Date(event.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: '10px' }}>
                                <AccessTime fontSize="small" /> {formatDateRange(event.startTime, event.endTime)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: '10px' }}>
                                <LocationOn fontSize="small" /> {event.location}
                            </Typography>

                            {/* Event Description */}
                            <Typography variant="body1" sx={{ marginTop: '20px' }}>
                                {event.description || 'No description available.'}

                            </Typography>

                            {/* Event Highlights */}
                            <Box sx={{ marginTop: '20px', flexDirection: 'column' }}>
                                <Typography variant="h6" color="primary">Event Highlights:</Typography>
                                <List sx={{ mt: 2 }}>
                                    {event.highlights.length > 0 ? (
                                        event.highlights.map((highlight, index) => (
                                            <Typography key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Star color="primary" sx={{ mr: 1 }} /> {highlight}
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            No highlights available.
                                        </Typography>
                                    )}
                                </List>
                            </Box>

                            {/* Cars Allowed (JDM, Euro, etc.) */}
                            <Box sx={{ marginTop: '20px', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {event.allowedCars.length > 0 ? (
                                    event.allowedCars.map((car, index) => (
                                        <Chip
                                            key={index}
                                            label={car.name}
                                            icon={<DirectionsCar />}
                                            color="secondary"
                                            variant="outlined"
                                            onClick={() => handleChipClick(car)}
                                            sx={{
                                                backgroundColor: theme.palette.background.default,
                                                color: theme.palette.text.primary,
                                            }}
                                        />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No cars allowed information available.
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1, mb: 2 }}>
                                {(event.tags || []).map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag.name  } // Adjust this based on the format of `tags`
                                        icon={<Tag />}
                                        color="secondary"
                                        variant="outlined"
                                        onClick={() => handleTagClick(tag.name || tag)}
                                        className={selectedTags.includes(tag.name || tag) ? 'Mui-selected' : 'Mui-unselected'}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                opacity: 0.8, // Adds a hover effect
                                            },
                                        }}
                                    />
                                ))}
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>

                {/* Ticket and Organizer Info */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ padding: '20px', boxShadow: theme.shadows[4], backgroundColor: theme.palette.background.default }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Ticket Information
                        </Typography>
                        
                        {ticketTypes.map((ticketType) => (
                                <Accordion key={ticketType.id}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMore />}
                                        aria-controls={`panel-${ticketType.id}-content`}
                                        id={`panel-${ticketType.id}-header`}
                                    >
                                        <Typography sx={{ fontWeight: 'bold' }}>{ticketType.name}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2" color="textSecondary">
                                            Price: ${ticketType.price.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Tickets Left: {ticketType.availableTickets}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSelectTicket(ticketType)}
                                            disabled={ticketType.availableTickets === 0}
                                            sx={{ marginTop: '10px' }}
                                        >
                                            {ticketType.availableTickets === 0 ? 'Sold Out' : 'Select Ticket'}
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                            {selectedTicket ? (
                                <Box sx={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        Selected Ticket: {selectedTicket.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Price: ${selectedTicket.price.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Tickets Left: {selectedTicket.availableTickets}
                                    </Typography>
                                    <FormControl sx={{ marginTop: '10px', minWidth: 120 }}>
                                        <InputLabel>Quantity</InputLabel>
                                        <Select
                                            value={ticketCount}
                                            onChange={handleTicketCountChange}
                                            label="Quantity"
                                        >
                                            {[...Array(selectedTicket.availableTickets).keys()].map((_, index) => (
                                                <MenuItem key={index + 1} value={index + 1}>
                                                    {index + 1}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        startIcon={<ShoppingCart />}
                                        onClick={handleBuyTicket}
                                        disabled={ticketCount > selectedTicket.availableTickets}
                                        sx={{ marginTop: '10px' }}
                                    >
                                        Buy {ticketCount} Ticket(s)
                                    </Button>
                                </Box>
                            ) : (
                                <Typography>Select a ticket to start the buying process.</Typography>
                            )}


                        <Divider sx={{ marginTop: '30px', marginBottom: '30px' }} />

                        {/* Organizer Info */}
                        <Typography variant="h6" color="primary" gutterBottom>
                            Organizer Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            {avatarURL ? (
                                    <Avatar src={avatarURL} sx={{ width: 50, height: 50, marginRight: '10px' }} />
                                ) : (
                                    <Avatar {...stringAvatar(event.creatorName)} />
                                )}
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {event.creatorName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <ContactMail fontSize="small" /> {event.creatorEmail}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ marginBottom: '20px' }} />

                        <Typography variant="h6" color="primary" gutterBottom>
                            Location Map
                        </Typography>
                        <Box sx={{ height: '300px' }}>
                            <iframe
                                src={getEmbedUrl(event.mapUrl)}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Location Map"
                            />
                        </Box>


                        {/* Dialog for Car Type Info */}
                        <Dialog open={!!selectedCar} onClose={handleCloseDialog}>
                            <DialogTitle>{selectedCar ? carDetails[selectedCar].title : ''}</DialogTitle>
                            <DialogContent>
                                <Typography variant="body1">
                                    {selectedCar ? carDetails[selectedCar].description : ''}
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog} color="primary">
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EventDetail;
