import React, { useState, useCallback } from 'react';
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
    Autocomplete,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ModelService from '../configuration/Services/ModelService';
import debounce from 'lodash/debounce';
import BrandService from '../configuration/Services/BrandService';
import { useAppNotifications } from '../common/NotificationProvider';

const ManageModelsPage = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const [selectedModel, setSelectedModel] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [newModel, setNewModel] = useState({ name: '', brandId: '', manufacturingYear: '' });
    const [brands, setBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [errors, setErrors] = useState({});

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false); 
    const [modelToDelete, setModelToDelete] = useState(null); 

    const size = 10;

    const { data: modelsData = {}, isLoading } = useQuery({
        queryKey: ['models', { page, size }],
        queryFn: async () => {
            const response = await ModelService.getAllModels(page, size);
            console.log('API Response:', response); // Log the response here
            return response;
        },
    });

    const { isLoading: isBrandsLoading } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const response = await BrandService.getAllBrands();
            console.log('Brands API Response:', response);
            setBrands(response);
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
        if (!newModel.brandId) newErrors.brandId = 'Brand is required';
        if (!newModel.manufacturingYear || isNaN(newModel.manufacturingYear) || newModel.manufacturingYear <= 0) {
            newErrors.manufacturingYear = 'Manufacturing year must be a positive number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveModel = async () => {
        if (!validateForm()) return;

        try {
            const modelData = { ...newModel };
            if (selectedModel) {
                modelData.id = selectedModel.id;
                await ModelService.updateModel(modelData);
                notifications.show('Model updated successfully!', { autoHideDuration: 3000, severity: 'success' });
            } else {
                await ModelService.createModel(modelData);
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

    const handleCloseDialog = () => {
        setSelectedModel(null);
        setOpenEditDialog(false);
        setNewModel({ name: '', brandId: '', manufacturingYear: '' });
    };

    const searchBrands = async (query) => {
        const searchQuery = typeof query === 'string' ? query.trim() : '';
        if (!searchQuery) return;
        setLoadingBrands(true);
        try {
            const response = await BrandService.searchBrands(query);
            setBrands(response);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoadingBrands(false);
        }
    };

    const debouncedSearchBrands = useCallback(debounce(searchBrands, 300), []);

    const handleBrandSearch = (event, value) => {
        debouncedSearchBrands(value || ''); // Pass the value or an empty string
    };

    const openDeleteConfirmation = (model) => {
        setModelToDelete(model);
        setOpenDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setModelToDelete(null);
    };
    

    const handleDeleteModel = async () => {
        if (!modelToDelete) return;

        try {
            await ModelService.deleteModel(modelToDelete.id);
            notifications.show('Model deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
            queryClient.invalidateQueries(['models']);
        } catch (error) {
            notifications.show('Error deleting model.', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            closeDeleteDialog();
        }
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
                                    <Button size="small" variant="contained" color="error" onClick={() => openDeleteConfirmation(model)}>Delete</Button>
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
                    <Autocomplete
                        options={brands}
                        getOptionLabel={(option) => option.name}
                        value={brands.find((brand) => brand.id === newModel.brandId) || null}
                        onInputChange={handleBrandSearch}
                        onChange={(event, value) => handleInputChange('brandId', value ? value.id : '')}
                        loading={loadingBrands}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="normal"
                                label="Brand"
                                variant="filled"
                                error={!!errors.brandId}
                                helperText={errors.brandId}
                            />
                        )}
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

            <Dialog open={openDeleteDialog} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the model <b>{modelToDelete?.name}</b>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteModel} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageModelsPage;
