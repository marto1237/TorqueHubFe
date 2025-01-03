import React, { useState, useMemo, useCallback  } from "react";
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
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import BrandService from "../configuration/Services/BrandService";

const ShowcaseFilterPanel = ({
    selectedFilters,
    setSelectedFilters,
    onApplyFilters,
}) => {
    const theme = useTheme();
    const [brandSearch, setBrandSearch] = useState("");

    // Debounced brand search with caching
    const { data: brandOptions = [], isLoading: isBrandLoading } = useQuery({
        queryKey: ["brands", brandSearch],
        queryFn: () => BrandService.searchBrands(brandSearch),
        enabled: !!brandSearch, // Trigger only when there's input
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Debounce function to reduce API calls
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const handleBrandSearch = useCallback(
        debounce((value) => setBrandSearch(value), 300),
        [] // Empty dependencies ensure the debounce function doesn't recreate
    );

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
            <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {/* Dynamic Brand Filter */}
                {/* Brand Search Dropdown */}
            <FormControl fullWidth>
            <Autocomplete
                options={brandOptions}
                getOptionLabel={(option) => option.name || ""}
                onInputChange={(e, value) => handleBrandSearch(value)} // Trigger brand search
                value={selectedFilters.brand || null}
                onChange={(event, newValue) =>
                    handleChange("brand", newValue ? newValue.id : null)
                }
                loading={isBrandLoading}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search Brand"
                        placeholder="Type to search brands"
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
                    <InputLabel>Model</InputLabel>
                    <Select
                        value={selectedFilters.model || ""}
                        onChange={(e) => handleChange("model", e.target.value)}
                    >
                        <MenuItem value="" disabled>
                            Select a Model
                        </MenuItem>
                        {/* Example: Replace with API data */}
                        <MenuItem value="model1">Model 1</MenuItem>
                        <MenuItem value="model2">Model 2</MenuItem>
                    </Select>
                </FormControl>

                {/* Country Filter */}
                <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                        value={selectedFilters.country || ""}
                        onChange={(e) => handleChange("country", e.target.value)}
                    >
                        <MenuItem value="" disabled>
                            Select a Country
                        </MenuItem>
                        {/* Example: Replace with API data */}
                        <MenuItem value="US">United States</MenuItem>
                        <MenuItem value="JP">Japan</MenuItem>
                    </Select>
                </FormControl>

                {/* Category Filter */}
                <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={selectedFilters.category || ""}
                        onChange={(e) => handleChange("category", e.target.value)}
                    >
                        <MenuItem value="" disabled>
                            Select a Category
                        </MenuItem>
                        {/* Example: Replace with API data */}
                        <MenuItem value="SUV">SUV</MenuItem>
                        <MenuItem value="Sedan">Sedan</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Year Filters */}
            <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
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

            {/* Apply Filters Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleApplyFilters}
                fullWidth
            >
                Apply Filters
            </Button>
        </Box>
    );
};

export default ShowcaseFilterPanel;
