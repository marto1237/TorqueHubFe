import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const FilterSidebar = () => {
    const theme = useTheme();

    return (
        <Box sx={{ padding: '20px', backgroundColor: theme.palette.background.paper, minHeight: '100vh' }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Brand</InputLabel>
                <Select>
                    <MenuItem value="">Choose One</MenuItem>
                    <MenuItem value="BMW">BMW</MenuItem>
                    <MenuItem value="Audi">Audi</MenuItem>
                </Select>
            </FormControl>

            <FormGroup sx={{ mb: 2 }}>
                <FormControlLabel control={<Checkbox />} label="SUV" />
                <FormControlLabel control={<Checkbox />} label="Sedan" />
                <FormControlLabel control={<Checkbox />} label="Truck" />
            </FormGroup>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Location</InputLabel>
                <Select>
                    <MenuItem value="">Choose One</MenuItem>
                    <MenuItem value="New York">New York</MenuItem>
                    <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Manufacture Year</InputLabel>
                <Select>
                    <MenuItem value="">Choose One</MenuItem>
                    <MenuItem value="2020">2020</MenuItem>
                    <MenuItem value="2019">2019</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Transmission</InputLabel>
                <Select>
                    <MenuItem value="">Choose One</MenuItem>
                    <MenuItem value="Automatic">Automatic</MenuItem>
                    <MenuItem value="Manual">Manual</MenuItem>
                </Select>
            </FormControl>

            <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                Search
            </Button>
        </Box>
    );
};

export default FilterSidebar;
