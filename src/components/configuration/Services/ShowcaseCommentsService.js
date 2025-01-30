import showcaseAPI from '../showcaseAPI';

const ShowcaseCommentsService = {
    upvoteComment: (commentId, userId) => {
        return showcaseAPI.post(`/comments/${commentId}/upvote`, null, {
            params: { userId },  // Correct way to send it as a query parameter
            requiresAuth: true,
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },
    
    downvoteComment: (commentId, userId) => {
        return showcaseAPI.post(`/comments/${commentId}/downvote`, null, {
            params: { userId },  // Correct way to send it as a query parameter
            requiresAuth: true,
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
    },
    
};


export default ShowcaseCommentsService;
