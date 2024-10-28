import api from '../api';

const BookmarkService = {
    toggleBookmarkQuestion: (questionId) => {
        return api.post(`/bookmarks/${questionId}`, {}, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    toggleBookmarkAnswer: (userId, answerId) => {
        return api.post(`/bookmarks/answer`, {
            userId,
            answerId,
        })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
};

export default BookmarkService;
