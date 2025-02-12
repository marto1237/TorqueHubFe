import ticktsAPI from '../ticketsAPI';

const EventService = {
    createEvent: async (eventData, token) => {
        try {
            const response = await ticktsAPI.post('/events', eventData, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getEventById: async (eventId) => {
        try {
            const response = await ticktsAPI.get(`/events/${eventId}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    deleteEvent: async (eventId) => {
        try {
            const response = await ticktsAPI.delete(`/events/${eventId}`, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    updateEvent: async (eventData) => {
        try {
            const response = await ticktsAPI.put('/events', eventData, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllEvents: async (page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get('/events', {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllEventsByUserId: async (userId, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/events/creator/${userId}`, {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findTop5RecentEvents: async (page = 0, size = 5) => {
        try {
            const response = await ticktsAPI.get('/events/recent', {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllByDateBetween: async (startDate, endDate, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get('/events/between', {
                params: { startDate, endDate, page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllByDateAfter: async (date, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get('/events/after', {
                params: { date, page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllByDateBefore: async (date, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get('/events/before', {
                params: { date, page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllByLocation: async (location, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get('/events/location', {
                params: { location, page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllByName: async (name, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get('/events/name', {
                params: { name, page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    findAllByCreatorAndDateBetween: async (userId, startDate, endDate, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/events/creator/${userId}/between`, {
                params: { startDate, endDate, page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Add other methods if needed
};

export default EventService;
