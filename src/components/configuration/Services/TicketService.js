import ticktsAPI from '../ticketsAPI';

const TicketService = {
    createTicket: async (ticketData, token) => {
        try {
            const response = await ticktsAPI.post('/tickets', ticketData, {
                headers: { Authorization: token },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getTicketById: async (ticketId) => {
        try {
            const response = await ticktsAPI.get(`/tickets/${ticketId}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getAllTickets: async (page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get('/tickets', {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    updateTicket: async (ticketData, token) => {
        try {
            const response = await ticktsAPI.put('/tickets', ticketData, {
                headers: { Authorization: token },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getTop5RecentTickets: async (page = 0, size = 5) => {
        try {
            const response = await ticktsAPI.get('/tickets/recent', {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getTicketsByUserId: async (userId, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/tickets/user/${userId}`, {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getTicketsByEventId: async (eventId, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/tickets/event/${eventId}`, {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Add other methods if needed
};

export default TicketService;
