import React from 'react';
import { Box, Typography, Chip, FormControlLabel, Checkbox, Select, MenuItem, Autocomplete, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // To apply theme-based styling

const availableTags = ['ssl-certificate', 'subdomain', 'wildcard', 'temperature', 'sensors', 'jdm'];

const FilterPanel = ({ selectedTags, setSelectedTags, noAnswers, setNoAnswers, noAcceptedAnswer, setNoAcceptedAnswer, sortOption, setSortOption }) => {
    const theme = useTheme(); // Use theme

    return (
        <Box
            sx={{
                padding: '20px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: '10px',
                boxShadow: theme.shadows[3],
                marginBottom: '20px',
            }}
        >
            <Typography variant="h6">Filter Questions</Typography>

            {/* Searchable Tag Input */}
            <Typography variant="body2" sx={{ marginTop: '10px' }}>
                Tags:
            </Typography>
            <Autocomplete
                multiple
                options={availableTags}
                value={selectedTags}
                onChange={(event, newValue) => {
                    setSelectedTags(newValue);
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip key={index} label={option} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="filled"
                        placeholder="Search and select tags"
                        size="small"
                        sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                    />
                )}
                sx={{ marginTop: '10px', width: '100%' }}
            />


            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                {/* No answers checkbox */}
                <FormControlLabel
                    control={<Checkbox checked={noAnswers} onChange={(e) => setNoAnswers(e.target.checked)} />}
                    label="No answers"
                    sx={{ marginRight: '20px' }} // Add some space between the checkboxes
                />
                {/* No accepted answers checkbox */}
                <FormControlLabel
                    control={<Checkbox checked={noAcceptedAnswer} onChange={(e) => setNoAcceptedAnswer(e.target.checked)} />}
                    label="No accepted answers"
                />
            </Box>

            {/* Sorting option */}
            <Typography variant="body2" sx={{ marginTop: '20px' }}>
                Sort by:
            </Typography>
            <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                fullWidth
                sx={{ marginTop: '10px', backgroundColor: theme.palette.background.paper }}
            >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="votes">Votes</MenuItem>
            </Select>
        </Box>
    );
};

export default FilterPanel;
