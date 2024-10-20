import React from 'react';
import { NotificationsProvider, useNotifications } from '@toolpad/core/useNotifications';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';

// Define the styled snackbar for notifications
const notificationsProviderSlots = {
    snackbar: styled(Snackbar)(),
};

// Export the NotificationProvider component
const NotificationProvider = ({ children }) => {
    return (
        <NotificationsProvider slots={notificationsProviderSlots}>
            {children}
        </NotificationsProvider>
    );
};

// Custom hook to use notifications
export const useAppNotifications = () => {
    return useNotifications();
};

export default NotificationProvider;
