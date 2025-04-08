import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    const [showFilters, setShowFilters] = useState(false); // Toggle filter panel visibility
    const [filters, setFilters] = useState({
        title: "",
        brandId: null,
        modelId: null,
        categoryId: null,
        countryId: null,
        sortOption: "newest",
    });
    
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const initialPage = parseInt(queryParams.get("page") || "0", 10);
    const initialSize = parseInt(queryParams.get("size") || "9", 10);

    const [page, setPage] = useState(0); // Pagination
    const [size, setSize] = useState(initialSize);
    const [totalPages, setTotalPages] = useState(1);

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
                setIsFiltering(false);
            } catch (err) {
                console.error("Error fetching showcases:", err);
                setError("Failed to load showcases.");
            } finally {
                setLoading(false);
            }
        };

        fetchShowcases();
    }, [page, size, isFiltering]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlFilters = {
            title: params.get("title") || "",
            brandId: params.get("brandId"),
            modelId: params.get("modelId"),
            categoryId: params.get("categoryId"),
            countryId: params.get("countryId"),
            sortOption: params.get("sortOption") || "newest",
        };
    
        const hasFilters = Object.values(urlFilters).some((val) => val);
        setFilters(urlFilters);
        setIsFiltering(hasFilters); // ✅ retain filtering state
    
        const urlPage = parseInt(params.get("page") || "0", 10);
        const urlSize = parseInt(params.get("size") || "9", 10);
        setPage(urlPage);
        setSize(urlSize);
    
    }, [location.search]);
    
    
    // Fetch filtered showcases
    const handleApplyFilters = async () => {
        const newPage = 0;
        setPage(newPage);
        setLoading(true);
        setShowcases([]); // Clear current view to prevent flashes
    
        try {
            const validFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== null && value !== "")
            );
    
            updateURLParams(newPage, size, filters); // 👈 move this here
    
            const response = await ShowcaseFilterService.filterShowcases(validFilters, newPage, size);
            console.log("Filtered showcases response:", response); // Debugging log
            const filteredWithImages = await Promise.all(
                response.content.map(async (showcase) => {
                    const imageUrl = await getFirebaseImage(showcase.id);
                    return { ...showcase, image: imageUrl };
                })
            );
    
            setShowcases(filteredWithImages);
            setTotalPages(response.totalPages);
            setIsFiltering(true);
            setError(null);
        } catch (err) {
            console.error("Error fetching filtered showcases:", err);
            setError("Failed to load filtered showcases.");
            isFiltering(false); // Reset filtering state on error
            setShowcases([]);
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

    const updateURLParams = (newPage, newSize, currentFilters = filters) => {
        const params = new URLSearchParams();
    
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (
                value !== null &&
                value !== "" &&
                !key.endsWith("Name") // 🛠️ Exclude 'countryName', 'brandName', etc.
            ) {
                params.set(key, value);
            }
        });
        
    
        params.set("page", newPage + 1); // URL is 1-based
        params.set("size", newSize);
        navigate({ search: params.toString() });
    };
    


    // Handle pagination
    const handlePageChange = (event, value) => {
        const zeroBasedPage = value - 1;
        setPage(zeroBasedPage);
        updateURLParams(zeroBasedPage, size, filters);
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

    if (loading ) {
        return <LoadingComponent />;
    }
    
    if (!loading && showcases.length === 0 && isFiltering) {
        return (
            <Box
                sx={{
                    padding: "20px",
                    paddingTop: "100px",
                    minHeight: "100vh",
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                {/* Filter toggle + panel still shown */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            if (isFiltering) {
                                handleClearFilters();
                                setShowFilters(false);
                            } else {
                                setIsFiltering(true);
                                setShowFilters(true);
                            }
                        }}
                        sx={{ fontWeight: 'bold' }}
                    >
                        {isFiltering ? 'Clear Filters' : 'Show Filters'}
                    </Button>
                </Box>
    
                {showFilters && isFiltering && (
                    <ShowcaseFilterPanel
                        selectedFilters={filters}
                        setSelectedFilters={setFilters}
                        onApplyFilters={(updatedFilters) => {
                            setFilters(updatedFilters);
                            handleApplyFilters(updatedFilters);
                        }}
                    />
                )}
    
                {/* No results message */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "50vh",
                        textAlign: "center",
                        color: "gray",
                    }}
                >
                    <Typography variant="h5" color="error" gutterBottom>
                        🚫 No results found for the applied filters.
                    </Typography>
                    <Typography variant="body1">Try changing your filter criteria.</Typography>
                </Box>
            </Box>
        );
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
                    onClick={() => {
                        if (isFiltering) {
                            handleClearFilters();
                            setShowFilters(false);
                        } else {
                            setIsFiltering(true);
                            setShowFilters(true);
                        }
                    }}
                    sx={{ fontWeight: 'bold' }}
                >
                    {isFiltering ? 'Clear Filters' : 'Show Filters'}
                </Button>

            </Box>

            {/* Filter Panel */}
            {showFilters && isFiltering && (
                <ShowcaseFilterPanel
                    selectedFilters={filters}
                    setSelectedFilters={setFilters}
                    onApplyFilters={(updatedFilters) => {
                        setFilters(updatedFilters); // ✅ Save to parent
                        handleApplyFilters(updatedFilters); // ✅ Then apply
                      }}
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
                    siblingCount={1}         // Number of pages shown on each side of the current page
                    boundaryCount={1}        // Number of pages always shown at the beginning and end
                    showFirstButton
                    showLastButton
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default Showcase;
