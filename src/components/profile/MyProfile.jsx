import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom'; 
import { useQuery } from '@tanstack/react-query';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase';

import { 
    Box, 
    Grid, 
    Typography, 
    Card, 
    Avatar, 
    Button, 
    Divider, 
    TextField, 
    Rating, 
    Chip, 
    ButtonGroup 
} from '@mui/material';
import { 
    Cake, 
    AccessTime, 
    CalendarMonth 
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import ProfileService from '../configuration/Services/ProfileService';

const ProfilePage = ({ avatar, userDetails }) => {
    const theme = useTheme();
    const { id } = useParams();
    
    // State for editing About Me section
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [aboutMe, setAboutMe] = useState("Enthusiast of classic cars, modern cars, and everything in between.");
    
    // State for filtering and sorting posts
    const [filter, setFilter] = useState('All');
    const [sort, setSort] = useState('Score');

    // Fetch profile data using React Query
    const { 
        data: profile, 
        isLoading, 
        error 
    } = useQuery({
        queryKey: ['userProfile', id],
        queryFn: () => ProfileService.getUserProfile(id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2
    });

    // Fetch profile avatar
    const { 
        data: avatarURL, 
        isLoading: isAvatarLoading 
    } = useQuery({
        queryKey: ['profileAvatar', id],
        queryFn: async () => {
            if (!profile?.user?.username) return null;
            const imageRef = ref(storage, `profileImages/${profile.user.username}/profile.jpg`);
            return await getDownloadURL(imageRef);
        },
        enabled: !!profile, 
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        retry: 1
    });

    // Utility functions
    function stringToColor(string) {
        let hash = 0;
        let i;

        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }

        return color;
    }

    function stringAvatar(name) {
        if (!name) {
            return {
                sx: { bgcolor: '#ccc' },
                children: '?',
            };
        }

        return {
            sx: {
                bgcolor: stringToColor(name),
                width: { xs: 80, sm: 120, md: 160, lg: 180 },
                height: { xs: 80, sm: 120, md: 160, lg: 180 },
            },
            children: `${name[0].toUpperCase()}`,
        };
    }

    // Event handlers
    const handleEditToggle = () => {
        setIsEditingAboutMe(!isEditingAboutMe);
    };

    const handleSaveChanges = () => {
        // Implement save logic here
        setIsEditingAboutMe(false);
    };

    const handlePostClick = (postTitle) => {
        alert(`Clicked on post: ${postTitle}`);
    };

    // Filter and sort posts
    const filteredPosts = useMemo(() => {
        if (!profile) return [];

        const combinedPosts = [
            ...(profile?.questions?.map(q => ({ ...q, type: 'Q' })) || []),
            ...(profile?.answers?.map(a => ({ ...a, type: 'A' })) || [])
        ];
        

        return combinedPosts
            .filter(post => {
                if (filter === 'All') return true;
                return post.type === filter;
            })
            .sort((a, b) => {
                if (sort === 'Score') return b.votes - a.votes;
                return new Date(b.date) - new Date(a.date);
            });
    }, [profile, filter, sort]);

    // Loading and error states
    if (isLoading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error.message}</Typography>;

    // Render events (could be moved to a separate component)
    const events = [
        { title: 'Car Expo 2024', date: 'Feb 15, 2024' },
        { title: 'Classic Car Show 2023', date: 'Nov 10, 2023' }
    ];


    const formatTextWithTags = (text) => {
        if (!text) return ''; // Ensure a string is always returned
        return text
            .replace(/\[b\](.*?)\[\/b\]/g, '<b>$1</b>')
            .replace(/\[i\](.*?)\[\/i\]/g, '<i>$1</i>')
            .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
            .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>');
    };

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            {/* Profile Header Card */}
            <Card sx={{ padding: '20px', mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                    {avatarURL ? (
                        <Avatar 
                            src={avatarURL} 
                            sx={{ 
                                width: { xs: 80, sm: 120, md: 160, lg: 180 }, 
                                height: { xs: 80, sm: 120, md: 160, lg: 180 } 
                            }}
                            alt={`${profile.user.username}'s profile picture`} 
                        />
                    ) : (
                        <Avatar 
                            {...stringAvatar(profile.user.username)} 
                        />
                    )}
                    <Box>
                        <Typography variant="h5" color="textPrimary">
                            {profile.user.username}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                {/* Display Member Since */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Cake fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                            Member Since: {new Date(profile.user.accountCreationDate).toLocaleDateString()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                            Last Seen: {new Date(profile.user.accountCreationDate).toLocaleTimeString()}
                        </Typography>
                    </Box>
                </Box>
                    </Box>
                </Box>
            </Card>

            <Grid container spacing={3}>
                {/* User Stats Column */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ padding: '20px' }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                            User Stats
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={5}>
                            {[
                                { label: 'Reputation', value: profile.user.points },
                                { label: 'Reached', value: '0' },
                                { label: 'Answers', value: profile.answerCount },
                                { label: 'Questions', value: profile.questionCount }
                            ].map((stat, index) => (
                                <Grid item xs={6} key={index}>
                                    <Typography variant="body1" color="textPrimary">
                                        <strong>{stat.label}:</strong> {stat.value}
                                    </Typography>
                                </Grid>
                            ))}
                            <Grid item xs={8}>
                                <Typography variant="body1" color="textPrimary">
                                    <strong>Marketplace Rate:</strong>
                                    <Rating
                                        name="marketplace-rating"
                                        value={4.5}
                                        precision={0.5}
                                        readOnly
                                        sx={{ mt: 1 }}
                                    />
                                    (4.5 - 2 reviews)
                                </Typography>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* Contributions Column */}
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

                    {/* Posts Filtering */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <ButtonGroup>
                            {['All', 'Q', 'A'].map((type) => (
                                <Button 
                                    key={type} 
                                    onClick={() => setFilter(type)}
                                    variant={filter === type ? 'contained' : 'outlined'}
                                >
                                    {type === 'All' ? 'All' : type === 'Q' ? 'Questions' : 'Answers'}
                                </Button>
                            ))}
                        </ButtonGroup>
                        <ButtonGroup>
                            {['Score', 'Newest'].map((sortType) => (
                                <Button 
                                    key={sortType} 
                                    onClick={() => setSort(sortType)}
                                    variant={sort === sortType ? 'contained' : 'outlined'}
                                >
                                    {sortType}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Box>

                    {/* Posts Listing */}
                    <Card sx={{ padding: '20px' }}>
                        <Typography variant="h5" color="textPrimary">
                            {filter === 'All' ? 'Top Posts' : 
                             filter === 'Q' ? 'Top Questions' : 
                             'Top Answers'}
                        </Typography>
                        <Divider sx={{ marginBottom: '20px' }} />
                        <Grid container spacing={2}>
                            {filteredPosts.map((post) => (
                                <Grid item xs={12} key={post.id}>
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
                                        onClick={() => handlePostClick(post.title)}
                                    >
                                        <Chip
                                            label={post.type === 'Q' ? 'Q' : 'A'}
                                            sx={{
                                                backgroundColor: post.type === 'Q' ? '#32a852' : '#323232',
                                                color: 'white',
                                                padding: '5px',
                                                '&:hover': { opacity: 0.8 },
                                            }}
                                        />
                                        <Typography 
                                            variant="body1" 
                                            color="textPrimary" 
                                            sx={{ 
                                                flexGrow: 1, 
                                                marginLeft: '15px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}

                                            dangerouslySetInnerHTML={{
                                                __html: formatTextWithTags(post.title || post.text || 'No content available'),
                                            }}
                                            
                                        >
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="textSecondary" 
                                            sx={{ marginRight: '15px' }}
                                        >
                                            {post.votes} votes
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {new Date(post.date || post.askedTime || post.postedTime).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Card>

                    {/* Events Section */}
                    <Card sx={{ padding: '20px', mb: 3, mt: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                            Events You're Attending
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {events.map((event, index) => (
                                <Chip 
                                    key={index} 
                                    label={`${event.title} - ${event.date}`} 
                                    variant="outlined"
                                />
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