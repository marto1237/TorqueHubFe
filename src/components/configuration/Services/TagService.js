import api from '../api';

const TagService = {
    getAllTags: () => {
        return api.get('/tags', { })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Fetch a specific tag by ID
    getTagById: (tagId) => {
        return api.get(`/tags/${tagId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Create a new tag (requires authentication)
    createTag: (tagData) => {
        return api.post('/tags', tagData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Update an existing tag by ID (requires authentication)
    updateTag: (tagId, tagData) => {
        return api.put(`/tags/${tagId}`, tagData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Delete a tag by ID (requires authentication)
    deleteTag: (tagId) => {
        return api.delete(`/tags/${tagId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    getTopTags: (query) => {
        return api.get('/tags/top', { params: { query } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    searchTags: (name) => {
        return api.get('/tags/search', { params: { name } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    
};

export default TagService;
