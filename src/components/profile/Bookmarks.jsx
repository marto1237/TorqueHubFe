import React, { useState } from 'react';
import { Box, Typography, Card, Grid, Button, Divider, IconButton } from '@mui/material';
import { Delete, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";

// Example data: list of saved questions/answers
const initialSavedItems = [
    {
        id: 1,
        question: "How to change oil in Audi A4?",
        answer: "You need a 5W-30 synthetic oil for the Audi A4. Drain the old oil, replace the oil filter, and pour in the new oil.",
        category: "Maintenance",
        dateSaved: "August 1, 2024",
        saved: true
    },
    {
        id: 2,
        question: "What is the recommended tire pressure for Audi Q5?",
        answer: "For an Audi Q5, the recommended tire pressure is typically 36 PSI for front and 38 PSI for rear tires.",
        category: "Tires",
        dateSaved: "August 5, 2024",
        saved: true
    },
];

const FollowingPage = () => {
    const theme = useTheme();
    const [savedItems, setSavedItems] = useState(initialSavedItems);

    // Toggle save/unsave a question or answer
    const toggleSaveItem = (id) => {
        setSavedItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, saved: !item.saved } : item
            )
        );
    };

    // Remove item from saved list
    const removeItem = (id) => {
        setSavedItems((prevItems) => prevItems.filter(item => item.id !== id));
    };

    return (
        <Box sx={{ padding: { xs: '20px', md: '50px' }, backgroundColor: theme.palette.background.paper, minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.primary }}>
                Following
            </Typography>

            <Grid container spacing={3}>
                {savedItems.length === 0 ? (
                    <Grid item xs={12}>
                        <Card sx={{ padding: '20px' }}>
                            <Typography>You haven't saved any questions or answers yet.</Typography>
                        </Card>
                    </Grid>
                ) : (
                    savedItems.map((item) => (
                        <Grid item xs={12} md={6} key={item.id}>
                            <Card sx={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                {/* Question and Answer Section */}
                                <Box>
                                    <Typography variant="h6">{item.question}</Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography sx={{ mb: 2 }}>{item.answer}</Typography>
                                    <Typography variant="body2" color="text.secondary">Category: {item.category}</Typography>
                                    <Typography variant="body2" color="text.secondary">Saved on: {item.dateSaved}</Typography>
                                </Box>

                                {/* Save/Unsave and Delete Buttons */}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <IconButton
                                        onClick={() => toggleSaveItem(item.id)}
                                        color="primary"
                                    >
                                        {item.saved ? <Bookmark /> : <BookmarkBorder />}
                                    </IconButton>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<Delete />}
                                        onClick={() => removeItem(item.id)}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default FollowingPage;
