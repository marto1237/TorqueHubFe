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
import CarCategory from '../configuration/Services/CarCategoryService'

const ITEMS_PER_PAGE = 10; 

const TagManagementPage = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    const [tags, setCategories] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [tagName, setCategoryName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); 
    const [categoryToDelete, setCategoryToDelete] = useState(null);


    const userDetails = sessionStorage.getItem('userDetails');

    const parsedDetails = JSON.parse(userDetails);
    const userId = parsedDetails.id;

    useEffect(() => {
        const fetchTopCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await CarCategory.getAllCategories();
                const categories = response.content || [];;
                console.log(categories);
                setTopCategories(categories);
                setCategories(categories);
            } catch (error) {
                notifications.show('Failed to fetch top categories', { autoHideDuration: 3000, severity: 'error' });
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchTopCategories();
    }, []);


    const handleSearch = async () => {
        if (!search.trim()) {
            notifications.show('Search query is empty', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        setLoadingCategories(true);
        try {
            const response = await CarCategory.searchCategories(search);
            console.log(response);
            const categories = response.content || []; // Extract 'content' from the response
            setCategories(categories);
            setCurrentPage(1);  // Reset to first page on search
        } catch (error) {
            notifications.show('Failed to search categories', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            setLoadingCategories(false);
        }
    };

    

    const filteredCategories = useMemo(() => {
        if (!Array.isArray(tags)) return []; // Handle non-array scenarios
        return tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));
    }, [tags, search]);

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCategories, currentPage]);

    const handleCreateOrUpdate = async () => {
        if (!tagName.trim()) {
            notifications.show('Tag name is required', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        try {
            if (selectedCategory) {
                console.log(selectedCategory);
                console.log(tagName);
                await CarCategory.updateCategory(selectedCategory.id, { id: selectedCategory.id, name: tagName, userId: userId });
                setCategories(tags.map(tag =>
                    tag.id === selectedCategory.id ? { ...tag, name: tagName } : tag
                ));
                notifications.show('Tag updated successfully!', { autoHideDuration: 3000, severity: 'success' });
            } else {
                const newTag = await CarCategory.createCategory({ name: tagName });
                setCategories([...tags, newTag]);
                notifications.show('Tag created successfully!', { autoHideDuration: 3000, severity: 'success' });
            }
        } catch (error) {
            notifications.show(
                selectedCategory ? 'Failed to update tag' : 'Failed to create tag',
                {autoHideDuration: 3000, severity: 'error' }
            );
        } finally {
            setCategoryName('');
            setSelectedCategory(null);
        }
    };

    const handleEdit = tag => {
        setSelectedCategory(tag);
        setCategoryName(tag.name);
    };

    const openDeleteDialog = (category) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    // Close delete dialog
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
    };

    // Handle deleting a category
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            await CarCategory.deleteCategory(categoryToDelete.id);
            setCategories((prev) => prev.filter((category) => category.id !== categoryToDelete.id));
            notifications.show('Category deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Failed to delete category', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            closeDeleteDialog();
        }
    };

    const handleDelete = async id => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            try {
                await CarCategory.deleteCategory(id);
                notifications.show('Category deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
            } catch (error) {
                notifications.show('Failed to delete category', { autoHideDuration: 3000, severity: 'error' });
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
                        Car Category Management
                    </Typography>
                    <Divider sx={{ mb: '1.5rem' }} />

                    {/* Search Box */}
                    <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TextField
                            label="Search category"
                            fullWidth
                            variant="filled"
                            placeholder="Search by category name"
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

                    {/* Tag Input */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <TextField
                            label="Category Name"
                            fullWidth
                            variant="filled"
                            placeholder="Enter a category name"
                            value={tagName}
                            onChange={e => setCategoryName(e.target.value)}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleCreateOrUpdate}
                            sx={{ marginLeft: '0.5rem' }}
                        >
                            {selectedCategory ? <EditIcon /> : <AddCircleOutlineIcon />}
                        </IconButton>
                    </Box>

                    {/* Tags List */}
                    {loadingCategories ? (
                        <Typography>Loading tags...</Typography>
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
                            {paginatedCategories.map((category) => (
                                <Chip
                                    key={category.id}
                                    label={category.name}
                                    sx={{
                                        padding: '0.5rem',
                                        fontSize: { xs: '0.8rem', sm: '1rem' },
                                        justifyContent: 'space-between',
                                    }}
                                    onClick={() => handleEdit(category)}
                                    onDelete={() => openDeleteDialog(category)}
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
                            count={Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)}
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
                        Are you sure you want to delete the category <b>{categoryToDelete?.name}</b>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteCategory} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TagManagementPage;
