import React, { useState } from "react";
import {
    Box,
    TextField,
    Autocomplete,
    Button,
    CircularProgress,
    Typography,
    Collapse,
    IconButton,
} from "@mui/material";
import { ExpandLess, ExpandMore, Clear } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import RoleService from "../configuration/Services/RoleService";

const UserFilterPanel = ({ onApplyFilters, onClearFilters }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(true); // Filter Panel open by default
    const [searchInputs, setSearchInputs] = useState({
        username: "",
        email: "",
        role: "",
    });

    // Fetch roles using react-query
    const { data: roles = [], isLoading: isRoleLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: RoleService.getRoles,
    });

    const handleInputChange = (key, value) => {
        setSearchInputs((prev) => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        if (onApplyFilters) {
            onApplyFilters(searchInputs);
        }
    };

    const handleClearFilters = () => {
        setSearchInputs({ username: "", email: "", role: null });
        if (onClearFilters) {
            onClearFilters();
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: "10px",
                boxShadow: theme.shadows[3],
                padding: "10px",
                marginBottom: "20px",
            }}
        >
            {/* Toggle Button */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                }}
            >
                <Typography variant="body1" fontWeight="bold" color="textSecondary">
                    Filter Users
                </Typography>
                <IconButton onClick={() => setExpanded(!expanded)} size="large">
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            {/* Filter Fields (Collapsible) */}
            <Collapse in={expanded}>
                <Box sx={{ padding: "10px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <TextField
                        label="Username"
                        variant="filled"
                        fullWidth
                        value={searchInputs.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                    />
                    <TextField
                        label="Email"
                        variant="filled"
                        fullWidth
                        value={searchInputs.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                    <Autocomplete
                        options={roles}
                        getOptionLabel={(option) => option.name || ""}
                        loading={isRoleLoading}
                        value={searchInputs.role}
                        onChange={(e, value) =>
                            handleInputChange("role", value ? value.name : "")
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Role" variant="filled" />
                        )}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <Button variant="contained" color="primary" onClick={handleApplyFilters} fullWidth>
                            Apply Filters
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleClearFilters} fullWidth>
                            Clear
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

export default UserFilterPanel;
