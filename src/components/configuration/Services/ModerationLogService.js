import api from '../api';

// Service for moderation logs
const ModerationLogService = {
    // Get all moderation logs (admin only)
    getAll: () => {
        return api.get('/moderation-logs', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get a specific moderation log by ID (admin only)
    getById: (id) => {
        return api.get(`/moderation-logs/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get moderation logs by report ID (moderator or admin)
    getByReportId: (reportId) => {
        return api.get(`/moderation-logs/report/${reportId}`, { requiresAuth: true })
            .then(res => {
                console.log('Moderation logs response:', res.data);
                return Array.isArray(res.data) ? res.data : 
                       (res.data && res.data.content && Array.isArray(res.data.content)) ? 
                       res.data.content : [];
            })
            .catch(err => {
                console.error('Error in getByReportId:', err);
                return [];
            });
    },

    // Get moderation logs by moderator ID (admin only)
    getByModeratorId: (moderatorId) => {
        return api.get(`/moderation-logs/moderator/${moderatorId}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get moderation logs filtered by time period (admin only)
    getByTimePeriod: (start, end) => {
        return api.get('/moderation-logs/period', { 
            params: { start, end }, 
            requiresAuth: true 
        })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Add a new moderation log (moderator or admin)
    create: (data) => {
        return api.post('/moderation-logs', data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ModerationLogService;