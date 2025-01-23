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
import TicketTags from '../configuration/Services/TicketTagsService'

const ITEMS_PER_PAGE = 10; // Number of tags to show per page

const TagManagementPage = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    const [tags, setTags] = useState([]);
    const [topTags, setTopTags] = useState([]);
    const [tagName, setTagName] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [search, setSearch] = useState('');
    const [loadingTags, setLoadingTags] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
    const [tagToDelete, setTagToDelete] = useState(null); // State for selected tag to delete

    // Fetch all tags

    useEffect(() => {
        const fetchTopTags = async () => {
            setLoadingTags(true);
            try {
                const response = await TicketTags.getTopTags();
                setTopTags(response);
                setTags(response); // Default to top tags initially
            } catch (error) {
                notifications.show('Failed to fetch top tags', { autoHideDuration: 3000, severity: 'error' });
            } finally {
                setLoadingTags(false);
            }
        };

        fetchTopTags();
    }, []);


    const handleSearch = async () => {
        if (!search.trim()) {
            notifications.show('Search query is empty', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        setLoadingTags(true);
        try {
            
            const response = await TicketTags.searchTags(search);
            setTags(response.content);
            setCurrentPage(1); // Reset to first page on search
        } catch (error) {
            notifications.show('Failed to search tags', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            setLoadingTags(false);
        }
    };

    // Filtered tags based on search
    const filteredTags = useMemo(() => {
        return tags.filter(tag =>
            tag.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [tags, search]);

    // Paginate filtered tags
    const paginatedTags = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTags.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTags, currentPage]);

    const handleCreateOrUpdate = async () => {
        if (!tagName.trim()) {
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
            if (selectedTag) {
                console.log(selectedTag);
                console.log(tagName);
                await TicketTags.updateTag(selectedTag.id, { id: selectedTag.id, name: tagName });
                setTags(tags.map(tag =>
                    tag.id === selectedTag.id ? { ...tag, name: tagName } : tag
                ));
                notifications.show('Tag updated successfully!', { autoHideDuration: 3000, severity: 'success' });
            } else {
                const newTag = await TicketTags.createTag({ name: tagName, userId });
                setTags([...tags, newTag]);
                notifications.show('Tag created successfully!', { autoHideDuration: 3000, severity: 'success' });
            }
        } catch (error) {
            notifications.show(
                selectedTag ? 'Failed to update tag' : 'Failed to create tag',
                {autoHideDuration: 3000, severity: 'error' }
            );
        } finally {
            setTagName('');
            setSelectedTag(null);
        }
    };

    const handleEdit = tag => {
        setSelectedTag(tag);
        setTagName(tag.name);
    };

    const openDeleteDialog = (tag) => {
        setTagToDelete(tag);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTagToDelete(null);
    };

    const handleDeleteTag = async () => {
        if (!tagToDelete) return;

        try {
            await TicketTags.deleteTag(tagToDelete.id);
            setTags((prev) => prev.filter((tag) => tag.id !== tagToDelete.id));
            notifications.show('Tag deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Failed to delete tag', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            closeDeleteDialog();
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
                            placeholder="Search by tag name"
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
                            placeholder="Enter a tag name"
                            value={tagName}
                            onChange={e => setTagName(e.target.value)}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleCreateOrUpdate}
                            sx={{ marginLeft: '0.5rem' }}
                        >
                            {selectedTag ? <EditIcon /> : <AddCircleOutlineIcon />}
                        </IconButton>
                    </Box>

                    {/* Tags List */}
                    {loadingTags ? (
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
                            {paginatedTags.map(tag => (
                                <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    sx={{
                                        padding: '0.5rem',
                                        fontSize: { xs: '0.8rem', sm: '1rem' },
                                        justifyContent: 'space-between',
                                    }}
                                    onClick={() => handleEdit(tag)}
                                    onDelete={() => openDeleteDialog(tag)}
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
                            count={Math.ceil(filteredTags.length / ITEMS_PER_PAGE)}
                            page={currentPage}
                            onChange={(event, page) => setCurrentPage(page)}
                            color="primary"
                        />
                    </Box>
                </Paper>
            </Box>

            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the tag <b>{tagToDelete?.name}</b>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteTag} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TagManagementPage;
