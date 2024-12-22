import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Card, Typography, Grid, CardMedia, Divider, Avatar, IconButton, List, ListItem, ListItemText,
    ListItemAvatar, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, LinearProgress
} from '@mui/material';
import { DirectionsCar, Speed, Build, CameraAlt, Add, Edit } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import ShowcaseService from '../configuration/Services/ShowcaseService';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../../firebase';

// Simulated Car Data
const initialCarData = {
    name: 'Toyota Supra MK4',
    currentStats: {
        horsepower: '500 HP',
        drivetrain: 'RWD',
        transmission: '6-Speed Manual',
        engine: '3.0L Inline 6 Twin-Turbo 2JZ-GTE',
        class: 'Sports',
    },
    gallery: [
        { year: 2020, image: 'https://images.collectingcars.com/019648/Toyota-Supra-34.jpg?w=1263&fit=fillmax&crop=edges&auto=format,compress&cs=srgb&q=85', desc: 'Stock appearance' },
        { year: 2022, image: 'https://i.redd.it/obmat9yo4mi81.jpg', desc: 'Custom paint job & wheels' },
        { year: 2024, image: 'https://s3.amazonaws.com/rparts-sites/3c6bf818a2c9a12c8c6d6483752dc1f9/images/custom/2014/06/57-2.jpg', desc: 'Bigger turbo & new exhaust' },
    ],
    modifications: [
        { date: '2021-07-10', description: 'Installed aftermarket turbo' },
        { date: '2022-05-14', description: 'Full paint job: Gloss Black' },
        { date: '2023-09-22', description: 'Upgraded suspension & exhaust system' },
    ],
};

// Main Showcase Component
const MyShowcase = () => {
    const { showcaseId } = useParams();
    const [showcaseData, setShowcaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [carData, setCarData] = useState(initialCarData);
    const [isModDialogOpen, setIsModDialogOpen] = useState(false);
    const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
    const [isEditModDialogOpen, setIsEditModDialogOpen] = useState(false); // State for edit dialog
    const [newMod, setNewMod] = useState({ date: '', description: '' });
    const [editedMod, setEditedMod] = useState({ date: '', description: '', index: null }); // For editing
    const [updatedStats, setUpdatedStats] = useState(carData.currentStats);

    const [carImages, setCarImages] = useState([]);
    const [newImageFile, setNewImageFile] = useState(null);
    const [isAddImageDialogOpen, setIsAddImageDialogOpen] = useState(false);

    useEffect(() => {
        const fetchShowcaseData = async () => {
            try {
                const data = await ShowcaseService.getShowcaseByID(showcaseId);
                console.log(data)
                setShowcaseData(data);

                // Fetch images from Firebase storage
                const imageRef = ref(storage, `showcaseImages/${showcaseId}/`);
                const imageList = await listAll(imageRef);
                const imageUrls = await Promise.all(imageList.items.map(item => getDownloadURL(item)));
                setCarImages(imageUrls);
            } catch (err) {
                setError(err.message || "Error fetching showcase data");
            } finally {
                setLoading(false);
            }
        };
        fetchShowcaseData();
    }, [showcaseId]);

    // Fetch images from Firebase
    const fetchImagesFromFirebase = async () => {
        const imageRef = ref(storage, `showcaseImages/${showcaseId}/`);
        const imageList = await listAll(imageRef);
        const urls = await Promise.all(
            imageList.items.map((item) => getDownloadURL(item))
        );
        return urls;
    };


    const handleImageUpload = async () => {
        if (!newImageFile) return;
        const storageRef = ref(storage, `showcaseImages/${showcaseId}/${newImageFile.name}`);
        await uploadBytes(storageRef, newImageFile);
        const newImageUrl = await getDownloadURL(storageRef);
        setCarImages((prevImages) => [...prevImages, newImageUrl]);
        setIsAddImageDialogOpen(false);
    };
    

    // Open/close dialog for adding modification
    const handleModDialogOpen = () => setIsModDialogOpen(true);
    const handleModDialogClose = () => setIsModDialogOpen(false);

    // Handle new modification submission
    const handleAddModification = () => {
        setCarData((prevData) => ({
            ...prevData,
            modifications: [...prevData.modifications, newMod],
        }));
        setIsModDialogOpen(false);
        setNewMod({ date: '', description: '' });
    };

    // Open/close dialog for editing performance stats
    const handleStatsDialogOpen = () => setIsStatsDialogOpen(true);
    const handleStatsDialogClose = () => setIsStatsDialogOpen(false);

    // Handle input change for modification or stats
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMod({ ...newMod, [name]: value });
    };

    // Handle stats input change
    const handleStatsInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedStats((prevStats) => ({
            ...prevStats,
            [name]: value,
        }));
    };

    // Update car performance stats
    const handleUpdateStats = () => {
        setCarData((prevData) => ({
            ...prevData,
            currentStats: updatedStats,
        }));
        setIsStatsDialogOpen(false);
    };

    // Open the dialog to edit an existing modification
    const handleEditModDialogOpen = (index) => {
        setEditedMod({ ...carData.modifications[index], index }); // Set the selected modification to edit
        setIsEditModDialogOpen(true);
    };

    // Close the edit dialog
    const handleEditModDialogClose = () => {
        setIsEditModDialogOpen(false);
        setEditedMod({ date: '', description: '', index: null });
    };

    // Handle edit input change
    const handleEditModInputChange = (e) => {
        const { name, value } = e.target;
        setEditedMod({ ...editedMod, [name]: value });
    };

    // Save the edited modification
    const handleSaveEditedMod = () => {
        const updatedModifications = [...carData.modifications];
        updatedModifications[editedMod.index] = {
            date: editedMod.date,
            description: editedMod.description,
        };
        setCarData((prevData) => ({
            ...prevData,
            modifications: updatedModifications,
        }));
        handleEditModDialogClose();
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper, minHeight: '100vh' }}>
            {loading ? (
                <Typography>Loading...</Typography>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Grid container spacing={3}>
                    {/* Car Details & Gallery */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ padding: '20px' }}>
                            <Typography variant="h4" color="primary" gutterBottom>
                                {showcaseData?.title}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Carousel showThumbs={false} showArrows infiniteLoop emulateTouch>
                                    {carImages.map((img, index) => (
                                        <Box key={index}>
                                            <CardMedia
                                                component="img"
                                                image={img}
                                                alt={`Car Image ${index + 1}`}
                                                sx={{ maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                                            />
                                        </Box>
                                    ))}
                                </Carousel>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="label"
                                    sx={{ mt: 2 }}
                                >
                                    Add New Image
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleImageUpload}
                                    />
                                </Button>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Performance Stats */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ padding: '20px' }}>
                            <Typography variant="h5" color="primary" gutterBottom>
                                Performance Stats
                                <IconButton onClick={handleStatsDialogOpen}>
                                    <Edit />
                                </IconButton>
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <List>
                                <ListItem>
                                    <ListItemText primary="Horsepower" secondary={`${showcaseData?.carPerformance?.horsepower || 'N/A'} HP`} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Drivetrain" secondary={showcaseData?.carPerformance?.drivetrain || 'N/A'} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Transmission" secondary={showcaseData?.carPerformance?.transmission || 'N/A'} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Top Speed" secondary={`${showcaseData?.carPerformance?.topSpeed || 'N/A'} km/h`} />
                                </ListItem>
                            </List>
                        </Card>
                    </Grid>

                    {/* Modifications */}
                    <Grid item xs={12}>
                        <Card sx={{ padding: '20px' }}>
                            <Typography variant="h5" color="primary" gutterBottom>
                                Modifications History
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add />}
                                    onClick={handleModDialogOpen}
                                    sx={{ float: 'right' }}
                                >
                                    Add
                                </Button>
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <List>
                                {showcaseData?.modifications?.content.map((mod, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={new Date(mod.modifiedAt).toLocaleDateString()}
                                            secondary={mod.description}
                                        />
                                        <IconButton onClick={() => handleEditModDialogOpen(index)}>
                                        <Edit />
                                    </IconButton>

                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Dialog for Editing Performance Stats */}
            <Dialog open={isStatsDialogOpen} onClose={handleStatsDialogClose}>
                <DialogTitle>Edit Performance Stats</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="horsepower"
                        label="Horsepower"
                        type="text"
                        fullWidth
                        value={updatedStats?.horsepower || ''}
                        onChange={handleStatsInputChange}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="drivetrain"
                        label="Drivetrain"
                        type="text"
                        fullWidth
                        value={updatedStats?.drivetrain || ''}
                        onChange={handleStatsInputChange}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="transmission"
                        label="Transmission"
                        type="text"
                        fullWidth
                        value={updatedStats?.transmission || ''}
                        onChange={handleStatsInputChange}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="topSpeed"
                        label="Top Speed"
                        type="text"
                        fullWidth
                        value={updatedStats?.topSpeed || ''}
                        onChange={handleStatsInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStatsDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateStats} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for Adding New Modification */}
            <Dialog open={isModDialogOpen} onClose={handleModDialogClose}>
                <DialogTitle>Add a New Modification</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="date"
                        label="Date (YYYY-MM-DD)"
                        type="date"
                        fullWidth
                        value={newMod.date}
                        onChange={(e) => setNewMod({ ...newMod, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="description"
                        label="Modification Description"
                        type="text"
                        fullWidth
                        value={newMod.description}
                        onChange={(e) => setNewMod({ ...newMod, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleModDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddModification} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyShowcase;
