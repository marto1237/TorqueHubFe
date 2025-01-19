import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ModelService from '../configuration/Services/ModelService';
import { useAppNotifications } from '../common/NotificationProvider';

const ManageModelsPage = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const [selectedModel, setSelectedModel] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [newModel, setNewModel] = useState({ name: '', brandId: '', manufacturingYear: '' });
    const [errors, setErrors] = useState({});

    const size = 10;

    const { data: modelsData = {}, isLoading } = useQuery({
        queryKey: ['models', { page, size }],
        queryFn: async () => {
            const response = await ModelService.getAllModels(page, size);
            console.log('API Response:', response); // Log the response here
            return response;
        },
    });

    const models = modelsData.content || [];
    const totalPages = modelsData.totalPages || 0;

    const handlePageChange = (event, value) => {
        const zeroBasedPage = value - 1;
        setPage(zeroBasedPage);
    };

    const handleInputChange = (field, value) => {
        setNewModel((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!newModel.name.trim()) newErrors.name = 'Model name is required';
        if (!newModel.brandId.trim()) newErrors.brandId = 'Brand ID is required';
        if (!newModel.manufacturingYear || isNaN(newModel.manufacturingYear) || newModel.manufacturingYear <= 0) {
            newErrors.manufacturingYear = 'Manufacturing year must be a positive number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveModel = async () => {
        if (!validateForm()) return;

        try {
            if (selectedModel) {
                await ModelService.updateModel({ ...newModel, id: selectedModel.id });
                notifications.show('Model updated successfully!', { autoHideDuration: 3000, severity: 'success' });
            } else {
                await ModelService.createModel(newModel);
                notifications.show('Model created successfully!', { autoHideDuration: 3000, severity: 'success' });
            }
            queryClient.invalidateQueries(['models']);
            setOpenEditDialog(false);
            setNewModel({ name: '', brandId: '', manufacturingYear: '' });
        } catch (error) {
            notifications.show('Error saving model. Please try again.', { autoHideDuration: 3000, severity: 'error' });
        }
    };

    const handleEditClick = (model) => {
        setSelectedModel(model);
        setNewModel({ name: model.name, brandId: model.brand.id, manufacturingYear: model.manufacturingYear });
        setOpenEditDialog(true);
    };

    const handleDeleteClick = async (id) => {
        try {
            await ModelService.deleteModel(id);
            notifications.show('Model deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
            queryClient.invalidateQueries(['models']);
        } catch (error) {
            notifications.show('Error deleting model.', { autoHideDuration: 3000, severity: 'error' });
        }
    };

    const handleCloseDialog = () => {
        setSelectedModel(null);
        setOpenEditDialog(false);
        setNewModel({ name: '', brandId: '', manufacturingYear: '' });
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" color="textSecondary" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
                Manage Models
            </Typography>

            <Button variant="contained" color="primary" onClick={() => setOpenEditDialog(true)} sx={{ marginBottom: '20px' }}>
                Add New Model
            </Button>

            {isLoading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Grid container spacing={3}>
                    {models.map((model) => (
                        <Grid item xs={12} sm={6} md={4} key={model.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{model.name}</Typography>
                                    <Typography variant="body2" color="textSecondary">Brand: {model.brand.name}</Typography>
                                    <Typography variant="body2" color="textSecondary">Manufacturing Year: {model.manufacturingYear}</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" variant="outlined" onClick={() => handleEditClick(model)}>Edit</Button>
                                    <Button size="small" variant="contained" color="error" onClick={() => handleDeleteClick(model.id)}>Delete</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination count={totalPages} page={page + 1} onChange={handlePageChange} color="primary" />
            </Box>

            <Dialog open={openEditDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{selectedModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Model Name"
                        variant="filled"
                        value={newModel.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Brand ID"
                        variant="filled"
                        value={newModel.brandId}
                        onChange={(e) => handleInputChange('brandId', e.target.value)}
                        error={!!errors.brandId}
                        helperText={errors.brandId}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Manufacturing Year"
                        variant="filled"
                        type="number"
                        value={newModel.manufacturingYear}
                        onChange={(e) => handleInputChange('manufacturingYear', e.target.value)}
                        error={!!errors.manufacturingYear}
                        helperText={errors.manufacturingYear}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={handleSaveModel} color="primary" variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageModelsPage;
