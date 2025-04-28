import api from '../api';

// Service for report statistics (admin)
const ReportStatisticsService = {
    getStatusStats: () => {
        return api.get('/reports/statistics/status', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getTypeStats: () => {
        return api.get('/reports/statistics/type', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getReasonStats: () => {
        return api.get('/reports/statistics/reason', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getPeriodStats: (start, end) => {
        return api.get('/reports/statistics/period', { params: { start, end }, requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getModeratorActivity: (moderatorId) => {
        return api.get(`/reports/statistics/moderator-activity/${moderatorId}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getTrendsByDay: () => {
        return api.get('/reports/statistics/trends/daily', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getTrendsByWeek: () => {
        return api.get('/reports/statistics/trends/weekly', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getTrendsByMonth: () => {
        return api.get('/reports/statistics/trends/monthly', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ReportStatisticsService;