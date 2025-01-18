import showcaseAPI from '../showcaseAPI';

const BrandService = {

    getAllBrands: async () => {
        try {
            const response = await showcaseAPI.get('/brand');
            return response.data.content || []; // Extract and return content
        } catch (error) {
            return Promise.reject(error);
        }
    },
    

    // Fetch a specific tag by ID
    getBrandsById: (brandId) => {
        return showcaseAPI.get(`/brand/${brandId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    createBrands: (brandData) => {
        return showcaseAPI.post('/brand', brandData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    updateBrands: (brandData) => {
        return showcaseAPI.put(`/brand`, brandData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteBrands: (brandId) => {
        return showcaseAPI.delete(`/brand/${brandId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    getTopBrands: (query) => {
        return showcaseAPI.get('/brand/top', { params: { query } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    searchBrands: async(name) => {
        try {
            const response = await showcaseAPI.get('/brand/search', { params: { name } });
            return response.data.content || []; // Extract and return content
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default BrandService;
