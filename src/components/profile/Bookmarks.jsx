import React, { useState } from 'react';
import {
    Box, Grid, Typography, Card, Button, Divider, Chip, ButtonGroup, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, TextField, IconButton, Pagination
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Bookmark, CheckCircle, Delete,  Search  } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import BookmarkService from '../configuration/Services/BookmarkService';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const ProfilePage = () => {
    const theme = useTheme();
    const { id } = useParams();
    const navigate = useNavigate(); 

    const handleQuestionClick = (id) => {
        navigate(`/questions/${id}`); 
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [sortOption, setSortOption] = useState('Score'); // Default sort by Score
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('questions');
    const [currentPage, setCurrentPage] = useState(1);
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const itemsPerPage = 10;

    // Fetch bookmarked questions
    const { data: bookmarkedQuestions = [], isLoading: questionsLoading } = useQuery({
        queryKey: ['bookmarkedQuestions', id],
        queryFn: () => BookmarkService.getUserBookmarkedQuestions(id),
        staleTime: 5 * 60 * 1000,
        onSuccess: (data) => {
            console.log('Bookmarked Questions Response:', data);
        },
        onError: (error) => {
            console.error('Error fetching bookmarked questions:', error);
        },
    });

    // Fetch bookmarked answers
    const { data: bookmarkedAnswers = [], isLoading: answersLoading } = useQuery({
        queryKey: ['bookmarkedAnswers', id],
        queryFn: () => BookmarkService.getUserBookmarkedAnswers(id),
        staleTime: 5 * 60 * 1000,
        onSuccess: (data) => {
            console.log('Bookmarked Answers Response:', data);
        },
        onError: (error) => {
            console.error('Error fetching bookmarked answers:', error);
        },
    });

    useEffect(() => {
        // Combine and filter posts based on filterOption
        const combinedPosts = [];

        if (filterOption === 'questions' || filterOption === 'all') {
            combinedPosts.push(
                ...(bookmarkedQuestions.content || []).map((q) => ({
                    id: q.id,
                    title: q.title,
                    votes: q.votes,
                    answers: q.totalAnswers,
                    views: q.views || '0',
                    tags: q.tags || [],
                    user: q.username,
                    dateAsked: q.askedTime,
                    type: 'question',
                }))
            );
        }

        if (filterOption === 'answers' || filterOption === 'all') {
            combinedPosts.push(
                ...(bookmarkedAnswers.content || []).map((a) => ({
                    id: a.id,
                    title: a.text,
                    votes: a.votes,
                    answers: null,
                    views: 'N/A',
                    tags: [],
                    user: a.username,
                    dateAsked: a.postedTime,
                    type: 'answer',
                }))
            );
        }

        setBookmarkedPosts(combinedPosts);
    }, [bookmarkedQuestions, bookmarkedAnswers, filterOption]);

    // Delete confirmation dialog handling
    const handleDeleteClick = (post) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        // Remove the post from bookmarkedPosts
        setBookmarkedPosts(bookmarkedPosts.filter(post => post.id !== postToDelete.id));
        setDeleteDialogOpen(false);
        setPostToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setPostToDelete(null);
    };

    // Sorting handling
    const handleSort = (option) => {
        setSortOption(option);
        let sortedPosts = [...bookmarkedPosts];

        switch (option) {
            case 'Score':
                sortedPosts.sort((a, b) => b.votes - a.votes);
                break;
            case 'Activity':
                sortedPosts.sort((a, b) => (b.answers || 0) - (a.answers || 0));
                break;
            case 'Views':
                sortedPosts.sort((a, b) => parseInt(b.views || '0') - parseInt(a.views || '0'));
                break;
            case 'Newest':
                sortedPosts.sort((a, b) => new Date(b.dateAsked) - new Date(a.dateAsked));
                break;
            case 'Oldest':
                sortedPosts.sort((a, b) => new Date(a.dateAsked) - new Date(b.dateAsked));
                break;
            default:
                break;
        }

        setBookmarkedPosts(sortedPosts);
    };

    // Search function
    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on search
    };

    // Pagination logic
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;

    // Filter and search logic
    const filteredPosts = bookmarkedPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    const isLoading = questionsLoading || answersLoading;


    return (
        <Box sx={{padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            <Card sx={{ padding: '20px', mb: 3 }}>
                <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                    Saved Items ({filteredPosts.length}) {/* Bookmark Counter */}
                </Typography>

                {/* Search Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <TextField
                        variant="filled"
                        label="Search"
                        size="small"
                        className="inputField"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flex: 1, marginRight: '15px', maxWidth: '400px' }}
                    />
                    <IconButton color="primary" onClick={handleSearch}>
                        <Search />
                    </IconButton>
                </Box>

                {/* Sorting Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <ButtonGroup>
                        <Button onClick={() => handleSort('Score')}>Score</Button>
                        <Button onClick={() => handleSort('Activity')}>Activity</Button>
                        <Button onClick={() => handleSort('Views')}>Views</Button>
                        <Button onClick={() => handleSort('Newest')}>Newest</Button>
                        <Button onClick={() => handleSort('Oldest')}>Oldest</Button>
                        <Button
                            variant={filterOption === 'questions' ? 'contained' : 'outlined'}
                            onClick={() => setFilterOption('questions')}
                        >
                            Questions
                        </Button>
                        <Button
                            variant={filterOption === 'answers' ? 'contained' : 'outlined'}
                            onClick={() => setFilterOption('answers')}
                        >
                            Answers
                        </Button>
                        <Button
                            variant={filterOption === 'all' ? 'contained' : 'outlined'}
                            onClick={() => setFilterOption('all')}
                        >
                            All
                        </Button>
                    </ButtonGroup>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3} direction="column">
                    {currentPosts.map((post) => (
                        <Grid item xs={12} key={post.id}>
                            <Card
                                sx={{
                                    padding: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: '8px',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                }}
                            >
                                {/* Post Info */}
                                <Box sx={{ flex: 1, marginRight: '15px' }}>
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => handleQuestionClick(post.id)} // Click handler
                                    >
                                        {post.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 1 }}>
                                        <Typography variant="body1">Votes: {post.votes}</Typography>
                                        {post.answers !== null && (
                                            <Typography variant="body1">Answers: {post.answers}</Typography>
                                        )}
                                        <Typography variant="body1">Views: {post.views}</Typography>
                                    </Box>

                                    <Box sx={{ marginTop: '8px', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {post.tags.map((tag, idx) => (
                                            <Chip key={idx} label={tag} size="small" />
                                        ))}
                                    </Box>

                                    <Typography variant="body2" color="textSecondary" sx={{ marginTop: '10px' }}>
                                        Posted by {post.user} on {new Date(post.dateAsked).toLocaleDateString()}
                                    </Typography>
                                </Box>

                                {/* Bookmark or Delete */}
                                <Delete
                                    sx={{ color: theme.palette.error.main, cursor: 'pointer' }}
                                    onClick={() => handleDeleteClick(post)}
                                />
                            </Card>
                        </Grid>
                    ))}
                </Grid>


                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Pagination
                        count={Math.ceil(filteredPosts.length / itemsPerPage)}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        color="primary"
                    />
                </Box>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove this post from bookmarks?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;