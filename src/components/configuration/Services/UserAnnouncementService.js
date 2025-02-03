import ticktsAPI from '../ticketsAPI';

const UserAnnouncementService = {
    
    getUnreadAnnouncementsCount: async (userId) => {
        try {
            const response = await ticktsAPI.get(`/user-announcements/unread/count`, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    getLatestAnnouncements: async (userId, page = 0, size = 5) => {
        try {
            const response = await ticktsAPI.get(`/user-announcements/latest`, {
                params: { userId, page, size }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    markAnnouncementAsRead: async (announcementId, userId) => {
        try {
            const response = await ticktsAPI.put(`/user-announcements/${announcementId}/mark-read`, null, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    }
};

export default UserAnnouncementService;
