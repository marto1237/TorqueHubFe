import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
    TextField,
    CircularProgress,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Tooltip,
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material'; // For the info icon
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const FilterPanel = ({
                         selectedTags,
                         setSelectedTags,
                         noAnswers,
                         setNoAnswers,
                         noAcceptedAnswer,
                         setNoAcceptedAnswer,
                         sortOption,
                         setSortOption,
                         onApplyFilters
                     }) => {
    const theme = useTheme();
    const [loadingTags, setLoadingTags] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);
    const [tagSearch, setTagSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false); // To control visibility of dropdown

    // Fetch tags from the server as user types
    useEffect(() => {
        if (tagSearch) {
            setLoadingTags(true);
            axios
                .get(`http://localhost:8080/tags/search?query=${tagSearch}`) // Replace with your backend API
                .then((response) => {
                    setAvailableTags(response.data); // Assuming API returns an array of tag objects { name: 'tag', count: 123 }
                    setFilteredTags(response.data);
                    setLoadingTags(false);
                })
                .catch((error) => {
                    console.error('Error fetching tags:', error);
                    setLoadingTags(false);
                });
        } else {
            setAvailableTags([]);
            setFilteredTags([]);
        }
    }, [tagSearch]);

    // Filter tags based on input value
    useEffect(() => {
        if (tagSearch) {
            const filtered = availableTags.filter((tag) =>
                tag.name.toLowerCase().includes(tagSearch.toLowerCase())
            );
            setFilteredTags(filtered);
            setShowDropdown(true); // Show dropdown when user types
        } else {
            setShowDropdown(false); // Hide dropdown if search is cleared
        }
    }, [tagSearch, availableTags]);

    const handleTagClick = (tag) => {
        if (!selectedTags.includes(tag.name)) {
            setSelectedTags([...selectedTags, tag.name]); // Only add tag name to selected
        }
        setTagSearch(''); // Clear the search input after selecting a tag
        setShowDropdown(false); // Hide the dropdown after selecting
    };

    return (
        <Box
            sx={{
                padding: '20px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: '10px',
                boxShadow: theme.shadows[3],
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                [theme.breakpoints.up('md')]: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                },
            }}
        >
            {/* Filter By Section */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="bold">
                    Filter By
                </Typography>
                <FormControlLabel
                    control={<Checkbox checked={noAnswers} onChange={(e) => setNoAnswers(e.target.checked)} />}
                    label="No answers"
                />
                <FormControlLabel
                    control={<Checkbox checked={noAcceptedAnswer} onChange={(e) => setNoAcceptedAnswer(e.target.checked)} />}
                    label="No accepted answer"
                />
            </Box>

            {/* Sorted By Section */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="bold">
                    Sorted By
                </Typography>
                <RadioGroup
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    sx={{ display: 'flex', flexDirection: 'column' }}
                >
                    <FormControlLabel value="newest" control={<Radio />} label="Newest" />
                    <FormControlLabel value="recentActivity" control={<Radio />} label="Recent activity" />
                    <FormControlLabel value="mostViews" control={<Radio />} label="Most views" />
                    <FormControlLabel value="mostLiked" control={<Radio />} label="Most liked" />
                </RadioGroup>
            </Box>

            {/* Tagged With Section */}
            <Box sx={{ flex: 1, position: 'relative' }}>
                <Typography variant="body1" fontWeight="bold">
                    Tagged With
                </Typography>
                <TextField
                    variant="filled"
                    placeholder="Search tags"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ marginTop: '10px', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                />
                {loadingTags ? (
                    <CircularProgress size={20} sx={{ marginTop: '10px' }} />
                ) : (
                    showDropdown && (
                        <Box
                            sx={{
                                position: 'absolute',
                                zIndex: 1000,
                                backgroundColor: theme.palette.background.paper,
                                boxShadow: theme.shadows[2],
                                maxHeight: '200px',
                                overflowY: 'auto',
                                width: '100%',
                                mt: 1,
                            }}
                        >
                            {filteredTags.length === 0 ? (
                                <Typography sx={{ padding: '10px', color: theme.palette.text.secondary }}>
                                    No tags found
                                </Typography>
                            ) : (
                                <List>
                                    {filteredTags.map((tag, index) => (
                                        <ListItem key={index} disablePadding>
                                            <ListItemButton onClick={() => handleTagClick(tag)}>
                                                {/* Tag name */}
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Chip
                                                                label={tag.name}
                                                                sx={{
                                                                    backgroundColor: theme.palette.background.default,
                                                                    fontWeight: 'bold',
                                                                    marginRight: '8px',
                                                                }}
                                                            />
                                                            {/* Tag count */}
                                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                                {tag.count}
                                                            </Typography>
                                                            {/* Info icon */}
                                                            <Tooltip title={`Info about ${tag.name}`}>
                                                                <IconButton sx={{ marginLeft: 'auto' }}>
                                                                    <HelpOutline fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )
                )}

                {/* Selected Tags */}
                <Box sx={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {selectedTags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            onDelete={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.common.white,
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Apply Button */}
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
                <Button variant="contained" color="primary" onClick={onApplyFilters}>Apply Filter</Button>
            </Box>
        </Box>
    );
};

export default FilterPanel;
