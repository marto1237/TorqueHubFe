import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, Typography, Grid, CardMedia, IconButton, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
    TextField, ListItemAvatar, Avatar, Divider, Fade,Button
} from '@mui/material';
import { Comment, Visibility, Add, Close, } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getStorage, ref, getDownloadURL,listAll } from "firebase/storage";
import ShowcaseFilterPanel from '../components/common/ShowcaseFilterPanel';
import ShowcaseService from '../components/configuration/Services/ShowcaseService';

const carShowcases = [
    {
        id: 1,
        user: 'Chris Murphy',
        year: '1985',
        make: 'Volkswagen',
        model: 'Cabriolet',
        color: 'Blue',
        packages: 'Karman',
        image: 'https://i.kinja-img.com/image/upload/c_fill,h_675,pg_1,q_80,w_1200/ob8mmpmrcoysw55nhpc1.png',
        modifications: [
            { category: 'Drivetrain', description: 'Cam oil baffle, Upgraded valve cover gasket' },
            { category: 'Interior', description: 'Recaro trophy w/power ba, Custom steering wheel' },
            { category: 'Exterior', description: 'Custom painted Krylon ocean glass blue, Canvas Black Top' },
            { category: 'Audio', description: '5” sony speakers, 10”Rockford 300w sub' },
            { category: 'Suspension', description: 'Airlift 3H management, CK2W double bellow Front Bags' },
            { category: 'Exhaust', description: 'Stainless 4-2-1 Header, Borla Pro exhaust' },
        ],
        history: 'Barn find $500, three years and $12k later…',
        comments: [
            { user: 'John Doe', text: 'Love the custom mods!' },
            { user: 'Jane Smith', text: 'Such a clean build, well done!' }
        ],
        views: 520,
        postDate: 'May 13, 2024'
    },

    {
        id: 2,
        user: 'Chris Murphy',
        year: '1985',
        make: 'Volkswagen',
        model: 'Cabriolet',
        color: 'Blue',
        packages: 'Karman',
        image: 'https://i.kinja-img.com/image/upload/c_fill,h_675,pg_1,q_80,w_1200/ob8mmpmrcoysw55nhpc1.png',
        modifications: [
            { category: 'Drivetrain', description: 'Cam oil baffle, Upgraded valve cover gasket' },
            { category: 'Interior', description: 'Recaro trophy w/power ba, Custom steering wheel' },
            { category: 'Exterior', description: 'Custom painted Krylon ocean glass blue, Canvas Black Top' },
            { category: 'Audio', description: '5” sony speakers, 10”Rockford 300w sub' },
            { category: 'Suspension', description: 'Airlift 3H management, CK2W double bellow Front Bags' },
            { category: 'Exhaust', description: 'Stainless 4-2-1 Header, Borla Pro exhaust' },
        ],
        history: 'Barn find $500, three years and $12k later…',
        comments: [
            { user: 'John Doe', text: 'Love the custom mods!' },
            { user: 'Jane Smith', text: 'Such a clean build, well done!' }
        ],
        views: 520,
        postDate: 'May 13, 2024'
    },

    {
        id: 3,
        user: 'Chris Murphy',
        year: '1985',
        make: 'Volkswagen',
        model: 'Cabriolet',
        color: 'Blue',
        packages: 'Karman',
        image: 'https://i.kinja-img.com/image/upload/c_fill,h_675,pg_1,q_80,w_1200/ob8mmpmrcoysw55nhpc1.png',
        modifications: [
            { category: 'Drivetrain', description: 'Cam oil baffle, Upgraded valve cover gasket' },
            { category: 'Interior', description: 'Recaro trophy w/power ba, Custom steering wheel' },
            { category: 'Exterior', description: 'Custom painted Krylon ocean glass blue, Canvas Black Top' },
            { category: 'Audio', description: '5” sony speakers, 10”Rockford 300w sub' },
            { category: 'Suspension', description: 'Airlift 3H management, CK2W double bellow Front Bags' },
            { category: 'Exhaust', description: 'Stainless 4-2-1 Header, Borla Pro exhaust' },
        ],
        history: 'Barn find $500, three years and $12k later…',
        comments: [
            { user: 'John Doe', text: 'Love the custom mods!' },
            { user: 'Jane Smith', text: 'Such a clean build, well done!' }
        ],
        views: 520,
        postDate: 'May 13, 2024'
    },

    {
        id: 4,
        user: 'Chris Murphy',
        year: '1985',
        make: 'Volkswagen',
        model: 'Cabriolet',
        color: 'Blue',
        packages: 'Karman',
        image: 'https://i.kinja-img.com/image/upload/c_fill,h_675,pg_1,q_80,w_1200/ob8mmpmrcoysw55nhpc1.png',
        modifications: [
            { category: 'Drivetrain', description: 'Cam oil baffle, Upgraded valve cover gasket' },
            { category: 'Interior', description: 'Recaro trophy w/power ba, Custom steering wheel' },
            { category: 'Exterior', description: 'Custom painted Krylon ocean glass blue, Canvas Black Top' },
            { category: 'Audio', description: '5” sony speakers, 10”Rockford 300w sub' },
            { category: 'Suspension', description: 'Airlift 3H management, CK2W double bellow Front Bags' },
            { category: 'Exhaust', description: 'Stainless 4-2-1 Header, Borla Pro exhaust' },
        ],
        history: 'Barn find $500, three years and $12k later…',
        comments: [
            { user: 'John Doe', text: 'Love the custom mods!' },
            { user: 'Jane Smith', text: 'Such a clean build, well done!' }
        ],
        views: 520,
        postDate: 'May 13, 2024'
    }
    // Add more car data here
];

const Showcase = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [showcases, setShowcases] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [hoveredCard, setHoveredCard] = useState(null); // To track hover state
    const [loading, setLoading] = useState(true); // To track loading state
    const [error, setError] = useState(null); // To track errors
    const navigate = useNavigate();

    const handleShowcaseClick = (id) => {
        // Navigate to the car detail page with the car id
        navigate(`/car/${id}`);
    };


    const [isFiltering, setIsFiltering] = useState(false);

    const [filters, setFilters] = useState({
        tags: [],
        noModifications: false,
        sortOption: 'newest',
    });

    const { data: filtershowcases, isLoading } = useQuery({
        queryKey: ['showcases', filters],
        queryFn: () => ShowcaseService.getFilteredShowcases(filters), // Create this service function
        keepPreviousData: true,
    });

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };


    useEffect(() => {
        const fetchShowcases = async () => {
            try {
                const response = await ShowcaseService.getAllShowcases(0, 10); // Fetch data
                const showcasesWithImages = await Promise.all(
                    response.content.map(async (showcase) => {
                        const imageUrl = await getFirebaseImage(showcase.id); // Fetch image for each showcase
                        return { ...showcase, image: imageUrl }; // Add image to showcase object
                    })
                );
                setShowcases(showcasesWithImages);
            } catch (err) {
                console.error('Error fetching showcases:', err);
                setError('Failed to load showcases.');
            } finally {
                setLoading(false);
            }
        };
    
        fetchShowcases();
    }, []);
    


    const getFirebaseImage = async (showcaseId) => {
        try {
            const storage = getStorage();
            const folderRef = ref(storage, `showcaseImages/${showcaseId}/`);
    
            // List all items in the folder
            const folderContents = await listAll(folderRef);
    
            // Ensure there is at least one item
            if (folderContents.items.length > 0) {
                // Get the URL for the first image in the folder
                const firstImageRef = folderContents.items[0];
                const url = await getDownloadURL(firstImageRef);
                return url;
            } else {
                console.warn(`No images found for showcaseId: ${showcaseId}`);
                return 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500'; 
            }
        } catch (err) {
            console.error('Error fetching Firebase image:', err);
            return 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500'; // Placeholder for error
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>

                <Button variant="outlined" onClick={() => setIsFiltering(!isFiltering)} sx={{ fontWeight: 'bold' }}>
                        {isFiltering ? 'Clear Filters' : 'Show Filters'}
                </Button>
            {isFiltering && (
                <ShowcaseFilterPanel
                selectedFilters={filters}
                setSelectedFilters={setFilters}
                onApplyFilters={handleApplyFilters}
                />
            )}
            <Grid container spacing={3}>
                {showcases.map((car) => (
                    <Grid item xs={12} sm={6} md={4} key={car.id}>
                        <Card
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: 3,
                                cursor: 'pointer',
                                '&:hover': { transform: 'scale(1.02)', transition: '0.3s ease-in-out' },
                            }}
                            onClick={() => handleShowcaseClick(car.id)}
                            onMouseEnter={() => setHoveredCard(car.id)} // Set hover state
                            onMouseLeave={() => setHoveredCard(null)}   // Remove hover state
                        >
                            <CardMedia
                                component="img"
                                image={car.image}
                                alt={car.make}
                                sx={{ height: '200px', objectFit: 'cover' }}
                            />
                            <Box sx={{ padding: '15px' }}>
                                <Typography variant="h6" gutterBottom>{car.year} {car.make} {car.model.name}</Typography>
                            </Box>

                            {/* Hover Overlay */}
                            <Fade in={hoveredCard === car.id}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        padding: '10px',
                                        transition: 'transform 0.3s ease-in-out',
                                        transform: hoveredCard === car.id ? 'translateY(0)' : 'translateY(100%)',
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">{car.user}</Typography>
                                        <Typography variant="body2">{car.postDate}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center">
                                            <Visibility sx={{ marginRight: '5px' }} />
                                            <Typography variant="body2">{car.views}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Comment sx={{ marginRight: '5px' }} />
                                            <Typography variant="body2">{car.comments.length}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Fade>
                        </Card>
                    </Grid>
                ))}
            </Grid>

        </Box>
    );
};

export default Showcase;
