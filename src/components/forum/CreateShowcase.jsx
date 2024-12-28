import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
} from '@mui/material';
import ShowcaseService from '../configuration/Services/ShowcaseService';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material';

const ShowcaseCreateForm = () => {
    const [formData, setFormData] = useState({
        userId: '',
        title: '',
        description: '',
        brandId: '',
        modelId: '',
        categoryId: '',
        countryId: '',
        horsepower: '',
        drivetrain: '',
        weight: '',
        engineDisplacement: '',
        transmission: '',
        torque: '',
        fuelType: '',
        topSpeed: '',
        acceleration: '',
    });

    const navigate = useNavigate();
    const theme = useTheme();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ShowcaseService.createShowcase(formData);
            console.log('Showcase created:', response);
            navigate(`/myshowcase/${response.id}`);
        } catch (error) {
            console.error('Error creating showcase:', error);
        }
    };

    return (
        <Box
            sx={{
                padding: '20px',
                backgroundColor: theme.palette.background.paper,
                minHeight: '100vh',
            }}
        >
            <Typography variant="h4" gutterBottom>
                Create New Showcase
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {['userId', 'title', 'description'].map((field) => (
                        <Grid item xs={12} key={field}>
                            <TextField
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                label={field.charAt(0).toUpperCase() + field.slice(1)}
                                fullWidth
                                variant="outlined"
                                required
                                multiline={field === 'description'}
                                rows={field === 'description' ? 4 : 1}
                            />
                        </Grid>
                    ))}

                    {['brandId', 'modelId', 'categoryId', 'countryId'].map((field) => (
                        <Grid item xs={12} sm={6} key={field}>
                            <TextField
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                label={field.replace(/Id$/, '').replace(/([A-Z])/g, ' $1')}
                                fullWidth
                                variant="outlined"
                                type="number"
                                required
                            />
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <Typography variant="h6">Car Performance</Typography>
                    </Grid>

                    {[
                        { name: 'horsepower', label: 'Horsepower' },
                        { name: 'drivetrain', label: 'Drivetrain' },
                        { name: 'weight', label: 'Weight (kg)' },
                        { name: 'engineDisplacement', label: 'Engine Displacement (cc)' },
                        { name: 'transmission', label: 'Transmission' },
                        { name: 'torque', label: 'Torque (Nm)' },
                        { name: 'fuelType', label: 'Fuel Type' },
                        { name: 'topSpeed', label: 'Top Speed (km/h)' },
                        { name: 'acceleration', label: 'Acceleration (0-100 km/h in seconds)' },
                    ].map(({ name, label }) => (
                        <Grid item xs={12} sm={6} key={name}>
                            <TextField
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                label={label}
                                fullWidth
                                variant="outlined"
                                required
                            />
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Create Showcase
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default ShowcaseCreateForm;
