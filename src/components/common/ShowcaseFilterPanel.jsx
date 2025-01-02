import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    TextField,
    Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ShowcaseService from "../configuration/Services/ShowcaseService"; // Replace with your actual service call
import { useQuery } from "@tanstack/react-query";

const ShowcaseFilterPanel = ({
    selectedFilters,
    setSelectedFilters,
    onApplyFilters,
}) => {
    const theme = useTheme();

    // Fetch filter options (brands, countries, categories, models)
    const { data: filterOptions = {}, isLoading } = useQuery({
        queryKey: ["showcaseFilters"],
        queryFn: ShowcaseService.getAllFilters, // Replace with your actual service call
        staleTime: 5 * 60 * 1000, // Cache filters for 5 minutes
    });

    // Handle filter changes
    const handleChange = (key, value) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Apply filters
    const handleApplyFilters = () => {
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
            {/* Filter By Section */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {/* Brand Filter */}
                <FormControl fullWidth>
                    <InputLabel id="brand-select-label">Brand</InputLabel>
                    <Select
                        labelId="brand-select-label"
                        value={selectedFilters.brand || ""}
                        onChange={(e) => handleChange("brand", e.target.value)}
                        disabled={isLoading}
                    >
                        {filterOptions.brands?.map((brand) => (
                            <MenuItem key={brand.id} value={brand.id}>
                                {brand.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Model Filter */}
                <FormControl fullWidth>
                    <InputLabel id="model-select-label">Model</InputLabel>
                    <Select
                        labelId="model-select-label"
                        value={selectedFilters.model || ""}
                        onChange={(e) => handleChange("model", e.target.value)}
                        disabled={isLoading}
                    >
                        {filterOptions.models?.map((model) => (
                            <MenuItem key={model.id} value={model.id}>
                                {model.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Category Filter */}
                <FormControl fullWidth>
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                        labelId="category-select-label"
                        value={selectedFilters.category || ""}
                        onChange={(e) => handleChange("category", e.target.value)}
                        disabled={isLoading}
                    >
                        {filterOptions.categories?.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Country Filter */}
                <FormControl fullWidth>
                    <InputLabel id="country-select-label">Country</InputLabel>
                    <Select
                        labelId="country-select-label"
                        value={selectedFilters.country || ""}
                        onChange={(e) => handleChange("country", e.target.value)}
                        disabled={isLoading}
                    >
                        {filterOptions.countries?.map((country) => (
                            <MenuItem key={country.id} value={country.id}>
                                {country.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Additional Filters */}
            <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {/* Manufacturing Year */}
                <TextField
                    label="Manufacturing Year"
                    type="number"
                    variant="filled"
                    value={selectedFilters.manufacturingYear || ""}
                    onChange={(e) =>
                        handleChange("manufacturingYear", e.target.value)
                    }
                    fullWidth
                />

                {/* No Modifications */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectedFilters.noModifications || false}
                            onChange={(e) =>
                                handleChange("noModifications", e.target.checked)
                            }
                        />
                    }
                    label="No Modifications"
                />
            </Box>

            {/* Apply Button */}
            <Box>
                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={handleApplyFilters}
                    fullWidth
                    sx={{ textTransform: "none" }}
                >
                    Apply Filters
                </Button>
            </Box>
        </Box>
    );
};

export default ShowcaseFilterPanel;
