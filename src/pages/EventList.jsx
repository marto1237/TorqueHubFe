import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button,Chip , Select, MenuItem, FormControl, InputLabel,Pagination } from '@mui/material';
import { LocationOn, Event as EventIcon, AccessTime, DirectionsCar as CarTag, Sell as Tag, ConfirmationNumber, AttachMoney} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import EventService from '../components/configuration/Services/EventService';
import EventFilterPanel from '../components/common/EventFilterPanel';
import EventFilterService from "../components/configuration/Services/EventFilterService";
import { format } from 'date-fns';
import QueryWrapper from '../components/common/QueryWrapper';
import LoadingComponent from '../components/common/Loader';
import NotFoundPage from '../components/common/NotFoundPage';
import ErrorPage from '../components/common/ErrorPage';
import EmptyState from '../components/common/EmptyState';

// Event data with image URL, tickets left, price, etc.

const EventList = () => {
    const theme = useTheme();
    const [sort, setSort] = useState("date");
    const [selectedTags, setSelectedTags] = useState([]); // Initialize as empty array
    const navigate = useNavigate(); // For programmatic navigation
    const [userRole, setUserRole] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [eventsWithImages, setEventsWithImages] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialPage = parseInt(queryParams.get('page') || '0', 10); // 0-indexed
    const initialSize = parseInt(queryParams.get('size') || '9', 10);

    const [page, setPage] = useState(initialPage);
    const [size, setPageSize] = useState(initialSize);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isFilterMode, setIsFilterMode] = useState(false);
    const [isImagesLoading, setIsImagesLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [connectionRefused, setConnectionRefused] = useState(false);

    const [defaultEvents, setDefaultEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const queryClient = useQueryClient();

    const fetchFilteredEvents = async () => {
        try {
            setIsImagesLoading(true);
            setApiError(null);
            setConnectionRefused(false);
            
            const validFilters = Object.fromEntries(
                Object.entries(selectedFilters).filter(
                    ([_, value]) => value !== null && value !== ""
                )
            );

            const filtersWithSort = {
                ...validFilters,
                sortOption: sort,
            };
            console.log("Filters being sent to API:", filtersWithSort);
            const response = await EventFilterService.filterEvents(filtersWithSort, page, size);
            console.log(response);

            const events = response.content;

            // Fetch images for each event
            const filteredWithImages = await Promise.all(
                events.map(async (event) => {
                    const imageUrl = await getFirebaseImage(event.id);
                    return { ...event, imageUrl };
                })
            );

            setFilteredEvents(filteredWithImages);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error("Error fetching events:", err);
            if (err.message && err.message.includes('Network Error')) {
                setConnectionRefused(true);
            }
            setApiError("Failed to load events. Please try again later.");
            // Don't clear filtered events to prevent UI flashing
        } finally {
            setIsImagesLoading(false); // Done loading
        } 
    };

    useEffect(() => {
        if (isFilterMode) {
            fetchFilteredEvents();
        }
    }, [selectedFilters, page, sort]);

    useEffect(() => {
        const storedUserDetails = JSON.parse(sessionStorage.getItem('userDetails'));
        if (storedUserDetails) {
            setUserRole(storedUserDetails.role);
        }
    }, []);
    

    // Fetch events from API using React Query
    const { data: events, isLoading, isError, error } = useQuery({
        queryKey: ['events', { page, size }],
        queryFn: async ({ queryKey }) => {
            try {
                const [, { page, size }] = queryKey;
                const cachedData = queryClient.getQueryData(['events', { page, size }]);
                if (cachedData) {
                    return cachedData; // Return cached data if available
                }
                const response = await EventService.findAllNotPassedEvents(page, size);
                console.log(response);
                return response;
            } catch (err) {
                if (err?.response?.status === 404) {
                    setNotFound(true);
                }
                if (err.message && err.message.includes('Network Error')) {
                    setConnectionRefused(true);
                }
                throw err;
            }
        },
        retry: (failureCount, error) => {
            // Don't retry on connection refused errors
            if (error.message && error.message.includes('Network Error')) {
                return false;
            }
            return failureCount < 1; // Only retry once for other errors
        },
        staleTime: 300000, // 5 minutes
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });

    // Dynamically fetch images for events
    useEffect(() => {
        if (!isFilterMode && !isLoading && !isError && events) {
            const fetchDefaultEvents = async () => {
                setIsImagesLoading(true);
                try {
                    const eventsWithImages = await Promise.all(
                        events.content.map(async (event) => {
                            const imageUrl = await getFirebaseImage(event.id);
                            return { ...event, imageUrl };
                        })
                    );
                    setDefaultEvents(eventsWithImages);
                    setTotalPages(events.totalPages);
                    setApiError(null);
                } catch (err) {
                    console.error("Error fetching event images:", err);
                    setApiError("Failed to load event images. Please try again later.");
                } finally {
                    setIsImagesLoading(false);
                }
            };
            fetchDefaultEvents();
        }
    }, [events, isLoading, isError, isFilterMode]);
    
    

    // Function to fetch the first image from Firebase Storage
    const getFirebaseImage = async (eventId) => {
        try {
            const storage = getStorage();
            const folderRef = ref(storage, `eventImages/${eventId}/`);
            const folderContents = await listAll(folderRef);

            if (folderContents.items.length > 0) {
                const firstImageRef = folderContents.items[0];
                const url = await getDownloadURL(firstImageRef);
                return url;
            } else {
                return 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500'; // Fallback image
            }
        } catch (err) {
            console.error(`Error fetching image for event ID ${eventId}:`, err);
            return 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500'; // Placeholder for errors
        }
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

    // Filter events by selected tags
    const visibleEvents = isFilterMode
    ? filteredEvents
    : (selectedTags.length > 0
        ? defaultEvents.filter(event =>
            selectedTags.every(tag =>
                (event.tags || []).includes(tag) ||
                (event.carsAllowed || []).includes(tag)
            )
        )
        : defaultEvents);
    const handleCreateEventClick = () => {
        navigate('/create-event');
    };
    

    const handleTagClick = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
        );
    };

    const handlePageChange = (event, value) => {
        const zeroBasedPage = value - 1;
        setPage(zeroBasedPage);
        navigate({ search: `?page=${zeroBasedPage}&size=${size}` });
    };

    const handleEventClick = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    const handleApplyFilters = (filters) => {
        console.log("Final Selected Filters:", filters); // Log final filters
        
        setSelectedFilters(filters); // Update the filters state in EventList
        setIsFilterMode(true);
        setPage(0);
        setShowFilterPanel(true); // Keep panel open ✅
        updateURLParams(0, size, filters);
    };
    
    const updateURLParams = (newPage, newSize, currentFilters = selectedFilters) => {
        const params = new URLSearchParams();
    
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== null && value !== "" && !Array.isArray(value)) {
                params.set(key, value);
            }
            if (Array.isArray(value) && value.length > 0) {
                params.set(key, value.join(",")); // For arrays like tagIds
            }
        });
    
        params.set("page", newPage + 1); // URL is 1-based
        params.set("size", newSize);
        navigate({ search: params.toString() });
    };
    

    const handleClearFilters = () => {
        setSelectedFilters({});
        setFilteredEvents([]);
        setIsFilterMode(false);
        setSelectedTags([]);
        setPage(0);
        setApiError(null);
    };

    // Show error state if API request failed
    if (notFound) {
        return <NotFoundPage />;
    }

    if (connectionRefused) {
        return <ErrorPage 
            title="Connection Error" 
            message="Unable to connect to the server. Please check your internet connection and try again."
        />;
    }

    return (
        <QueryWrapper 
            isLoading={isLoading || isImagesLoading} 
            isError={isError || apiError !== null} 
            error={error || (apiError ? new Error(apiError) : null)}
            notFound={notFound}
        >
            <Box sx={{ padding: '20px', paddingTop: '100px',minHeight: '100vh', backgroundColor: theme.palette.background.paper }}>
                <Box>

                    <Box>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            if (isFilterMode) {
                            handleClearFilters();            // Reset all filters and state
                            setShowFilterPanel(false);
                            } else {
                            setShowFilterPanel((prev) => !prev); // Just toggle panel open/close
                            }
                        }}
                        sx={{ fontWeight: 'bold', mb: 2 }}
                        >
                        {isFilterMode ? 'Clear Filters' : (showFilterPanel ? 'Hide Filters' : 'Show Filters')}
                        </Button>


                    </Box>
                    {showFilterPanel && (
                        <EventFilterPanel
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            onFilter={handleApplyFilters}
                            isFilterPanelOpen={showFilterPanel}
                        />
                    )}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" color="textSecondary">Upcoming Events</Typography>
                                <Box sx={{ display: 'flex', gap: '10px' }}>
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

                            {/* Show message when no events are available */}
                            {visibleEvents.length === 0 && !isLoading && !isImagesLoading && (
                                <EmptyState 
                                    title="No events found matching your criteria."
                                    message="Try adjusting your filters or check back later for new events."
                                />
                            )}

                            {/* Render the filtered events */}
                            <Grid container spacing={3}>
                                {visibleEvents.map((event) => (
                                    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={event.id} sx={{ padding: '15px' }}>
                                        <Card sx={{ borderRadius: '15px', overflow: 'hidden' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                {/* Wrap the image with a click handler */}
                                                <Box
                                                    onClick={() => handleEventClick(event.id)}
                                                    sx={{ width: '100%', height: '300px', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', cursor: 'pointer' }}
                                                >
                                                    <img
                                                        src={event.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500'}
                                                        alt={event.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
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
                                                        <EventIcon fontSize="small" /> {format(new Date(event.date), 'MMMM d, yyyy, h:mm a')}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                        <AccessTime fontSize="small" /> {formatDateRange(event.startTime, event.endTime)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                        <LocationOn fontSize="small" /> {event.location}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                        <CarTag fontSize="small" />
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {(event.allowedCars || []).map((car, index) => (
                                                                <Chip
                                                                    key={index}
                                                                    color="primary"
                                                                    label={car.name || car} 
                                                                    size="small"
                                                                    onClick={() => handleTagClick(car.name || car)}
                                                                    className={selectedTags.includes(car.name || car) ? 'Mui-selected' : 'Mui-unselected'}
                                                                    sx={{
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            opacity: 0.8, 
                                                                        },
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Typography>

                                                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                                                        <Tag fontSize="small" />
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1, mb: 2 }}>
                                                            {(event.tags || []).map((tag, index) => (
                                                                <Chip
                                                                    key={index}
                                                                    label={tag.name  } // Adjust this based on the format of `tags`
                                                                    size="small"
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
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: theme.palette.background.default, padding: '10px', borderRadius: '10px', mt: 2 }}>
                                                        <ConfirmationNumber color="primary" fontSize="small" />
                                                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                                                            Tickets Left: {event.totalTicketsLeft}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: theme.palette.background.default, padding: '10px', borderRadius: '10px', mt: 1 }}>
                                                        <AttachMoney color="primary" fontSize="small" />
                                                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                                                            Price: {event.cheapestTicketPrice}
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

                            {visibleEvents.length > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px', margin:'auto' }}>
                                    <Pagination
                                        count={totalPages} // Total pages from API response
                                        page={page+1} // Material-UI Pagination uses 1-indexed pages
                                        onChange={handlePageChange}
                                        siblingCount={1}         // Number of pages shown on each side of the current page
                                        boundaryCount={1}        // Number of pages always shown at the beginning and end
                                        showFirstButton
                                        showLastButton
                                        color="primary"
                                    />
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </QueryWrapper>
    );
};

export default EventList;
