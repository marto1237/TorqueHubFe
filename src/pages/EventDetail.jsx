import React, { useState } from 'react';
import {
    Box, Typography, Button, Chip, Card, CardMedia, CardContent, Grid, MenuItem, FormControl, Select,
    InputLabel, Divider, Paper, Avatar, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { LocationOn, Event as EventIcon, AccessTime, AttachMoney, Map, ContactMail, ShoppingCart, DirectionsCar, Star } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

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
    const event = events.find(e => e.id === parseInt(id)); // Find the event based on the ID
    const [ticketCount, setTicketCount] = useState(1); // For ticket quantity selection
    const navigate = useNavigate();
    const [selectedCar, setSelectedCar] = useState(null);

    if (!event) {
        return <Typography variant="h6">Event not found</Typography>;
    }

    const handleBuyTicket = () => {
        alert(`Successfully purchased ${ticketCount} ticket(s) for ${event.name}`);
        navigate('/');
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

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            <Grid container spacing={4}>
                {/* Event Details and Highlights Section */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: theme.shadows[4] }}>
                        <CardMedia
                            component="img"
                            image={event.imageUrl}
                            alt={event.name}
                            sx={{ height: 400, objectFit: 'cover' }}
                        />
                        <CardContent>
                            {/* Event Name and Main Info */}
                            <Typography variant="h4" color="primary" gutterBottom>{event.name}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon fontSize="small" /> {event.date}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: '10px' }}>
                                <AccessTime fontSize="small" /> {event.hour}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: '10px' }}>
                                <LocationOn fontSize="small" /> {event.location}
                            </Typography>

                            {/* Event Description */}
                            <Typography variant="body1" sx={{ marginTop: '20px' }}>
                                {event.description}
                            </Typography>

                            {/* Event Highlights */}
                            <Box sx={{ marginTop: '20px', flexDirection: 'column' }}>
                                <Typography variant="h6" color="primary">Event Highlights:</Typography>
                                <List sx={{ mt: 2 }}>
                                    {event.highlights.map((highlight, index) => (
                                        <ListItem key={index} sx={{ py: 0 }}>
                                            <Star color="primary" sx={{ mr: 2 }} />
                                            <ListItemText primary={highlight} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            {/* Cars Allowed (JDM, Euro, etc.) */}
                            <Box sx={{ marginTop: '20px', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {event.carsAllowed.map((car, index) => (
                                    <Chip
                                        key={index}
                                        label={car}
                                        icon={<DirectionsCar />}
                                        color="secondary"
                                        variant="outlined"
                                        onClick={() => handleChipClick(car)}
                                        sx={{
                                            backgroundColor:theme.palette.background.default,
                                            color: theme.palette.text.primary,
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
                            <Avatar src={event.organizer.avatar} sx={{ width: 50, height: 50, marginRight: '10px' }} />
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {event.organizer.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <ContactMail fontSize="small" /> {event.organizer.contact}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ marginBottom: '20px' }} />

                        <Typography variant="h6" color="primary" gutterBottom>
                            Location Map
                        </Typography>
                        <Box sx={{ height: '300px' }}>
                            <iframe
                                src={event.mapUrl}
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
