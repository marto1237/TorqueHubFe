import React, { useState, useEffect } from 'react';
import { Box, Typography, Tab, Tabs, Card, Grid, Divider, Button, Menu, MenuItem, Checkbox, IconButton,Select,useMediaQuery } from '@mui/material';
import { Notifications, NotificationsNone, Email, MailLock, ModeComment, Visibility } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";
import FollowService from '../configuration/Services/FollowService';
import { useQuery } from '@tanstack/react-query';


// Main Component
const ForumPage = () => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(1);
    const [selectedForums, setSelectedForums] = useState([]); // Manage selected checkboxes
    const [menuAnchorEl, setMenuAnchorEl] = useState(null); // For the bottom dropdown
    const [selectedAction, setSelectedAction] = useState('');
    const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [followedQuestions, setFollowedQuestions] = useState([]);
    const [followedAnswers, setFollowedAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState([]); 
    const [selectAllAnswersChecked, setSelectAllAnswersChecked] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]); // Manages selected answers and questions
    const [selectAllChecked, setSelectAllChecked] = useState(false); // For "Select All" checkbox



    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        setSelectedForums([]); // Reset selection and action when switching tabs
        setSelectedAction('');
    };

    // Handle checkbox changes for selected forums
    const handleCheckboxChange = (forumId) => {
        setSelectedForums((prevSelected) =>
            prevSelected.includes(forumId)
                ? prevSelected.filter((id) => id !== forumId)
                : [...prevSelected, forumId]
        );
    };

    // Handle "Select All" checkbox
    const handleSelectAllChange = (event, type) => {
        const isChecked = event.target.checked;
        if (type === "questions") {
            setSelectedItems((prev) => 
                isChecked
                    ? [...prev, ...followedQuestions.map(q => ({ id: q.id, type: "question" }))]
                    : prev.filter(item => item.type !== "question")
            );
        } else if (type === "answers") {
            setSelectedItems((prev) =>
                isChecked
                    ? [...prev, ...followedAnswers.map(a => ({ id: a.id, type: "answer" }))]
                    : prev.filter(item => item.type !== "answer")
            );
        }
        setSelectAllChecked(isChecked);
    };
    

    const handleSelectAllAnswersChange = (event) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            const allAnswerIds = followedAnswers.map(answer => answer.id);
            setSelectedAnswers(allAnswerIds);
        } else {
            setSelectedAnswers([]);
        }
        setSelectAllAnswersChecked(isChecked);
    };
    

    const handleItemCheckboxChange = (id, type) => {
        setSelectedItems((prev) => {
            const exists = prev.find(item => item.id === id && item.type === type);
            return exists
                ? prev.filter(item => !(item.id === id && item.type === type)) // Remove if already selected
                : [...prev, { id, type }]; // Add if not selected
        });
    };
    
    

    // Handle dropdown menu for "Manage followed forums"
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    // Function to update forum data (email notifications or alerts)
    const updateForumData = (updatedFields) => {
        setFollowedQuestions((prevData) =>
            prevData.map((forum) =>
                selectedForums.includes(forum.id) ? { ...forum, ...updatedFields } : forum
            )
        );
        setSelectedAction(''); // Reset the action text after performing any action
        setMenuAnchorEl(null); // Close the menu
    };

    // Functions to simulate actions like enabling/disabling email and alerts
    const handleEnableEmail = () => {
        updateForumData({ emailNotifications: true });
    };

    const handleDisableEmail = () => {
        updateForumData({ emailNotifications: false });
    };

    const handleEnableAlerts = () => {
        updateForumData({ alerts: true });
    };

    const handleDisableAlerts = () => {
        updateForumData({ alerts: false });
    };

    // Display the notification and email icons based on forum data
    const getEmailIcon = (emailNotifications) => {
        return emailNotifications ? <Email sx={{ ml: 1, color: 'lightgreen' }} /> : <MailLock sx={{ ml: 1, color: 'gray' }} />;
    };

    const getNotificationsIcon = (alerts) => {
        return alerts ? <Notifications sx={{ ml: 1, color: 'lightblue' }} /> : <NotificationsNone sx={{ ml: 1, color: 'gray' }} />;
    };



    // Determine if the current tab has data
    const currentTabHasData = () => {
        if (selectedTab === 0 || selectedTab === 2 || selectedTab === 3) {
            return false; // No data for Followed Discussions, My Discussions, or Participated Discussions
        }
        return followedQuestions.length > 0;
    };


    // Fetch Followed Questions
    const fetchFollowedQuestions = async () => {
        setLoading(true);
        try {
            const data = await FollowService.getFollowedQuestions();
            console.log("Followed Questions Response:", data);
            setFollowedQuestions(data.content || []);
        } catch (error) {
            console.error("Failed to fetch followed questions", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Followed Answers
    const fetchFollowedAnswers = async () => {
        setLoading(true);
        try {
            const data = await FollowService.getFollowedAnswers();
            console.log("Followed Answer Response:", data);
            setFollowedAnswers(data.content || []);
        } catch (error) {
            console.error("Failed to fetch followed answers", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data based on selected tab
    useEffect(() => {
        if (selectedTab === 1) fetchFollowedQuestions();
        else if (selectedTab === 2) fetchFollowedAnswers();
    }, [selectedTab]);

    const toggleMuteState = async (forumId, mute) => {
        try {
            const action = mute ? "batch-mute" : "batch-unfollow";
            await FollowService[action]([forumId]);
            setFollowedQuestions((prev) =>
                prev.map((forum) =>
                    forum.id === forumId ? { ...forum, muted: mute } : forum
                )
            );
        } catch (error) {
            console.error("Failed to update mute state:", error);
        }
    };
    
    const handleBulkAction = async () => {
        try {
            if (selectedAction === "Mute") {
                const questionIds = selectedItems.filter(i => i.type === "question").map(i => i.id);
                const answerIds = selectedItems.filter(i => i.type === "answer").map(i => i.id);
                await FollowService.batchMuteFollows([...questionIds, ...answerIds]);
            } else if (selectedAction === "Unfollow") {
                const questionIds = selectedItems.filter(i => i.type === "question").map(i => i.id);
                const answerIds = selectedItems.filter(i => i.type === "answer").map(i => i.id);
                await FollowService.batchUnfollow([...questionIds, ...answerIds]);
            }
            // Reset State
            setSelectedItems([]);
        } catch (error) {
            console.error("Failed to apply bulk action:", error);
        }
    };
    
    
    return (
        <Box sx={{ backgroundColor: theme.palette.background.paper, color: 'white', padding: '20px', paddingTop: '100px', minHeight: '100vh' }}>
            <Grid container spacing={3}>
                {/* Left Section: Tabs for Discussions */}
                <Grid item xs={12} md={9}>
                    <Typography variant="h4" sx={{ mb: 2 }} color="textPrimary">
                        Following
                    </Typography>

                    {/* Tabs */}
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                        textColor="inherit"
                        indicatorColor="secondary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab color="textPrimary" label="Followed Discussions" />
                        <Tab color="textPrimary" label="Followed Forums" />
                        <Tab label="Followed Answers" />
                        <Tab color="textPrimary" label="My Discussions" />
                        <Tab color="textPrimary" label="Participated Discussions" />
                    </Tabs>

                    {/* Dropdown for Managing Followed Forums */}
                    {currentTabHasData() && (
                        <Box sx={{padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
                            <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleMenuClick}>
                                Manage followed forums
                            </Button>
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                <MenuItem onClick={handleMenuClose}>Disable email notifications</MenuItem>
                                <MenuItem onClick={handleMenuClose}>Stop following all forums</MenuItem>
                            </Menu>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography color="textPrimary">Select all</Typography>
                                <Checkbox
                                    checked={selectAllChecked}
                                    onChange={handleSelectAllChange}
                                    sx={{ mr: 1 }}
                                />
                            </Box>
                        </Box>
                    )}

                        {/* Tab Panels */}
                        <TabPanel value={selectedTab} index={1}>
                        {loading ? (
                            <Typography>Loading...</Typography>
                        ) : followedQuestions.length === 0 ? (
                            <Card sx={{ padding: '20px' }}>
                                <Typography>You are not following any forums.</Typography>
                            </Card>
                        ) : (
                            followedQuestions.map((forum) => (
                                <Card
                                    key={forum.id}
                                    sx={{
                                        padding: '10px',
                                        mb: 2,
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {/* Forum Details */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Typography variant="h6">{forum.title}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {forum.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                            <Typography>
                                                <ModeComment fontSize="small" /> {forum.totalAnswers} Replies
                                            </Typography>
                                            <Typography>
                                                <Visibility fontSize="small" /> {forum.views} Views
                                            </Typography>
                                            <Typography>Asked by: {forum.username}</Typography>
                                        </Box>
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            {/* Mute/Unmute State */}
                                            {forum.muted ? (
                                                <IconButton
                                                    color="warning"
                                                    onClick={() => toggleMuteState(forum.id, false)}
                                                    title="Unmute Notifications"
                                                >
                                                    <NotificationsNone />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => toggleMuteState(forum.id, true)}
                                                    title="Mute Notifications"
                                                >
                                                    <Notifications />
                                                </IconButton>
                                            )}
                                            {/* Checkbox */}
                                            <Checkbox
                                                checked={selectedItems.some(item => item.id === forum.id && item.type === "question")}
                                                onChange={() => handleItemCheckboxChange(forum.id, "question")}
                                            />
                                        </Box>
                                    </Box>
                                </Card>
                            ))
                        )}

                        {/* Bulk Actions */}
                        {followedQuestions.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                displayEmpty
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="" disabled>With selected...</MenuItem>
                                <MenuItem value="Mute">Mute Notifications</MenuItem>
                                <MenuItem value="Unfollow">Unfollow</MenuItem>
                            </Select>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={selectedItems.length === 0 || selectedAction === ''}
                                onClick={handleBulkAction}
                            >
                                Go
                            </Button>
                        </Box>
                        
                        )}
                    </TabPanel>



                    <TabPanel value={selectedTab} index={2}>
                        {loading ? (
                            <Typography>Loading...</Typography>
                        ) : followedAnswers.length === 0 ? (
                            <Card sx={{ padding: '20px' }}>
                                <Typography>You are not following any answers.</Typography>
                            </Card>
                        ) : (
                            <>
                                {/* Select All Checkbox */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography>Select all</Typography>
                                    <Checkbox
                                        checked={selectAllAnswersChecked}
                                        onChange={handleSelectAllAnswersChange}
                                    />
                                </Box>

                                {/* Render Individual Answers */}
                                {followedAnswers.map((answer) => (
                                    <Card
                                        key={answer.id}
                                        sx={{
                                            padding: '10px',
                                            mb: 2,
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <Typography variant="h6">{answer.questionTitle}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {answer.text}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                                <Typography>Answered by: {answer.username}</Typography>
                                                <Typography>Votes: {answer.votes}</Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={selectedItems.some(item => item.id === answer.id && item.type === "answer")}
                                                onChange={() => handleItemCheckboxChange(answer.id, "answer")}
                                            />
                                            <IconButton
                                                color="error"
                                                onClick={() => toggleMuteState(answer.id, true)}
                                                title="Unfollow Answer"
                                            >
                                                <NotificationsNone />
                                            </IconButton>
                                        </Box>
                                    </Card>
                                ))}

                                {/* Bulk Actions */}
                                {followedAnswers.length > 0 && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Select
                                        value={selectedAction}
                                        onChange={(e) => setSelectedAction(e.target.value)}
                                        displayEmpty
                                        sx={{ minWidth: 200 }}
                                    >
                                        <MenuItem value="" disabled>With selected...</MenuItem>
                                        <MenuItem value="Mute">Mute Notifications</MenuItem>
                                        <MenuItem value="Unfollow">Unfollow</MenuItem>
                                    </Select>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={selectedItems.length === 0 || selectedAction === ''}
                                        onClick={handleBulkAction}
                                    >
                                        Go
                                    </Button>
                                </Box>
                                
                                )}
                            </>
                        )}
                    </TabPanel>


                    <TabPanel value={selectedTab} index={3}>
                        <Card sx={{ padding: '20px' }}>
                            <Typography>You haven't created any discussions yet.</Typography>
                        </Card>
                    </TabPanel>

                    <TabPanel value={selectedTab} index={4}>
                        <Card sx={{ padding: '20px' }}>
                            <Typography>You haven't participated in any discussions yet.</Typography>
                        </Card>
                    </TabPanel>
                </Grid>

                {/* Right Section: Community Sidebar */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ padding: '20px'}}>
                        <Typography variant="h6" sx={{ mb: 2 }} color="textPrimary">
                            Torque Hub - everything for the car enthusiast in one place
                        </Typography>
                        <Typography color="textPrimary">84.6M posts • 1.5M members • Since 20024</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography color="textPrimary">
                            A forum community dedicated to all enthusiasts. Come join the discussion
                            about performance, builds, troubleshooting, modifications, and more!
                        </Typography>
                        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                            Go ad-free with Plus
                        </Button>
                        <Button variant="outlined" sx={{ mt: 2 }}>
                            Grow Your Business
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

// Component for Tab Panel
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export default ForumPage;
