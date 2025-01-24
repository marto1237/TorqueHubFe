import React, { useState, useCallback } from "react";
import {
    Box,
    TextField,
    Autocomplete,
    Button,
    CircularProgress,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import TagService from "../configuration/Services/TagService"; 
import CarCategoryService from "../configuration/Services/CarCategoryService"; 

const EventFilterPanel = ({ selectedFilters, setSelectedFilters, onApplyFilters }) => {
    const theme = useTheme();

    const [searchInputs, setSearchInputs] = useState({
        name: "",
        location: "",
        tag: "",
        carCategory: "",
    });

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

    const { data: tags = [], isLoading: isTagLoading } = useQuery({
        queryKey: ["tags", searchInputs.tag],
        queryFn: () =>
            searchInputs.tag
                ? TagService.searchTags(searchInputs.tag)
                : TagService.getAllTags(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: carCategories = [], isLoading: isCarCategoryLoading } = useQuery({
        queryKey: ["carCategories", searchInputs.carCategory],
        queryFn: () =>
            searchInputs.carCategory
                ? CarCategoryService.searchCarCategories(searchInputs.carCategory)
                : CarCategoryService.getAllCarCategories(),
        staleTime: 5 * 60 * 1000,
    });

    const handleChange = (key, value) => {
        const id = value ? value.id : null;
        const name = value ? value.name : "";

        setSelectedFilters((prev) => ({
            ...prev,
            [`${key}Id`]: id,
            [`${key}Name`]: name,
        }));
    };

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
                display: "flex",
                flexDirection: "column",
                gap: "20px",
            }}
        >
            {/* Name Filter */}
            <TextField
                label="Event Name"
                variant="filled"
                fullWidth
                onChange={(e) => handleSearchInputChange("name", e.target.value)}
            />

            {/* Location Filter */}
            <TextField
                label="Location"
                variant="filled"
                fullWidth
                onChange={(e) => handleSearchInputChange("location", e.target.value)}
            />

            {/* Tag Filter */}
            <Autocomplete
                options={tags}
                getOptionLabel={(option) => option.name || ""}
                loading={isTagLoading}
                onInputChange={(e, value) => handleSearchInputChange("tag", value)}
                onChange={(event, newValue) => handleChange("tag", newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Tags"
                        variant="filled"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isTagLoading ? (
                                        <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />

            {/* Allowed Cars Filter */}
            <Autocomplete
                options={carCategories}
                getOptionLabel={(option) => option.name || ""}
                loading={isCarCategoryLoading}
                onInputChange={(e, value) => handleSearchInputChange("carCategory", value)}
                onChange={(event, newValue) => handleChange("carCategory", newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Allowed Cars"
                        variant="filled"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isCarCategoryLoading ? (
                                        <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />

            {/* Date Range Filter */}
            <Typography variant="subtitle1">Date Range:</Typography>
            <Box sx={{ display: "flex", gap: "10px" }}>
                <TextField
                    label="Start Date"
                    type="date"
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) =>
                        setSelectedFilters((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                />
                <TextField
                    label="End Date"
                    type="date"
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) =>
                        setSelectedFilters((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                />
            </Box>

            {/* Apply Filters Button */}
            <Button variant="contained" color="primary" onClick={handleApplyFilters} fullWidth>
                Apply Filters
            </Button>
        </Box>
    );
};

export default EventFilterPanel;
