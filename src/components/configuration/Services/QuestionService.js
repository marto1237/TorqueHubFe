import api from '../api';
import { storage } from '../../../firebase';
import { listAll, ref, getDownloadURL } from 'firebase/storage';


const QuestionService = {
    getAllQuestions: (page = 0, size = 10) => {
        return api.get('/questions', { params: { page, size } })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getQuestionById: (questionId, page = 0, size = 10) => {
        const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve token from sessionStorage

        const config = jwtToken ? {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            },
            params: { page, size }
        } : { params: { page, size } }; // If not logged in, just pass page and size

        return api.get(`/questions/${questionId}`, config)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getAnswersByQuestionId: (questionId, page = 0, size = 10) => {
        return api.get(`/answers/questions/${questionId}`, {
            params: { page, size },
        }).then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getQuestionImages: async (questionId) => {
        const imagesRef = ref(storage, `questionImages/${questionId}`);
        try {
            const result = await listAll(imagesRef);
            const urls = await Promise.all(
                result.items.map((itemRef) => getDownloadURL(itemRef))
            );
            return urls;
        } catch (error) {
            console.error('Error fetching question images:', error);
            return [];
        }
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
    return api.post(`/questions/${questionId}/upvote`, {}, { requiresAuth: true })
        .then(response => response.data)  // Return the full response, including the message
        .catch(error => Promise.reject(error));
    },

    downvoteQuestion: (questionId) => {
    return api.post(`/questions/${questionId}/downvote`,{}, { requiresAuth: true })
        .then(response => response.data)  // Return the full response, including the message
        .catch(error => Promise.reject(error));
    },

    updateQuestion: (questionId, updateData) => {
    return api.put(`/questions/${questionId}`, updateData, { requiresAuth: true });
    },

    deleteQuestion: (questionId) => {
    return api.delete(`/questions/${questionId}`, { requiresAuth: true });
    },

    followQuestion: (questionId) => {
    const jwtToken = sessionStorage.getItem('jwtToken');
    if (!jwtToken) return Promise.reject('User not authenticated');

    return api.post(`/questions/${questionId}/follow`, {}, {
        headers: {
            Authorization: `Bearer ${jwtToken}`
        }
    }).then(response => response.data)
        .catch(error => Promise.reject(error));
    },

    unfollowQuestion: (questionId) => {
    const jwtToken = sessionStorage.getItem('jwtToken');
    if (!jwtToken) return Promise.reject('User not authenticated');

    return api.delete(`/questions/${questionId}/unfollow`, {
        headers: {
            Authorization: `Bearer ${jwtToken}`
        }
    }).then(response => response.data)
        .catch(error => Promise.reject(error));
    },
};

export default QuestionService;
