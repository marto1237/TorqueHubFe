import React, {useEffect, useState} from 'react';
import {Box, Button, Typography, Grid,Paper,Chip,IconButton,Link,Tooltip,Pagination, Skeleton} from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, Bookmark } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import FilterPanel from '../common/FilterPanel';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';



const QuestionListPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();


    const [selectedTags, setSelectedTags] = useState([]);
    const [noAnswers, setNoAnswers] = useState(false);
    const [noAcceptedAnswer, setNoAcceptedAnswer] = useState(false);
    const [sortOption, setSortOption] = useState('newest'); // Sorting option

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const handleTagClick = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    };

    const [showFilters, setShowFilters] = useState(false); // Toggle filter visibility
    // Toggle the visibility of the filter panel
    const toggleFilterPanel = () => {
        setShowFilters(!showFilters);
    };


    const handleQuestionClick = (questionId) => {
        navigate(`/questions/${questionId}`); // Navigate to the question details page
    };

    const handleAskQuestionClick = () => {
        navigate('/askquestion'); // Navigate to the Ask Question page
    };

    // Filter questions based on selected tags
    const filteredQuestions = selectedTags.length > 0
        ? questions.filter((question) =>
            selectedTags.every((tag) => question.tags.includes(tag))
        )
        : questions; // If no tags selected, show all questions

    const formatTimeAgo = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/questions?page=${page - 1}&size=${pageSize}`);
                setQuestions(response.data.content);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (err) {
                setError('Failed to load questions');
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [page]);


    const handlePageChange = (event, value) => {
        setPage(value);
    };


    return (
        <Box sx={{ padding: '20px', paddingTop: '100px' , backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ maxWidth: '900px', margin: 'auto', minHeight: '60vh'}}>
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
                                    className={
                                        selectedTags.includes(tag)
                                            ? 'Mui-selected'
                                            : 'Mui-unselected'
                                    }
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
                {loading ? (
                    <Grid container spacing={3}>
                        {[...Array(5)].map((_, index) => (
                            <Grid item xs={12} key={index}>
                                <Skeleton variant="rectangular" height={100} />
                            </Grid>
                        ))}
                    </Grid>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (

                    <Grid container spacing={3}>
                        {filteredQuestions.map((question) => (

                            <Grid item xs={12} key={question.id}>
                                <Paper sx={{ padding: '20px', marginBottom: '20px' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                                            <Tooltip title="Upvote">
                                                <IconButton>
                                                    <KeyboardArrowUp />
                                                </IconButton>
                                            </Tooltip>
                                            <Typography variant="body1">{question.votes}</Typography>
                                            <Tooltip title="Downvote">
                                                <IconButton>
                                                    <KeyboardArrowDown />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Bookmark">
                                                <IconButton>
                                                    <Bookmark />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
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
                                                        className={
                                                            selectedTags.includes(tag)
                                                                ? 'Mui-selected'
                                                                : 'Mui-unselected'
                                                        }
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
                )}

                {/* Pagination Component */}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default QuestionListPage;
