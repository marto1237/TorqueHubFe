import showcaseAPI from '../showcaseAPI';

const ShowcaseService = {
    getUserShowcases: (userId, page = 0, size = 10) => {
        const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve token from sessionStorage

        // Add the Authorization header if the token exists
        const config = jwtToken ? {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            },
            params: { page, size } // Add pagination params
        } : { params: { page, size } }; // Fallback to just params if no token

        return showcaseAPI
            .get(`/showcase/user/${userId}`, config)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    getShowcaseByID: (showcaseId) => {
        const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve token from sessionStorage

        const config = jwtToken ? {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        } : {};

        return showcaseAPI
            .get(`/showcase/${showcaseId}`, config)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
};

export default ShowcaseService;
