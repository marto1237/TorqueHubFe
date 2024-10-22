import api from '../api';

const FollowService = {
    toggleFollowQuestion: (questionId) => {
        return api.post(`/follows/questions/${questionId}`, {}, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    toggleFollowAnswer: (answerId) => {
        return api.post(`/follows/answers/${answerId}`, {}, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },


};

export default FollowService;
