import ticktsAPI from '../ticketsAPI';

const GeneralAnnouncementService = {
    
    createAnnouncement: async (announcementData) => {
        try {
            const response = await ticktsAPI.post(`/announcements`, announcementData, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    updateAnnouncement: async (announcementId, announcementData) => {
        try {
            const response = await ticktsAPI.put(`/announcements/${announcementId}`, announcementData, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    deleteAnnouncement: async (announcementId) => {
        try {
            const response = await ticktsAPI.delete(`/announcements/${announcementId}`, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    getAnnouncementsByEvent: async (eventId, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/announcements/event/${eventId}`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    getGeneralAnnouncements: async (page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/announcements/general`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },
    getUserAnnouncements: async (userId, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/announcements/user/${userId}`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    getEventAnnouncementsForUser: async (userId, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/announcements/user/${userId}/event-announcements`, {
                params: { page, size }
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
    },

    getAnnouncementById: async(announcementId) => {
        try {
            const response = await ticktsAPI.get(`/announcements/${announcementId}`, {
                params: { announcementId }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },
    searchGeneralAnnouncements: async (keyword, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/announcements/general/search`, {
                params: { keyword, page, size }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    getAnnouncementsByEventId: async (eventId,  page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/announcements/event/${eventId}`, {
                params: { eventId, page, size }
            });
            console.log("Fetched Announcements:", response.data);
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    getAnnouncementsByTicketType: async (eventId = null, ticketTypeId = null, page = 0, size = 10) => {
        if (!eventId && !ticketTypeId) {
            throw new Error("Either eventId or ticketTypeId must be provided.");
        }
        
        try {
            const response = await ticktsAPI.get(`/announcements/ticket`, {
                params: { eventId, ticketTypeId, page, size }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },

    getDelayAnnouncements: async (eventId = null, ticketTypeId = null, page = 0, size = 10) => {
        if (!eventId && !ticketTypeId) {
            throw new Error("Either eventId or ticketTypeId must be provided.");
        }
        
        try {
            const response = await ticktsAPI.get(`/announcements/delay`, {
                params: { eventId, ticketTypeId, page, size }
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data || error);
        }
    },
    
};

export default GeneralAnnouncementService;
