import api from '../api';
import ReportStatusService from './ReportStatusService';

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
    // Update a report's status
    updateReportStatus: (reportId, statusId, notes = '') => {
        if (!reportId || !statusId) {
            console.error('Missing required parameters for updateReportStatus:', { reportId, statusId });
            return Promise.reject(new Error('Required parameters missing'));
        }
        
        console.log('Updating report status:', { reportId, statusId, notes });
        
        // Get current user details to get moderatorId
        const userDetails = JSON.parse(sessionStorage.getItem('userDetails') || '{}');
        const moderatorId = userDetails.id;

        if (!moderatorId) {
            console.error('Missing moderatorId for updateReportStatus - user not logged in');
            return Promise.reject(new Error('User authentication required'));
        }
        // The backend expects only statusId and note (optional)
        return api.put(`/reports/${reportId}/status`, {
            statusId: statusId,
            note: notes,
            moderatorId: moderatorId
        }, { requiresAuth: true })
            .then(res => {
                console.log('Report status update response:', res.data);
                return res.data;
            })
            .catch(err => {
                console.error('Error updating report status:', err);
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    request: err.config
                });
                return Promise.reject(err);
            });
    },

    delete: (id) => {
        return api.delete(`/reports/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Admin/Moderator: Add moderation action to a report
    addModerationAction: (reportId, actionData) => {
        // The backend expects these fields exactly as defined in ModerationActionCreateRequest
        const formattedData = {
            reportId: reportId,
            moderatorId: actionData.moderatorId,
            actionTypeId: actionData.actionTypeId,
            newStatusId: actionData.newStatusId || null,
            notes: actionData.notes || '',
            // Optional fields
            banDuration: actionData.banDuration || null,
            targetUserId: actionData.targetUserId || null
        };
        
        // Debug log: Data being sent to the backend
        console.log('Sending moderation action data:', {
            url: `/reports/${reportId}/actions`,
            method: 'POST',
            data: formattedData,
            userDetails: JSON.parse(sessionStorage.getItem('userDetails') || '{}'),
            token: sessionStorage.getItem('jwtToken') ? 'Token exists' : 'No token found'
        });
        
        return api.post(`/reports/${reportId}/actions`, formattedData, { requiresAuth: true })
            .then(response => {
                console.log('Moderation action success response:', response);
                return response.data;
            })
            .catch(error => {
                console.error('Error adding moderation action:', error);
                // If the error has a response, log its details
                if (error.response) {
                    console.error('Error response status:', error.response.status);
                    console.error('Error response data:', error.response.data);
                }
                // Log the specific error message if available
                if (error.message) {
                    console.error('Error message:', error.message);
                }
                return Promise.reject(error);
            });
    },

    // Admin/Moderator: Get moderation actions for a report
    getModerationActions: (reportId) => {
        return api.get(`/reports/${reportId}/actions`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }
};

export default ReportService; 