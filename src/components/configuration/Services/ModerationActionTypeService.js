import api from '../api';

const ModerationActionTypeService = {
    // Get all moderation action types
    getAll: () => {
        // This endpoint needs to be implemented on the backend
        return api.get('/moderation-action-types', { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Get a specific moderation action type by ID
    getById: (id) => {
        // This endpoint needs to be implemented on the backend
        return api.get(`/moderation-action-types/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

     // Get action type ID from name (client-side lookup from cached types)
    getIdByName: async (name) => {
        try {
            // Get all action types
            const types = await ModerationActionTypeService.getAll();
            
            // Find the matching type by name
            const matchingType = types.find(type => 
                type.name.toUpperCase() === name.toUpperCase()
            );
            
            // Return the ID if found, otherwise return null
            return matchingType ? matchingType.id : null;
        } catch (err) {
            console.error('Error in getIdByName:', err);
            return null;
        }
    },

    // Create a new moderation action type (admin only)
    create: (data) => {
        // This endpoint needs to be implemented on the backend
        return api.post('/moderation-action-types', data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Update an existing moderation action type (admin only)
    update: (id, data) => {
        // This endpoint needs to be implemented on the backend
        return api.put(`/moderation-action-types/${id}`, data, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    // Delete a moderation action type (admin only)
    delete: (id) => {
        // This endpoint needs to be implemented on the backend
        return api.delete(`/moderation-action-types/${id}`, { requiresAuth: true })
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    }
};

export default ModerationActionTypeService; 