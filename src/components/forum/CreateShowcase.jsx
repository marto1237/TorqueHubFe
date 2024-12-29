    import React, { useState, useMemo, useEffect } from 'react';
    import {
        Box,
        Typography,
        Autocomplete,
        TextField,
        Button,
        Paper,
        Divider,
    } from '@mui/material';
    import { useTheme } from '@mui/material/styles';
    import { useQuery } from '@tanstack/react-query';
    import ShowcaseService from '../configuration/Services/ShowcaseService';
    import BrandService from '../configuration/Services/BrandService';
    import CategoryService from '../configuration/Services/CategoryService';
    import CountryService from '../configuration/Services/CountryService';
    import DOMPurify from 'dompurify';

    const ShowcaseCreateForm = () => {
        const theme = useTheme();

        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [category, setCategory] = useState(null);
        const [brand, setBrand] = useState(null);
        const [country, setCountry] = useState(null);

        const [categorySearch, setCategorySearch] = useState('');
        const [brandSearch, setBrandSearch] = useState('');
        const [countrySearch, setCountrySearch] = useState('');

        const [topBrands, setTopBrands] = useState([]);
        const [filteredBrands, setFilteredBrands] = useState([]);

        const [allCategories, setallCategories] = useState([]);
        const [filteredCategories, setFilteredCategories] = useState([]);

        const [allCountries, setallCountries] = useState([]);
        const [filteredCountries, setFilteredCountries] = useState([]);

        const [models, setModels] = useState([]);
        const [filteredModels, setFilteredModels] = useState([]);
        const [model, setModel] = useState(null);


        const [error, setError] = useState({
            title: false,
            description: false,
            category: false,
            brand: false,
            country: false,
        });

        // Fetch top brands on component mount
        useEffect(() => {
            const fetchTopBrands = async () => {
                try {
                    const brands = await BrandService.getAllBrands();
                    console.log(brand);
                    setTopBrands(brands);
                    setFilteredBrands(brands); // Default to showing top brands
                } catch (error) {
                    console.error('Error fetching top brands:', error);
                }
            };

            fetchTopBrands();
        }, []);

        // Dynamically search brands based on user input
        useEffect(() => {
            const searchBrands = async () => {
                if (brandSearch.trim() === '') {
                    setFilteredBrands(topBrands); // Show top brands when input is empty
                    return;
                }

                try {
                    const searchResults = await BrandService.searchBrands(brandSearch);
                    setFilteredBrands(searchResults);
                } catch (error) {
                    console.error('Error searching brands:', error);
                }
            };

            searchBrands();
        }, [brandSearch, topBrands]);

        // Fetch top brands on component mount
        useEffect(() => {
            const fetchAllCategories = async () => {
                try {
                    const categories = await CategoryService.getAllCategories();
                    console.log(categories);
                    setallCategories(categories);
                    setFilteredCategories(categories); // Default to showing top brands
                } catch (error) {
                    console.error('Error fetching top brands:', error);
                }
            };

            fetchAllCategories();
        }, []);

        // Dynamically search brands based on user input
        useEffect(() => {
            const searchCategories = async () => {
                if (categorySearch.trim() === '') {
                    setFilteredCategories(allCategories); // Show top brands when input is empty
                    return;
                }

                try {
                    const searchResults = await CategoryService.searchCategory(categorySearch);
                    setFilteredCategories(searchResults);
                } catch (error) {
                    console.error('Error searching brands:', error);
                }
            };

            searchCategories();
        }, [categorySearch, allCategories]);


        
        // Fetch top brands on component mount
        useEffect(() => {
            const fetchAllCountries = async () => {
                try {
                    const countries = await CountryService.getAllCountries();
                    console.log(countries);
                    setallCountries(countries);
                    setFilteredCountries(countries); 
                } catch (error) {
                    console.error('Error fetching top brands:', error);
                }
            };

            fetchAllCountries();
        }, []);

        // Dynamically search brands based on user input
        useEffect(() => {
            const searchCountries = async () => {
                if (countrySearch.trim() === '') {
                    setFilteredCountries(allCountries); 
                    return;
                }

                try {
                    const searchResults = await CountryService.searchCountry(countrySearch);
                    setFilteredCountries(searchResults);
                } catch (error) {
                    console.error('Error searching country:', error);
                }
            };

            searchCountries();
        }, [categorySearch, allCountries]);
        
        
        useEffect(() => {
            const fetchModelsByBrand = async () => {
                if (!brand) {
                    setFilteredModels([]);
                    setModel(null); // Reset the selected model if no brand is selected
                    return;
                }
        
                try {
                    const response = await BrandService.getModelsByBrand(brand.id); // Adjust API call as needed
                    setModels(response); // Store all models fetched for the brand
                    setFilteredModels(response); // Display fetched models initially
                } catch (error) {
                    console.error('Error fetching models:', error);
                }
            };
        
            fetchModelsByBrand();
        }, [brand]); // Refetch models when the brand changes
        


        const validateForm = () => {
            const titleValid = title.trim().length >= 3;
            const descriptionValid = DOMPurify.sanitize(description).trim().length >= 3;
            const categoryValid = !!category;
            const brandValid = !!brand;
            const countryValid = !!country;

            setError({
                title: !titleValid,
                description: !descriptionValid,
                category: !categoryValid,
                brand: !brandValid,
                country: !countryValid,
            });

            return titleValid && descriptionValid && categoryValid && brandValid && countryValid;
        };

        const handleSubmit = async () => {
            if (!validateForm()) return;

            const showcaseData = {
                title,
                description: DOMPurify.sanitize(description),
                categoryId: category.id,
                brandId: brand.id,
                countryId: country?.id,
            };

            try {
                const response = await ShowcaseService.createShowcase(showcaseData);
                console.log('Showcase created:', response);
                // Navigate to created showcase or show success message
            } catch (error) {
                console.error('Error creating showcase:', error);
            }
        };

        return (
            <Box sx={{ padding: { xs: '1rem', sm: '2rem' }, backgroundColor: theme.palette.background.default }}>
                <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                    <Paper elevation={3} sx={{ padding: '2rem', backgroundColor: theme.palette.background.paper }}>
                        <Typography variant="h4" sx={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                            Create a Showcase
                        </Typography>
                        <Divider sx={{ marginBottom: '2rem' }} />

                        {/* Title Input */}
                        <Typography variant="h6">Title:</Typography>
                        <TextField
                            fullWidth
                            variant="filled"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={error.title}
                            helperText={error.title ? 'Title is required (min 3 characters)' : ''}
                            sx={{ marginBottom: '1.5rem' }}
                        />

                        {/* Description Input */}
                        <Typography variant="h6">Description:</Typography>
                        <TextField
                            fullWidth
                            variant="filled"
                            multiline
                            minRows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            error={error.description}
                            helperText={error.description ? 'Description is required (min 3 characters)' : ''}
                            sx={{ marginBottom: '1.5rem' }}
                        />

                        {/* Category Input */}
                        <Typography variant="h6">Category:</Typography>
                        <Autocomplete
                            options={filteredCategories}
                            getOptionLabel={(option) => option.name}
                            value={category}
                            onChange={(event, newValue) => setCategory(newValue)}
                            inputValue={categorySearch}
                            onInputChange={(event, newInputValue) => setCategorySearch(newInputValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Categories"
                                    variant="filled"
                                    error={error.category}
                                    helperText={error.category ? 'Please select a category' : ''}
                                />
                            )}
                            sx={{ marginBottom: '1.5rem' }}
                        />

                        {/* Brand Input */}
                        <Typography variant="h6">Brand:</Typography>
                        <Autocomplete
                            options={filteredBrands || []}
                            getOptionLabel={(option) => option.name || ''}
                            value={brand}
                            onChange={(event, newValue) => {
                                setBrand(newValue); // Update the selected brand
                                console.log('Selected Brand:', newValue); // Log the selected brand
                            }}
                            inputValue={brandSearch}
                            onInputChange={(event, newInputValue) => setBrandSearch(newInputValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Brands"
                                    variant="filled"
                                    error={error.brand}
                                    helperText={error.brand ? 'Please select a brand' : ''}
                                />
                            )}
                            sx={{ marginBottom: '1.5rem' }}
                        />


                        {/* Country Input */}
                        <Typography variant="h6">Country:</Typography>
                        <Autocomplete
                            options={filteredCountries}
                            getOptionLabel={(option) => option.name}
                            value={country}
                            onChange={(event, newValue) => setCountry(newValue)}
                            inputValue={countrySearch}
                            onInputChange={(event, newInputValue) => setCountrySearch(newInputValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Countries"
                                    variant="filled"
                                    error={error.country}
                                    helperText={error.country ? 'Please select a country' : ''}
                                />
                            )}
                            sx={{ marginBottom: '1.5rem' }}
                        />

                        <Typography variant="h6">Model:</Typography>
                        <Autocomplete
                            options={filteredModels || []}
                            getOptionLabel={(option) => option.name || ''}
                            value={model}
                            onChange={(event, newValue) => setModel(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Model"
                                    variant="filled"
                                    error={!model}
                                    helperText={!model ? 'Please select a model' : ''}
                                />
                            )}
                            sx={{ marginBottom: '1.5rem' }}
                        />


                        <Divider sx={{ marginBottom: '2rem' }} />

                        {/* Submit Button */}
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleSubmit}
                        >
                            Create Showcase
                        </Button>
                    </Paper>
                </Box>
            </Box>
        );
    };

    export default ShowcaseCreateForm;
