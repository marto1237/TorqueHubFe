import api from '../api';

// Service for moderation logs
const ModerationLogService = {
    create: (data) => {
        return api.post('/moderation-logs', data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getByReportId: (reportId, page = 0, size = 10) => {
        return api.get(`/moderation-logs/report/${reportId}`, { params: { page, size }, requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getByModeratorId: (moderatorId, page = 0, size = 10) => {
        return api.get(`/moderation-logs/moderator/${moderatorId}`, { params: { page, size }, requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ModerationLogService;