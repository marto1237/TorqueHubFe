import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Chip,
    Autocomplete,
    Divider,
    IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TagService from '../configuration/Services/TagService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppNotifications } from '../common/NotificationProvider';

const TagManagementPage = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();
    const queryClient = useQueryClient();

    const [tagName, setTagName] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [search, setSearch] = useState('');

    const { data: tags = [], isLoading: loadingTags } = useQuery({
        queryKey: ['tags'],
        queryFn: TagService.getAllTags,
        staleTime: 5 * 60 * 1000, // Cache tags for 5 minutes
        refetchOnWindowFocus: false,
    });

    const createTagMutation = useMutation(TagService.createTag, {
        onSuccess: () => {
            queryClient.invalidateQueries(['tags']);
            notifications.show('Tag created successfully!', { severity: 'success' });
        },
        onError: () => {
            notifications.show('Failed to create tag', { severity: 'error' });
        },
    });

    const updateTagMutation = useMutation(({ id, name }) => TagService.updateTag(id, { name }), {
        onSuccess: () => {
            queryClient.invalidateQueries(['tags']);
            notifications.show('Tag updated successfully!', { severity: 'success' });
        },
        onError: () => {
            notifications.show('Failed to update tag', { severity: 'error' });
        },
    });

    const deleteTagMutation = useMutation((id) => TagService.deleteTag(id), {
        onSuccess: () => {
            queryClient.invalidateQueries(['tags']);
            notifications.show('Tag deleted successfully!', { severity: 'success' });
        },
        onError: () => {
            notifications.show('Failed to delete tag', { severity: 'error' });
        },
    });

    const filteredTags = useMemo(() => {
        return tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));
    }, [tags, search]);

    const handleCreateOrUpdate = () => {
        if (!tagName.trim()) {
            notifications.show('Tag name is required', { severity: 'warning' });
            return;
        }

        if (selectedTag) {
            updateTagMutation.mutate({ id: selectedTag.id, name: tagName });
        } else {
            createTagMutation.mutate({ name: tagName });
        }

        setTagName('');
        setSelectedTag(null);
    };

    const handleEdit = (tag) => {
        setSelectedTag(tag);
        setTagName(tag.name);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            deleteTagMutation.mutate(id);
        }
    };

    return (
        <Box sx={{ padding: { xs: '1rem', sm: '1.5rem', md: '2rem' }, backgroundColor: theme.palette.background.default }}>
            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                <Paper elevation={3} sx={{ padding: { xs: '1rem', md: '2rem' }, backgroundColor: theme.palette.background.paper }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                        Tag Management
                    </Typography>
                    <Divider sx={{ mb: '1.5rem' }} />

                    {/* Search Box */}
                    <TextField
                        label="Search Tags"
                        fullWidth
                        variant="outlined"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ marginBottom: '1rem' }}
                    />

                    {/* Tag Input */}
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <TextField
                            label="Tag Name"
                            fullWidth
                            variant="outlined"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
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
                        <Box>
                            {filteredTags.map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    sx={{ margin: '0.25rem' }}
                                    onClick={() => handleEdit(tag)}
                                    onDelete={() => handleDelete(tag.id)}
                                    deleteIcon={<DeleteIcon />}
                                />
                            ))}
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default TagManagementPage;
