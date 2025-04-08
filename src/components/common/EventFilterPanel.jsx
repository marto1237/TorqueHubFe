import React, { useState, useEffect } from "react";
import { Box, TextField, Autocomplete, Button, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import TicketTags from "../configuration/Services/TicketTagsService";
import CarCategoryService from "../configuration/Services/CarCategoryService";

const EventFilterPanel = ({ onFilter, selectedFilters }) => {
    const theme = useTheme();
    const [searchInputs, setSearchInputs] = useState({
        name: "",
        location: "",
        startDate: "",
        endDate: "",
        tagIds: [],
        allowedCarCategoryIds: [],
    });

    // ✅ Move useQuery ABOVE useEffect so variables exist before use
    const { data: tags = [], isLoading: isTagLoading } = useQuery({
        queryKey: ["tags"],
        queryFn: TicketTags.getAllTags,
        select: (data) => data.content,
    });

    const { data: carCategories = [], isLoading: isCarCategoryLoading } = useQuery({
        queryKey: ["carCategories"],
        queryFn: CarCategoryService.getAllCategories,
        select: (data) => data.content,
    });

    // ✅ Now useEffect can safely reference tags & carCategories
    useEffect(() => {
        if (tags.length === 0 || carCategories.length === 0) return;

        const matchedTags = tags.filter(tag =>
            (selectedFilters.tagIds || []).includes(tag.id)
        );
        const matchedCarCats = carCategories.filter(cat =>
            (selectedFilters.allowedCarCategoryIds || []).includes(cat.id)
        );

        setSearchInputs({
            name: selectedFilters.name || "",
            location: selectedFilters.location || "",
            startDate: selectedFilters.startDate || "",
            endDate: selectedFilters.endDate || "",
            tagIds: matchedTags,
            allowedCarCategoryIds: matchedCarCats,
        });
    }, [selectedFilters, tags, carCategories]);
    

    

    const handleInputChange = (key, value) => {
        setSearchInputs((prev) => ({ ...prev, [key]: value }));
    };

    const formatToDateTimeString = (date) => {
        const d = new Date(date);
        return d.toISOString().split(".")[0]; // Trims milliseconds
    };

    const handleApplyFilters = () => {
        const formattedInputs = {
            ...searchInputs,
            tagIds: searchInputs.tagIds.map((tag) => tag.id),
            
            allowedCarCategoryIds: searchInputs.allowedCarCategoryIds.map((cat) => cat.id),
            startDate: searchInputs.startDate ? formatToDateTimeString(searchInputs.startDate) : null,
            endDate: searchInputs.endDate ? formatToDateTimeString(searchInputs.endDate) : null,
        };
        console.log("Sending filter request with:", formattedInputs);
        onFilter(formattedInputs);
    };
    

    return (
        <Box>
                <Box
                    sx={{
                        padding: "20px",
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "10px",
                        boxShadow: theme.shadows[3],
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        marginTop: "10px",
                    }}
                >
                    <TextField label="Event Name" variant="filled" value={searchInputs.name} fullWidth onChange={(e) => handleInputChange("name", e.target.value)} />
                    <TextField label="Location" variant="filled" value={searchInputs.location} fullWidth onChange={(e) => handleInputChange("location", e.target.value)} />

                    <Autocomplete
    options={tags}
    multiple
    value={searchInputs.tagIds}
    getOptionLabel={(option) => option.name || ""}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    loading={isTagLoading}
    onChange={(e, value) => handleInputChange("tagIds", value)}
    renderInput={(params) => (
        <TextField
            {...params}
            label="Tags"
            variant="filled"
            InputProps={{
                ...params.InputProps,
                endAdornment: (
                    <>
                        {isTagLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                    </>
                ),
            }}
        />
    )}
/>

<Autocomplete
    options={carCategories}
    multiple
    value={searchInputs.allowedCarCategoryIds}
    getOptionLabel={(option) => option.name || ""}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    loading={isCarCategoryLoading}
    onChange={(e, value) => handleInputChange("allowedCarCategoryIds", value)}
    renderInput={(params) => (
        <TextField
            {...params}
            label="Allowed Cars"
            variant="filled"
            InputProps={{
                ...params.InputProps,
                endAdornment: (
                    <>
                        {isCarCategoryLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                    </>
                ),
            }}
        />
    )}
/>


                    <Typography variant="body1" fontWeight="bold" color="textSecondary">
                        Date Range:
                    </Typography>
                    <Box sx={{ display: "flex", gap: "10px" }}>
                        <TextField
                            label="Start Date"
                            type="date"
                            variant="filled"
                            fullWidth
                            value={searchInputs.startDate}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            variant="filled"
                            fullWidth
                            value={searchInputs.endDate}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                        />
                    </Box>

                    <Button variant="contained" color="primary" onClick={handleApplyFilters} fullWidth>
                        Apply Filters
                    </Button>
                    
                </Box>
            
        </Box>
    );
};

export default EventFilterPanel;
