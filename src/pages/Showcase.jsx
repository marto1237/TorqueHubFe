import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    Typography,
    Grid,
    CardMedia,
    Button,
    Pagination,
    Fade,
    Divider,
    IconButton,
} from "@mui/material";
import { Visibility, Comment, FilterList, FilterListOff } from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import ShowcaseFilterPanel from "../components/common/ShowcaseFilterPanel";
import ShowcaseService from "../components/configuration/Services/ShowcaseService";
import ShowcaseFilterService from "../components/configuration/Services/ShowcaseFilterService";
import LoadingComponent from '../components/common/Loader';

const Showcase = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [showcases, setShowcases] = useState([]); // Showcase data (filtered or all)
    const [hoveredCard, setHoveredCard] = useState(null); // Track hover state
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [isFiltering, setIsFiltering] = useState(false); // Filter toggle
    const [showFilters, setShowFilters] = useState(true); // Toggle filter panel visibility
    const [filters, setFilters] = useState({
        title: "",
        brandId: null,
        modelId: null,
        categoryId: null,
        countryId: null,
        sortOption: "newest",
    });
    const [page, setPage] = useState(0); // Pagination
    const [totalPages, setTotalPages] = useState(1);
    const size = 9;
    const navigate = useNavigate();

    const handleShowcaseClick = (id) => {
        navigate(`/car/${id}`); // Navigate to car detail page
    };

    // Fetch all showcases (default view)
    useEffect(() => {
        const fetchShowcases = async () => {
            if (isFiltering) return; // Skip fetching all if filtering
            setLoading(true);
            try {
                const response = await ShowcaseService.getAllShowcases(page, size);
                const showcasesWithImages = await Promise.all(
                    response.content.map(async (showcase) => {
                        const imageUrl = await getFirebaseImage(showcase.id);
                        return { ...showcase, image: imageUrl, views: showcase.views };
                    })
                );
                setShowcases(showcasesWithImages);
                setTotalPages(response.totalPages);
            } catch (err) {
                console.error("Error fetching showcases:", err);
                setError("Failed to load showcases.");
            } finally {
                setLoading(false);
            }
        };

        fetchShowcases();
    }, [page, size, isFiltering]);

    // Fetch filtered showcases
    const handleApplyFilters = async () => {
        setLoading(true);
        try {
            // Remove null or empty filters from the request
            const validFilters = Object.fromEntries(
                Object.entries(filters).filter(
                    ([_, value]) => value !== null && value !== ""
                )
            );

            const params = new URLSearchParams({
                ...validFilters,
                page,
                size,
            });

            const apiUrl = `http://localhost:8082/showcases/filter?${params.toString()}`;
            console.log("Generated Filter API URL:", apiUrl);

            const response = await ShowcaseFilterService.filterShowcases(validFilters, page, size);
            const filteredWithImages = await Promise.all(
                response.content.map(async (showcase) => {
                    const imageUrl = await getFirebaseImage(showcase.id);
                    return { ...showcase, image: imageUrl };
                })
            );

            // Update the showcase data with the filtered results
            setShowcases(filteredWithImages);
            setTotalPages(response.totalPages);
            setIsFiltering(true);
        } catch (err) {
            console.error("Error fetching filtered showcases:", err);
            setError("Failed to load filtered showcases.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Firebase image
    const getFirebaseImage = async (showcaseId) => {
        try {
            const storage = getStorage();
            const folderRef = ref(storage, `showcaseImages/${showcaseId}/`);
            const folderContents = await listAll(folderRef);
            if (folderContents.items.length > 0) {
                const firstImageRef = folderContents.items[0];
                return await getDownloadURL(firstImageRef);
            }
            return "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500";
        } catch {
            return "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500";
        }
    };

    // Handle pagination
    const handlePageChange = (event, value) => {
        const zeroBasedPage = value - 1;
        setPage(zeroBasedPage);
    };

    // Clear filters and reload all showcases
    const handleClearFilters = () => {
        setIsFiltering(false);
        setFilters({
            title: "",
            brandId: null,
            modelId: null,
            categoryId: null,
            countryId: null,
            sortOption: "newest",
        });
        setPage(0);
    };

    if (loading || showcases.length === 0) {
        return <LoadingComponent />;
    }
    

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box
            sx={{
                padding: "20px",
                paddingTop: "100px",
                minHeight: "100vh",
                backgroundColor: theme.palette.background.paper,
            }}
        >
            {/* Toggle Show/Hide Filters */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 2,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={isFiltering ? handleClearFilters : () => setIsFiltering(true)}
                    sx={{ fontWeight: "bold" }}
                >
                    {isFiltering ? "Clear Filters" : "Show Filters"}
                </Button>

                <IconButton
                    onClick={() => setShowFilters(!showFilters)}
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                >
                    {showFilters ? <FilterListOff /> : <FilterList />}
                </IconButton>
            </Box>

            {/* Filter Panel */}
            {showFilters && isFiltering && (
                <ShowcaseFilterPanel
                    selectedFilters={filters}
                    setSelectedFilters={setFilters}
                    onApplyFilters={handleApplyFilters}
                />
            )}

            {/* Showcase Grid */}
            <Grid container spacing={3}>
                {showcases.map((car) => (
                    <Grid item xs={12} sm={6} md={4} key={car.id}>
                        <Card
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: 3,
                                cursor: "pointer",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    transition: "0.3s ease-in-out",
                                },
                            }}
                            onClick={() => handleShowcaseClick(car.id)}
                            onMouseEnter={() => setHoveredCard(car.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <CardMedia
                                component="img"
                                image={car.image}
                                alt={car.make}
                                sx={{ height: "200px", objectFit: "cover" }}
                            />
                            <Box sx={{ padding: "15px" }}>
                    {/* Title */}
                    <Typography variant="h6" gutterBottom>
                        {car.title}
                    </Typography>

                    {/* Model and Brand */}
                    <Typography variant="body1" color="textSecondary">
                        {car.model?.name} ({car.brand?.name})
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {car.description}
                    </Typography>
                </Box>
                            <Fade in={hoveredCard === car.id}>
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                                        color: "white",
                                        padding: "10px",
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">{car.user}</Typography>
                                        <Typography variant="body2">{car.postDate}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box display="flex" justifyContent="space-between">
                                        <Box display="flex" alignItems="center">
                                            <Visibility sx={{ marginRight: "5px" }} />
                                            <Typography variant="body2">{car.views}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Comment sx={{ marginRight: "5px" }} />
                                            <Typography variant="body2">{car.commentsCount}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Fade>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default Showcase;
