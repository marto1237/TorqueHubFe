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
        // Add the updateShowcase method
        updateShowcase: (id, showcaseData) => {
            const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve token from sessionStorage
        
            // Configure headers
            const config = jwtToken
                ? {
                      headers: {
                          Authorization: `Bearer ${jwtToken}`,
                          'Content-Type': 'application/json', // Ensure JSON payload
                      },
                  }
                : {};
        
            // Construct payload
            const payload = {
                id: showcaseData.id,
                userId: showcaseData.userId,
                title: showcaseData.title,
                description: showcaseData.description,
                brandId: showcaseData.brandId,
                modelId: showcaseData.modelId,
                categoryId: showcaseData.categoryId,
                countryId: showcaseData.countryId,
                horsepower: showcaseData.horsepower,
                drivetrain: showcaseData.drivetrain,
                weight: showcaseData.weight,
                engineDisplacement: showcaseData.engineDisplacement,
                transmission: showcaseData.transmission,
                torque: showcaseData.torque,
                fuelType: showcaseData.fuelType,
                topSpeed: showcaseData.topSpeed,
                acceleration: showcaseData.acceleration,
            };
        
            // Make PUT request
            return showcaseAPI
                .put(`/showcase/${id}`, payload, config)
                .then((response) => response.data)
                .catch((error) => {
                    console.error('Update error:', error.response || error.message || error);
                    return Promise.reject(error);
                });
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

    addModification: (modification) =>
        showcaseAPI.post('/modifications', modification, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('jwtToken')}` },
        }),
    
        updateModification: (id, modification) => {
            const jwtToken = sessionStorage.getItem('jwtToken');
        
            return showcaseAPI
                .put(`/modifications/${id}`, modification, {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                })
                .then((response) => response.data)
                .catch((error) => Promise.reject(error));
        },
        
    
      deleteModification: (id) =>
        showcaseAPI.delete(`/modifications/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('jwtToken')}` },
        }),
};

export default ShowcaseService;
