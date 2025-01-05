import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    Autocomplete,
    Paper,
    Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import EventService from '../configuration/Services/EventService';

const EventCreateForm = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [hourStart, setHourStart] = useState('');
    const [hourEnd, setHourEnd] = useState('');
    const [location, setLocation] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [price, setPrice] = useState('');
    const [ticketsAvailable, setTicketsAvailable] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [carTypesAllowed, setCarTypesAllowed] = useState([]);
    const autocompleteRef = useRef(null);
    const [eventImageUrl, setEventImageUrl] = useState('');

    const carTypes = ['JDM Only', 'Euro Only', 'Sports Cars', 'Classic Cars'];
    const [ticketTypes, setTicketTypes] = useState([]);

    const [error, setError] = useState({
        name: false,
        description: false,
        date: false,
        hourStart: false,
        hourEnd: false,
        location: false,
        price: false,
        ticketsAvailable: false,
        ticketTypes: false,
    });

    useEffect(() => {
        // Initialize Google Maps Places Autocomplete
        const loadAutocomplete = () => {
            if (window.google && autocompleteRef.current) {
                const autocomplete = new window.google.maps.places.Autocomplete(
                    autocompleteRef.current,
                    { types: ['geocode'] }
                );

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const formattedAddress = place.formatted_address;

                        setLocation(formattedAddress);
                        setLocationUrl(`https://www.google.com/maps?q=${lat},${lng}`);
                    }
                });
            }
        };

        loadAutocomplete();
    }, []);


    const handleTicketTypeChange = (index, field, value) => {
        const updatedTickets = [...ticketTypes];
        updatedTickets[index][field] = value;
        setTicketTypes(updatedTickets);
    };

    const handleAddTicketType = () => {
        setTicketTypes([...ticketTypes, { type: '', price: '', quantity: 1 }]);
    };

    const validateForm = () => {
        const nameValid = name.trim().length >= 3;
        const descriptionValid = description.trim().length >= 10;
        const dateValid = !!date;
        const hourStartValid = !!hourStart;
        const hourEndValid = !!hourEnd;
        const locationValid = location.trim().length > 0;
        const priceValid = !isNaN(price) && price > 0;
        const ticketsAvailableValid = !isNaN(ticketsAvailable) && ticketsAvailable > 0;

        setError({
            name: !nameValid,
            description: !descriptionValid,
            date: !dateValid,
            hourStart: !hourStartValid,
            hourEnd: !hourEndValid,
            location: !locationValid,
            price: !priceValid,
            ticketsAvailable: !ticketsAvailableValid,
        });

        return (
            nameValid &&
            descriptionValid &&
            dateValid &&
            hourStartValid &&
            hourEndValid &&
            locationValid &&
            priceValid &&
            ticketsAvailableValid
        );
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const eventData = {
            name,
            description,
            date,
            hour: `${hourStart} - ${hourEnd}`,
            location,
            locationUrl,
            price: `$${price}`,
            ticketsLeft: parseInt(ticketsAvailable, 10),
            highlights,
            carsAllowed: carTypesAllowed,
            imageUrl,
        };

        try {
            await EventService.createEvent(eventData);
            navigate('/events');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleHighlightChange = (index, value) => {
        const updatedHighlights = [...highlights];
        updatedHighlights[index] = value;
        setHighlights(updatedHighlights);
    };

    const handleAddHighlight = () => {
        setHighlights([...highlights, '']);
    };


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileRef = ref(storage, `eventImages/`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error('Upload error:', error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setEventImageUrl(downloadURL);
                        console.log('File available at', downloadURL);
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                    }
                }
            );
        }
    };

    return (
        <Box sx={{ padding: { xs: '1rem', sm: '1.25rem', md: '2rem' },paddingTop: { xs: '4.5rem', sm: '4rem', md: '5rem', }, backgroundColor: theme.palette.background.default }}>
            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                <Paper elevation={3} sx={{ padding: '2rem', backgroundColor: theme.palette.background.paper }}>
                    <Typography variant="h4" sx={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                        Create a New Event
                    </Typography>
                    <Divider sx={{ marginBottom: '2rem' }} />

                    <TextField
                        fullWidth
                        label="Event Name"
                        variant="filled"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={error.name}
                        helperText={error.name ? 'Event name must be at least 3 characters' : ''}
                        sx={{ marginBottom: '1.5rem' }}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        variant="filled"
                        multiline
                        minRows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        error={error.description}
                        helperText={error.description ? 'Description must be at least 10 characters' : ''}
                        sx={{ marginBottom: '1.5rem' }}
                    />

                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        variant="filled"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        error={error.date}
                        helperText={error.date ? 'Event date is required' : ''}
                        sx={{ marginBottom: '1.5rem' }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, marginBottom: '1.5rem' }}>
                        <TextField
                            fullWidth
                            label="Start Time"
                            type="time"
                            variant="filled"
                            value={hourStart}
                            onChange={(e) => setHourStart(e.target.value)}
                            error={error.hourStart}
                            helperText={error.hourStart ? 'Start time is required' : ''}
                        />
                        <TextField
                            fullWidth
                            label="End Time"
                            type="time"
                            variant="filled"
                            value={hourEnd}
                            onChange={(e) => setHourEnd(e.target.value)}
                            error={error.hourEnd}
                            helperText={error.hourEnd ? 'End time is required' : ''}
                        />
                    </Box>

                    {/* Ticket Types */}
                    <Typography variant="h6" sx={{ marginBottom: '1rem' }}>
                        Ticket Types:
                    </Typography>
                    {ticketTypes.map((ticket, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
                            <TextField
                                fullWidth
                                label="Ticket Type"
                                variant="filled"
                                value={ticket.type}
                                onChange={(e) => handleTicketTypeChange(index, 'type', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Price"
                                variant="filled"
                                type="number"
                                value={ticket.price}
                                onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                inputProps={{ min: 1 }} // Prevent negative values or zero in the input
                            />
                             <TextField
                                fullWidth
                                label="Quantity"
                                variant="filled"
                                type="number"
                                value={ticket.quantity}
                                onChange={(e) => handleTicketTypeChange(index, 'quantity', e.target.value)}
                                inputProps={{ min: 1 }} // Prevent negative values or zero in the input
                            />
                        </Box>
                    ))}
                    <Button variant="contained" onClick={handleAddTicketType}>
                        Add Ticket Type
                    </Button>

                    <Typography variant="h6" sx={{ marginBottom: '1rem' }}>
                        Search Location:
                    </Typography>
                    <TextField
                        fullWidth
                        inputRef={autocompleteRef}
                        placeholder="Type a location"
                        variant="filled"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        error={error.location}
                        helperText={error.location ? 'Location is required' : ''}
                        sx={{ marginBottom: '1.5rem' }}
                    />

                    {locationUrl && (
                        <Box sx={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ marginBottom: '0.5rem' }}>
                                Location Preview:
                            </Typography>
                            <iframe
                                src={`${locationUrl}&output=embed`}
                                width="100%"
                                height="300"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Google Maps Preview"
                            />
                        </Box>
                    )}

                    <Typography variant="h6">Event Highlights:</Typography>
                        <List>
                            {highlights.map((highlight, index) => (
                                <ListItem key={index}>
                                    <TextField
                                        fullWidth
                                        value={highlight}
                                        variant="filled"
                                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                                        placeholder="Highlight description"
                                    />
                                </ListItem>
                            ))}
                            <Button onClick={handleAddHighlight} sx={{ marginTop: '1rem' }}>
                                Add Highlight
                            </Button>
                        </List>

                        <Autocomplete
                            multiple
                            options={carTypes}
                            value={carTypesAllowed}
                            onChange={(event, newValue) => setCarTypesAllowed(newValue)}
                            renderInput={(params) => <TextField {...params} label="Allowed Car Types" variant="filled" />}
                            sx={{ marginBottom: '1.5rem' }}
                        />

                        {/* Event Image Upload */}
                        <Typography variant="h6">Event Image:</Typography>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{ marginBottom: '1rem' }}
                        >
                            Upload Image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </Button>
                        {eventImageUrl && (
                            <Box sx={{ my: 2 }}>
                                <img
                                    src={eventImageUrl}
                                    alt="Event"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        )}
                        {error.eventImage && (
                            <Typography color="error" sx={{ mb: '1rem' }}>
                                Event image is required
                            </Typography>
                        )}



                    <Divider sx={{ marginBottom: '2rem' }} />

                    <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
                        Create Event
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
};

export default EventCreateForm;
