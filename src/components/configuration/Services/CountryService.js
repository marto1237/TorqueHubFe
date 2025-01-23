import showcaseAPI from '../showcaseAPI';

const CountryService = {

    getAllCountries: async () => {
        try {
            const response = await showcaseAPI.get('/countries');
            return response.data.content || []; // Extract and return content
        } catch (error) {
            return Promise.reject(error);
        }
    },
    

    // Fetch a specific tag by ID
    getCountryById: (categoryId) => {
        return showcaseAPI.get(`/countries/${categoryId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    createCountry: (categoryData) => {
        return showcaseAPI.post('/countries', categoryData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    updateCountry: (categoryData) => {
        return showcaseAPI.put(`/countries`, categoryData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteCountry: (categoryId) => {
        return showcaseAPI.delete(`/countries/${categoryId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    searchCountry: async(name) => {
        try {
            const response = await showcaseAPI.get('/countries/search', { params: { name } });
            return response.data.content || []; // Extract and return content
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default CountryService;
