import React, { useState, useCallback } from "react";
import {
    Box,
    Typography,
    FormControl,
    TextField,
    Button,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import BrandService from "../configuration/Services/BrandService";
import ModelService from "../configuration/Services/ModelService";
import CategoryService from "../configuration/Services/CarCategoryService";
import CountryService from "../configuration/Services/CountryService";

const ShowcaseFilterPanel = ({ selectedFilters, setSelectedFilters, onApplyFilters }) => {
    const theme = useTheme();
    const [searchInputs, setSearchInputs] = useState({
        brand: "",
        model: "",
        category: "",
        country: "",
    });

    // Debounce input changes for better performance
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const handleSearchInputChange = useCallback(
        debounce((key, value) => {
            setSearchInputs((prev) => ({ ...prev, [key]: value }));
        }, 300),
        []
    );

    // Fetch options for each filter
    const { data: brands = [], isLoading: isBrandLoading } = useQuery({
        queryKey: ["brands", searchInputs.brand],
        queryFn: () =>
            searchInputs.brand
                ? BrandService.searchBrands(searchInputs.brand)
                : BrandService.getAllBrands(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: modelsData = [], isLoading: isModelLoading } = useQuery({
        queryKey: ["models", selectedFilters?.brandId],
        queryFn: () =>
            selectedFilters?.brandId
                ? ModelService.getModelsByBrandName(selectedFilters.brandName)
                : [],
        enabled: !!selectedFilters?.brandId,
        staleTime: 5 * 60 * 1000,
    });
    const models = modelsData || [];

    const { data: categoriesData = [], isLoading: isCategoryLoading } = useQuery({
        queryKey: ["categories", searchInputs.category],
        queryFn: () =>
            searchInputs.category
                ? CategoryService.searchCategories(searchInputs.category)
                : CategoryService.getAllCategories(),
        staleTime: 5 * 60 * 1000,
    });
    const categories = categoriesData.content || [];

    const { data: countries = [], isLoading: isCountryLoading } = useQuery({
        queryKey: ["countries", searchInputs.country],
        queryFn: () =>
            searchInputs.country
                ? CountryService.searchCountry(searchInputs.country)
                : CountryService.getAllCountries(),
        staleTime: 5 * 60 * 1000,
    });

    const handleTitleChange = (event) => {
        setSelectedFilters((prev) => ({
            ...prev,
            title: event.target.value, // Update title filter
        }));
    };


    // Handle filter changes and log updates
    const handleChange = (key, value) => {
        const id = value ? value.id : null;
        const name = value ? value.name : "";

        console.log(`Updated ${key}:`, { id, name }); // Log updates for debugging

        setSelectedFilters((prev) => ({
            ...prev,
            [`${key}Id`]: id, // Store the ID
            [`${key}Name`]: name, // Optionally store name for debugging
        }));
    };

    // Apply filters and log final filters
    const handleApplyFilters = () => {
        console.log("Final Selected Filters:", selectedFilters); // Log final filters
        onApplyFilters(selectedFilters);
    };

    return (
        <Box
            sx={{
                padding: "20px",
                backgroundColor: theme.palette.background.paper,
                borderRadius: "10px",
                boxShadow: theme.shadows[3],
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
            }}
        >
            <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

                <FormControl fullWidth>
                    <TextField
                        label="Search by Title"
                        variant="filled"
                        value={selectedFilters.title || ""}
                        onChange={handleTitleChange}
                    />
                </FormControl>
                {/* Brand Filter */}
                <FormControl fullWidth>
                    <Autocomplete
                        options={brands}
                        getOptionLabel={(option) => option.name || ""}
                        onInputChange={(e, value) => handleSearchInputChange("brand", value)}
                        value={brands.find((b) => b.id === selectedFilters?.brandId) || null}
                        onChange={(event, newValue) => handleChange("brand", newValue)}
                        loading={isBrandLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search Brand"
                                variant="filled"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isBrandLoading ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </FormControl>

                {/* Model Filter */}
                <FormControl fullWidth>
                    <Autocomplete
                        options={models}
                        getOptionLabel={(option) => option.name || ""}
                        onInputChange={(e, value) => handleSearchInputChange("model", value)}
                        value={models.find((m) => m.id === selectedFilters?.modelId) || null}
                        onChange={(event, newValue) => handleChange("model", newValue)}
                        loading={isModelLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search Model"
                                variant="filled"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isModelLoading ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </FormControl>

                {/* Country Filter */}
                <FormControl fullWidth>
                    <Autocomplete
                        options={countries}
                        getOptionLabel={(option) => option.name || ""}
                        onInputChange={(e, value) => handleSearchInputChange("country", value)}
                        value={countries.find((c) => c.id === selectedFilters?.countryId) || null}
                        onChange={(event, newValue) => handleChange("country", newValue)}
                        loading={isCountryLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search Country"
                                variant="filled"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isCountryLoading ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </FormControl>

                {/* Category Filter */}
                <FormControl fullWidth>
                    <Autocomplete
                        options={categories}
                        getOptionLabel={(option) => option.name || ""}
                        onInputChange={(e, value) => handleSearchInputChange("category", value)}
                        value={categories.find((cat) => cat.id === selectedFilters?.categoryId) || null}
                        onChange={(event, newValue) => handleChange("category", newValue)}
                        loading={isCategoryLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search Category"
                                variant="filled"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isCategoryLoading ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </FormControl>
            </Box>

            <Button variant="contained" color="primary" onClick={handleApplyFilters} fullWidth>
                Apply Filters
            </Button>
        </Box>
    );
};

export default ShowcaseFilterPanel;
