import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, IconButton, Badge, Typography, Divider, Box, Button, Tabs, Tab, Tooltip } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import { useNavigate } from 'react-router-dom';
import UserAnnouncementService from '../configuration/Services/UserAnnouncementService';
import GeneralAnnouncementService from '../configuration/Services/GeneralAnnouncementService';
import { timeAgo } from '../configuration/utils/TimeFormating';

const AnnouncementDropdown = ({ userId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [personalAnnouncements, setPersonalAnnouncements] = useState([]);
    const [generalAnnouncements, setGeneralAnnouncements] = useState([]);
    const [eventAnnouncements, setEventAnnouncements] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('personal'); // Default to personal announcements
    const [generalLoaded, setGeneralLoaded] = useState(false); // Track if general announcements have been loaded
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchPersonalAnnouncements();
        }
    }, [userId]);

    const fetchPersonalAnnouncements = async () => {
        try {
            const response = await UserAnnouncementService.getLatestAnnouncements(userId);
            if (response?.content && Array.isArray(response.content)) {
                setPersonalAnnouncements(response.content); // Extract 'content' array
                const personalUnread = response.content.filter(ann => !ann.isRead).length;
                setUnreadCount(prev => prev + personalUnread);
            } else {
                setPersonalAnnouncements([]); // Ensure it's an array
            }
        } catch (error) {
            console.error('Error fetching personal announcements:', error);
            setPersonalAnnouncements([]); // Prevent crashing
        }
    };

    const fetchGeneralAnnouncements = async () => {
        try {
            if (!generalLoaded) {
                const response = await GeneralAnnouncementService.getGeneralAnnouncements();
                if (response?.content && Array.isArray(response.content)) {
                    setGeneralAnnouncements(response.content);
                    setGeneralLoaded(true);
                    const generalUnread = response.content.filter(ann => !ann.isRead).length;
                    setUnreadCount(prev => prev + generalUnread);
                } else {
                    setGeneralAnnouncements([]);
                }
            }
        } catch (error) {
            console.error('Error fetching general announcements:', error);
            setGeneralAnnouncements([]);
        }
    };

    const fetchEventAnnouncements = async () => {
        try {
            const response = await GeneralAnnouncementService.getUserAnnouncements(userId);
            if (response?.content && Array.isArray(response.content)) {
                setEventAnnouncements(response.content);
            } else {
                setEventAnnouncements([]);
            }
        } catch (error) {
            console.error('Error fetching event announcements:', error);
            setEventAnnouncements([]);
        }
    };


    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleTabChange = (event, newTab) => {
        setActiveTab(newTab);
        if (newTab === 'general') {
            fetchGeneralAnnouncements();
        } else if (newTab === 'event') {
            fetchEventAnnouncements();
        }
    };

    const handleAnnouncementClick = (announcementId) => {
        navigate(`/announcement/${announcementId}`);
        handleCloseMenu();
    };


    const markAsRead = async (announcementId, category) => {
        try {
            await UserAnnouncementService.markAnnouncementAsRead(announcementId, userId);

            if (category === 'personal') {
                setPersonalAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
            } else if (category === 'event') {
                setEventAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
            } else {
                setGeneralAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
            }
        } catch (error) {
            console.error('Error marking announcement as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            if (activeTab === 'personal') {
                await Promise.all(personalAnnouncements.map(ann => UserAnnouncementService.markAnnouncementAsRead(ann.id, userId)));
                setPersonalAnnouncements([]);
            } else if (activeTab === 'event') {
                await Promise.all(eventAnnouncements.map(ann => UserAnnouncementService.markAnnouncementAsRead(ann.id, userId)));
                setEventAnnouncements([]);
            } else {
                await Promise.all(generalAnnouncements.map(ann => UserAnnouncementService.markAnnouncementAsRead(ann.id, userId)));
                setGeneralAnnouncements([]);
            }
            setUnreadCount(0);
            handleCloseMenu();
        } catch (error) {
            console.error('Error marking all announcements as read:', error);
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleOpenMenu}>
                <Badge badgeContent={unreadCount} color="error">
                    <MailIcon />
                </Badge>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                <Typography variant="h6" sx={{ px: 2, py: 1 }}>Announcements</Typography>
                <Divider />

                {/* Toggle Tabs */}
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Personal" value="personal" />
                    <Tab label="Event-Specific" value="event" />
                    <Tab label="General" value="general" />
                </Tabs>

                <Divider />

                {/* Display Announcements Based on Tab */}
                {[{ tab: 'personal', data: personalAnnouncements }, 
                  { tab: 'event', data: eventAnnouncements }, 
                  { tab: 'general', data: generalAnnouncements }]
                  .map(({ tab, data }) => (
                    activeTab === tab && (
                        data.length > 0 ? data.map(ann => (
                            <MenuItem key={ann.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Tooltip title={ann.message} arrow>
                                    <Box 
                                        sx={{ flexGrow: 1, cursor: 'pointer' }} 
                                        onClick={() => handleAnnouncementClick(ann.id)}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            noWrap 
                                            sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        >
                                            <b>{ann.type}</b>: {ann.message}
                                        </Typography>
                                        <Typography variant="caption" color="gray">{timeAgo(ann.createdAt)}</Typography>
                                    </Box>
                                </Tooltip>
                                <Button size="small" onClick={() => markAsRead(ann.id, tab)}>
                                    Mark as Read
                                </Button>
                            </MenuItem>
                        )) : <MenuItem>No {tab} announcements</MenuItem>
                    )
                ))}

                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
                    <Button onClick={markAllAsRead} variant="text" size="small">Mark All as Read</Button>
                </Box>
            </Menu>
        </>
    );
};

export default AnnouncementDropdown;
