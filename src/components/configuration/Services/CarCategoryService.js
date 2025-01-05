import ticktsAPI from '../ticketsAPI';

const CarCategory = {
    getAllCategories: () => {
        return ticktsAPI.get('/car-categories', { })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getCategoryById: (categoryId) => {
        return ticktsAPI.get(`/car-categories/${categoryId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    createCategory: (tagData) => {
        return ticktsAPI.post('/car-categories', tagData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    updateCategory: (categoryId, tagData) => {
        return ticktsAPI.put(`/car-categories/${categoryId}`, tagData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteCategory: (categoryId) => {
        return ticktsAPI.delete(`/car-categories/${categoryId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    searchCategories: (name) => {
        return ticktsAPI.get('/car-categories/search', { params: { name } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    
};

export default CarCategory;
