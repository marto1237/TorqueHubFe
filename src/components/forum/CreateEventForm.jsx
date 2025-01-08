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
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAppNotifications } from '../common/NotificationProvider';
import EventService from '../configuration/Services/EventService';
import CarCategory from '../configuration/Services/CarCategoryService';
import TicketTags from '../configuration/Services/TicketTagsService'

const EventCreateForm = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const notifications = useAppNotifications();

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

    const [category, setCategory] = useState(null);
    const [categorySearch, setCategorySearch] = useState('');
    const [allCategories, setallCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);

    const [tag, setTag] = useState([]);
    const [tagSearch, setTagSearch] = useState('');
    const [allTags, setallTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);

    const maxTags = 5;
    const [files, setFiles] = useState([]);
    const maxImages = 3; 


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

    const userDetails = sessionStorage.getItem('userDetails');

    const parsedDetails = JSON.parse(userDetails);
    const userId = parsedDetails.id;

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



    const validateForm = () => {
        const nameValid = name.trim().length >= 3;
        const descriptionValid = description.trim().length >= 10;
        const dateValid = !!date;
        const hourStartValid = !!hourStart;
        const hourEndValid = !!hourEnd;
        const locationValid = location.trim().length > 0;

        setError({
            name: !nameValid,
            description: !descriptionValid,
            date: !dateValid,
            hourStart: !hourStartValid,
            hourEnd: !hourEndValid,
            location: !locationValid,
        });

        return (
            nameValid &&
            descriptionValid &&
            dateValid &&
            hourStartValid &&
            hourEndValid &&
            locationValid 
        );
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
    
        const eventData = {
            name,
            description,
            date: `${date}T${hourStart}:00`, // Combine date and time
            startTime: `${date}T${hourStart}:00`, // Backend expects ISO string
            endTime: `${date}T${hourEnd}:00`,
            location,
            mapUrl: locationUrl, // Match backend key
            highlights, // Should already be an array of strings
            tags: tag.map((t) => t.name), // Map tag objects to names
            allowedCars: carTypesAllowed.map((car) => car.name || car),
            creatorUserId: userId,
        };
    
        console.log("Submitting event data:", eventData);

        
    
        try {
            const response = await EventService.createEvent(eventData);
            const eventId = response?.id;

             // Upload images
            const imageUrls = await uploadImages(eventId);
            console.log('Uploaded image URLs:', imageUrls);

            notifications.show('"Event created successfully!', { autoHideDuration: 3000, severity: 'success' });
            navigate('/events');
        } catch (error) {
            console.error('Error response from API:', error.response?.data || error.message);
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


    const handleTagChange = (event, newTags) => {
        if (newTags.length <= maxTags) {
            setTag(newTags);
        }
    };

    const handleCategoryChange = (event, newValue) => {
        setCarTypesAllowed(newValue.map((category) => category.name));
    };
    

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
    
        // Check max image limit
        if (selectedFiles.length + files.length > maxImages) {
            notifications.show(`You can only upload up to ${maxImages} images per event.`, { autoHideDuration: 3000, severity: 'error' });
            return;
        }
    
        // Validate files
        const validFiles = selectedFiles.filter((file) => {
            if (!file.type.startsWith('image/')) {
                notifications.show(`${file.name} is not an image file.`, { severity: 'error' });
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                notifications.show(`${file.name} is too large (max 5MB).`, { severity: 'error' });
                return false;
            }
            return true;
        });
    
        const newFiles = validFiles.map((file) => ({
            file,
            previewURL: URL.createObjectURL(file),
            name: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'), // Sanitize filename
        }));
    
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };
    
    const uploadImages = async (eventId) => {
        if (!eventId) {
            console.error('No event ID provided for image upload.');
            return [];
        }
    
        const uploadPromises = files.map(async ({ file, name }) => {
            try {
                const timestamp = new Date().getTime();
                const sanitizedName = `${timestamp}_${name}`;
                const fileRef = ref(storage, `eventImages/${eventId}/${sanitizedName}`);
    
                const uploadTask = uploadBytesResumable(fileRef, file);
    
                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log(`Upload is ${progress}% done.`);
                        },
                        (error) => {
                            console.error('Upload error:', error);
                            notifications.show(`Error uploading ${name}: ${error.message}`, { severity: 'error', autoHideDuration: 5000 });
                            reject(error);
                        },
                        async () => {
                            try {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                resolve(downloadURL);
                            } catch (error) {
                                console.error('Error getting download URL:', error);
                                reject(error);
                            }
                        }
                    );
                });
            } catch (error) {
                console.error(`Error processing ${name}:`, error);
                return null;
            }
        });
    
        try {
            const urls = await Promise.all(uploadPromises);
            return urls.filter((url) => url !== null); // Filter out failed uploads
        } catch (error) {
            console.error('Error uploading images:', error);
            return [];
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
                            options={filteredCategories || []} // Options for categories
                            getOptionLabel={(option) => option?.name || ''} // Display the name of the category
                            value={carTypesAllowed} // Bind the value to carTypesAllowed state
                            onChange={(event, newValue) => setCarTypesAllowed(newValue)} // Update carTypesAllowed
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Allowed Car Categories"
                                    variant="filled"
                                    placeholder="Select allowed cars"
                                />
                            )}
                            sx={{ marginBottom: '1.5rem' }}
                        />




                        <Autocomplete
                            multiple
                            options={filteredTags}
                            getOptionLabel={(option) => option.name}
                            value={tag}
                            onChange={handleTagChange}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => {
                                    const tagProps = getTagProps({ index });
                                    return (
                                        <Chip
                                            key={option.name || index} // Use unique property or fallback to index
                                            label={option.name}
                                            {...tagProps} // Spread the remaining props here
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Tags"
                                    variant="filled"
                                    sx={{ marginBottom: '1.5rem' }}
                                    helperText={`You can select up to ${maxTags} tags`}
                                />
                            )}
                        />

                        {/* Event Image Upload */}
                        <Typography variant="h6">Event Image:</Typography>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{ marginBottom: '1rem' }}
                        >
                            Upload Image
                            <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                        </Button>
                        {files.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', mb: 2 }}>
                            {files.map(({ previewURL }, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: '100px',
                                        height: '100px',
                                        overflow: 'hidden',
                                        borderRadius: '8px',
                                        border: '1px solid #ccc',
                                    }}
                                >
                                    <img
                                        src={previewURL}
                                        alt={`Preview ${index}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                            ))}
                        </Box>
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
