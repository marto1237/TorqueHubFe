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
};

export default BookmarkService;
