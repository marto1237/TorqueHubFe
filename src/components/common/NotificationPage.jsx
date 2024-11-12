import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import NotificationService from "../configuration/Services/NotificationService";
import { timeAgo } from "../configuration/utils/TimeFormating";
import { useTheme } from '@mui/material/styles';

const NotificationsPage = ({ userId }) => {
    const theme = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    const fetchNotifications = async (currentPage) => {
        try {
            const response = await NotificationService.getAllNotifications(userId, currentPage);
            setNotifications(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <Box sx={{ padding: { xs: '20px', sm: '100px' }, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h4" sx={{ marginBottom: '20px', color: theme.palette.text.primary }}>
                All Notifications
            </Typography>
            <Divider />

            <List>
                {notifications.length === 0 ? (
                    <Typography sx={{ padding: '20px' }}>No notifications available</Typography>
                ) : (
                    notifications.map((notif, index) => (
                        <Paper key={notif.id} sx={{ marginBottom: '10px', padding: '10px' }}>
                            <ListItem divider>
                                <ListItemText
                                    primary={notif.message}
                                    secondary={`${timeAgo(notif.createdAt)} - ${notif.isRead ? 'Read' : 'Unread'}`}
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
    );
};

export default NotificationsPage;