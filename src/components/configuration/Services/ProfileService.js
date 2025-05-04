import api from '../api';

const ProfileService = {
    getUserProfile: (id) => {
        return api.get(`/profile/data/${id}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    updateAboutMe: (userId, aboutMeText) => {
        return api.put(`/users/${userId}`, { aboutMe: aboutMeText }, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
};

export default ProfileService;
