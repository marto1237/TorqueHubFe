import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationService from "../configuration/Services/NotificationService";
import { timeAgo } from "../configuration/utils/TimeFormating";
import { useAppNotifications } from '../common/NotificationProvider';

const NotificationsPage = () => {
    const theme = useTheme();
    const notificationsApp = useAppNotifications();
    const [notifications, setNotifications] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    // Parse URL query parameters for page and pageSize
    const queryParams = new URLSearchParams(location.search);
    const initialPage = parseInt(queryParams.get('page') || '0', 10);
    const initialPageSize = parseInt(queryParams.get('pageSize') || '20', 10);

    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    useEffect(() => {
        fetchNotifications(page, pageSize);
    }, [page, pageSize]);

    const fetchNotifications = async (currentPage, size) => {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            notificationsApp.show('You need to be logged in to see your notifications', {
                autoHideDuration: 3000,
                severity: 'error',
            });
            return;
        }

        try {
            const response = await NotificationService.getAllUserNotifications(currentPage, size);
            setNotifications(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            notificationsApp.show('Error fetching notifications. Please try again later.', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            // Update URL with new page and pageSize values
            navigate(`/notifications?page=${newPage}&pageSize=${pageSize}`);
            window.scrollTo(0, 0);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await NotificationService.markNotificationAsRead(notificationId);
            setNotifications((prevNotifications) =>
                prevNotifications.map(notif => 
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            notificationsApp.show('Notification marked as read.', {
                autoHideDuration: 3000,
                severity: 'success',
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            notificationsApp.show('Failed to mark notification as read.', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    return (
        <Box sx={{ padding: { xs: '20px', sm: '100px' }, backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ maxWidth: '900px', margin: 'auto', minHeight: '60vh' }}>
                <Typography variant="h4" sx={{ marginBottom: '20px', color: theme.palette.text.primary }}>
                    All Notifications
                </Typography>
                <Divider />

                <List>
                    {notifications.length === 0 ? (
                        <Typography sx={{ padding: '20px' }}>No notifications available</Typography>
                    ) : (
                        notifications.map((notif) => (
                            <Paper key={notif.id} sx={{ marginBottom: '10px', padding: '10px' }}>
                                <ListItem divider>
                                    <ListItemText
                                        primary={<span dangerouslySetInnerHTML={{ __html: notif.message }} />}
                                        secondary={`${timeAgo(notif.createdAt)} - ${notif.read ? 'Read' : 'Unread'}`}
                                    />
                                    {!notif.read && (
                                        <Button 
                                            onClick={() => markAsRead(notif.id)} 
                                            variant="outlined" 
                                            sx={{ marginLeft: '10px' }}
                                        >
                                            Mark as Read
                                        </Button>
                                    )}
                                </ListItem>
                            </Paper>
                        ))
                    )}
                </List>

                {/* Pagination Controls */}
                <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
                    <Button
                        variant="outlined"
                        disabled={page === 0}
                        onClick={() => handlePageChange(page - 1)}
                        sx={{ marginRight: '10px' }}
                    >
                        Previous
                    </Button>
                    <Typography variant="body2" display="inline" sx={{ marginX: '10px' }}>
                        Page {page + 1} of {totalPages}
                    </Typography>
                    <Button
                        variant="outlined"
                        disabled={page + 1 >= totalPages}
                        onClick={() => handlePageChange(page + 1)}
                        sx={{ marginLeft: '10px' }}
                    >
                        Next
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default NotificationsPage;
