import api from '../api';
import ReportService from './ReportService';

// Service for user bans management (admin/moderator)
const UserBanService = {
    // Helper function to get ACTION_TAKEN status ID from reportStatuses array
    getActionTakenStatusId: () => {
        try {
            // Attempt to get report statuses from sessionStorage if available
            const storedStatuses = sessionStorage.getItem('reportStatuses');
            if (storedStatuses) {
                const reportStatuses = JSON.parse(storedStatuses);
                const actionTakenStatus = reportStatuses.find(status => status.name === 'ACTION_TAKEN');
                
                if (actionTakenStatus && actionTakenStatus.id) {
                    console.log('Found ACTION_TAKEN status ID from session storage:', actionTakenStatus.id);
                    return actionTakenStatus.id;
                }
            }
            
            // Default to 3 if not found
            console.log('Using default ACTION_TAKEN status ID: 3');
            return 3;
        } catch (err) {
            console.error('Error finding ACTION_TAKEN status ID:', err);
            // Default to 3 if any error occurs
            return 3;
        }
    },

    // Ban a user with custom settings
    banUser: (banRequest) => {
        return api.post('/moderation/bans', banRequest, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Apply a temporary ban for specified days and update report status
    temporaryBan: async (userId, reason, days, moderatorId = null, reportId = null) => {
        console.log('Applying temporary ban with params:', { 
            userId, 
            reason, 
            days, 
            reportId,
            endpoint: reportId 
                ? `/moderation/bans/temporary/${userId}?reason=${encodeURIComponent(reason)}&days=${days}&reportId=${reportId}`
                : `/moderation/bans/temporary/${userId}?reason=${encodeURIComponent(reason)}&days=${days}`
        });
        
        try {
            // Use the specific temporary ban endpoint that extracts moderatorId from token
            // And include reportId in query parameters if provided
            const endpoint = reportId 
                ? `/moderation/bans/temporary/${userId}?reason=${encodeURIComponent(reason)}&days=${days}&reportId=${reportId}`
                : `/moderation/bans/temporary/${userId}?reason=${encodeURIComponent(reason)}&days=${days}`;
            
            const banResponse = await api.post(endpoint, null, { requiresAuth: true });
            
            console.log('Temporary ban response:', banResponse.data);
            
            // If a report ID was provided, update the report status to ACTION_TAKEN
            if (reportId) {
                console.log('Updating report status after successful ban, reportId:', reportId);
                
                try {
                    // Get the correct status ID for ACTION_TAKEN
                    const actionTakenStatusId = UserBanService.getActionTakenStatusId();
                    console.log('Using status ID for ACTION_TAKEN:', actionTakenStatusId);
                    
                    const statusUpdateResponse = await ReportService.updateReportStatus(
                        reportId, 
                        actionTakenStatusId, 
                        `User was temporarily banned for ${days} days`
                    );
                    console.log('Report status update response:', statusUpdateResponse);
                    console.log('Report status successfully updated to ACTION_TAKEN');
                } catch (statusError) {
                    console.error('Failed to update report status after ban:', statusError);
                    console.error('Status error details:', { 
                        message: statusError.message, 
                        response: statusError.response?.data,
                        status: statusError.response?.status,
                        request: statusError.config
                    });
                }
            }
            
            return banResponse.data;
        } catch (err) {
            console.error('Temporary ban error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                request: err.config
            });
            return Promise.reject(err);
        }
    },

    // Apply a permanent ban and update report status
    permanentBan: async (userId, reason, moderatorId = null, reportId = null) => {
        console.log('Applying permanent ban with params:', { 
            userId, 
            reason, 
            reportId,
            endpoint: reportId 
                ? `/moderation/bans/permanent/${userId}?reason=${encodeURIComponent(reason)}&reportId=${reportId}`
                : `/moderation/bans/permanent/${userId}?reason=${encodeURIComponent(reason)}`
        });
        
        try {
            // Use the specific permanent ban endpoint that extracts moderatorId from token
            // And include reportId in query parameters if provided
            const endpoint = reportId 
                ? `/moderation/bans/permanent/${userId}?reason=${encodeURIComponent(reason)}&reportId=${reportId}`
                : `/moderation/bans/permanent/${userId}?reason=${encodeURIComponent(reason)}`;
            
            const banResponse = await api.post(endpoint, null, { requiresAuth: true });
            
            console.log('Permanent ban response:', banResponse.data);
            
            // If a report ID was provided, update the report status to ACTION_TAKEN
            if (reportId) {
                console.log('Updating report status after successful ban, reportId:', reportId);
                
                try {
                    // Get the correct status ID for ACTION_TAKEN
                    const actionTakenStatusId = UserBanService.getActionTakenStatusId();
                    console.log('Using status ID for ACTION_TAKEN:', actionTakenStatusId);
                    
                    const statusUpdateResponse = await ReportService.updateReportStatus(
                        reportId, 
                        actionTakenStatusId, 
                        'User was permanently banned'
                    );
                    console.log('Report status update response:', statusUpdateResponse);
                    console.log('Report status successfully updated to ACTION_TAKEN');
                } catch (statusError) {
                    console.error('Failed to update report status after ban:', statusError);
                    console.error('Status error details:', { 
                        message: statusError.message, 
                        response: statusError.response?.data,
                        status: statusError.response?.status,
                        request: statusError.config
                    });
                }
            }
            
            return banResponse.data;
        } catch (err) {
            console.error('Permanent ban error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                request: err.config
            });
            return Promise.reject(err);
        }
    },

    // Remove a ban
    unbanUser: (userId) => {
        return api.delete(`/moderation/bans/${userId}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get all currently banned users
    getAllBannedUsers: () => {
        return api.get('/moderation/bans', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get details about a specific user's ban
    getUserBanDetails: (userId) => {
        return api.get(`/moderation/bans/${userId}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Check if a user is banned (public endpoint)
    isUserBanned: (userId) => {
        return api.get(`/moderation/bans/check/${userId}`)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get all users banned by a specific moderator (admin only)
    getUsersBannedByModerator: (moderatorId) => {
        return api.get(`/moderation/bans/moderator/${moderatorId}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default UserBanService; 