    import React, { useState } from 'react';
    import { Box, Typography, Tab, Tabs, Card, Grid, Divider, Button, Menu, MenuItem, Checkbox, IconButton,Select,useMediaQuery } from '@mui/material';
    import { Notifications, NotificationsNone, Email, MailLock, ModeComment, Visibility } from '@mui/icons-material';
    import { useTheme } from "@mui/material/styles";

    // Simulate API JSON data
    const initialForumData = [
        {
            id: 1,
            title: "A1, S1, and A2",
            description: "Discussion form about the A1, S1, and A2 models",
            replies: 825,
            views: "1.8M",
            lastPost: "August 14, 2024",
            emailNotifications: true,
            alerts: true,
        },
        {
            id: 2,
            title: "A3, S3, RS 3 (8P)",
            description: "Discussion forum for the current generation (8P) Audi A3, S3, and RS 3 produced from 2004 - 2013.",
            replies: 379000,
            views: "70.9M",
            lastPost: "7 days ago",
            emailNotifications: false,
            alerts: true,
        },
    ];

    // Main Component
    const ForumPage = () => {
        const theme = useTheme();
        const [selectedTab, setSelectedTab] = useState(1);
        const [selectedForums, setSelectedForums] = useState([]); // Manage selected checkboxes
        const [menuAnchorEl, setMenuAnchorEl] = useState(null); // For the bottom dropdown
        const [selectedAction, setSelectedAction] = useState('');
        const [forumData, setForumData] = useState(initialForumData);
        const [selectAllChecked, setSelectAllChecked] = useState(false);
        const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        const handleSelectAllChange = (event) => {
            const isChecked = event.target.checked;
            if (isChecked) {
                // Select all forums
                const allForumIds = forumData.map(forum => forum.id);
                setSelectedForums(allForumIds);
            } else {
                // Uncheck all forums
                setSelectedForums([]);
            }
            setSelectAllChecked(isChecked); // Set state for "Select All" checkbox
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
            setForumData((prevData) =>
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
            return forumData.length > 0;
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
                        <TabPanel value={selectedTab} index={0}>
                            <Card sx={{ padding: '20px' }}>
                                <Typography>You are not watching any threads.</Typography>
                                <Typography sx={{ mt: 2 }}>Show all:</Typography>
                                <ul>
                                    <li>Threads you've started</li>
                                    <li>Threads in which you've participated</li>
                                </ul>
                            </Card>
                        </TabPanel>

                        {/* Followed Forums Tab */}
                        <TabPanel value={selectedTab} index={1}>



                            {/* Display Followed Forums */}
                            {forumData.length === 0 ? (
                                <Card sx={{ padding: '20px' }}>
                                    <Typography>You are not following any forums.</Typography>
                                </Card>
                            ) : (
                                forumData.map((forum) => (
                                    <Card
                                        key={forum.id}
                                        sx={{
                                            padding: '10px',
                                            mb: 2,
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',  // Make it column for mobile
                                            justifyContent: 'space-between',
                                        }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <Typography>{forum.title}</Typography>
                                            <Typography sx={{ marginBottom: '10px' }}>{forum.description}</Typography>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Typography sx={{ flexBasis: isMobile ? '100%' : '150px' }}>
                                                <ModeComment/> {forum.replies.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{ flexBasis: isMobile ? '100%' : '150px' }}>
                                                <Visibility/> {forum.views}
                                            </Typography>
                                            <Typography>{forum.lastPost}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                                {getEmailIcon(forum.emailNotifications)}
                                                {getNotificationsIcon(forum.alerts)}
                                            </Box>

                                        </Box>
                                        <Checkbox
                                            checked={selectedForums.includes(forum.id)}
                                            onChange={() => handleCheckboxChange(forum.id)}
                                            sx={{ ml: 2 }} // Move checkbox to end
                                        />
                                    </Card>
                                ))
                            )}

                            {/* Action buttons at the bottom (Conditionally rendered) */}
                            {currentTabHasData() && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                    {/* Dropdown for "With selected..." */}
                                    <Select
                                        value={selectedAction}
                                        onChange={(e) => setSelectedAction(e.target.value)}
                                        displayEmpty
                                        sx={{ minWidth: 200 }}
                                        disabled={selectedForums.length === 0} // Disable if no forums selected
                                    >
                                        <MenuItem value="" disabled>
                                            With selected...
                                        </MenuItem>
                                        <MenuItem value="Enable Email Notifications">Enable Email Notifications</MenuItem>
                                        <MenuItem value="Disable Email Notifications">Disable Email Notifications</MenuItem>
                                        <MenuItem value="Enable Alerts">Enable Alerts</MenuItem>
                                        <MenuItem value="Disable Alerts">Disable Alerts</MenuItem>
                                    </Select>

                                    {/* "Go" Button */}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ textTransform: 'none' }}
                                        disabled={selectedForums.length === 0 || selectedAction === ''} // Disable if no forums selected or no action chosen
                                        onClick={() => {
                                            if (selectedAction === 'Enable Email Notifications') {
                                                handleEnableEmail();
                                            } else if (selectedAction === 'Disable Email Notifications') {
                                                handleDisableEmail();
                                            } else if (selectedAction === 'Enable Alerts') {
                                                handleEnableAlerts();
                                            } else if (selectedAction === 'Disable Alerts') {
                                                handleDisableAlerts();
                                            }
                                        }}
                                    >
                                        Go
                                    </Button>

                                    {/* "Select All" Checkbox */}
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography color="textPrimary">Select all</Typography>
                                        <Checkbox
                                            checked={selectAllChecked}
                                            onChange={handleSelectAllChange}
                                            sx={{ ml: 2 }} // Move checkbox to end
                                        />
                                    </Box>
                                </Box>
                            )}
                        </TabPanel>

                        <TabPanel value={selectedTab} index={2}>
                            <Card sx={{ padding: '20px' }}>
                                <Typography>You haven't created any discussions yet.</Typography>
                            </Card>
                        </TabPanel>

                        <TabPanel value={selectedTab} index={3}>
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
