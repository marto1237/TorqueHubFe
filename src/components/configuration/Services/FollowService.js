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

    getFollowedQuestions: (page = 0, size = 10) => {
        return api.get(`/follows/user/questions`, { params: { page, size }, requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getFollowedAnswers: (page = 0, size = 10) => {
        return api.get(`/follows/user/answers`, { params: { page, size }, requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    batchMuteFollows: (followIds) => {
        return api.post(`/follows/batch-mute`, followIds, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    batchUnfollow: (followIds) => {
        return api.delete(`/follows/batch-unfollow`, { data: followIds, requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }

};

export default FollowService;
