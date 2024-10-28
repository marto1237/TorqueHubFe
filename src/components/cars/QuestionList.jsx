import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Paper, Chip, IconButton, Link, Tooltip, Pagination, Skeleton } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, Bookmark } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import FilterPanel from '../common/FilterPanel';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QuestionService from '../configuration/Services/QuestionService';

const QuestionListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // Access queryClient to manage cache

    const [selectedTags, setSelectedTags] = useState([]);
    const [noAnswers, setNoAnswers] = useState(false);
    const [noAcceptedAnswer, setNoAcceptedAnswer] = useState(false);
    const [sortOption, setSortOption] = useState('newest');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const handleTagClick = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    };

    const [showFilters, setShowFilters] = useState(false);

    const toggleFilterPanel = () => {
        setShowFilters(!showFilters);
    };

    const handleQuestionClick = (questionId) => {
        navigate(`/questions/${questionId}`);
    };

    const handleAskQuestionClick = () => {
        navigate('/askquestion');
    };

    // Fetch questions using react-query
    const { data, isLoading, error } = useQuery({
        queryKey: ['questions', page],
        queryFn: async () => {
            const cachedData = queryClient.getQueryData(['questions', page]); // Check for cached data
            if (cachedData) {
                console.log("Using cached data for page:", page);
            }
    
            try {
                const response = await QuestionService.getAllQuestions(page - 1, pageSize);
                console.log("API Response Data:", response); // Log API response
    
                // Set the query data into the cache manually after successful API fetch
                queryClient.setQueryData(['questions', page], response);
                console.log("Data cached for page:", page, response); // Log cache insertion
    
                return response;
            } catch (apiError) {
                console.error("API failed:", apiError);
                
                // If the API fails, fallback to using cached data if available
                if (cachedData) {
                    console.warn("API failed, using cached data:", cachedData);
                    return cachedData; // Return cached data if available
                }
    
                // If no cached data is available, throw an error
                throw new Error("API failed and no cached data available.");
            }
        }
    });
    
    
    // Single useEffect to log cached data
    useEffect(() => {
        const cachedData = queryClient.getQueryData(['questions', page]);
        console.log("Cached Data (on page load):", cachedData); // Print cached data if exists
    }, [page, queryClient]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const formatTimeAgo = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ maxWidth: '900px', margin: 'auto', minHeight: '60vh' }}>
                {/* Filter Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Button
                        variant="outlined"
                        onClick={toggleFilterPanel}
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAskQuestionClick}
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Ask Question
                    </Button>
                </Box>

                {/* Conditionally render Filter Panel based on toggle */}
                {showFilters && (
                    <FilterPanel
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        noAnswers={noAnswers}
                        setNoAnswers={setNoAnswers}
                        noAcceptedAnswer={noAcceptedAnswer}
                        setNoAcceptedAnswer={setNoAcceptedAnswer}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                    />
                )}

                {/* Render selected tags */}
                {selectedTags.length > 0 && (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography variant="body2" color="primary">Selected Tags:</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {selectedTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={selectedTags.includes(tag) ? 'Mui-selected' : 'Mui-unselected'}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 0.8, // Adds a hover effect
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Render questions or loading/skeleton */}
                {isLoading ? (
                    <Grid container spacing={3}>
                        {[...Array(5)].map((_, index) => (
                            <Grid item xs={12} key={index}>
                                <Skeleton variant="rectangular" height={100} />
                            </Grid>
                        ))}
                    </Grid>
                ) : error ? (
                    <Typography color="error">{error.message}</Typography>
                ) : (
                    data && (
                        <Grid container spacing={3}>
                            {data.content.map((question) => (
                                <Grid item xs={12} key={question.id}>
                                    <Paper sx={{ padding: '20px', marginBottom: '20px' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={10} sm={11}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                    onClick={() => handleQuestionClick(question.id)}
                                                >
                                                    {question.title}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                                    {question.tags.map((tag, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={tag}
                                                            onClick={() => handleTagClick(tag)}
                                                            className={selectedTags.includes(tag) ? 'Mui-selected' : 'Mui-unselected'}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    opacity: 0.8, // Adds a hover effect
                                                                },
                                                            }}
                                                        />
                                                    ))}
                                                </Box>

                                                <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="caption">
                                                        {question.votes} votes | {question.totalAnswers} answers | {question.views} views
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Asked by{' '}
                                                        <Link href={`/user/${question.userName}`} color="primary">
                                                            {question.userName} ({question.userPoints})
                                                        </Link>{' '}
                                                        {formatTimeAgo(question.askedTime)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )
                )}

                {/* Pagination Component */}
                {data && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination
                            count={data.totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default QuestionListPage;
