import React, { useState, useEffect, useMemo } from 'react';
import {Box,Typography,Chip,FormControlLabel,Checkbox,RadioGroup,Radio,TextField,CircularProgress,
    Button,List,ListItem,ListItemButton,ListItemText,IconButton,Tooltip,Autocomplete
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material'; // For the info icon
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import TagService from '../configuration/Services/TagService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FilterService from '../configuration/Services/FilterService';

const FilterPanel = ({
                         selectedTags,
                         setSelectedTags,
                         noAnswers,
                         setNoAnswers,
                         noAcceptedAnswer,
                         setNoAcceptedAnswer,
                         sortOption,
                         setSortOption,
                         onApplyFilters,
                         page,
                         pageSize
                     }) => {
    const theme = useTheme();
    const [loadingTags, setLoadingTags] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false); // To control visibility of dropdown

    const maxTags = 5;
    const { data: availableTags = [], isLoading } = useQuery({
        queryKey: ['tags', tagSearch],
        queryFn: TagService.getAllTags,
        staleTime: 5 * 60 * 1000, // Cache tags for 5 minutes
        refetchOnWindowFocus: false,
    });

    // Filter tags based on search input
    const filteredTags = useMemo(() => {
        return (availableTags || []).filter(tag =>
            tag.name.toLowerCase().includes(tagSearch.toLowerCase())
        );
    }, [availableTags, tagSearch]);
    


    // Handle tag selection with a limit
    const handleTagChange = (event, newValue) => {
        const uniqueTags = Array.from(new Set(newValue.map((item) => item.name)));
        setSelectedTags(uniqueTags.slice(0, maxTags)); // Limit tags to maxTags

        // Log selected tags for debugging
        console.log("Selected Tags after tag change:", uniqueTags);
    };
   
    const handleTagClick = (tag) => {
        if (!selectedTags.includes(tag.name)) {
            setSelectedTags([...selectedTags, tag.name]); // Only add tag name to selected
        }
        setTagSearch(''); // Clear the search input after selecting a tag
        setShowDropdown(false); // Hide the dropdown after selecting
    };

    const handleTagSearchChange = (event) => {
        setTagSearch(event.target.value);
        setShowDropdown(true); // Show dropdown when typing
    };

    const handleApplyFilters = async (event) => {
        event.preventDefault();
    
        // Log the API request parameters before calling FilterService
        console.log("Applying Filters with the following parameters:", {
            tags: selectedTags,
            noAnswers,
            noAcceptedAnswer,
            sortOption,
            page,
            pageSize
        });
    
        try {
            const filteredQuestions = await FilterService.filterQuestions(
                selectedTags,
                noAnswers,
                noAcceptedAnswer,
                sortOption,
                page,
                pageSize
            );
            onApplyFilters(filteredQuestions);
        } catch (error) {
            console.error("Failed to fetch filtered questions:", error);
        }
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
                <Autocomplete
                    multiple
                    options={filteredTags}
                    getOptionLabel={(option) => option.name}
                    onChange={handleTagChange}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                key={index}
                                label={option.name}
                                {...getTagProps({ index })}
                                sx={{ m: '0.25rem' }}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Tags"
                            placeholder="Search and select tags"
                            variant="filled"
                            onChange={handleTagSearchChange}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    limitTags={maxTags}
                    sx={{ mt: 1 }}
                />

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
                <Button type="button" variant="contained" color="primary" onClick={handleApplyFilters}>Apply Filter</Button>
            </Box>
        </Box>
    );
};

export default FilterPanel;
