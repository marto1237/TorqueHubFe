import api from '../api';

const NotificationService = {
    getUnreadNotifications: (userId) => {
        return api.get(`/notifications/${userId}/unread/latest`, )
            .then(response => {
                console.log("Response Data:", response.data);  // Debugging
                return response.data;
            })
            .catch(error => Promise.reject(error));
    },

    getAllNotifications: (userId, page = 0, size = 20) => {
        return api.get(`/notifications/${userId}/all`, { params: { page, size } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getAllUserNotifications: (page = 0, size = 20) => {
        return api.get(`/notifications/user/all`, {
            params: { page, size },
            requiresAuth: true, 
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },

    markNotificationAsRead: (notificationId) => {
        return api.put(`/notifications/${notificationId}/mark-as-read`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    markAllAsRead: (userId) => {
        return api.put(`/notifications/${userId}/mark-all-as-read`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }
};

export default NotificationService;
