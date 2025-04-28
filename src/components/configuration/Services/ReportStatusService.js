import api from '../api';

// Service for report statuses (e.g., OPEN, CLOSED, etc.)
const ReportStatusService = {
    getAll: (page = 0, size = 10) => {
        return api.get('/report-statuses', { params: { page, size }, requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getById: (id) => {
        return api.get(`/report-statuses/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    create: (data) => {
        return api.post('/report-statuses', data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    update: (id, data) => {
        return api.put(`/report-statuses/${id}`, data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    delete: (id) => {
        return api.delete(`/report-statuses/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ReportStatusService;