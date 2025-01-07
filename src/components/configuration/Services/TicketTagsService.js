import ticktsAPI from '../ticketsAPI';

const TicketTags = {
    getAllTags: () => {
        return ticktsAPI.get('/tags', { })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getTagById: (tagId) => {
        return ticktsAPI.get(`/tags/${tagId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    createTag: (tagData) => {
        return ticktsAPI.post('/tags', tagData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    updateTag: (tagId, tagData) => {
        return ticktsAPI.put(`/tags/${tagId}`, tagData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteTag: (tagId) => {
        return ticktsAPI.delete(`/tags/${tagId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getTopTags: (query) => {
        return ticktsAPI.get('/tags/top', { params: { query } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    searchTags: (name) => {
        return ticktsAPI.get('/tags/search', { params: { name } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    
};

export default TicketTags;
