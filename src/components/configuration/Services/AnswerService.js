import api from '../api';

const AnswerService = {
    createAnswer: (questionData) => {
        return api.post(`/answers`, questionData, { requiresAuth: true });
    },

    upvoteAnswer: (answerId, userId) => {
        return api.post(`/answers/${answerId}/upvote`, { userId }, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    downvoteAnswer: (answerId, userId) => {
        return api.post(`/answers/${answerId}/downvote`, { userId }, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    approveBestAnswer: (answerId, questionId, userId) => {
        return api.post(`/answers/${answerId}/bestAnswer`, { questionId, userId }, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    editAnswer: (answerId, answerData) => {
        return api.put(`/answers/${answerId}`, answerData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getAnswersByQuestionId: (questionId, page = 0, size = 10) => {
        return api.get(`/answers/questions/${questionId}`, {
            params: { page, size },
        }).then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getAnswersByUser: (userId) => {
        return api.get(`/answers/user/${userId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getAnswerById: (answerId) => {
        return api.get(`/answers/byId/${answerId}`)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    deleteAnswer: (answerId) => {
        return api.delete(`/answers/${answerId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
};

export default AnswerService;
