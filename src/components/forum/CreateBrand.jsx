import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Chip,
    Divider,
    IconButton,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppNotifications } from '../common/NotificationProvider';
import BrandService from '../configuration/Services/BrandService';

const ITEMS_PER_PAGE = 10; // Number of brands to show per page

const BrandManagementPage = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    const [brands, setBrands] = useState([]);
    const [brandName, setBrandName] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [search, setSearch] = useState('');
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); 
    const [brandToDelete, setBrandToDelete] = useState(null);

    // Fetch all brands

    useEffect(() => {
        const fetchTopBrands = async () => {
            setLoadingBrands(true);
            try {
                const response = await BrandService.getAllBrands();
                setBrands(response); // Default to top brands initially
            } catch (error) {
                notifications.show('Failed to fetch top brands', { autoHideDuration: 3000, severity: 'error' });
            } finally {
                setLoadingBrands(false);
            }
        };

        fetchTopBrands();
    }, []);


    const handleSearch = async () => {
        if (!search.trim()) {
            notifications.show('Search query is empty', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        setLoadingBrands(true);
        try {
            const response = await BrandService.searchBrands(search);
            setBrands(response);
            setCurrentPage(1); // Reset to first page on search
        } catch (error) {
            notifications.show('Failed to search brands', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            setLoadingBrands(false);
        }
    };

    // Filtered brands based on search
    const filteredBrands = useMemo(() => {
        return brands.filter(brand =>
            brand.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [brands, search]);

    // Paginate filtered brands
    const paginatedBrands = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBrands.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredBrands, currentPage]);

    const handleCreateOrUpdate = async () => {
        if (!brandName.trim()) {
            notifications.show('Brand name is required', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        try {
            if (selectedBrand) {
                console.log(selectedBrand);
                console.log(brandName);
                const updatedBrand = await BrandService.updateBrands({
                    id: selectedBrand.id, // Ensure ID is included in payload
                    name: brandName,
                });
    
                // Update the local state to reflect changes
                setBrands((prevBrands) =>
                    prevBrands.map((brand) =>
                        brand.id === selectedBrand.id
                            ? { ...brand, name: brandName } // Update the name while preserving other properties
                            : brand
                    )
                );
                notifications.show('Brand updated successfully!', { autoHideDuration: 3000, severity: 'success' });
            } else {
                const newBrand = await BrandService.createBrands({ name: brandName});
                setBrands([...brands, newBrand]);
                notifications.show('Brand created successfully!', { autoHideDuration: 3000, severity: 'success' });
            }
        } catch (error) {
            notifications.show(
                selectedBrand ? 'Failed to update brand' : 'Failed to create brand',
                {autoHideDuration: 3000, severity: 'error' }
            );
        } finally {
            setBrandName('');
            setSelectedBrand(null);
        }
    };

    const handleEdit = brand => {
        setSelectedBrand(brand);
        setBrandName(brand.name);
    };

    const openDeleteDialog = (tag) => {
        setBrandToDelete(tag);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setBrandToDelete(null);
    };

    const handleDeleteBrand = async () => {
        if (!brandToDelete) return;

        try {
            await BrandService.deleteBrands(brandToDelete.id);
            setBrands((prev) => prev.filter((brand) => brand.id !== brandToDelete.id));
            notifications.show('Brand deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Failed to delete tag', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            closeDeleteDialog();
        }
    };

    const handleDelete = async id => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                await BrandService.deleteBrands(id);
                setBrands(brands.filter(brand => brand.id !== id));
                notifications.show('Brand deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
            } catch (error) {
                notifications.show('Failed to delete brand', { autoHideDuration: 3000, severity: 'error' });
            }
        }
    };

    return (
        <Box
            sx={{
                padding: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                paddingTop: { xs: '4rem', sm: '6rem', md: '8rem' },
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
            }}
        >
            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: { xs: '1rem', md: '2rem' },
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '8px',
                        boxShadow: theme.shadows[3],
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            textAlign: 'center',
                        }}
                    >
                        Brand Management
                    </Typography>
                    <Divider sx={{ mb: '1.5rem' }} />

                    {/* Search Box */}
                    <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TextField
                            label="Search Brands"
                            fullWidth
                            variant="filled"
                            placeholder="Search by brand name"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            startIcon={<SearchIcon />}
                        >
                            Search
                        </Button>
                    </Box>

                    {/* Brand Input */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <TextField
                            label="Brand Name"
                            fullWidth
                            variant="filled"
                            placeholder="Enter a brand name"
                            value={brandName}
                            onChange={e => setBrandName(e.target.value)}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleCreateOrUpdate}
                            sx={{ marginLeft: '0.5rem' }}
                        >
                            {selectedBrand ? <EditIcon /> : <AddCircleOutlineIcon />}
                        </IconButton>
                    </Box>

                    {/* Brands List */}
                    {loadingBrands ? (
                        <Typography>Loading brands...</Typography>
                    ) : (
                        <Box
                            sx={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr 1fr', // 2 columns on small screens
                                    sm: '1fr 1fr 1fr', // 3 columns on medium screens
                                    md: '1fr 1fr 1fr 1fr', // 4 columns on large screens
                                },
                                gap: '0.5rem',
                            }}
                        >
                            {paginatedBrands.map(brand => (
                                <Chip
                                    key={brand.id}
                                    label={brand.name}
                                    sx={{
                                        padding: '0.5rem',
                                        fontSize: { xs: '0.8rem', sm: '1rem' },
                                        justifyContent: 'space-between',
                                    }}
                                    onClick={() => handleEdit(brand)}
                                    onDelete={() => openDeleteDialog(brand)}
                                    deleteIcon={<DeleteIcon />}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Pagination */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '1rem',
                        }}
                    >
                        <Pagination
                            count={Math.ceil(filteredBrands.length / ITEMS_PER_PAGE)}
                            page={currentPage}
                            onChange={(event, page) => setCurrentPage(page)}
                            color="primary"
                        />
                    </Box>
                </Paper>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the tag <b>{brandToDelete?.name}</b>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteBrand} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BrandManagementPage;
