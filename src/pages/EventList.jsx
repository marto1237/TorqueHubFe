import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button,Chip , Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LocationOn, Event as EventIcon, AccessTime, DirectionsCar as CarTag, Sell as Tag, ConfirmationNumber, AttachMoney} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';

// Event data with image URL, tickets left, price, etc.
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
        carsAllowed: ['Sports cars'],
        tags: ['Tuning', 'Expo', 'Happening', 'FR']
    },
    {
        id: 2,
        name: 'Let\'s Go Tokyo - At Night',
        location: 'Quarter 51, Dorpsstraat, Damme (BE)',
        hour: "10:00 AM - 6:00 PM",
        date: 'Saturday, September 21, 2024',
        ticketsLeft: 30,
        price: '$35',
        imageUrl: 'https://www.auto-evenementen.be/img/events/1815.jpg?uncache=1721750651',
        carsAllowed: ['JDM'],
        tags: ['Tuning', 'Expo', 'Happening', 'FR']
    },
    {
        id: 3,
        name: 'Antwerp Tuning Day',
        location: 'The Schorre, Boom (BE)',
        hour: "10:00 AM - 6:00 PM",
        date: 'Sunday, September 22, 2024',
        ticketsLeft: 0,
        price: '$20',
        imageUrl: 'https://www.auto-evenementen.be/img/events/1767.jpg',
        carsAllowed: ['Sports cars'],
        tags: ['Tuning', 'Expo', 'Happening', 'FR']
    },
    {
        id: 4,
        name: 'Antwerp Tuning Day',
        location: 'The Schorre, Boom (BE)',
        hour: "10:00 AM - 6:00 PM",
        date: 'Sunday, September 22, 2024',
        ticketsLeft: 10,
        price: '$20',
        imageUrl: 'https://www.auto-evenementen.be/img/events/1767.jpg',
        carsAllowed: ['Sports cars'],
        tags: ['Meeting', 'Asian Cars', 'Bikes', 'BE']
    },
    {
        id: 5,
        name: 'Wonderland #3',
        location: 'Ainterexpo, Bourg en Bresse (FR)',
        hour: "10:00 AM - 6:00 PM",
        date: 'September 21, 2024 - September 22, 2024',
        ticketsLeft: 50,
        price: '$25',
        imageUrl: 'https://www.auto-evenementen.be/img/events/1801.jpg?uncache=1718278097',
        carsAllowed: ['Sports cars'],
        tags: ['Tuning', 'BE', 'Expo']
    },
    {
        id: 6,
        name: 'Let\'s Go Tokyo - At Night',
        location: 'Quarter 51, Dorpsstraat, Damme (BE)',
        hour: "10:00 AM - 6:00 PM",
        date: 'Saturday, September 21, 2024',
        ticketsLeft: 30,
        price: '$35',
        imageUrl: 'https://www.auto-evenementen.be/img/events/1815.jpg?uncache=1721750651',
        carsAllowed: ['JDM'],
        tags: ['Tuning', 'Expo', 'Happening', 'FR']
    },
];

const EventList = () => {
    const theme = useTheme();
    const [sort, setSort] = useState('High to Low');
    const [selectedTags, setSelectedTags] = useState([]); // Initialize as empty array
    const navigate = useNavigate(); // For programmatic navigation
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const storedUserDetails = JSON.parse(sessionStorage.getItem('userDetails'));
        if (storedUserDetails) {
            setUserRole(storedUserDetails.role);
        }
    }, []);

    
    const handleCreateEventClick = () => {
        navigate('/create-event');
    };

    const handleSortChange = (event) => {
        setSort(event.target.value);
    };

    const handleTagClick = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    };

    // Navigate to the event details page when clicking on an image or title
    const handleEventClick = (eventId) => {
        navigate(`/events/${eventId}`); // Redirect to the event details page
    };

    // Filter events by the selected tags
    const filteredEvents = selectedTags.length > 0
        ? events.filter((event) => selectedTags.every((tag) => event.tags.includes(tag) || event.carsAllowed.includes(tag)))
        : events;

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" color="textSecondary">Upcoming Events</Typography>
                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <Typography variant="body2" color="textSecondary">{filteredEvents.length} Results Found</Typography>
                                <FormControl size="small">
                                    <InputLabel>Sort By</InputLabel>
                                    <Select value={sort} onChange={handleSortChange}>
                                        <MenuItem value="High to Low">Price: High to Low</MenuItem>
                                        <MenuItem value="Low to High">Price: Low to High</MenuItem>
                                    </Select>
                                </FormControl>
                                {/* Show "Create Event" button only for authorized roles */}
                                {(userRole === 'ADMIN' || userRole === 'MODERATOR' || userRole === 'EVENT_ORGANISER') && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleCreateEventClick}
                                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        Create Event
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Render selected tags below Upcoming Events */}
                        {selectedTags.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" color="primary">Selected Tags:</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {selectedTags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            onClick={() => handleTagClick(tag)}
                                            className={
                                                selectedTags.includes(tag)
                                                    ? 'Mui-selected'
                                                    : 'Mui-unselected'
                                            }
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    opacity: 0.8, // Adds a hover effect
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Render the filtered events */}
                        <Grid container spacing={3}>
                            {filteredEvents.map((event) => (
                                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={event.id} sx={{ padding: '15px' }}>
                                    <Card sx={{ borderRadius: '15px', overflow: 'hidden' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* Wrap the image with a click handler */}
                                            <Box
                                                onClick={() => handleEventClick(event.id)}
                                                sx={{ width: '100%', height: '300px', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', cursor: 'pointer' }}
                                            >
                                                <img src={event.imageUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </Box>
                                            <CardContent>
                                                {/* Wrap the title with a click handler and make it bold */}
                                                <Typography
                                                    variant="h6"
                                                    color="primary"
                                                    onClick={() => handleEventClick(event.id)}
                                                    sx={{ margin: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    {event.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <EventIcon fontSize="small" /> {event.date}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                    <AccessTime fontSize="small" /> {event.hour}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                    <LocationOn fontSize="small" /> {event.location}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                    <CarTag fontSize="small" />
                                                    {event.carsAllowed.map((tag, index) => (
                                                        <Chip key={index} color="primary" label={tag} size="small" onClick={() => handleTagClick(tag)} className={
                                                            selectedTags.includes(tag)
                                                                ? 'Mui-selected'
                                                                : 'Mui-unselected'
                                                        }
                                                              sx={{
                                                                  cursor: 'pointer',
                                                                  '&:hover': {
                                                                      opacity: 0.8, // Adds a hover effect
                                                                  },
                                                              }} />
                                                    ))}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                    <Tag fontSize="small" />
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1, mb: 2 }}>
                                                        {event.tags.map((tag, index) => (
                                                            <Chip key={index} label={tag} size="small" onClick={() => handleTagClick(tag)}
                                                                  className={
                                                                      selectedTags.includes(tag)
                                                                          ? 'Mui-selected'
                                                                          : 'Mui-unselected'
                                                                  }
                                                                  sx={{
                                                                      cursor: 'pointer',
                                                                      '&:hover': {
                                                                          opacity: 0.8, // Adds a hover effect
                                                                      },
                                                                  }} />
                                                        ))}
                                                    </Box>
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: theme.palette.background.default, padding: '10px', borderRadius: '10px', mt: 2 }}>
                                                    <ConfirmationNumber color="primary" fontSize="small" />
                                                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                                                        Tickets Left: {event.ticketsLeft}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: theme.palette.background.default, padding: '10px', borderRadius: '10px', mt: 1 }}>
                                                    <AttachMoney color="primary" fontSize="small" />
                                                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                                                        Price: {event.price}
                                                    </Typography>
                                                </Box>
                                                <Button size="small" variant="contained" sx={{ mt: 2 }} onClick={() => handleEventClick(event.id)} disabled={event.ticketsLeft === 0}>
                                                    {event.ticketsLeft === 0 ? 'Sold Out' : 'Buy Ticket'}
                                                </Button>
                                            </CardContent>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default EventList;
