import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import NotificationService from "../configuration/Services/NotificationService";
import { timeAgo } from "../configuration/utils/TimeFormating";
import { useTheme } from '@mui/material/styles';
import { useAppNotifications } from '../common/NotificationProvider';

const NotificationsPage = () => {
    const theme = useTheme();
    const notificationsApp = useAppNotifications();
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    useEffect(() => {
        fetchNotifications(page, pageSize);
    }, [page, pageSize]);

    const fetchNotifications = async (currentPage, size) => {
        const token = sessionStorage.getItem('jwtToken');
        console.log("Token:", token);

        if (!token) {
            notificationsApp.show('You need to be logged in to see your notifications', {
                autoHideDuration: 3000,
                severity: 'error',
            });
            return;
        }

        try {
            const response = await NotificationService.getAllUserNotifications(currentPage, size);
            setNotifications(response.content); // Save fetched notifications
            setTotalPages(response.totalPages); // Set total pages based on API response
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
            window.scrollTo(0, 0);
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
