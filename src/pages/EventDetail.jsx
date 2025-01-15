import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Chip, Card, CardMedia, CardContent, Grid, MenuItem, FormControl, Select,
    InputLabel, Divider, Paper, Avatar, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { LocationOn, Event as EventIcon, AccessTime, AttachMoney, Map, ContactMail, ShoppingCart, DirectionsCar, Star } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import EventService from '../components/configuration/Services/EventService';

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

    const { data: event, isLoading, isError } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response =  await EventService.getEventById(id);
            console.log(response);
            return response
        },
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
    
    

    if (!event) {
        return <Typography variant="h6">Event not found</Typography>;
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

    if (isLoading) {
        return <Typography>Loading event details...</Typography>;
    }

    if (isError) {
        return <Typography color="error">Failed to load event details. Please try again later.</Typography>;
    }

    if (!event) {
        return <Typography variant="h6">Event not found</Typography>;
    }

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
                                <AccessTime fontSize="small" /> {event.startTime || 'N/A'} - {event.endTime || 'N/A'}
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
                                            label={car}
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
                        </CardContent>
                    </Card>
                </Grid>

                {/* Ticket and Organizer Info */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ padding: '20px', boxShadow: theme.shadows[4], backgroundColor: theme.palette.background.default }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Ticket Information
                        </Typography>

                        {/* Price */}
                        <Typography variant="h5" color="primary" sx={{ marginTop: '10px' }}>
                            Price: {event.price}
                        </Typography>

                        {/* Tickets Left */}
                        <Typography variant="body1" color="textSecondary" sx={{ marginTop: '10px' }}>
                            Tickets Left: {event.ticketsLeft}
                        </Typography>

                        {/* Ticket Quantity Selector */}
                        <FormControl sx={{ marginTop: '20px', minWidth: 120 }}>
                            <InputLabel>Quantity</InputLabel>
                            <Select
                                value={ticketCount}
                                onChange={handleTicketCountChange}
                                label="Quantity"
                            >
                                {[...Array(event.ticketsLeft).keys()].map((_, index) => (
                                    <MenuItem key={index + 1} value={index + 1}>
                                        {index + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Buy Ticket Button */}
                        <Grid container spacing={2} sx={{ marginTop: '20px' }}>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    startIcon={<ShoppingCart />}
                                    onClick={handleBuyTicket}
                                    disabled={event.ticketsLeft === 0}
                                >
                                    {event.ticketsLeft === 0 ? 'Sold Out' : `Buy ${ticketCount} Ticket(s)`}
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ marginTop: '30px', marginBottom: '30px' }} />

                        {/* Organizer Info */}
                        <Typography variant="h6" color="primary" gutterBottom>
                            Organizer Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <Avatar src={event.creatorUserId} sx={{ width: 50, height: 50, marginRight: '10px' }} />
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
