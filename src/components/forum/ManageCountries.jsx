import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Chip,
    Divider,
    IconButton,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppNotifications } from '../common/NotificationProvider';
import CountryService from '../configuration/Services/CountryService';

const ITEMS_PER_PAGE = 10; // Number of countries to show per page

const CountryManagementPage = () => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    const [countries, setCountries] = useState([]);
    const [countryName, setCountryName] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [search, setSearch] = useState('');
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New state for delete dialog
    const [countryToDelete, setCountryToDelete] = useState(null); // Store selected country to delete

    // Fetch all countries

    useEffect(() => {
        const fetchTopCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await CountryService.getAllCountries();
                setCountries(response); // Default to top countries initially
            } catch (error) {
                notifications.show('Failed to fetch top countries', { autoHideDuration: 3000, severity: 'error' });
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchTopCountries();
    }, []);


    const handleSearch = async () => {
        if (!search.trim()) {
            notifications.show('Search query is empty', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        setLoadingCountries(true);
        try {
            const response = await CountryService.searchCountry(search);
            setCountries(response);
            setCurrentPage(1); // Reset to first page on search
        } catch (error) {
            notifications.show('Failed to search countries', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            setLoadingCountries(false);
        }
    };

    // Filtered countries based on search
    const filteredCountries = useMemo(() => {
        return countries.filter(country =>
            country.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [countries, search]);

    // Paginate filtered countries
    const paginatedCountries = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCountries.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCountries, currentPage]);

    const handleCreateOrUpdate = async () => {
        if (!countryName.trim()) {
            notifications.show('Country name is required', { autoHideDuration: 3000, severity: 'warning' });
            return;
        }

        try {
            if (selectedCountry) {
                console.log(selectedCountry);
                console.log(countryName);
                await CountryService.updateCountry({ id: selectedCountry.id, name: countryName });
                setCountries(countries.map(country =>
                    country.id === selectedCountry.id ? { ...country, name: countryName } : country
                ));
                notifications.show('Country updated successfully!', { autoHideDuration: 3000, severity: 'success' });
            } else {
                const newCountry = await CountryService.createCountry({ name: countryName });
                setCountries([...countries, newCountry]);
                notifications.show('Country created successfully!', { autoHideDuration: 3000, severity: 'success' });
            }
        } catch (error) {
            notifications.show(
                selectedCountry ? 'Failed to update country' : 'Failed to create country',
                {autoHideDuration: 3000, severity: 'error' }
            );
        } finally {
            setCountryName('');
            setSelectedCountry(null);
        }
    };

    const handleEdit = country => {
        setSelectedCountry(country);
        setCountryName(country.name);
    };

    const openDeleteDialog = (country) => {
        setCountryToDelete(country);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setCountryToDelete(null);
    };

    const handleDeleteCountry = async () => {
        if (!countryToDelete) return;

        try {
            await CountryService.deleteCountry(countryToDelete.id);
            setCountries((prev) => prev.filter((c) => c.id !== countryToDelete.id));
            notifications.show('Country deleted successfully!', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Failed to delete country', { autoHideDuration: 3000, severity: 'error' });
        } finally {
            closeDeleteDialog();
        }
    };

    return (
        <Box
            sx={{
                padding: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                paddingTop: { xs: '4rem', sm: '6rem', md: '8rem' },
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
            }}
        >
            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: { xs: '1rem', md: '2rem' },
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '8px',
                        boxShadow: theme.shadows[3],
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            textAlign: 'center',
                        }}
                    >
                        Country Management
                    </Typography>
                    <Divider sx={{ mb: '1.5rem' }} />

                    {/* Search Box */}
                    <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TextField
                            label="Search Countries"
                            fullWidth
                            variant="filled"
                            placeholder="Search by country name"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            startIcon={<SearchIcon />}
                        >
                            Search
                        </Button>
                    </Box>

                    {/* Country Input */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <TextField
                            label="Country Name"
                            fullWidth
                            variant="filled"
                            placeholder="Enter a country name"
                            value={countryName}
                            onChange={e => setCountryName(e.target.value)}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleCreateOrUpdate}
                            sx={{ marginLeft: '0.5rem' }}
                        >
                            {selectedCountry ? <EditIcon /> : <AddCircleOutlineIcon />}
                        </IconButton>
                    </Box>

                    {/* Countries List */}
                    {loadingCountries ? (
                        <Typography>Loading countries...</Typography>
                    ) : (
                        <Box
                            sx={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr 1fr', // 2 columns on small screens
                                    sm: '1fr 1fr 1fr', // 3 columns on medium screens
                                    md: '1fr 1fr 1fr 1fr', // 4 columns on large screens
                                },
                                gap: '0.5rem',
                            }}
                        >
                            {paginatedCountries.map((country) => (
                                <Chip
                                    key={country.id}
                                    label={country.name}
                                    sx={{
                                        padding: '0.5rem',
                                        fontSize: { xs: '0.8rem', sm: '1rem' },
                                        justifyContent: 'space-between',
                                    }}
                                    onClick={() => handleEdit(country)}
                                    onDelete={() => openDeleteDialog(country)}
                                    deleteIcon={<DeleteIcon />}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Pagination */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '1rem',
                        }}
                    >
                        <Pagination
                            count={Math.ceil(filteredCountries.length / ITEMS_PER_PAGE)}
                            page={currentPage}
                            onChange={(event, page) => setCurrentPage(page)}
                            color="primary"
                        />
                    </Box>
                </Paper>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the country <b>{countryToDelete?.name}</b>? This action cannot
                        be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteCountry} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CountryManagementPage;
