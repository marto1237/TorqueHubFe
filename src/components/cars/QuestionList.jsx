import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Paper, Chip, IconButton, Link, Tooltip, Pagination, Skeleton } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, Bookmark } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import FilterPanel from '../common/FilterPanel';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QuestionService from '../configuration/Services/QuestionService';
import FilterService from '../configuration/Services/FilterService';

const QuestionListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation(); 
    const queryClient = useQueryClient(); // Access queryClient to manage cache

    const [selectedTags, setSelectedTags] = useState([]);
    const [noAnswers, setNoAnswers] = useState(false);
    const [noAcceptedAnswer, setNoAcceptedAnswer] = useState(false);
    const [sortOption, setSortOption] = useState('newest');

    const queryParams = new URLSearchParams(location.search);
    const initialPage = parseInt(queryParams.get('page') || '1', 10);
    const [page, setPage] = useState(initialPage);
    const pageSize = parseInt(queryParams.get('size') || '10', 10);
    const [isFiltering, setIsFiltering] = useState(false);

    // Fetch initial query parameters from the URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlTags = params.getAll('tags');
        const urlNoAnswers = params.get('noAnswers') === 'true';
        const urlNoAcceptedAnswer = params.get('noAcceptedAnswer') === 'true';
        const urlSortOption = params.get('sortOption') || 'newest';
        const urlPage = parseInt(params.get('page') || '1', 10);

        // Update state if URL parameters exist
        if (urlTags.length > 0 || urlNoAnswers || urlNoAcceptedAnswer || urlSortOption !== 'newest') {
            setIsFiltering(true);
            setSelectedTags(urlTags);
            setNoAnswers(urlNoAnswers);
            setNoAcceptedAnswer(urlNoAcceptedAnswer);
            setSortOption(urlSortOption);
            setPage(urlPage);
        }
    }, [location.search]);

    // Function to update the URL with filters
    const updateURLWithFilters = (filters) => {
        const params = new URLSearchParams();
        if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
        if (filters.noAnswers) params.set('noAnswers', filters.noAnswers);
        if (filters.noAcceptedAnswer) params.set('noAcceptedAnswer', filters.noAcceptedAnswer);
        if (filters.sortOption) params.set('sortOption', filters.sortOption);
        params.set('page', 1); // Reset to page 1 on filter change
        navigate({ search: params.toString() });
        setIsFiltering(true);
        queryClient.invalidateQueries('questions');
    };

    const handleClearFilters = () => {
        setSelectedTags([]);
        setNoAnswers(false);
        setNoAcceptedAnswer(false);
        setSortOption('newest');
        setIsFiltering(false);
        setPage(1);
        
        // Clear URL parameters and navigate to base questions page
        navigate('/questions');
        
        // Invalidate queries to trigger refetch
        queryClient.invalidateQueries({
            queryKey: ['allQuestions']
        });
    };
    
    const handleApplyFilters = () => {
        // Create URLSearchParams object
        const params = new URLSearchParams();
        
        // Add all filter parameters to URL
        if (selectedTags.length > 0) {
            selectedTags.forEach(tag => params.append('tags', tag));
        }
        if (noAnswers) params.set('noAnswers', noAnswers);
        if (noAcceptedAnswer) params.set('noAcceptedAnswer', noAcceptedAnswer);
        if (sortOption) params.set('sortOption', sortOption);
        params.set('page', '1'); // Reset to first page when applying filters
        params.set('size', pageSize.toString());

        // Update URL with new parameters
        navigate({ search: params.toString() });
        
        // Set filtering state
        setIsFiltering(true);
        setPage(1); // Reset page to 1 when applying filters
        
        // Invalidate queries to trigger refetch
        queryClient.invalidateQueries({
            queryKey: ['filteredQuestions']
        });
    };
    
    const handleTagClick = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    };


    const handleQuestionClick = (questionId) => {
        navigate(`/questions/${questionId}`);
    };

    const handleAskQuestionClick = () => {
        navigate('/askquestion');
    };

    // Fetch questions using react-query
    const { data, isLoading, error } = useQuery({
        queryKey: isFiltering
            ? ['filteredQuestions', selectedTags, noAnswers, noAcceptedAnswer, sortOption, page - 1, pageSize]
            : ['allQuestions', page - 1, pageSize],
        queryFn: async () => {
            try {
                const response = isFiltering
                    ? await FilterService.filterQuestions(
                          selectedTags,
                          noAnswers,
                          noAcceptedAnswer,
                          sortOption,
                          page - 1,
                          pageSize
                      )
                    : await QuestionService.getAllQuestions(page - 1, pageSize);
                
                console.log("API Response Data:", response);
                return response;
            } catch (error) {
                console.error("API Error:", error);
                throw error;
            }
        },
        keepPreviousData: true, // Keep previous data while loading new data
        staleTime: 0, // Always fetch new data when filters change
        retry: 1, // Only retry failed requests once
    });

    
    
    // Single useEffect to log cached data
    useEffect(() => {
        const cachedData = queryClient.getQueryData(['questions', page, pageSize]);
        console.log("Cached Data (on page load):", cachedData); // Print cached data if exists
    }, [page, pageSize, queryClient]);

    const handlePageChange = (event, value) => {
        setPage(value);
        const params = new URLSearchParams(location.search);
        params.set('page', value);
        navigate({ search: params.toString() });
        
    };

    const formatTimeAgo = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    const formatTextWithTags = (text) => {
        return text
            .replace(/\[b\](.*?)\[\/b\]/g, '<b>$1</b>')
            .replace(/\[i\](.*?)\[\/i\]/g, '<i>$1</i>')
            .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
            .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>');
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ maxWidth: '900px', margin: 'auto', minHeight: '60vh' }}>
                {/* Filter Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Button variant="outlined" onClick={() => setIsFiltering(!isFiltering)} sx={{ fontWeight: 'bold' }}>
                        {isFiltering ? 'Clear Filters' : 'Show Filters'}
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
                {isFiltering && (
                    <FilterPanel
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        noAnswers={noAnswers}
                        setNoAnswers={setNoAnswers}
                        noAcceptedAnswer={noAcceptedAnswer}
                        setNoAcceptedAnswer={setNoAcceptedAnswer}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                        onApplyFilters={handleApplyFilters}
                        page={page}     
                        pageSize={pageSize}
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
                    data && data.content && data.content.length > 0 ?(
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
                                                    dangerouslySetInnerHTML={{ __html: formatTextWithTags(question.title) }}
                                                >
                                                    
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
                    ): (
                        <Typography>No questions found.</Typography>
                    )
                )}

                {/* Pagination Component */}
                {data && data.totalPages > 1 && (
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
