import api from '../api';

const QuestionService = {
    getAllQuestions: (page = 0, size = 10) => {
        return api.get('/questions', { params: { page, size } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getQuestionById: (questionId, page = 0, size = 10) => {
        return api.get(`/questions/${questionId}`, {
            params: { page, size }
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },

    getAnswersByQuestionId: (questionId, page = 0, size = 10) => {
        return api.get(`/answers/questions/${questionId}`, {
            params: { page, size },
        }).then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getCommentsByAnswerId: (answerId, page = 0, size = 5) => {
        return api.get(`/comments/answer/${answerId}`, {
            params: { page, size },
        }).then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    getQuestionsByUser: (userId) => {
        return api.get(`/questions/user/${userId}`);
    },

    askQuestion: (questionData) => {
        return api.post(`/questions`, questionData, { requiresAuth: true });
    },

    upvoteQuestion: (questionId) => {
        return api.post(`/questions/${questionId}/upvote`, {}, { requiresAuth: true });
    },

    downvoteQuestion: (questionId, userId) => {
        return api.post(`/questions/${questionId}/downvote`, { userId }, { requiresAuth: true });
    },

    updateQuestion: (questionId, updateData) => {
        return api.put(`/questions/${questionId}`, updateData, { requiresAuth: true });
    },

    deleteQuestion: (questionId) => {
        return api.delete(`/questions/${questionId}`, { requiresAuth: true });
    }
};

export default QuestionService;
