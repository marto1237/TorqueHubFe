import showcaseAPI from '../showcaseAPI';

const ModelService = {
    getAllModels: async (page = 0, size = 10) => {
        try {
            const response = await showcaseAPI.get('/models', { params: { page, size } });
            return response.data || []; // Extract and return content
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getModelById: async (id) => {
        try {
            const response = await showcaseAPI.get(`/models/${id}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getModelByName: async (name, page = 0, size = 10) => {
        try {
            const response = await showcaseAPI.get('/models/name', { params: { name, page, size } });
            return response.data.content || [];
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getModelsByManufacturingYear: async (year, page = 0, size = 10) => {
        try {
            const response = await showcaseAPI.get(`/models/year/${year}`, { params: { page, size } });
            return response.data.content || [];
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getModelsByBrandName: async (brandName, page = 0, size = 10) => {
        try {
            const response = await showcaseAPI.get('/models/brand', { params: { brandName, page, size } });
            return response.data.content || [];
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getModelsBetweenYears: async (startYear, endYear, page = 0, size = 10) => {
        try {
            const response = await showcaseAPI.get('/models/year-range', {
                params: { startYear, endYear, page, size },
            });
            return response.data.content || [];
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getModelsByBrandAndYear: async (brandName, year, page = 0, size = 10) => {
        try {
            const response = await showcaseAPI.get('/models/brand-year', {
                params: { brandName, year, page, size },
            });
            return response.data.content || [];
        } catch (error) {
            return Promise.reject(error);
        }
    },

    createModel: async (modelData) => {
        try {
            const response = await showcaseAPI.post('/models', modelData, { requiresAuth: true });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    updateModel: async (modelData) => {
        try {
            const response = await showcaseAPI.put('/models', modelData, { requiresAuth: true });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    deleteModel: async (id) => {
        try {
            const response = await showcaseAPI.delete(`/models/${id}`, { requiresAuth: true });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default ModelService;
