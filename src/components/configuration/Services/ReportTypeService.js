import api from '../api';

// Service for report types (e.g., QUESTION, ANSWER, COMMENT, etc.)
const ReportTypeService = {
    getAll: () => {
        return api.get('/report-types')
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    getById: (id) => {
        return api.get(`/report-types/${id}`)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    create: (data) => {
        return api.post('/report-types', data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    update: (id, data) => {
        return api.put(`/report-types/${id}`, data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    delete: (id) => {
        return api.delete(`/report-types/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ReportTypeService;