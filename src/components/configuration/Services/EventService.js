import ticktsAPI from '../ticketsAPI';

const EventService = {
    createEvent: async (eventData, token) => {
        try {
            const response = await ticktsAPI.post('/events', eventData, {
                headers: { Authorization: token },
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

    deleteEvent: async (eventId, token) => {
        try {
            const response = await ticktsAPI.delete(`/events/${eventId}`, {
                headers: { Authorization: token },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    updateEvent: async (eventData, token) => {
        try {
            const response = await ticktsAPI.put('/events', eventData, {
                headers: { Authorization: token },
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

    // Add other methods if needed
};

export default EventService;
