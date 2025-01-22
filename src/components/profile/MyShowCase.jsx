import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Card, Typography, Grid, CardMedia, Divider, Avatar, IconButton, List, ListItem, ListItemText,
    ListItemAvatar, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, LinearProgress
} from '@mui/material';
import { DirectionsCar, Speed, Build, CameraAlt, Add, Edit,Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import ShowcaseService from '../configuration/Services/ShowcaseService';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../../firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppNotifications } from '../common/NotificationProvider';


// Main Showcase Component
const MyShowcase = () => {
    const { showcaseId } = useParams();
    const queryClient = useQueryClient();
    const notifications = useAppNotifications();
    const theme = useTheme();
    const navigate = useNavigate();

    const [showcaseData, setShowcaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    const [carData, setCarData] = useState({});
    const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
    const [isEditModDialogOpen, setIsEditModDialogOpen] = useState(false); // State for edit dialog
    const [newMod, setNewMod] = useState({ date: '', description: '' });
    const [editedMod, setEditedMod] = useState({ date: '', description: '', index: null }); // For editing
    const [updatedStats, setUpdatedStats] = useState(carData.currentStats);

    const [carImages, setCarImages] = useState([]);
    const [newImageFile, setNewImageFile] = useState(null);
    const [isAddImageDialogOpen, setIsAddImageDialogOpen] = useState(false);

    const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
    const [isModDialogOpen, setIsModDialogOpen] = useState(false);
  
    const [updatedPerformance, setUpdatedPerformance] = useState({});
    const [modificationToEdit, setModificationToEdit] = useState(null);

    const userDetails = sessionStorage.getItem('userDetails');

    const parsedDetails = JSON.parse(userDetails);
    const userId = parsedDetails.id;

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const { data: cachedShowcaseData, isLoading: queryLoading, error: queryError } = useQuery({
        queryKey: ['showcase', showcaseId],
        queryFn: () => ShowcaseService.getShowcaseByID(showcaseId),
        onSuccess: (data) => {
            setShowcaseData(data);
            setUpdatedPerformance(data.carPerformance);
            fetchImagesFromFirebase();
        },
    });
    
    useEffect(() => {
        const fetchShowcaseData = async () => {
            try {
                const data = await ShowcaseService.getShowcaseByID(showcaseId);
                console.log(data)
                setShowcaseData(data);
                setUpdatedPerformance(data.carPerformance);

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

    const handleUpdatePerformance = async () => {
        try {
          await ShowcaseService.updateShowcase(showcaseId, {
            id: showcaseId, // Hidden ID passed to API
            userId: userId,
            title: showcaseData.title,
            description: showcaseData.description,
            brandId: showcaseData.brand.id,
            modelId: showcaseData.model.id,
            categoryId: showcaseData.category.id,
            countryId: showcaseData.country.id,
            ...updatedPerformance,
          });
      
          // Update local state
          setShowcaseData((prev) => ({
            ...prev,
            carPerformance: updatedPerformance,
          }));
          queryClient.setQueryData(['showcase', showcaseId], (oldData) => ({
            ...oldData,
            carPerformance: { ...updatedPerformance },
        }));
          setIsPerformanceDialogOpen(false);
          notifications.show('Performance updated successfully', { autoHideDuration: 3000, severity: 'success' });
        } catch (err) {
            notifications.show('Error updating performance', { autoHideDuration: 3000, severity: 'error' });
        }
      };
      // Add or update a modification
      const handleAddOrUpdateModification = async () => {
        try {
          if (modificationToEdit.id) {
            // Update existing modification
            await ShowcaseService.updateModification(modificationToEdit.id, modificationToEdit);
            setShowcaseData((prev) => ({
              ...prev,
              modifications: {
                ...prev.modifications,
                content: prev.modifications.content.map((mod) =>
                  mod.id === modificationToEdit.id ? modificationToEdit : mod
                ),
              },
            }));
          } else {
            // Add new modification
            const newMod = await ShowcaseService.addModification({
              ...modificationToEdit,
              showcaseId,
            });
            setShowcaseData((prev) => ({
              ...prev,
              modifications: {
                ...prev.modifications,
                content: [...prev.modifications.content, newMod],
              },
            }));
          }
          setIsModDialogOpen(false);
        } catch (err) {
          console.error('Error saving modification:', err);
        }
      };
    
      // Delete a modification
      const handleDeleteModification = async (modId) => {
        try {
          await ShowcaseService.deleteModification(modId);
          setShowcaseData((prev) => ({
            ...prev,
            modifications: {
              ...prev.modifications,
              content: prev.modifications.content.filter((mod) => mod.id !== modId),
            },
          }));
          queryClient.invalidateQueries(['showcase', showcaseId]);
        } catch (err) {
          console.error('Error deleting modification:', err);
        }
      };
    // Fetch images from Firebase
    const fetchImagesFromFirebase = async () => {
        try {
            const imageRef = ref(storage, `showcaseImages/${showcaseId}/`);
            const imageList = await listAll(imageRef);
    
            // Fetch all image URLs
            const imageUrls = await Promise.all(
                imageList.items.map((item) => getDownloadURL(item))
            );
            setCarImages(imageUrls); // Update state with image URLs
        } catch (error) {
            console.error('Error fetching images from Firebase:', error);
            notifications.show('Error fetching images', { autoHideDuration: 3000, severity: 'error' });
        }
    };
    
    // Add an effect to re-fetch images after a successful upload
    useEffect(() => {
        fetchImagesFromFirebase();
    }, [showcaseId]);


    const handleImageUpload = async (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (!file) {
            notifications.show('No file selected', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }
    
        const storageRef = ref(storage, `showcaseImages/${showcaseId}/${file.name}`); // Firebase storage reference
    
        try {
            // Upload the file to Firebase
            await uploadBytes(storageRef, file);
            const newImageUrl = await getDownloadURL(storageRef);
    
            // Update the image list
            setCarImages((prevImages) => [...prevImages, newImageUrl]);
            notifications.show('Image uploaded successfully', { autoHideDuration: 3000, severity: 'success' });
        } catch (err) {
            notifications.show('Error uploading image', { autoHideDuration: 3000, severity: 'error' });
            console.error('Upload Error:', err);
        }
    };
    

    // Open/close dialog for adding modification
    const handleModDialogOpen = (mod = null) => {
        setModificationToEdit(
            mod
                ? {
                      id: mod.id,
                      date: mod.modifiedAt ? new Date(mod.modifiedAt).toISOString().split('T')[0] : '', // Convert to YYYY-MM-DD
                      description: mod.description,
                  }
                : { date: '', description: '' } // Default values for adding a new modification
        );
        setIsModDialogOpen(true);
    };    
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


    // Save the modification (add or update)
    const handleSaveModification = async () => {
        try {
            const currentDate = new Date(); // Get the current date and time
            const formattedDate = modificationToEdit.date
                ? `${modificationToEdit.date}T${currentDate.toTimeString().split(' ')[0]}` // Append current time to the provided date
                : currentDate.toISOString(); // Use current date and time if no date provided
    
            const payload = {
                userId: userId, // Ensure this matches the server expectations
                description: modificationToEdit.description,
                modifiedAt: formattedDate, // Use the formatted date
            };
    
            if (modificationToEdit.id) {
                // Update existing modification
                await ShowcaseService.updateModification(modificationToEdit.id, payload);
                setShowcaseData((prev) => ({
                    ...prev,
                    modifications: {
                        ...prev.modifications,
                        content: prev.modifications.content.map((mod) =>
                            mod.id === modificationToEdit.id ? { ...mod, ...payload } : mod
                        ),
                    },
                }));
            } else {
                // Add new modification
                const newMod = await ShowcaseService.addModification({
                    ...payload,
                    showcaseId,
                });
                setShowcaseData((prev) => ({
                    ...prev,
                    modifications: {
                        ...prev.modifications,
                        content: [...prev.modifications.content, newMod],
                    },
                }));
            }
            queryClient.invalidateQueries(['showcase', showcaseId]);
            handleModDialogClose();
        } catch (err) {
            notifications.show('Error saving modification', { autoHideDuration: 3000, severity: 'error' });
            console.error('Error saving modification:', err.response || err.message || err);
        }
    };

    const handleDeleteShowcase = async () => {
        try {
            await ShowcaseService.deleteShowcase(showcaseId);
            notifications.show('Showcase deleted successfully', { autoHideDuration: 3000, severity: 'success' });
            queryClient.invalidateQueries(['showcase']); // Invalidate cache to refresh data
            navigate(`/usershowcase/${userId}`);
        } catch (err) {
            console.error('Error deleting showcase:', err);
            notifications.show('Error deleting showcase', { autoHideDuration: 3000, severity: 'error' });
        }
    };

    const openDeleteDialog = () => setIsDeleteDialogOpen(true);
    const closeDeleteDialog = () => setIsDeleteDialogOpen(false);
    
    
    

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
                                {showcaseData.title}
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
                                {showcaseData?.modifications?.content.map((mod) => (
                                    <ListItem key={mod.id} secondaryAction={
                                        <>
                                            <IconButton onClick={() => handleModDialogOpen(mod)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteModification(mod.id)}>
                                                🗑️
                                            </IconButton>
                                        </>
                                    }>
                                        <ListItemText
                                            primary={new Date(mod.modifiedAt).toLocaleDateString()}
                                            secondary={mod.description}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </Grid>
                </Grid>
                
            )}
            <Grid item xs={12}>
                <Card sx={{ padding: '20px' }}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Delete />}
                            onClick={openDeleteDialog}
                        >
                            Delete Showcase
                        </Button>
                    <Divider sx={{ mb: 3 }} />
                    
                </Card>
            </Grid>

            {/* Dialog for Editing Performance Stats */}
            <Dialog open={isStatsDialogOpen} onClose={handleStatsDialogClose}>
                <DialogTitle>Edit Performance Stats</DialogTitle>
                <DialogContent>
                    {/* No visible input for ID */}
                    {Object.entries(updatedPerformance).map(([key, value]) =>
                        key !== 'id' ? ( // Exclude `id` from visible fields
                            <TextField
                                key={key}
                                label={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize field name
                                variant="filled"
                                fullWidth
                                margin="dense"
                                value={value}
                                onChange={(e) =>
                                    setUpdatedPerformance((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                    }))
                                }
                            />
                        ) : null // Do not render `id`
                    )}
                </DialogContent>
                        <DialogActions>
                            <Button onClick={handleStatsDialogClose} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleUpdatePerformance} color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>

            {/* Dialog for Adding New Modification */}
            <Dialog open={isModDialogOpen} onClose={handleModDialogClose}>
                <DialogTitle>{modificationToEdit?.id ? 'Edit Modification' : 'Add Modification'}</DialogTitle>
                <DialogContent>
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="date"
                        label="Date"
                        type="date"
                        fullWidth
                        value={modificationToEdit?.date || ''} // Pre-fill with the selected modification's date
                        onChange={(e) =>
                            setModificationToEdit((prev) => ({
                                ...prev,
                                date: e.target.value,
                            }))
                        }
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        variant="filled"
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        value={modificationToEdit?.description || ''} // Pre-fill with the selected modification's description
                        onChange={(e) =>
                            setModificationToEdit((prev) => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                    />
                </DialogContent>
        <DialogActions>
                <Button onClick={handleModDialogClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSaveModification} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>


        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this showcase? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            closeDeleteDialog();
                            handleDeleteShowcase();
                        }}
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            
        </Box>
    );
};

export default MyShowcase;
