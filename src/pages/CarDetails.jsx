import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Divider, Card, CardContent, TextField, Button, IconButton, Tooltip, Grid, CardMedia } from '@mui/material';
import { FormatBold, FormatItalic, FormatUnderlined, FormatStrikethrough, Settings } from '@mui/icons-material';
import { Bookmark, CheckCircle, KeyboardArrowUp, KeyboardArrowDown, Done } from '@mui/icons-material';
import ShowcaseService from '../components/configuration/Services/ShowcaseService';
import { useQuery } from '@tanstack/react-query';
import { getStorage, ref,listAll, getDownloadURL } from "firebase/storage";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useTheme } from '@mui/material';
import PostForm  from "../components/forum/PostForm";

const carShowcases = [
    {
        id: 1,
        user: { username: 'Chris Murphy', profileLink: '/profile/chris-murphy' },
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
            { user: { username: 'John Doe', profileLink: '/profile/john-doe' }, text: 'Love the custom mods!', votes:0 },
            { user: { username: 'Jane Smith', profileLink: '/profile/jane-smith' }, text: 'Such a clean build, well done!', votes: 0 }
        ],
        views: 520,
        postDate: 'May 13, 2024'
    }
    // Add more cars as needed
];

const CarDetails = () => {
    const theme = useTheme();
    const { id } = useParams();

    // State to manage comments and editor content
    const [comment, setComment] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [carImages, setCarImages] = useState([]);

     // Fetch showcase data using ShowcaseService and React Query
     const { data: showcase, isLoading, isError } = useQuery({
        queryKey: ['showcase', id],
        queryFn: async() => {
            const response = await ShowcaseService.getShowcaseByID(id);
            console.log("Fetched car details:", response)
            return response;
        },
    });

    // Comments state (initialized empty, updated after fetching data)
    const [comments, setComments] = useState([]);

    // Update comments when showcase data is loaded
    useEffect(() => {
        if (showcase && showcase.comments?.content) {
            setComments(showcase.comments.content);
        }
    }, [showcase]);


    const [showcaseImageUrl, setShowcaseImageUrl] = useState('');

    useEffect(() => {
        const fetchShowcaseImage = async () => {
            try {
                const storage = getStorage();
                const folderRef = ref(storage, `showcaseImages/${id}/`); // Adjust path as per your storage setup
                const folderContents = await listAll(folderRef);

                if (folderContents.items.length > 0) {
                    const imageUrls = await Promise.all(
                        folderContents.items.map(item => getDownloadURL(item))
                    );
                    console.log("Fetched Image URLs: ", imageUrls); // Log the fetched URLs
                    setCarImages(imageUrls);
                } else {
                    console.warn(`No images found for showcase ID ${id}`);
                    setCarImages([]); // Fallback to empty array
                }
            } catch (error) {
                console.error('Error fetching showcase image:', error);
                setShowcaseImageUrl(''); // Fallback to default or placeholder image
            }
        };

        fetchShowcaseImage();
    }, [id]);


    // Handle new comment submission
    const handleCommentSubmit = (newCommentText) => {
        const newComment = {
            user: { username: 'New User' }, // Placeholder user
            text: newCommentText,
            votes: 0,
        };
        setComments([...comments, newComment]); // Add the new comment to the list
    };

    if (isLoading) return <Typography>Loading...</Typography>;
    if (isError) return <Typography>Error loading showcase data.</Typography>;
    if (!showcase) return <Typography>No data found.</Typography>;

    // Apply formatting to the selected text
    const applyFormatting = (tag) => {
        if (selectionStart !== selectionEnd) {
            const before = comment.slice(0, selectionStart);
            const selectedText = comment.slice(selectionStart, selectionEnd);
            const after = comment.slice(selectionEnd);
            setComment(`${before}[${tag}]${selectedText}[/${tag}]${after}`);
        }
    };

    // Handle text selection
    const handleTextSelect = (e) => {
        setSelectionStart(e.target.selectionStart);
        setSelectionEnd(e.target.selectionEnd);
    };

    // Toggle between Preview and Edit mode
    const handlePreview = () => {
        setIsPreview(!isPreview);
    };

    // Convert custom tags to HTML for preview
    const formatCommentForPreview = (text) => {
        return text
            .replace(/\[b\](.*?)\[\/b\]/g, '<b>$1</b>')
            .replace(/\[i\](.*?)\[\/i\]/g, '<i>$1</i>')
            .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
            .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>')
            .replace(/\[url\](.*?)\[\/url\]/g, '<a href="$1">$1</a>')
            .replace(/\[emoji\](.*?)\[\/emoji\]/g, '😃'); // Example emoji replacement
    };


    // Function to handle comment voting
    const handleCommentVote = (commentIndex, type) => {
        const updatedComments = comments.map((comment, index) => {
            if (index === commentIndex) {
                // Clone the comment object and update its votes
                return {
                    ...comment,
                    votes: comment.votes + (type === 'up' ? 1 : -1)
                };
            }
            return comment; // Return unchanged comment if not the one being voted on
        });

        setComments(updatedComments);  // Update the state with the new comments array
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
            <Typography variant="h4" color="primary" gutterBottom>{showcase.year} {showcase.make} {showcase.model?.name || 'Unknown Model'}</Typography>
            <Card sx={{ my: 4, boxShadow: theme.shadows[3] }}>
            
        </Card>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <Carousel showThumbs={false} showArrows infiniteLoop emulateTouch>
                            {carImages && carImages.length > 0 ? (
                                carImages.map((img, index) => (
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
            </Box>
            <Card sx={{ my: 4, boxShadow: theme.shadows[3] }}>
                <CardContent >
                    <Typography variant="h5" color="primary" gutterBottom>Car Details</Typography>
                    <Typography variant="body1">
                        Brand: {showcase.brand?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="body1">
                        Model: {showcase.model?.name || 'Unknown'} ({showcase.model?.manufacturingYear || 'Year Unknown'})
                    </Typography>
                </CardContent>
            </Card>

            {/* General Information Section */}
            <Card sx={{ my: 4, boxShadow: theme.shadows[3] }}>
                <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom>General Information</Typography>
                    <List>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="Owner"
                                secondary={<Link to={`/profile/${showcase.userId || 'unknown'}`} style={{ color: theme.palette.primary.main }}>{showcase.user?.username || 'Unknown'}</Link>}
                                primaryTypographyProps={{ color: 'primary', sx: { fontWeight: 'bold' } }}
                                secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                            />
                        </ListItem>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="Color"
                                secondary={showcase.color}
                                primaryTypographyProps={{ color: 'primary', sx: { fontWeight: 'bold' } }}
                                secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                            />
                        </ListItem>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="Packages"
                                secondary={showcase.packages}
                                primaryTypographyProps={{ color: 'primary', sx: { fontWeight: 'bold' } }}
                                secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                            />
                        </ListItem>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="History"
                                secondary={showcase.history}
                                primaryTypographyProps={{ color: 'primary', sx: { fontWeight: 'bold' } }}
                                secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* Modifications Section */}
            <Card sx={{ my: 4, boxShadow: theme.shadows[3] }}>
                <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom>Modifications</Typography>
                    <Grid container spacing={2}>
                    {Array.isArray(showcase.modifications) && showcase.modifications.length > 0 ? (
                            showcase.modifications.map((mod, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Card sx={{ backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                                                {mod.category || 'Unknown Category'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                                                {mod.description || 'No description provided'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                No modifications available for this showcase.
                            </Typography>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* Comments Section */}
            <Card sx={{ my: 4, boxShadow: theme.shadows[3] }}>
                <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom>Comments</Typography>

                    {/* Comments List */}
                    {comments.map((comment, index) => (
                        <Box key={index} sx={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '3px solid #ccc', marginBottom: 2 }}>
                            <Grid container>
                                <Grid item xs={9}>
                                    <Typography
                                        variant="body1"
                                        dangerouslySetInnerHTML={{ __html: formatCommentForPreview(comment.text) }}
                                        sx={{
                                            wordWrap: 'break-word',   // Breaks long words
                                            overflowWrap: 'anywhere', // Allows breaking words anywhere
                                            whiteSpace: 'pre-wrap',   // Preserves newlines and spaces while allowing wrapping
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={3} sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Commented by{' '}
                                        <Link to={`/profile/${comment.user?.userId || 'unknown'}`} style={{ color: theme.palette.primary.main }}>
                                            {comment.user?.username || 'Anonymous'}
                                        </Link>
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Comment Votes */}
                            <Box sx={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <IconButton onClick={() => handleCommentVote(index, 'up')}>
                                    <KeyboardArrowUp />
                                </IconButton>
                                <Typography>{comment.votes}</Typography>
                                <IconButton onClick={() => handleCommentVote(index, 'down')}>
                                    <KeyboardArrowDown />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}

                    {/* Divider */}
                    <Divider sx={{ my: 2 }} />

                    {/* Comment Input */}
                    <Typography variant="h5" sx={{ padding: '20px'}}>Your Comment</Typography>
                    <Box>

                        <PostForm  placeholder="Write your comment here..."
                                   buttonText="Submit comment"
                                   onSubmit={handleCommentSubmit}/>

                    </Box>
                </CardContent>


            </Card>
        </Box>
    );
};

export default CarDetails;
