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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppNotifications } from '../common/NotificationProvider';
import CategoryService from '../configuration/Services/CategoryService';

const ITEMS_PER_PAGE = 10; // Number of categories to show per page

const CarCategoryManagement = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch all categories

    useEffect(() => {
        const fetchTopTags = async () => {
            setLoadingCategories(true);
            try {
                const response = await CategoryService.getAllCategories();
                setCategories(response); // Default to top categories initially
                console.log(response);
            } catch (error) {
                notifications.show('Failed to fetch top categories', { autoHideDuration: 3000, severity: 'error' });
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchTopTags();
    }, []);


    const handleSearch = async () => {
        if (!search.trim()) {
            notifications.show('Search query is empty', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        setLoadingCategories(true);
        try {
            
            const response = await CategoryService.searchCategories(search);
            setCategories(response.content);
            setCurrentPage(1); // Reset to first page on search
        } catch (error) {
            notifications.show('Failed to search categories', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            setLoadingCategories(false);
        }
    };

    // Filtered categories based on search
    const filteredCategories = useMemo(() => {
        if (!Array.isArray(categories)) return [];
        return categories.filter(category =>
            category.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [categories, search]);
    

    // Paginate filtered categories
    const paginatedTags = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCategories, currentPage]);

    const handleCreateOrUpdate = async () => {
        if (!categoryName.trim()) {
            notifications.show('Tag name is required', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        try {
            const userDetails = sessionStorage.getItem('userDetails'); // Retrieve user details
            const parsedDetails = JSON.parse(userDetails); // Parse user details
            const userId = parsedDetails?.id; // Get the userId

            if (!userId) {
                notifications.show('User ID is missing', { autoHideDuration: 3000, severity: 'error' });
                return;
            }
            if (selectedCategory) {
                console.log("Updating category:", {
                    id: selectedCategory.id,
                    name: categoryName
                });
                await CategoryService.updateCategory(selectedCategory.id, { id: selectedCategory.id, name: categoryName });
                setCategories(categories.map(category  =>
                    category.id === selectedCategory.id ? { ...category , name: categoryName } : category 
                ));
                notifications.show('Tag updated successfully!', { autoHideDuration: 3000, severity: 'success' });
            } else {
                const newTag = await CategoryService.createCategory({ name: categoryName, userId });
                setCategories([...categories, newTag]);
                notifications.show('Tag created successfully!', { autoHideDuration: 3000, severity: 'success' });
            }
        } catch (error) {
            notifications.show(
                selectedCategory ? 'Failed to update category ' : 'Failed to create category ',
                {autoHideDuration: 3000, severity: 'error' }
            );
        } finally {
            setCategoryName('');
            setSelectedCategory(null);
        }
    };

    const handleEdit = category => {
        setSelectedCategory(category);
        setCategoryName(category.name);
    };

    const handleDelete = async id => {
        if (window.confirm('Are you sure you want to delete this category ?')) {
            try {
                await CategoryService.deleteCategory(id);
                setCategories(categories.filter(category => category.id !== id));
                notifications.show('Tag deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
            } catch (error) {
                notifications.show('Failed to delete category ', { autoHideDuration: 3000, severity: 'error' });
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
                        Event Tag Management
                    </Typography>
                    <Divider sx={{ mb: '1.5rem' }} />

                    {/* Search Box */}
                    <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TextField
                            label="Search Tags"
                            fullWidth
                            variant="filled"
                            placeholder="Search by category  name"
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
                            label="Tag Name"
                            fullWidth
                            variant="filled"
                            placeholder="Enter a category name"
                            value={categoryName}
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
                        <Typography>Loading categories...</Typography>
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
                            {paginatedTags.map(category => (
                                <Chip
                                    key={category .id}
                                    label={category .name}
                                    sx={{
                                        padding: '0.5rem',
                                        fontSize: { xs: '0.8rem', sm: '1rem' },
                                        justifyContent: 'space-between',
                                    }}
                                    onClick={() => handleEdit(category )}
                                    onDelete={() => handleDelete(category.id)}
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
        </Box>
    );
};

export default CarCategoryManagement;
