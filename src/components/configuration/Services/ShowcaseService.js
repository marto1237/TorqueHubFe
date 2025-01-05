import showcaseAPI from '../showcaseAPI';

const ShowcaseService = {

    getAllShowcases:(page = 0, size = 10) => {
        return showcaseAPI
            .get(`/showcase`, {
                params: { page, size }, 
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getUserShowcases: (userId, page = 0, size = 10) => {
        return showcaseAPI
            .get(`/showcase/user/${userId}`, {
                requiresAuth: true, // Automatically adds the Authorization header
                params: { page, size }, // Add pagination params
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    createShowcase: (showcaseData) => {
        return showcaseAPI
            .post('/showcase', showcaseData, {
                requiresAuth: true,
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteShowcase: (showcaseId) => {
        return showcaseAPI
            .delete(`/showcase/${showcaseId}`, {
                requiresAuth: true, // Automatically adds the Authorization header
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    
    

    updateShowcase: (id, showcaseData) => {
        return showcaseAPI
            .put(`/showcase/${id}`, showcaseData, {
                requiresAuth: true, // Automatically adds the Authorization header
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getShowcaseByID: (showcaseId) => {
        return showcaseAPI
            .get(`/showcase/${showcaseId}`, {
                requiresAuth: true, // Automatically adds the Authorization header
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    addModification: (modification) => {
        return showcaseAPI
            .post('/modifications', modification, {
                requiresAuth: true, // Automatically adds the Authorization header
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    updateModification: (id, modification) => {
        return showcaseAPI
            .put(`/modifications/${id}`, modification, {
                requiresAuth: true, // Automatically adds the Authorization header
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteModification: (id) => {
        return showcaseAPI
            .delete(`/modifications/${id}`, {
                requiresAuth: true, // Automatically adds the Authorization header
            })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
};

export default ShowcaseService;
