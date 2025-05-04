import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
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
    ButtonGroup,
    LinearProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    Cake, 
    AccessTime, 
    CalendarMonth,
    Flag as FlagIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import ProfileService from '../configuration/Services/ProfileService';
import { useAppNotifications } from '../common/NotificationProvider';
import ReportDialog from '../common/ReportDialog';

const ProfilePage = ({ avatar, userDetails }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const notifications = useAppNotifications();
    const currentUserId = userDetails?.id;
    const isOwnProfile = currentUserId === parseInt(id);
    
    // State for editing About Me section
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [aboutMe, setAboutMe] = useState('');
    
    // State for filtering and sorting posts
    const [filter, setFilter] = useState('All');
    const [sort, setSort] = useState('Score');

    // State for reporting user
    const [openReportDialog, setOpenReportDialog] = useState(false);

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

    // When profile data is loaded, set the about me text
    useEffect(() => {
        if (profile && profile.user && profile.user.aboutMe !== undefined) {
            setAboutMe(profile.user.aboutMe || "Enthusiast of classic cars, modern cars, and everything in between.");
        }
    }, [profile]);

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

    const handleSaveChanges = async () => {
        try {
            // Use UserService as a fallback if ProfileService.updateAboutMe doesn't exist
            if (typeof ProfileService.updateAboutMe !== 'function') {
                const UserService = require('../configuration/Services/UserService').default;
                await UserService.updateUser(id, { aboutMe });
            } else {
                await ProfileService.updateAboutMe(id, aboutMe);
            }
            
            notifications.show('About me updated successfully', {
                autoHideDuration: 3000,
                severity: 'success',
            });
            
            setIsEditingAboutMe(false);
        } catch (error) {
            console.error('Error updating about me:', error);
            notifications.show('Error updating about me', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    const handlePostClick = (post) => {
        if (!post || !post.id) return;
        
        // Navigate based on post type
        if (post.type === 'Q') {
            navigate(`/questions/${post.id}`);
        } else if (post.type === 'A') {
            // For answers, we try to navigate to the parent question if available
            const questionId = post.questionId || post.id;
            navigate(`/questions/${questionId}`);
        }
    };

    const handleOpenReportDialog = () => {
        setOpenReportDialog(true);
    };

    const handleCloseReportDialog = () => {
        setOpenReportDialog(false);
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

    // EXP Rank Calculation
    const donationRanks = [
        { name: 'Garage Rookie', min: 1, icon: '🧰' },
        { name: 'Piston Patron', min: 25, icon: '🔩' },
        { name: 'Turbo Supporter', min: 50, icon: '🌀' },
        { name: 'Gearhead Giver', min: 100, icon: '⚙️' },
        { name: 'V8 Visionary', min: 250, icon: '🏎️' },
        { name: 'Supercharger Elite', min: 500, icon: '💨' },
        { name: 'Nitro Champion', min: 1000, icon: '🏆' }
    ];
    
    const activityRanks = [
        { name: 'Engine Starter', points: 0, icon: '🚗' },
    { name: 'Street Tuner', points: 501, icon: '🛠️' },
    { name: 'Track Day Driver', points: 1501, icon: '🏁' },
    { name: 'Dyno Dominator', points: 4501, icon: '📊' },
    { name: 'Pit Crew Chief', points: 15000, icon: '👨‍🔧' },
    { name: 'Torque Master', points: 40000, icon: '🔧' },
    { name: 'Fuel Injected Guru', points: 100000, icon: '⛽' }
    ];
    
    const getCurrentRank = (value, ranks, key) => {
        return [...ranks].reverse().find(rank => value >= rank[key]) || ranks[0];
    };
    
    const getNextRank = (value, ranks, key) => {
        return ranks.find(rank => value < rank[key]);
    };
  
  const RankProgressBar = ({ title, value, ranks, keyName, onClick }) => {
    const theme = useTheme();
    const currentRank = getCurrentRank(value, ranks, keyName);
    const nextRank = getNextRank(value, ranks, keyName);
    const progress = nextRank ? ((value - currentRank[keyName]) / (nextRank[keyName] - currentRank[keyName])) * 100 : 100;
  
    return (
        <Box 
            onClick={onClick}
            sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                backgroundColor: theme.palette.background.default, 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 4 },
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <Typography variant="subtitle1" color="primary" fontWeight="bold">{title}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body2" color="textPrimary">
                    {currentRank.icon} {currentRank.name} ({value})
                </Typography>
                {nextRank && (
                    <Typography variant="body2" color="textPrimary">
                        {nextRank.icon} {nextRank.name} in {nextRank[keyName] - value}
                    </Typography>
                )}
            </Box>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, height: 8, borderRadius: 5, backgroundColor: theme.palette.grey[800], '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.error.main } }}
            />
            {!nextRank && (
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                    Max rank achieved! 🚀
                </Typography>
            )}
        </Box>
    );
  };
  

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px', backgroundColor: theme.palette.background.paper }}>
            {/* Profile Header Card */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ padding: '20px' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', position: 'relative' }}>
                            {avatarURL ? (
                                <Avatar src={avatarURL} sx={{ 
                                    width: { xs: 80, sm: 120, md: 160, lg: 180 }, 
                                    height: { xs: 80, sm: 120, md: 160, lg: 180 } 
                                }}
                                 />
                            ) : (
                                <Avatar 
                                    {...stringAvatar(profile?.user?.username || '?')} 
                                />
                            )}
                            <Box>
                                <Typography variant="h5" color="textPrimary">
                                    {profile?.user?.username || 'User'}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    {/* Display Member Since */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Cake fontSize="small" sx={{ mr: 1 }} />
                                        <Typography variant="body2">
                                            Member Since: {profile?.user?.accountCreationDate ? new Date(profile.user.accountCreationDate).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AccessTime fontSize="small" sx={{ mr: 1 }} />
                                        <Typography variant="body2">
                                            Last Seen: {profile?.user?.accountCreationDate ? new Date(profile.user.accountCreationDate).toLocaleTimeString() : 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            
                            {!isOwnProfile && userDetails && (
                                <Tooltip title="Report User" placement="top">
                                    <IconButton 
                                        color="warning" 
                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                        onClick={handleOpenReportDialog}
                                    >
                                        <FlagIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <RankProgressBar
                        title="Donation Progress"
                        value={profile?.user?.totalDonated || 0}
                        ranks={donationRanks}
                        keyName="min"
                        onClick={() => navigate('/donate')}
                    />
                    <RankProgressBar
                        title="Activity Progress"
                        value={profile?.user?.points || 0}
                        ranks={activityRanks}
                        keyName="points"
                        onClick={() => navigate('/rank')}
                    />
                </Grid>
            </Grid>

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
                                { label: 'Reputation', value: profile?.user?.points || 0 },
                                { label: 'Reached', value: '0' },
                                { label: 'Answers', value: profile?.answerCount || 0 },
                                { label: 'Questions', value: profile?.questionCount || 0 }
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
                                {isOwnProfile && (
                                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleEditToggle}>
                                        Edit
                                    </Button>
                                )}
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
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
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
                                            onClick={() => handlePostClick(post)}
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
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                                        No posts found
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Card>

                    {/* Events Section */}
                    <Card sx={{ padding: '20px', mb: 3, mt: 3 }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                            {isOwnProfile ? "Events You're Attending" : "Events This User is Attending"}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {events && events.length > 0 ? (
                                events.map((event, index) => (
                                    <Chip 
                                        key={index} 
                                        label={`${event.title} - ${event.date}`} 
                                        variant="outlined"
                                        onClick={() => event.id && navigate(`/events/${event.id}`)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                                    No events to display
                                </Typography>
                            )}
                        </Box>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/events')}
                        >
                            View All Events
                        </Button>
                    </Card>
                </Grid>
            </Grid>

            {/* Use the common ReportDialog component */}
            <ReportDialog
                open={openReportDialog}
                onClose={handleCloseReportDialog}
                targetId={parseInt(id)}
                targetType="USER"
            />
        </Box>
    );
};

export default ProfilePage;