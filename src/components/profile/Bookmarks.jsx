import React, { useState } from 'react';
import {
    Box, Grid, Typography, Card, Button, Divider, Chip, ButtonGroup, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, TextField, IconButton, Pagination
} from '@mui/material';
import { Bookmark, CheckCircle, Delete,  Search  } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ProfilePage = () => {
    const theme = useTheme();

    // State to track bookmarked posts
    const [bookmarkedPosts, setBookmarkedPosts] = useState([
        {
            id: 1,
            title: 'How to programmatically navigate using React Router?',
            votes: 2349,
            answers: 50,
            views: '1.7m',
            tags: ['javascript', 'reactjs', 'react-router'],
            accepted: true,
            dateAsked: 'Jun 26, 2015',
            user: 'George Mauer',
            userReputation: '121k',
            profileLink: '/profile/GeorgeMauer'
        },
        {
            id: 2,
            title: 'How configure Spring boot CORS for Restful API?',
            votes: 1,
            answers: 1,
            views: '2k',
            tags: ['spring', 'reactjs', 'cors'],
            accepted: true,
            dateAsked: 'Dec 3, 2018',
            user: 'Mimmo',
            userReputation: '123',
            profileLink: '/profile/Mimmo'
        }
    ]);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [sortOption, setSortOption] = useState('Score'); // Default sort by Score
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete confirmation dialog handling
    const handleDeleteClick = (post) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
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
                sortedPosts.sort((a, b) => b.answers - a.answers);
                break;
            case 'Views':
                sortedPosts.sort((a, b) => parseInt(b.views) - parseInt(a.views));
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

    const handleProfileClick = (profileLink) => {
        window.location.href = profileLink;
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
                    </ButtonGroup>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3} direction="column">
                    {currentPosts.map((post) => (
                        <Grid item xs={12} key={post.id}>
                            <Card sx={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '8px', flexDirection: { xs: 'column', sm: 'row' } }}>

                                {/* Post Info */}
                                <Box sx={{ flex: 1, marginRight: '15px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{post.votes} votes</Typography>
                                        <Typography variant="body1">{post.answers} answers</Typography>
                                        <Typography variant="body1">{post.views} views</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Bookmark sx={{ color: theme.palette.text.secondary, marginRight: '5px' }} />
                                            <Typography variant="body2" color="textSecondary">Saved in For later</Typography>
                                        </Box>
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        sx={{ marginTop: '8px', color: theme.palette.primary.main, cursor: 'pointer' }}
                                        onClick={() => alert(`Clicked on post: ${post.title}`)}
                                    >
                                        {post.title}
                                    </Typography>

                                    <Box sx={{ marginTop: '8px', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {post.tags.map((tag, idx) => (
                                            <Chip key={idx} label={tag} size="small" />
                                        ))}
                                    </Box>

                                    {post.accepted && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                            <CheckCircle fontSize="small" sx={{ color: 'green', marginRight: '5px' }} />
                                            <Typography variant="body2" color="textSecondary">
                                                Accepted
                                            </Typography>
                                        </Box>
                                    )}

                                    <Typography variant="body2" color="textSecondary" sx={{ marginTop: '10px', cursor: 'pointer' }} onClick={() => handleProfileClick(post.profileLink)}>
                                        Asked by {post.user} ({post.userReputation}) on {post.dateAsked}
                                    </Typography>
                                </Box>

                                {/* Delete Icon */}
                                <Delete sx={{ color: theme.palette.error.main, cursor: 'pointer' }} onClick={() => handleDeleteClick(post)} />
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