import ticktsAPI from '../ticketsAPI';

const TicketTypeService = {
    createTicketType: async (ticketTypeData, token) => {
        try {
            const response = await ticktsAPI.post('/ticket-types', ticketTypeData, {
                headers: { Authorization: token },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getTicketTypeById: async (ticketTypeId) => {
        try {
            const response = await ticktsAPI.get(`/ticket-types/${ticketTypeId}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    deleteTicketType: async (ticketTypeId, token) => {
        try {
            await ticktsAPI.delete(`/ticket-types/${ticketTypeId}`, {
                headers: { Authorization: token },
            });
            return true;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    updateTicketType: async (ticketTypeData, token) => {
        try {
            const response = await ticktsAPI.put('/ticket-types', ticketTypeData, {
                headers: { Authorization: token },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getAllByEventId: async (eventId, page = 0, size = 10) => {
        try {
            const response = await ticktsAPI.get(`/ticket-types/event/${eventId}`, {
                params: { page, size },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default TicketTypeService;
