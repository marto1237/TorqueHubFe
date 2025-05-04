import api from '../api';

// Service for report statuses (e.g., OPEN, CLOSED, etc.)
const ReportStatusService = {
    // Get all report statuses (paginated, requires moderator or admin)
    getAll: (page = 0, size = 10) => {
        return api.get('/report-statuses', { 
            params: { page, size }, 
            requiresAuth: true 
        })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get a specific report status by ID (requires moderator or admin)
    getById: (id) => {
        return api.get(`/report-statuses/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    getIdByName: async (name) => {
        const status = await ReportStatusService.getByName(name);
        return status ? status.id : null;
    },

    // Create a new report status (admin only)
    create: (data) => {
        return api.post('/report-statuses', data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Update an existing report status (admin only)
    update: (id, data) => {
        return api.put(`/report-statuses/${id}`, data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Delete a report status (admin only)
    delete: (id) => {
        return api.delete(`/report-statuses/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ReportStatusService;