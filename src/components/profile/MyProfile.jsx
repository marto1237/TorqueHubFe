import React, { useState } from 'react';
import { Box, Grid, Typography, Card, Avatar, Button, Divider, TextField, Rating, Chip, ButtonGroup } from '@mui/material';
import { Cake, AccessTime, CalendarMonth } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ProfilePage = () => {
    const theme = useTheme();
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [aboutMe, setAboutMe] = useState("Enthusiast of classic cars, modern cars, and everything in between.");

    const handleEditToggle = () => {
        setIsEditingAboutMe(!isEditingAboutMe);
    };

    const handleSaveChanges = () => {
        // Handle saving changes here
        setIsEditingAboutMe(false);
    };

    const posts = [
        { type: 'A', title: 'Why are Rust executables so huge?', votes: 340, date: 'Feb 23, 2019' },
        { type: 'A', title: 'What does the Ellipsis object do?', votes: 136, date: 'May 28, 2016' },
        { type: 'A', title: 'PyCharm logging output colours', votes: 87, date: 'Aug 6, 2017' },
        { type: 'A', title: 'Python poetry install failure - invalid hashes', votes: 47, date: 'May 26, 2022' },
        { type: 'A', title: 'How to install Clang and LLVM 3.9 on CentOS 7', votes: 41, date: 'Jan 4, 2018' },
        { type: 'A', title: 'Abstract attributes in Python', votes: 33, date: 'Aug 3, 2016' },
        { type: 'A', title: 'Adding payload in packet', votes: 19, date: 'May 17, 2012' },
        { type: 'Q', title: 'Can clang static analyzer (scan-build) be used with cmake --build?', votes: 13, date: 'Feb 22, 2017' },
        { type: 'Q', title: 'How to convert from std::io::Bytes to &[u8]', votes: 13, date: 'Jun 8, 2017' },
        { type: 'Q', title: 'How can the line wrapping width on Sphinx with alabaster be increased?', votes: 11, date: 'Aug 24, 2015' },
    ];

    const events = [
        { title: 'Car Expo 2024', date: 'Feb 15, 2024' },
        { title: 'Classic Car Show 2023', date: 'Nov 10, 2023' }
    ];

    const [filter, setFilter] = useState('All');
    const [sort, setSort] = useState('Score');

    // Filter and sort posts based on the selected options
    const filteredPosts = posts
        .filter(post => {
            if (filter === 'All') return true;
            return post.type === filter[0]; // Q for Question, A for Answer
        })
        .sort((a, b) => {
            if (sort === 'Score') return b.votes - a.votes;
            return new Date(b.date) - new Date(a.date);
        });

    const handlePostClick = (postTitle) => {
        alert(`Clicked on post: ${postTitle}`);
    };

    // Handle filter and sort button changes
    const handleFilterChange = (newFilter) => setFilter(newFilter);
    const handleSortChange = (newSort) => setSort(newSort);

    // Update title dynamically based on the filter
    const getPostTitle = () => {
        switch (filter) {
            case 'All': return 'Top Posts';
            case 'Q': return 'Top Questions';
            case 'A': return 'Top Answers';
            default: return 'Top Posts';
        }
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            {/* Full-width Profile Card */}
            <Card sx={{ padding: '20px', mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                    <Avatar
                        src="path_to_user_image"
                        alt="User Avatar"
                        sx={{ width: 120, height: 120 }}
                    />
                    <Box>
                        <Typography variant="h5" color="textPrimary">
                            Username
                        </Typography>
                        {/* Box for date-related information, each on a new line */}
                        <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Cake fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="textSecondary">
                                    Member since [Join Date]
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AccessTime fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="textSecondary">
                                    [Join Time]
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="textSecondary">
                                    [Join Month]
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Card>

            {/* Split layout for stats and content */}
            <Grid container spacing={3}>
                {/* Left Column - User Stats */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ padding: '20px'}}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                            User Stats
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {/* Stats in 2-columns per row */}
                        <Grid container spacing={5}>
                            <Grid item xs={6}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Reputation:</strong> 1
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Reached:</strong> 0
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Answers:</strong> 0
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Questions:</strong> 0
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Marketplace Rate:</strong>
                                    <Rating
                                        name="marketplace-rating"
                                        value={4.5}  // Assuming the current rating is 4 out of 5
                                        precision={0.5}
                                        readOnly  // Set to readOnly if user cannot modify the rating
                                        sx={{ mt: 1 }}
                                    />
                                    (4.5 - 2 reviews)
                                </Typography>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* Right Column - Contributions */}
                <Grid item xs={12} md={8}>
                    {/* About Me Section */}
                    <Card sx={{ padding: '20px', mb: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                            About Me
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {isEditingAboutMe ? (
                            <Box>
                                <TextField
                                    variant="filled"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    className="whiteText"
                                    value={aboutMe}
                                    onChange={(e) => setAboutMe(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Button variant="contained" onClick={handleSaveChanges} sx={{ mr: 1 }}>
                                    Save Changes
                                </Button>
                                <Button variant="outlined" onClick={handleEditToggle}>
                                    Cancel
                                </Button>
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="body1" color="textPrimary">
                                    {aboutMe}
                                </Typography>
                                <Button variant="contained" sx={{ mt: 2 }} onClick={handleEditToggle}>
                                    Edit
                                </Button>
                            </Box>
                        )}
                    </Card>

                    {/* Forum Posts Section */}
                    {/* Post Filter and Sort */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <ButtonGroup>
                            <Button onClick={() => handleFilterChange('All')}>All</Button>
                            <Button onClick={() => handleFilterChange('Q')}>Questions</Button>
                            <Button onClick={() => handleFilterChange('A')}>Answers</Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button onClick={() => handleSortChange('Score')}>Score</Button>
                            <Button onClick={() => handleSortChange('Newest')}>Newest</Button>
                        </ButtonGroup>
                    </Box>
                    <Card sx={{ padding: '20px' }}>
                        <Typography variant="h5" color="textPrimary">
                            {getPostTitle()}
                        </Typography>
                        <Divider sx={{ marginBottom: '20px' }} />
                        <Grid container spacing={2}>
                            {filteredPosts.map((post, index) => (
                                <Grid item xs={12} key={index} onClick={() => handlePostClick(post.title)}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer',border: `2px solid ${theme.palette.divider}`, // Adds a solid border with the theme's divider color
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover, // Hover effect to change background
                                            borderColor: theme.palette.primary.main, // Change border color on hover
                                        } }}>
                                        <Chip
                                            label={post.type}
                                            sx={{ backgroundColor: post.type === 'A' ? '#323232' : '#32a852', color: 'white', padding: '5px','&:hover': {
                                            opacity: 0.8, // Adds a hover effect
                                        }, }}
                                        />
                                        <Typography variant="body1" color="textPrimary" sx={{ flexGrow: 1, marginLeft: '15px' }}>
                                            {post.title}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ marginRight: '15px' }}>
                                            {post.votes} votes
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {post.date}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Card>

                    {/* Events Section */}
                    <Card sx={{ padding: '20px', mb: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                            Events You're Attending
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {events.map((event, index) => (
                                <Chip key={index} label={`${event.title} - ${event.date}`} />
                            ))}
                        </Box>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                            View All Events
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;
