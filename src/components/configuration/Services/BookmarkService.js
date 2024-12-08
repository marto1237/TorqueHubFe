import { error } from 'ajv/dist/vocabularies/applicator/dependencies';
import api from '../api';

const BookmarkService = {
    toggleBookmarkQuestion: (questionId) => {
        return api.post(`/bookmarks/question/${questionId}`, {}, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    toggleBookmarkAnswer: (answerId) => {
        return api.post(`/bookmarks/answer/${answerId}`, {}, { requiresAuth: true } )
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    getUserBookmarkedQuestions: async (userId) => {
        try {
            console.log(`Fetching bookmarked questions for user: ${userId}`);
            const response = await api.get(`/bookmarks/questions/${userId}`, {}, { requiresAuth: true });
            console.log('Fetched data:', response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUserBookmarkedAnswers: (userId) => {
        console.log(`Fetching bookmarked answers for user: ${userId}`);
        return api
            .get(`/bookmarks/answers/${userId}`, {}, { requiresAuth: true })
            .then((response) => {
                console.log('Fetched data:', response.data);
                return response.data; // Explicitly return the response data
            })
            .catch((error) => {
                return Promise.reject(error); // Properly propagate the error
            });
    },
    
};

export default BookmarkService;
