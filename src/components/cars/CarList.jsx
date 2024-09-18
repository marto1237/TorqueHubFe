import React, { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LocationOn, DirectionsCar } from '@mui/icons-material';
import '../../styles/CarList.css';
import FilterSidebar from '../common/FilterSidebar';
import { useTheme } from '@mui/material/styles';

const cars = [
    {
        id: 1,
        name: 'Lexus GS F',
        location: '123 Kathal St. Tampa City',
        price: '$178,000',
        sport: 'Sport',
        mileage: '17,000',
        fuel: 'Diesel',
        imageUrl: 'https://hips.hearstapps.com/hmg-prod/images/2020-lexus-gs-mmp-1-1574354422.jpg',
    },
    {
        id: 2,
        name: 'BMW 535 v5',
        location: '123 Kathal St. Tampa City',
        price: '$178,000',
        sport: 'Sport',
        mileage: '17,000',
        fuel: 'Diesel',
        imageUrl: 'https://bmw.scene7.com/is/image/BMW/bmw-5-series-overview-g60-bev?wid=3000&hei=3000',
    },
    // Add more cars here
];

const CarList = () => {
    const theme = useTheme();

    const [sort, setSort] = useState('High to Low');

    const handleSortChange = (event) => {
        setSort(event.target.value);
    };

    return (
        // Replace the div with Box to properly use sx and theme
        <Box sx={{ padding: '20px', backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ padding: '100px' }}>
                {/* Layout with Filter Sidebar and Car List */}
                <Grid container spacing={3}>
                    {/* Filter Sidebar on the left */}
                    <Grid item xs={12} md={3}>
                        <FilterSidebar />
                    </Grid>

                    {/* Car list on the right */}
                    <Grid item xs={12} md={9}>
                        {/* Sorting and View Switch */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" color="textSecondary">Car List</Typography>
                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <Typography variant="body2" color="textSecondary">20 Results Found</Typography>
                                <FormControl size="small">
                                    <InputLabel>Sort By</InputLabel>
                                    <Select value={sort} onChange={handleSortChange}>
                                        <MenuItem value="High to Low">High to Low</MenuItem>
                                        <MenuItem value="Low to High">Low to High</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        {/* Car Cards */}
                        <Grid container spacing={3}>
                            {cars.map((car) => (
                                <Grid item xs={12} key={car.id}>
                                    <Card>
                                        <Box sx={{ display: 'flex' }}>
                                            <Box sx={{ width: '30%', height: '200px' }}>
                                                <img src={car.imageUrl} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </Box>
                                            <CardContent sx={{ width: '70%' }}>
                                                <Typography variant="h6" color="primary">
                                                    {car.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <LocationOn fontSize="small" /> {car.location}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                                </Typography>
                                                <Typography variant="h6" color="primary">
                                                    {car.price}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: '10px', mt: 1 }}>
                                                    <Button size="small" variant="outlined" startIcon={<DirectionsCar />}>
                                                        {car.sport}
                                                    </Button>
                                                    <Button size="small" variant="outlined">
                                                        {car.mileage}
                                                    </Button>
                                                    <Button size="small" variant="outlined">
                                                        {car.fuel}
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default CarList;
