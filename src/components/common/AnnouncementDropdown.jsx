import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, IconButton, Badge, Typography, Divider, Box, Button, Tabs, Tab } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import UserAnnouncementService from '../configuration/Services/UserAnnouncementService';
import GeneralAnnouncementService from '../configuration/Services/GeneralAnnouncementService';
import { timeAgo } from '../configuration/utils/TimeFormating';

const AnnouncementDropdown = ({ userId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [personalAnnouncements, setPersonalAnnouncements] = useState([]);
    const [generalAnnouncements, setGeneralAnnouncements] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('personal'); // Default to personal announcements
    const [generalLoaded, setGeneralLoaded] = useState(false); // Track if general announcements have been loaded

    useEffect(() => {
        if (userId) {
            fetchPersonalAnnouncements();
        }
    }, [userId]);

    const fetchPersonalAnnouncements = async () => {
        try {
            const personal = await UserAnnouncementService.getLatestAnnouncements(userId);
            if (Array.isArray(personal)) {
                setPersonalAnnouncements(personal);
                const personalUnread = personal.filter(ann => !ann.isRead).length;
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
                const general = await GeneralAnnouncementService.getGeneralAnnouncements();
                if (Array.isArray(general)) {
                    setGeneralAnnouncements(general);
                    setGeneralLoaded(true);
                    const generalUnread = general.filter(ann => !ann.isRead).length;
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
        }
    };

    const markAsRead = async (announcementId, isPersonal) => {
        try {
            if (isPersonal) {
                await UserAnnouncementService.markAnnouncementAsRead(announcementId, userId);
                setPersonalAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
            } else {
                await GeneralAnnouncementService.markAnnouncementAsRead(announcementId, userId);
                setGeneralAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
            }
            setUnreadCount(prev => Math.max(0, prev - 1)); // Ensure count doesn't go below 0
        } catch (error) {
            console.error('Error marking announcement as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            if (activeTab === 'personal') {
                await Promise.all(personalAnnouncements.map(ann => UserAnnouncementService.markAnnouncementAsRead(ann.id, userId)));
                setPersonalAnnouncements([]);
            } else {
                await Promise.all(generalAnnouncements.map(ann => GeneralAnnouncementService.markAnnouncementAsRead(ann.id, userId)));
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
                    <Tab label="General" value="general" />
                </Tabs>

                <Divider />

                {/* Display Announcements Based on Tab */}
                {activeTab === 'personal' ? (
                    <>
                        {personalAnnouncements.length > 0 ? (
                            personalAnnouncements.map((ann) => (
                                <MenuItem key={ann.id} onClick={() => markAsRead(ann.id, true)} style={{ cursor: 'pointer' }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2"><b>{ann.type}</b>: {ann.message}</Typography>
                                        <Typography variant="caption" color="gray">{timeAgo(ann.createdAt)}</Typography>
                                    </Box>
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem>No personal announcements</MenuItem>
                        )}
                    </>
                ) : (
                    <>
                        {generalAnnouncements.length > 0 ? (
                            generalAnnouncements.map((ann) => (
                                <MenuItem key={ann.id} onClick={() => markAsRead(ann.id, false)} style={{ cursor: 'pointer' }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2"><b>{ann.type}</b>: {ann.message}</Typography>
                                        <Typography variant="caption" color="gray">{timeAgo(ann.createdAt)}</Typography>
                                    </Box>
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem>No general announcements</MenuItem>
                        )}
                    </>
                )}

                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
                    <Button onClick={markAllAsRead} variant="text" size="small">Mark All as Read</Button>
                </Box>
            </Menu>
        </>
    );
};

export default AnnouncementDropdown;
