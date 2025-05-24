import showcaseAPI from '../api/showcaseAPI';

const BrandService = {

    getAllBrands: async () => {
        try {
            const response = await showcaseAPI.get('/brand');
            return response.data.content || []; // Extract and return content
        } catch (error) {
            console.error('Error fetching brands:', error);
            return Promise.reject(error);
        }
    },
    
    // Fetch a specific brand by ID
    getBrandsById: (brandId) => {
        return showcaseAPI.get(`/brand/${brandId}`)
            .then(response => response.data)
            .catch(error => {
                console.error(`Error fetching brand ${brandId}:`, error);
                return Promise.reject(error);
            });
    },

    createBrands: (brandData) => {
        // Ensure content type is explicitly set for POST requests
        return showcaseAPI.post('/brand', brandData, { 
            requiresAuth: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('Brand created successfully:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('Error creating brand:', error);
            // Provide more specific error information
            if (error.isConnectionError) {
                console.error('Connection to server failed');
            } else if (error.response?.status === 401) {
                console.error('Authentication error - please log in again');
            } else if (error.response?.status === 400) {
                console.error('Invalid brand data:', error.response.data);
            }
            return Promise.reject(error);
        });
    },

    updateBrands: (brandData) => {
        return showcaseAPI.put(`/brand`, brandData, { 
            requiresAuth: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.data)
        .catch(error => {
            console.error('Error updating brand:', error);
            return Promise.reject(error);
        });
    },

    deleteBrands: (brandId) => {
        return showcaseAPI.delete(`/brand/${brandId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => {
                console.error(`Error deleting brand ${brandId}:`, error);
                return Promise.reject(error);
            });
    },
    
    getTopBrands: (query) => {
        return showcaseAPI.get('/brand/top', { params: { query } })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching top brands:', error);
                return Promise.reject(error);
            });
    },

    searchBrands: async(name) => {
        try {
            const response = await showcaseAPI.get('/brand/search', { params: { name } });
            return response.data.content || []; // Extract and return content
        } catch (error) {
            console.error(`Error searching brands with name "${name}":`, error);
            return Promise.reject(error);
        }
    },
};

export default BrandService; 