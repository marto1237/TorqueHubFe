import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Chip, Pagination, Skeleton,Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ShowcaseService from '../configuration/Services/ShowcaseService';
import { useTheme, useMediaQuery } from '@mui/material';

const ShowcaseListPage = () => {
    const { userId } = useParams(); // Extract userId from route
    const navigate = useNavigate();
    const theme = useTheme();

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const pageSize = 10;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const storedUserId = JSON.parse(sessionStorage.getItem('userDetails'))?.id; // Retrieve stored userId if available
                const effectiveUserId = userId || storedUserId;

                if (!effectiveUserId) {
                    throw new Error("User ID is missing. Please log in.");
                }

                console.log("Fetching showcases for userId:", effectiveUserId);

                const response = await ShowcaseService.getUserShowcases(effectiveUserId, page - 1, pageSize);
                setData(response);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to fetch showcase data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, page]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleShowcaseClick = (showcaseId) => {
        navigate(`/myshowcase/${showcaseId}`);
    };

    const handleCreateShowcase = () => {
        navigate('/create-showcase'); 
    };


    return (
        <Box
            sx={{
                padding: '20px',
                paddingTop: '100px',
                minHeight: '100vh',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                
            }}
        >
            <Typography variant="h4" gutterBottom>
                Showcases
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleCreateShowcase}
                sx={{ marginBottom: '20px' }}
            >
                Create New Showcase
            </Button>

            {loading ? (
                <Grid container spacing={3}>
                    {[...Array(5)].map((_, index) => (
                        <Grid item xs={12} key={index}>
                            <Skeleton
                                variant="rectangular"
                                height={100}
                                sx={{
                                    backgroundColor: theme.palette.action.hover,
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : data && data.content.length > 0 ? (
                <Grid container spacing={3}>
                    {data.content.map((showcase) => (
                        <Grid item xs={12} key={showcase.id}>
                            <Paper
                                sx={{
                                    padding: '20px',
                                    backgroundColor: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                }}
                                onClick={() => handleShowcaseClick(showcase.id)}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: theme.palette.primary.main,
                                    }}
                                >
                                    {showcase.title}
                                </Typography>
                                <Typography variant="body2" sx={{ marginTop: '10px' }}>
                                    {showcase.description}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: '10px',
                                        flexWrap: 'wrap',
                                        marginTop: '10px',
                                    }}
                                >
                                    {showcase.tags?.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            sx={{
                                                backgroundColor: theme.palette.secondary.light,
                                                color: theme.palette.secondary.contrastText,
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No showcases found.</Typography>
            )}
            {data && data.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Pagination count={data.totalPages} page={page} onChange={handlePageChange} color="primary" />
                </Box>
            )}
        </Box>
    );
};

export default ShowcaseListPage;
