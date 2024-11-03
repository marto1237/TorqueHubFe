import api from '../api';

const CommentService = {
    // Method to add a new comment
    addComment: (commentData) => {
        return api.post(`/comments`, commentData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Method to upvote a comment
    upvoteComment: (commentId) => {
        return api.post(`/comments/${commentId}/upvote`, {}, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Method to downvote a comment
    downvoteComment: (commentId) => {
        return api.post(`/comments/${commentId}/downvote`, {}, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Method to edit a comment
    editComment: (commentId, commentData) => {
        return api.put(`/comments/${commentId}`, commentData, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Method to delete a comment
    deleteComment: (commentId) => {
        return api.delete(`/comments/${commentId}`, { requiresAuth: true })
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },

    // Method to get comments by answer ID (paginated)
    getCommentsByAnswerId: (answerId, page = 0, size = 5) => {
        return api.get(`/comments/answer/${answerId}`, {
            params: { page, size },
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    }
};

export default CommentService;
