import api from '../api';

// Service for report reasons (e.g., spam, abuse, etc.)
const ReportReasonService = {
    getAll: () => {
        return api.get('/report-reasons')
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getById: (id) => {
        return api.get(`/report-reasons/${id}`)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getByTypeId: (typeId) => {
        return api.get(`/report-reasons/by-type/${typeId}`)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    create: (data) => {
        return api.post('/report-reasons', data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    update: (id, data) => {
        return api.put(`/report-reasons/${id}`, data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    delete: (id) => {
        return api.delete(`/report-reasons/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ReportReasonService;