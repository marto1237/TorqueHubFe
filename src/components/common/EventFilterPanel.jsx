import React, { useState } from "react";
import { Box, TextField, Autocomplete, Button, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import TicketTags from "../configuration/Services/TicketTagsService";
import CarCategoryService from "../configuration/Services/CarCategoryService";

const EventFilterPanel = ({ onFilter }) => {
    const theme = useTheme();
    const [isPanelVisible, setIsPanelVisible] = useState(false); // Default: Hidden
    const [searchInputs, setSearchInputs] = useState({
        name: "",
        location: "",
        startDate: "",
        endDate: "",
        tagIds: [],
        allowedCarCategoryIds: [],
    });

    const handleClearFilters = () => {
        setSearchInputs({
            name: "",
            location: "",
            startDate: "",
            endDate: "",
            tagIds: [],
            allowedCarCategoryIds: [],
        });
        onFilter({});
    };
    

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
            startDate: searchInputs.startDate ? formatToDateTimeString(searchInputs.startDate) : null,
            endDate: searchInputs.endDate ? formatToDateTimeString(searchInputs.endDate) : null,
        };
        console.log("Sending filter request with:", formattedInputs);
        onFilter(formattedInputs); // Call the correct function
    };

    return (
        <Box>
            {/* Toggle Button */}
            <Button variant="contained" onClick={() => setIsPanelVisible((prev) => !prev)} fullWidth>
                {isPanelVisible ? "Hide Filters" : "Show Filters"}
            </Button>

            {isPanelVisible && (
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
                    <TextField label="Event Name" variant="filled" fullWidth onChange={(e) => handleInputChange("name", e.target.value)} />
                    <TextField label="Location" variant="filled" fullWidth onChange={(e) => handleInputChange("location", e.target.value)} />

                    <Autocomplete
                        options={tags}
                        getOptionLabel={(option) => option.name || ""}
                        loading={isTagLoading}
                        onChange={(e, value) => handleInputChange("tagIds", value ? [value.id] : [])}
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
                        getOptionLabel={(option) => option.name || ""}
                        loading={isCarCategoryLoading}
                        onChange={(e, value) => handleInputChange("allowedCarCategoryIds", value ? [value.id] : [])}
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
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            variant="filled"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                        />
                    </Box>

                    <Button variant="contained" color="primary" onClick={handleApplyFilters} fullWidth>
                        Apply Filters
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleClearFilters} fullWidth>
                        Clear Filters
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default EventFilterPanel;
