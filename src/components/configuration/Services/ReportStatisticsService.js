import api from '../api';

// Service for report statistics (admin)
const ReportStatisticsService = {
    // Get statistics about report statuses (admin only)
    getStatusStats: () => {
        return api.get('/reports/statistics/status', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get statistics about report types (admin only)
    getTypeStats: () => {
        return api.get('/reports/statistics/type', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get statistics about report reasons (admin only)
    getReasonStats: () => {
        return api.get('/reports/statistics/reason', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get reports statistics for a specific time period (admin only)
    getPeriodStats: (start, end) => {
        return api.get('/reports/statistics/period', { 
            params: { start, end }, 
            requiresAuth: true 
        })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get moderation activity statistics for a specific moderator (admin only)
    getModeratorActivity: (moderatorId) => {
        return api.get(`/reports/statistics/moderator-activity/${moderatorId}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get daily report trends (admin only)
    getTrendsByDay: () => {
        return api.get('/reports/statistics/trends/daily', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get weekly report trends (admin only)
    getTrendsByWeek: () => {
        return api.get('/reports/statistics/trends/weekly', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get monthly report trends (admin only)
    getTrendsByMonth: () => {
        return api.get('/reports/statistics/trends/monthly', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ReportStatisticsService;