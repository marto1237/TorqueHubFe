import React, { useState } from 'react';
import {
    Box, Card, Typography, Grid, CardMedia, Divider, Avatar, IconButton, List, ListItem, ListItemText,
    ListItemAvatar, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, LinearProgress
} from '@mui/material';
import { DirectionsCar, Speed, Build, CameraAlt, Add, Edit } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [carData, setCarData] = useState(initialCarData);
    const [isModDialogOpen, setIsModDialogOpen] = useState(false);
    const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
    const [isEditModDialogOpen, setIsEditModDialogOpen] = useState(false); // State for edit dialog
    const [newMod, setNewMod] = useState({ date: '', description: '' });
    const [editedMod, setEditedMod] = useState({ date: '', description: '', index: null }); // For editing
    const [updatedStats, setUpdatedStats] = useState(carData.currentStats);

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
            <Grid container spacing={3}>
                {/* Car Details & Gallery */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ padding: '20px' }}>
                        <Typography variant="h4" color="primary" gutterBottom>
                            {carData.name}
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {/* Car Image Carousel */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Carousel
                                showThumbs={false}
                                selectedItem={0}
                                showArrows={true}
                                infiniteLoop
                                emulateTouch
                                dynamicHeight
                            >
                                {carData.gallery.map((img, index) => (
                                    <Box key={index}>
                                        <CardMedia
                                            component="img"
                                            image={img.image}
                                            alt={`Car image from ${img.year}`}
                                            sx={{ maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                                        />
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                            {img.year} - {img.desc}
                                        </Typography>
                                    </Box>
                                ))}
                            </Carousel>
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
                                <ListItemAvatar>
                                    <Avatar>
                                        <Speed />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="Horsepower" secondary={carData.currentStats.horsepower} />
                            </ListItem>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <Build />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="Drivetrain" secondary={carData.currentStats.drivetrain} />
                            </ListItem>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <DirectionsCar />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="Transmission" secondary={carData.currentStats.transmission} />
                            </ListItem>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <CameraAlt />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="Class" secondary={carData.currentStats.class} />
                            </ListItem>
                        </List>
                    </Card>
                </Grid>

                {/* Modification History */}
                <Grid item xs={12}>
                    <Card sx={{ padding: '20px' }}>
                        <Typography variant="h5" color="primary" gutterBottom>
                            Modifications History
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <List>
                            {carData.modifications.map((mod, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`${mod.date}`} secondary={mod.description} />
                                    <IconButton onClick={() => handleEditModDialogOpen(index)}>
                                        <Edit />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            onClick={handleModDialogOpen}
                        >
                            Add Modification
                        </Button>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog for Adding New Modification */}
            <Dialog open={isModDialogOpen} onClose={handleModDialogClose}>
                <DialogTitle>Add a New Modification</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="filled"
                        autoFocus
                        margin="dense"
                        name="date"
                        label="Date (YYYY-MM-DD)"
                        type="date"
                        fullWidth
                        value={newMod.date}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleModDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddModification} color="primary">
                        Add Modification
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for Editing Modification */}
            <Dialog open={isEditModDialogOpen} onClose={handleEditModDialogClose}>
                <DialogTitle>Edit Modification</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="date"
                        label="Date (YYYY-MM-DD)"
                        type="date"
                        fullWidth
                        value={editedMod.date}
                        onChange={handleEditModInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="description"
                        label="Modification Description"
                        type="text"
                        fullWidth
                        value={editedMod.description}
                        onChange={handleEditModInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditModDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveEditedMod} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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
                        className="MuiTextFieldWhite"
                        value={updatedStats.horsepower}
                        onChange={handleStatsInputChange}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="drivetrain"
                        label="Drivetrain"
                        type="text"
                        fullWidth
                        value={updatedStats.drivetrain}
                        onChange={handleStatsInputChange}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="transmission"
                        label="Transmission"
                        type="text"
                        fullWidth
                        value={updatedStats.transmission}
                        onChange={handleStatsInputChange}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="class"
                        label="Class"
                        type="text"
                        fullWidth
                        value={updatedStats.class}
                        onChange={handleStatsInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStatsDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateStats} color="primary">
                        Update Stats
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyShowcase;
