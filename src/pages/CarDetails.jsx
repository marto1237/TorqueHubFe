import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Divider, Card, CardContent, TextField, Button, IconButton, Tooltip, Grid } from '@mui/material';
import { FormatBold, FormatItalic, FormatUnderlined, FormatStrikethrough, Settings } from '@mui/icons-material';
import { useTheme } from '@mui/material';

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
            { user: { username: 'John Doe', profileLink: '/profile/john-doe' }, text: 'Love the custom mods!' },
            { user: { username: 'Jane Smith', profileLink: '/profile/jane-smith' }, text: 'Such a clean build, well done!' }
        ],
        views: 520,
        postDate: 'May 13, 2024'
    }
    // Add more cars as needed
];

const CarDetails = () => {
    const theme = useTheme();
    const { id } = useParams();
    const car = carShowcases.find(car => car.id === parseInt(id));

    // State to manage comments and editor content
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState(car.comments);
    const [isPreview, setIsPreview] = useState(false);
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);

    if (!car) {
        return <Typography variant="h6">Car not found</Typography>;
    }

    // Function to handle comment submission
    const handleCommentSubmit = () => {
        if (comment.trim()) {
            const updatedComments = [...comments, { user: { username: 'New User', profileLink: '/profile/new-user' }, text: comment }];
            setComments(updatedComments);
            setComment('');  // Clear the comment input
        }
    };

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

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
            <Typography variant="h4" color="primary" gutterBottom>{car.year} {car.make} {car.model}</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <img src={car.image} alt={car.make} style={{ width: '100%', maxWidth: '800px', height: 'auto', borderRadius: '8px', boxShadow: theme.shadows[3] }} />
            </Box>

            {/* General Information Section */}
            <Card sx={{ my: 4, boxShadow: theme.shadows[3] }}>
                <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom>General Information</Typography>
                    <List>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="Owner"
                                secondary={<Link to={car.user.profileLink} style={{ color: theme.palette.primary.main }}>{car.user.username}</Link>}
                                primaryTypographyProps={{ color: 'primary', sx: { fontWeight: 'bold' } }}
                                secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                            />
                        </ListItem>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="Color"
                                secondary={car.color}
                                primaryTypographyProps={{ color: 'primary', sx: { fontWeight: 'bold' } }}
                                secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                            />
                        </ListItem>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="Packages"
                                secondary={car.packages}
                                primaryTypographyProps={{ color: 'primary', sx: { fontWeight: 'bold' } }}
                                secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                            />
                        </ListItem>
                        <ListItem sx={{ marginBottom: 2 }}>
                            <ListItemText
                                primary="History"
                                secondary={car.history}
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
                        {car.modifications.map((mod, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Card sx={{ backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>{mod.category}</Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>{mod.description}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* Comments Section */}
            <Card sx={{ my: 4, boxShadow: theme.shadows[3] }}>
                <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom>Comments</Typography>
                    <List>
                        {comments.map((comment, index) => (
                            <ListItem key={index} sx={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <Box>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: formatCommentForPreview(comment.text) }} />
                                        }
                                        secondary={
                                            <Link to={comment.user.profileLink} style={{ color: theme.palette.primary.main }}>
                                                {comment.user.username}
                                            </Link>
                                        }
                                        secondaryTypographyProps={{ sx: { color: theme.palette.text.secondary, mt: 1 } }}
                                    />
                                </Box>
                            </ListItem>

                        ))}
                    </List>

                    {/* Divider */}
                    <Divider sx={{ my: 2 }} />

                    {/* Comment Input */}
                    <Typography variant="h5" sx={{ padding: '20px'}}>Your Answer</Typography>
                    <Box>
                        <TextField
                            variant="filled"
                            fullWidth
                            multiline
                            minRows={4}
                            value={comment}
                            placeholder="Add a comment..."
                            onSelect={handleTextSelect}
                            onChange={(e) => setComment(e.target.value)}
                            sx={{
                                borderRadius: '8px',
                                mb: 2
                            }}
                        />

                        {/* Toolbar for Formatting */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', padding: '10px', mb: 2 }}>
                            <Box sx={{ display: 'flex' }}>
                                <Tooltip title="Bold">
                                    <IconButton onClick={() => applyFormatting('b')}>
                                        <FormatBold  />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Italic">
                                    <IconButton onClick={() => applyFormatting('i')}>
                                        <FormatItalic  />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Underline">
                                    <IconButton onClick={() => applyFormatting('u')}>
                                        <FormatUnderlined  />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Strikethrough">
                                    <IconButton onClick={() => applyFormatting('s')}>
                                        <FormatStrikethrough  />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Box>
                                <Tooltip title="Preview">
                                    <IconButton onClick={handlePreview}>
                                        <Settings  />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Preview */}
                        {isPreview && (
                            <Box sx={{ padding: '20px', backgroundColor: '#333', borderRadius: '8px', boxShadow: 3, mt: 2 }}>
                                <Typography
                                    variant="body1"
                                    sx={{ color: '#fff' }}
                                    dangerouslySetInnerHTML={{ __html: formatCommentForPreview(comment) }}
                                />
                            </Box>
                        )}

                        {/* Submit Comment */}
                        <Button variant="contained" color="primary" onClick={handleCommentSubmit}>
                            Submit Comment
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CarDetails;
