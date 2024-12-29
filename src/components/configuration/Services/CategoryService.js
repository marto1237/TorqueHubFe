import showcaseAPI from '../showcaseAPI';

const CategoryService = {

    getAllCategories: async () => {
        try {
            const response = await showcaseAPI.get('/categories');
            return response.data.content || []; // Extract and return content
        } catch (error) {
            return Promise.reject(error);
        }
    },
    

    // Fetch a specific tag by ID
    getCategoryById: (categoryId) => {
        return showcaseAPI.get(`/categories/${categoryId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    createCategory: (categoryData) => {
        return showcaseAPI.post('/categories', categoryData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    updateCategory: (categoryId, categoryData) => {
        return showcaseAPI.put(`/categories/${categoryId}`, categoryData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteCategory: (categoryId) => {
        return showcaseAPI.delete(`/categories/${categoryId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    getTopCategories: (query) => {
        return showcaseAPI.get('/categories/top', { params: { query } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    searchCategory: async(name) => {
        try {
            const response = await showcaseAPI.get('/categories/search', { params: { name } });
            return response.data.content || []; // Extract and return content
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default CategoryService;
