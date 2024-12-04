import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { Box, Grid, Typography, Card, Avatar, Button, Divider, TextField, Rating, Chip, ButtonGroup } from '@mui/material';
import { Cake, AccessTime, CalendarMonth } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase';
import ProfileService from '../configuration/Services/ProfileService';

const ProfilePage = ({ avatar, userDetails }) => {
    const theme = useTheme();
    const { id } = useParams();
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [aboutMe, setAboutMe] = useState("Enthusiast of classic cars, modern cars, and everything in between.");
    const [avatarURL, setAvatarURL] = useState(avatar);

    function stringToColor(string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name) {
        if (!name) {
            // Fallback if no name is provided
            return {
                sx: {
                    bgcolor: '#ccc', // Default background color
                },
                children: '?', // Default avatar content
            };
        }

        return {
            sx: {
                bgcolor: stringToColor(name),
                width: { xs: 80, sm: 120, md: 160, lg: 180 }, // Match the size of avatarURL
                height: { xs: 80, sm: 120, md: 160, lg: 180 }, // Match the size of avatarURL
                
            },
            children: `${name[0].toUpperCase()}`,
        };
    }

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
    
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch user data based on the 'id'
                const userData = await ProfileService.getUserProfile(id);
                setProfile(userData);

                // Fetch the profile picture from Firebase
            const imageRef = ref(storage, `profileImages/${userData.user.username}/profile.jpg`);
            try {
                const imageURL = await getDownloadURL(imageRef);
                setAvatarURL(imageURL); // Set the avatar URL if it exists
            } catch (imageError) {
                console.error('Profile picture not found:', imageError);
                setAvatarURL(null); // Set to null if the image does not exist
            }

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch profile data or image.');
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            {/* Full-width Profile Card */}
            <Card sx={{ padding: '20px', mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                        {avatarURL ?(
                                <Avatar src={avatarURL} sx={{ width: { xs: 80, sm: 120, md: 160, lg:180 }, height: { xs: 80, sm: 120, md: 160, lg:180 } }}
                                alt={userDetails?.username ? `${userDetails.username}'s profile picture` : 'User profile picture'} />
                            ) : (
                                <Avatar  sx={{ width: { xs: 80, sm: 120, md: 160, lg:180 }, height: { xs: 80, sm: 120, md: 160, lg:180 } }} {...stringAvatar(profile?.user?.username || 'User' )} />
                            )}
                    <Box>
                        <Typography variant="h5" color="textPrimary">
                            {profile.user.username}
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
                                    <strong>Reputation:</strong> {profile.user.points}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Reached:</strong> 0
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Answers:</strong> {profile.answerCount}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Questions:</strong> {profile.questionCount}
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
                            {filter === 'All' && (
                                <>
                                    {profile.questions.map((question) => (
                                        <Grid item xs={12} key={`question-${question.id}`} onClick={() => handlePostClick(question.title)}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    border: `2px solid ${theme.palette.divider}`,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.action.hover,
                                                        borderColor: theme.palette.primary.main,
                                                    },
                                                }}
                                            >
                                                <Chip
                                                    label="Q"
                                                    sx={{
                                                        backgroundColor: '#32a852',
                                                        color: 'white',
                                                        padding: '5px',
                                                        '&:hover': { opacity: 0.8 },
                                                    }}
                                                />
                                                <Typography variant="body1" color="textPrimary" sx={{ flexGrow: 1, marginLeft: '15px' }}>
                                                    {question.title.replace(/<\/?[^>]+(>|$)/g, '')} {/* Strip HTML tags */}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ marginRight: '15px' }}>
                                                    {question.votes} votes
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {new Date(question.askedTime).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                    {profile.answers.map((answer) => (
                                        <Grid item xs={12} key={`answer-${answer.id}`}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    border: `2px solid ${theme.palette.divider}`,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.action.hover,
                                                        borderColor: theme.palette.primary.main,
                                                    },
                                                }}
                                            >
                                                <Chip
                                                    label="A"
                                                    sx={{
                                                        backgroundColor: '#323232',
                                                        color: 'white',
                                                        padding: '5px',
                                                        '&:hover': { opacity: 0.8 },
                                                    }}
                                                />
                                                <Typography variant="body1" color="textPrimary" sx={{ flexGrow: 1, marginLeft: '15px' }}>
                                                    {answer.text.replace(/<\/?[^>]+(>|$)/g, '')} {/* Strip HTML tags */}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ marginRight: '15px' }}>
                                                    {answer.votes} votes
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {new Date(answer.postedTime).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </>
                            )}
                            {filter === 'Q' &&
                                profile.questions.map((question) => (
                                    <Grid item xs={12} key={`question-${question.id}`}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: `2px solid ${theme.palette.divider}`,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover,
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }}
                                        >
                                            <Chip
                                                label="Q"
                                                sx={{
                                                    backgroundColor: '#32a852',
                                                    color: 'white',
                                                    padding: '5px',
                                                    '&:hover': { opacity: 0.8 },
                                                }}
                                            />
                                            <Typography variant="body1" color="textPrimary" sx={{ flexGrow: 1, marginLeft: '15px' }}>
                                                {question.title.replace(/<\/?[^>]+(>|$)/g, '')}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{ marginRight: '15px' }}>
                                                {question.votes} votes
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {new Date(question.askedTime).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            {filter === 'A' &&
                                profile.answers.map((answer) => (
                                    <Grid item xs={12} key={`answer-${answer.id}`}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: `2px solid ${theme.palette.divider}`,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover,
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }}
                                        >
                                            <Chip
                                                label="A"
                                                sx={{
                                                    backgroundColor: '#323232',
                                                    color: 'white',
                                                    padding: '5px',
                                                    '&:hover': { opacity: 0.8 },
                                                }}
                                            />
                                            <Typography variant="body1" color="textPrimary" sx={{ flexGrow: 1, marginLeft: '15px' }}>
                                                {answer.text.replace(/<\/?[^>]+(>|$)/g, '')}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{ marginRight: '15px' }}>
                                                {answer.votes} votes
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {new Date(answer.postedTime).toLocaleDateString()}
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
