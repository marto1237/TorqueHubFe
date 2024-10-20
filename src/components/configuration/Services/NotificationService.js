import api from '../api';

const NotificationService = {
    getUnreadNotifications: () => {
        return api.get('/notifications/unread/latest')
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    markAllNotificationsAsRead: () => {
        return api.put('/notifications/mark-all-as-read')
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    markNotificationAsRead: (notificationId) => {
        return api.put(`/notifications/${notificationId}/mark-as-read`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getAllNotifications: () => {
        return api.get('/notifications/all')
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }
};

export default NotificationService;
