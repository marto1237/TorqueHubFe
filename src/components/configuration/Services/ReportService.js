import api from '../api';

const ReportService = {


    
    // Submit a new report
    createReport: (reportData) => {
        return api.post('/reports', reportData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    getById: (id) => {
        return api.get(`/reports/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    // Get all reports submitted by the current user
    getMyReports: (page = 0, size = 10) => {
        return api.get('/reports/my-reports', { 
            params: { page, size },
            requiresAuth: true 
        })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Admin/Moderator: Get all reports
    getAllReports: (page = 0, size = 10) => {
        return api.get('/reports', { 
            params: { page, size },
            requiresAuth: true 
        })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Admin/Moderator: Get reports by status
    getReportsByStatus: (statusName, page = 0, size = 10) => {
        return api.get(`/reports/status/${statusName}`, { 
            params: { page, size },
            requiresAuth: true 
        })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Admin/Moderator: Update report status
    updateReportStatus: (reportId, statusData) => {
        return api.put(`/reports/${reportId}/status`, statusData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    delete: (id) => {
        return api.delete(`/reports/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Admin/Moderator: Add moderation action to a report
    addModerationAction: (reportId, actionData) => {
        return api.post(`/reports/${reportId}/actions`, actionData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Admin/Moderator: Get moderation actions for a report
    getModerationActions: (reportId) => {
        return api.get(`/reports/${reportId}/actions`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }
};

export default ReportService;