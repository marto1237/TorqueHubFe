import showcaseAPI from '../showcaseAPI';

const ShowcaseCommentsService = {
    getCommentsByShowcaseId: (showcaseId, userId, page = 0, size = 10) => {
        return showcaseAPI.get(`/comments/showcase/${showcaseId}`, {
            params: { userId, page, size },
            requiresAuth: !!userId, // Only require authentication if userId is provided
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },

    upvoteComment: (commentId, userId) => {
        return showcaseAPI.post(`/comments/${commentId}/upvote`, null, {
            params: { userId },
            requiresAuth: true,
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },
    
    downvoteComment: (commentId, userId) => {
        return showcaseAPI.post(`/comments/${commentId}/downvote`, null, {
            params: { userId },
            requiresAuth: true,
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },

    createComment: (commentData) => {
        return showcaseAPI.post(`/comments`, commentData, {   
            requiresAuth: true,
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },

    editComment: (commentId, commentupdateData) => {
        return showcaseAPI.put(
        `/comments/${commentId}`, commentupdateData, {
            requiresAuth: true,
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },

    deleteComment: (commentId) => {
        return showcaseAPI.delete(`/comments/${commentId}`, {
            requiresAuth: true,
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    }
};

export default ShowcaseCommentsService;

