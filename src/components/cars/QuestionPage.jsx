import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, IconButton, Grid, Divider, Paper, Tooltip, Link, Chip, Skeleton } from '@mui/material';
import { Bookmark, CheckCircle, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import {BookmarkBorder} from "@material-ui/icons";
import { useTheme } from '@mui/material/styles';
import PostForm from "../forum/PostForm";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import QuestionService from '../configuration/Services/QuestionService';
import AnswerService from '../configuration/Services/AnswerService';
import CommentService from '../configuration/Services/CommentService'
import { useAppNotifications } from '../common/NotificationProvider';
import { timeAgo } from '../configuration/utils/TimeFormating';
import AnswerWebSocketService from '../configuration/WebSocket/AnswersWebSocketService'
import FollowService from '../configuration/Services/FollowService';
import BookmarkService from '../configuration/Services/BookmarkService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const QuestionPage = () => {

    const { questionId } = useParams();
    
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient(); // Access queryClient to manage cache
    const initialized = useRef(false);

    const queryParams = new URLSearchParams(location.search);
    const initialPage = parseInt(queryParams.get('page') || '0', 10);
    const pageSize = parseInt(queryParams.get('size') || '10', 10);

    const commentsPageSize = 5;  // Number of comments to load initially per answer
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [commentPages, setCommentPages] = useState({});
    const [comments, setComments] = useState({});
    const [questionComments, setQuestionComments] = useState([]);
    const [votes, setVotes] = useState(0);
    const [acceptedAnswerIndex, setAcceptedAnswerIndex] = useState(null);
    const [showCommentForms, setShowCommentForms] = useState([]); // Track visibility of comment forms
    const [isBookmarked, setIsBookmarked] = useState(false); // State to track bookmarked status
    const [isFollowing, setIsFollowing] = useState(false);   // State to track following status
    const [isAnswerBookmarked, setIsAnswerBookmarked] = useState({});
    const [isAnswerFollowing, setIsAnswerFollowing] = useState({});
    const notifications = useAppNotifications();
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [userVote, setUserVote] = useState(null);

    const [questionVotes, setQuestionVotes] = useState(0); // For question votes
    const [answerVotes, setAnswerVotes] = useState([]);    // For answer votes
    const [commentVotes, setCommentVotes] = useState({});  // For comment votes

    const [answerText, setAnswerText] = useState('');
    const [userAnswerVotes, setUserAnswerVotes] = useState({});
    const [commentUserVotes, setUserCommentVotes] = useState({}); // Track vote state for each comment
    const [imageUrls, setImageUrls] = useState([]);

    const validateAnswer = (answerText) => {
        return answerText.trim().length >= 3 && answerText.trim().length <= 100000;
    };
    
    const validateComment = (commentText) => {
        return commentText.trim().length >= 3 && commentText.trim().length <= 100000;
    };

    const handleAnswerSubmit = async (submittedAnswer) => {
        console.log("Answer Text:", submittedAnswer);
        if (!validateAnswer(submittedAnswer)) {
            notifications.show("Your answer is too short or too long", { autoHideDuration: 3000, severity: "error" });
            return;
        }
    
        const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
        if (!userDetails || !userDetails.id) {
            notifications.show('You need to be logged in to answer', { autoHideDuration: 3000, severity: 'error' });
            return;
        }
    
        const userId = userDetails.id;
    
        try {
            const response = await AnswerService.createAnswer({ text: submittedAnswer, questionId, userId });
            notifications.show("Answer posted successfully", { autoHideDuration: 3000, severity: "success" });
            queryClient.invalidateQueries(['question', questionId]);
            setAnswerText(""); // Clear the input after submitting
        } catch (error) {
            notifications.show("Failed to post answer", { autoHideDuration: 3000, severity: "error" });
        }
    };


    const handleAnswerCommentSubmit = async (commentText, answerId) => {
        if (!validateComment(commentText)) {
            notifications.show("Your comment is too short or too long", { autoHideDuration: 3000, severity: "error" });
            return;
        }
    
        const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
        if (!userDetails || !userDetails.id) {
            notifications.show('You need to be logged in to comment', { autoHideDuration: 3000, severity: 'error' });
            return;
        }
    
        const userId = userDetails.id;

        try {
            const newComment = await CommentService.addComment({ text: commentText, answerId, userId });
            notifications.show("Comment posted successfully!", { autoHideDuration: 3000, severity: "success" });
    
            // Update the state to immediately show the new comment
        setComments((prevComments) => ({
            ...prevComments,
            [answerId]: [...(prevComments[answerId] || []), newComment],
        }));

        // Update the query cache directly for immediate UI feedback
        queryClient.setQueryData(['question', questionId, currentPage], (oldData) => {
            if (!oldData) return oldData;

            const updatedAnswers = oldData.answers.content.map((answer) => {
                if (answer.id === answerId) {
                    return {
                        ...answer,
                        comments: [...(answer.comments || []), newComment], // Ensure existing comments are maintained
                    };
                }
                return answer;
            });

            return {
                ...oldData,
                answers: {
                    ...oldData.answers,
                    content: updatedAnswers,
                },
            };
        });

        setAnswerText(""); // Clear the comment input
        toggleCommentForm(answerId);
        }  catch (error) {
            const errorMessage = error.message || JSON.stringify(error);
            notifications.show("Failed to post comment", { autoHideDuration: 3000, severity: "error" });
        }
    };

    // Fetch Question details and its answers using useQuery
    const { data: question, isLoading: isQuestionLoading } = useQuery({
        queryKey: ['question', questionId, currentPage], // Include page number in queryKey for pagination
        queryFn: async () => {
            const cachedData = queryClient.getQueryData(['question', questionId, currentPage]);
            if (cachedData) {
                initializeFollowAndBookmarkStates(cachedData.answers.content);
                return cachedData; // Return cached question data if available
            }
            const response = await QuestionService.getQuestionById(questionId, currentPage, pageSize);
            console.log(response)
            setVotes(response.votes);
            setAnswers(response.answers.content);
            setTotalPages(response.answers.totalPages);
            setCurrentPage(response.answers.pageable.pageNumber);
            setUserVote(response.userVote);
            setIsFollowing(response.isFollowing);
            setIsBookmarked(response.isBookmarked);
            initializeFollowAndBookmarkStates(response.answers.content);

            queryClient.setQueryData(['question', questionId, currentPage], response); // Cache the fetched question data
            return response;
        }
    });

    const initializeFollowAndBookmarkStates = (answersContent) => {
        if (initialized.current) return; // Skip re-initialization
        initialized.current = true;
    
        const followState = {};
        const bookmarkState = {};
        const answerVotesState = {};
        const answerUserVotesState = {};
        const commentVotesState = {};
        const commentUserVotesState = {};
        
        answersContent.forEach((answer) => {
            followState[answer.id] = answer.isFollowing;
            bookmarkState[answer.id] = answer.isBookmarked;
            answerUserVotesState[answer.id] = answer.userVote;
            answer.comments.forEach((comment) => {
                commentUserVotesState[comment.id] = comment.userVote;
            });
            
        });
    
        setIsAnswerFollowing((prev) => ({ ...prev, ...followState }));
        setIsAnswerBookmarked((prev) => ({ ...prev, ...bookmarkState }));
        setAnswerVotes(answerVotesState);  // Initialize votes state
        setUserAnswerVotes(answerUserVotesState);  // Initialize user votes state
        setCommentVotes(commentVotesState);
        setUserCommentVotes(commentUserVotesState);
    };
    
    useEffect(() => {
        // When page changes, check cache and initialize follow/bookmark states
        const cachedData = queryClient.getQueryData(['question', questionId, currentPage]);
        if (cachedData) {
            initializeFollowAndBookmarkStates(cachedData.answers.content);
        }
    }, [currentPage, questionId]);

    useEffect(() => {
        const fetchImages = async () => {
            if (questionId) {
                const urls = await QuestionService.getQuestionImages(questionId);
                setImageUrls(urls);
            }
        };
        fetchImages();
    }, [questionId]);


    const handleQuestionVote = async (type) => {
        const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve token
        if (!jwtToken) {
            notifications.show('You need to be logged in to vote', { autoHideDuration: 3000, severity: 'error' });
            return;  // Stop execution if the user is not logged in
        }

        // Clear the previous debounce timeout if the user clicks again before delay
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set a new debounce timeout
        const newDebounceTimeout = setTimeout(async () => {
            try {
                let response;

                if (type === 'up') {
                    response = await QuestionService.upvoteQuestion(questionId);

                    if (userVote === 'up') {
                        // If already upvoted, remove the upvote
                        setVotes((prevVotes) => prevVotes - 1);
                        setUserVote(null);  // Reset vote to null
                    } else if (userVote === 'down') {
                        // If downvoted, switch to upvote
                        setVotes((prevVotes) => prevVotes + 2);
                        setUserVote('up');
                    } else {
                        // Otherwise, add an upvote
                        setVotes((prevVotes) => prevVotes + 1);
                        setUserVote('up');
                    }
                } else if (type === 'down') {
                    response = await QuestionService.downvoteQuestion(questionId);

                    if (userVote === 'down') {
                        // If already downvoted, remove the downvote
                        setVotes((prevVotes) => prevVotes + 1);
                        setUserVote(null);  // Reset vote to null
                    } else if (userVote === 'up') {
                        // If upvoted, switch to downvote
                        setVotes((prevVotes) => prevVotes - 2);
                        setUserVote('down');
                    } else {
                        // Otherwise, add a downvote
                        setVotes((prevVotes) => prevVotes - 1);
                        setUserVote('down');
                    }
                }

                // Show success notification
                notifications.show(response.message, { autoHideDuration: 3000, severity: 'success' });
            } catch (error) {
                console.error('Error occurred while voting:', error.response || error);
                notifications.show('Error occurred while voting', { autoHideDuration: 3000, severity: 'error' });
            }
        }, 500);  // 500ms debounce time

        setDebounceTimeout(newDebounceTimeout);  // Update the debounce timeout
    };


    const handleAnswerVote = async (answerId, type) => {
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (!jwtToken) {
            notifications.show('You need to be logged in to vote', { autoHideDuration: 3000, severity: 'error' });
            return;
        }
    
        // Clear the previous debounce timeout if the user clicks again before delay
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
    
        const newDebounceTimeout = setTimeout(async () => {
            try {
                let response;
                const currentVote = userAnswerVotes[answerId] || null;
                const currentVotes = answerVotes[answerId] || 0;
                let newVotes;
    
                if (type === 'up') {
                    if (currentVote === 'up') {
                        // Neutralize the upvote by removing it
                        response = await AnswerService.upvoteAnswer(answerId);
                        newVotes = currentVotes - 1;
                        setUserAnswerVotes((prev) => ({ ...prev, [answerId]: null }));
                    } else if (currentVote === 'down') {
                        // Switch from downvote to upvote
                        response = await AnswerService.upvoteAnswer(answerId);
                        newVotes = currentVotes + 2;
                        setUserAnswerVotes((prev) => ({ ...prev, [answerId]: 'up' }));
                    } else {
                        // Add an upvote
                        response = await AnswerService.upvoteAnswer(answerId);
                        newVotes = currentVotes + 1;
                        setUserAnswerVotes((prev) => ({ ...prev, [answerId]: 'up' }));
                    }
                } else if (type === 'down') {
                    if (currentVote === 'down') {
                        // Neutralize the downvote by removing it
                        response = await AnswerService.downvoteAnswer(answerId);
                        newVotes = currentVotes + 1;
                        setUserAnswerVotes((prev) => ({ ...prev, [answerId]: null }));
                    } else if (currentVote === 'up') {
                        // Switch from upvote to downvote
                        response = await AnswerService.downvoteAnswer(answerId);
                        newVotes = currentVotes - 2;
                        setUserAnswerVotes((prev) => ({ ...prev, [answerId]: 'down' }));
                    } else {
                        // Add a downvote
                        response = await AnswerService.downvoteAnswer(answerId);
                        newVotes = currentVotes - 1;
                        setUserAnswerVotes((prev) => ({ ...prev, [answerId]: 'down' }));
                    }
                }
    
                // Update UI state immediately
                setAnswerVotes((prevVotes) => ({ ...prevVotes, [answerId]: newVotes }));
    
                // Update query cache to maintain consistency
                queryClient.setQueryData(['question', questionId, currentPage], (oldData) => {
                    if (!oldData) return oldData;
                    const updatedAnswers = oldData.answers.content.map((answer) => {
                        if (answer.id === answerId) {
                            return { ...answer, votes: newVotes };
                        }
                        return answer;
                    });
                    return {
                        ...oldData,
                        answers: { ...oldData.answers, content: updatedAnswers },
                    };
                });
    
                notifications.show(response.message, { autoHideDuration: 3000, severity: 'success' });
            } catch (error) {
                notifications.show('Error occurred while voting on answer', { autoHideDuration: 3000, severity: 'error' });
            }
        }, 500);
    
        setDebounceTimeout(newDebounceTimeout);
    };




    // Function to handle comment voting
    const handleCommentVote = async (commentId, type) => {
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (!jwtToken) {
            notifications.show('You need to be logged in to vote', { autoHideDuration: 3000, severity: 'error' });
            return;
        }
    
        try {
            let response;
            const currentVote = commentUserVotes[commentId] || null;
            const currentVotes = commentVotes[commentId] || 0;
            let newVotes = currentVotes;
    
            if (type === 'up') {
                if (currentVote === 'up') {
                    response = await CommentService.upvoteComment(commentId);
                    newVotes -= 1;
                    setUserCommentVotes((prev) => ({ ...prev, [commentId]: null }));
                } else if (currentVote === 'down') {
                    // Switch from downvote to upvote
                    response = await CommentService.upvoteComment(commentId);
                    newVotes += 2;
                    setUserCommentVotes((prev) => ({ ...prev, [commentId]: 'up' }));
                } else {
                    // Add an upvote
                    response = await CommentService.upvoteComment(commentId);
                    newVotes += 1;
                    setUserCommentVotes((prev) => ({ ...prev, [commentId]: 'up' }));
                }
            } else if (type === 'down') {
                if (currentVote === 'down') {
                    // Neutralize the downvote by removing it
                    response = await CommentService.downvoteComment(commentId); 
                    newVotes += 1;
                    setUserCommentVotes((prev) => ({ ...prev, [commentId]: null }));
                } else if (currentVote === 'up') {
                    // Switch from upvote to downvote
                    response = await CommentService.downvoteComment(commentId);
                    newVotes -= 2;
                    setUserCommentVotes((prev) => ({ ...prev, [commentId]: 'down' }));
                } else {
                    // Add a downvote
                    response = await CommentService.downvoteComment(commentId);
                    newVotes -= 1;
                    setUserCommentVotes((prev) => ({ ...prev, [commentId]: 'down' }));
                }
            }
    
            // Update the UI state immediately
            setCommentVotes((prevVotes) => ({ ...prevVotes, [commentId]: newVotes }));
    
            // Update the query cache to maintain consistency
            queryClient.setQueryData(['question', questionId, currentPage], (oldData) => {
                if (!oldData) return oldData;
                const updatedAnswers = oldData.answers.content.map((answer) => {
                    const updatedComments = answer.comments.map((comment) =>
                        comment.id === commentId ? { ...comment, votes: newVotes } : comment
                    );
                    return { ...answer, comments: updatedComments };
                });
                return { ...oldData, answers: { ...oldData.answers, content: updatedAnswers } };
            });

            queryClient.invalidateQueries(['question', questionId]);
    
            notifications.show(response.message, { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Error occurred while voting on comment', { autoHideDuration: 3000, severity: 'error' });
            console.error("Error voting on comment:", error);
        }
    };
    
    


    // Handle bookmarking the question
    const handleBookmarkToggle = async () => {
        const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve token
        if (!jwtToken) {
            notifications.show('You need to be logged in to bookmark', { autoHideDuration: 3000, severity: 'error' });
            return; // Stop if user is not logged in
        }
    
        try {
            // Call the BookmarkService to toggle the bookmark for the question
            const response = await BookmarkService.toggleBookmarkQuestion(questionId);
            
            // Update `isBookmarked` based on the response from the server
            setIsBookmarked((prevIsBookmarked) => !prevIsBookmarked);
    
            // Show notification based on action
            notifications.show(response ? 'Bookmarked successfully' : 'Bookmark removed', {
                autoHideDuration: 3000,
                severity: response ? 'success' : 'info',
            });
    
            // Invalidate cache for consistent data
            queryClient.invalidateQueries(['question', questionId]);
        } catch (error) {
            notifications.show('Error toggling bookmark', { autoHideDuration: 3000, severity: 'error' });
            console.error("Error bookmarking question:", error);
        }
    };
    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
    };

    const handleAnswerBookmarkToggle = async (answerId) => {
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (!jwtToken) {
            notifications.show('You need to be logged in to bookmark', { autoHideDuration: 3000, severity: 'error' });
            return;
        }

        try {
            const response = await BookmarkService.toggleBookmarkAnswer(answerId);
            setIsAnswerBookmarked((prev) => ({
                ...prev,
                [answerId]: !prev[answerId],
            }));

            queryClient.invalidateQueries(['question', questionId]); // Invalidate cache for consistent state
            
            notifications.show(response ? 'Bookmarked successfully' : 'Bookmark removed', {
                autoHideDuration: 3000,
                severity: response ? 'success' : 'info',
            });
        } catch (error) {
            notifications.show('Error toggling bookmark', { autoHideDuration: 3000, severity: 'error' });
            console.error("Error bookmarking answer:", error);
        }
    };

    const handleFollowQuestionToggle = async () => {
        const jwtToken = sessionStorage.getItem('jwtToken'); // Check if the user is logged in
        if (!jwtToken) {
            notifications.show('You need to be logged in to follow', { autoHideDuration: 3000, severity: 'error' });
            return; // If not logged in, show an error and stop execution
        }

        try {
            const response = await FollowService.toggleFollowQuestion(questionId);
            setIsFollowing(!isFollowing); // Toggle the follow status in the state
            notifications.show(response.message || 'Follow toggled', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Error toggling follow ', { autoHideDuration: 3000, severity: 'error' });
            console.error("Error toggling follow status:", error);
        }
    };

    const handleAnswerFollowToggle = async (answerId) => {
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (!jwtToken) {
            notifications.show('You need to be logged in to bookmark', { autoHideDuration: 3000, severity: 'error' });
            return;
        }

        try {
            const response = await FollowService.toggleFollowAnswer(answerId);
            setIsAnswerFollowing((prev) => ({
                ...prev,
                [answerId]: !prev[answerId] // Toggle follow status for the specific answer
            }));

            // Invalidate cache for followedAnswers to refresh follow state
            queryClient.invalidateQueries(['question', questionId]);

            const action = isAnswerFollowing[answerId] ? 'Unfollowed' : 'Following';
            notifications.show(`${action} answer successfully`, { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Error toggling bookmark', { autoHideDuration: 3000, severity: 'error' });
            console.error("Error bookmarking answer:", error);
        }
    };

    const handleBookmarkQuestionToggle = async () => {
        const jwtToken = sessionStorage.getItem('jwtToken'); // Retrieve token
        if (!jwtToken) {
            notifications.show('You need to be logged in to bookmark', { autoHideDuration: 3000, severity: 'error' });
            return;
        }

        try {
            const response = await BookmarkService.toggleBookmarkQuestion(questionId);
            setIsBookmarked(!isBookmarked);  // Toggle the bookmark status
            notifications.show(response ? 'Bookmarked successfully' : 'Bookmark removed', {
                autoHideDuration: 3000,
                severity: response ? 'success' : 'info',
            });
        } catch (error) {
            notifications.show('Error toggling bookmark', { autoHideDuration: 3000, severity: 'error' });
            console.error("Error bookmarking question:", error);
        }
    };

    const handleAcceptAnswer = (index) => {
        setAcceptedAnswerIndex(index);
    };


    const toggleCommentForm = (answerId) => {
        setShowCommentForms((prev) => ({
            ...prev,
            [answerId]: !prev[answerId],  // Toggle visibility for the specific answer ID
        }));
    };
    

    const getTagStyles = () => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e1ecf4',
        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary,
        padding: '5px',
        borderRadius: '3px',
        cursor: 'pointer',
        '&:hover': {
            opacity: 0.8, // Adds a hover effect
        },
    });

    const formatTextWithTags = (text) => {
        return text
            .replace(/\[b\](.*?)\[\/b\]/g, '<b>$1</b>')
            .replace(/\[i\](.*?)\[\/i\]/g, '<i>$1</i>')
            .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
            .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>');
    };


    
    

    const fetchAnswers = async (page) => {
        try {
            const { content: fetchedAnswers, totalPages: fetchedTotalPages } = await QuestionService.getAnswersByQuestionId(questionId, page, pageSize);
            setAnswers(fetchedAnswers);
            setTotalPages(fetchedTotalPages);
            setCurrentPage(page);

            // Initialize isAnswerBookmarked based on fetched answer data
            const bookmarkStatus = {};
            fetchedAnswers.forEach(answer => {
                bookmarkStatus[answer.id] = answer.isBookmarked;  // assuming each answer has an `isBookmarked` property
            });
            setIsAnswerBookmarked(bookmarkStatus);
        } catch (error) {
            console.error("Error fetching answers:", error);
        }
    };


    const fetchAllComments = async (answerId) => {
        try {
            const response = await CommentService.getCommentsByAnswerId(answerId,commentPages[answerId] + 1,commentsPageSize)
            setComments(prev => ({
                ...prev,
                [answerId]: [...prev[answerId], ...response.data.content] // Append new comments
            }));
            setCommentPages(prev => ({ ...prev, [answerId]: commentPages[answerId] + 1 }));
        } catch (error) {
            console.error("Error fetching all comments:", error);
        }
    };
    
    // Fetch next 10 comments
    const fetchMoreComments = async (answerId) => {
        try {
            const nextPage = commentPages[answerId] + 1;
            const response = await axios.get(`/comments/answer/${answerId}`, {
                params: { page: nextPage, size: 10 }
            });
            setComments(prev => ({
                ...prev,
                [answerId]: [...prev[answerId], ...response.data.content] // Append new comments
            }));
            setCommentPages(prev => ({ ...prev, [answerId]: nextPage }));
        } catch (error) {
            console.error("Error fetching more comments:", error);
        }
    };

    // Handle pagination click
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            navigate(`/questions/${questionId}?page=${newPage}&size=${pageSize}`); // Update URL with page and size
        }
    };

    useEffect(() => {
        const answerWebSocketService = AnswerWebSocketService(questionId, handleNewAnswer);
        answerWebSocketService.connect();
        return () => answerWebSocketService.disconnect(); // Cleanup WebSocket on component unmount
    }, [questionId]);

    useEffect(() => {
        if (question && question.answers.content) {
            initializeFollowAndBookmarkStates(question.answers.content);
        }
    }, [question]);
    

    

    const handleNewAnswer = (message) => {
        try {
            // Check if message.body exists before parsing
            const body = message.body ? message.body : message;

            // Ensure message.body is either a string or a valid object
            const newAnswer = typeof body === 'string' ? JSON.parse(body) : body;

            // Ensure votes field is initialized or defaulted
            newAnswer.votes = newAnswer.votes !== undefined ? newAnswer.votes : 0;

            // Directly update the cached data with the new answer
            queryClient.setQueryData(['question', questionId, currentPage], (oldData) => {
                if (!oldData) return;

                // Merge the new answer into the existing answers array
                const updatedAnswers = [...oldData.answers.content, newAnswer];

                // Return the updated data structure
                return {
                    ...oldData,
                    answers: {
                        ...oldData.answers,
                        content: updatedAnswers,
                    },
                };
            });
        } catch (error) {
            console.error("Error parsing message body:", error);
        }
    };



    if (!question) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: '50px' }}>
                <Typography variant="h6">Question not found</Typography>
                <Button onClick={() => navigate('/questions')} variant="contained" color="primary">
                    Go back to Questions List
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: { xs: '20px', sm: '100px' }, backgroundColor: theme.palette.background.paper }}>
            <Box sx={{  padding: { xs: '4px 0', sm: '10px 0', lg: '20px' }, maxWidth: '1000px', margin: 'auto', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
                {/* Question Title */}
                {isQuestionLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                ) : (
                    <Typography variant="h5"
                                dangerouslySetInnerHTML={{ __html: formatTextWithTags(question.title) }}
                                sx={{
                                    fontWeight: 'bold', marginBottom: '20px',
                                    wordWrap: 'break-word',   // Breaks long words
                                    overflowWrap: 'anywhere', // Allows breaking words anywhere
                                    whiteSpace: 'pre-wrap',   // Preserves newlines and spaces while allowing wrapping
                                }}>
                    </Typography>
                )}
                
                <Paper sx={{  padding: { xs: '4px 0', sm: '10px 0', lg: '20px' }, marginBottom: '40px', backgroundColor: theme.palette.background.paper }}>
                    <Grid container spacing={2}>
                        <Grid item xs={2} sm={1} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                             {/* Vote Buttons and Bookmark Icon with Skeletons */}
                             {isQuestionLoading ? (
                                <>
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <Skeleton variant="text" width={40} height={30} />
                                    <Skeleton variant="circular" width={40} height={40} />
                                </>
                            ) : (
                                    <Tooltip title="This question shows research effort; it is useful and clear" placement="right" arrow>
                                        <IconButton onClick={() => handleQuestionVote('up')}  sx={{ padding: 0 }}>
                                            <KeyboardArrowUp color={userVote === 'up' ? 'primary' : 'inherit'}/>
                                        </IconButton>
                                    </Tooltip>
                                    )}
                                    <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{votes}</Typography>
                                    <Tooltip title="This question does not show any research effort; it is unclear or not useful" placement="right" arrow>
                                        <IconButton onClick={() => handleQuestionVote('down')}  sx={{ padding: 0 }}>
                                            <KeyboardArrowDown color={userVote === 'down' ? 'primary' : 'inherit'} />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    {/* Bookmark Button */}
                                    <Tooltip title={isBookmarked ? "Remove Bookmark" : "Bookmark this question"} placement="right" arrow>
                                                <IconButton onClick={handleBookmarkToggle}>
                                                    {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                                                </IconButton>
                                    </Tooltip>
                                
                        </Grid>

                        <Grid item xs={10} sm={11}>
    {isQuestionLoading ? (
        <>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="90%" height={30} />
            <Skeleton variant="text" width="80%" height={30} />
        </>
    ) : (
        <>
            {/* Question Description */}
            <Typography
                variant="body1"
                dangerouslySetInnerHTML={{ __html: formatTextWithTags(question.description) }}
                sx={{
                    marginBottom: '10px',
                    wordWrap: 'break-word',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                }}
            />

            {/* Question Images */}
            {imageUrls.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                    {imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Question Image ${index + 1}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '300px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                            }}
                        />
                    ))}
                </Box>
            )}

            {/* Question Tags */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {question.tags.map((tag, index) => (
                    <Chip
                        key={index}
                        label={tag}
                        className={'Mui-unselected'}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 0.8, // Adds a hover effect
                            },
                        }}
                    />
                ))}
            </Box>

            {/* Question Metadata */}
            <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
                <Box sx={{ textAlign: 'left' }}>
                    {/* Follow Button */}
                    <Tooltip title={isFollowing ? "Unfollow this question" : "Follow this question"} placement="right" arrow>
                        <Button onClick={handleFollowQuestionToggle} variant={isFollowing ? "contained" : "outlined"} size="small">
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                    </Tooltip>
                </Box>
                {/* Ask Time */}
                <Typography variant="caption" color="textSecondary" sx={{ marginBottom: '5px', display: 'block' }}>
                    {timeAgo(question.askedTime)}
                </Typography>

                {/* Username and Reputation Points */}
                <Typography variant="caption" color="textSecondary">
                    Asked by{' '}
                    <Link href={`/user/${question.userName}`} color="primary" underline="hover">
                        {question.userName} ({question.userPoints})
                    </Link>
                </Typography>

                {/* Points (if needed) */}
                <Box sx={{ marginTop: '5px' }}>
                    <Tooltip title="Reputation score" placement="left-start" arrow>
                        <Typography variant="caption" color="textSecondary">
                            {question.userPoints} {/* Replace with the correct field */}
                        </Typography>
                    </Tooltip>
                </Box>
            </Box>
        </>
    )}
</Grid>

                    </Grid>
                </Paper>

                <Divider />

                <Box sx={{ marginTop: '20px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '20px' }}>Answers</Typography>

                    {question.answers.content.map((answer, index) => (
                        <Paper key={answer.id} sx={{ padding: '20px', marginBottom: '20px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={2} sm={1} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Tooltip title="This answer is useful" placement="right" arrow>
                                        <IconButton onClick={() => handleAnswerVote(answer.id,'up')} sx={{ padding: 0 }}>
                                            <KeyboardArrowUp color={userAnswerVotes[answer.id] === 'up' ? 'primary' : 'inherit'}/>
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{answer.votes}</Typography>
                                    <Tooltip title="This answer is not useful" placement="right" arrow>
                                        <IconButton onClick={() => handleAnswerVote(answer.id,'down')} sx={{ padding: 0 }}>
                                            <KeyboardArrowDown color={userAnswerVotes[answer.id] === 'down' ? 'primary' : 'inherit'}/>
                                        </IconButton>
                                    </Tooltip>
                                    {/* Bookmark Button */}
                                    <Tooltip title={isAnswerBookmarked[answer.id] ? "Remove Bookmark" : "Bookmark this answer"} placement="right" arrow>
                                        <IconButton onClick={() => handleAnswerBookmarkToggle(answer.id)}>
                                            {isAnswerBookmarked[answer.id] ? <Bookmark /> : <BookmarkBorder />}
                                        </IconButton>
                                    </Tooltip>
                                </Grid>

                                <Grid item xs={10} sm={11}>
                                    <Typography
                                        variant="body1"
                                        dangerouslySetInnerHTML={{ __html: formatTextWithTags(answer.text) }}
                                    />

                                    {answer.edited && (
                                        <Typography variant="caption" color="textSecondary" sx={{ marginLeft: '10px' }}>
                                            (Edited)
                                        </Typography>
                                    )}

                                    <Box sx={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircle />}
                                            onClick={() => handleAcceptAnswer(index)}
                                            disabled={acceptedAnswerIndex === index}
                                        >
                                            {acceptedAnswerIndex === index ? 'Accepted Answer' : 'Accept Answer'}
                                        </Button>
                                    </Box>

                                    <Box sx={{ marginTop: '10px', textAlign: 'right' }}>

                                        <Box sx={{ marginTop: '20px', textAlign: 'left' }}>
                                            {/* Follow Button */}
                                            <Tooltip title={isAnswerFollowing[answer.id] ? "Unfollow this answer" : "Follow this answer"} placement="right" arrow>
                                                <Button onClick={() => handleAnswerFollowToggle(answer.id)} variant={isAnswerFollowing[answer.id] ? "contained" : "outlined"} size="small">
                                                    {isAnswerFollowing[answer.id] ? "Following" : "Follow"}
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                        {/* Post time */}
                                        <Typography variant="caption" color="textSecondary" sx={{ marginBottom: '5px', display: 'block' }}>
                                            {timeAgo(answer.postedTime)}
                                        </Typography>
                                        {/* Username and points */}
                                        <Typography variant="caption" color="textSecondary">
                                            Answered by{' '}
                                            <Link href={`/user/${answer.username}`} color="primary" underline="hover">
                                                {answer.username} ({answer.userPoints})
                                            </Link>
                                        </Typography>

                                        {/* Points moved to new line */}
                                        <Box sx={{ marginTop: '5px' }}>
                                            <Tooltip title="Reputation score" placement="left-start" arrow>
                                                <Typography variant="caption" color="textSecondary">
                                                </Typography>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {/* Comments Section */}
                                     {answer.comments.slice(0, 5).map((comment, commentIndex) => (
                                        <Box key={commentIndex} sx={{ marginTop: '10px', paddingLeft: { xs: 0, sm: '20px' }, borderLeft: '3px solid #ccc' }}>
                                            <Grid container>
                                                <Grid item xs={9}>
                                                    <Typography variant="body2"
                                                                dangerouslySetInnerHTML={{ __html: formatTextWithTags(comment.text) }}
                                                                sx={{
                                                                    wordWrap: 'break-word',   // Breaks long words
                                                                    overflowWrap: 'anywhere', // Allows breaking words anywhere
                                                                    whiteSpace: 'pre-wrap',   // Preserves newlines and spaces while allowing wrapping
                                                                }}
                                                    >
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={3} sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" color="textSecondary" sx={{ marginBottom: '5px', display: 'block' }}>
                                                        {timeAgo(comment.postedTime)}
                                                    </Typography>
                                                    {/* Username and points */}
                                                    <Typography variant="caption" color="textSecondary">
                                                        Commented by{' '}
                                                        <Link href={`/user/${comment.username}`} color="primary" underline="hover">
                                                            {comment.username} ({comment.userPoints})
                                                        </Link>
                                                    </Typography>

                                                    
                                                </Grid>
                                            </Grid>

                                            <Box sx={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <IconButton onClick={() => handleCommentVote(comment.id, 'up')}>
                                                    <KeyboardArrowUp color={commentUserVotes[comment.id] === 'up' ? 'primary' : 'inherit'} />
                                                </IconButton>
                                                <Typography>{comment.votes}</Typography>
                                                <IconButton onClick={() => handleCommentVote(comment.id, 'down')}>
                                                    <KeyboardArrowDown color={commentUserVotes[comment.id] === 'down' ? 'primary' : 'inherit'} />
                                                </IconButton>
                                            </Box>

                                            {answer.comments.length > 5 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => fetchAllComments(answer.id)}
                                                        sx={{ marginTop: '10px' }}
                                                    >
                                                        Load More Comments
                                                    </Button>
                                                </Box>
                                            )}

                                        </Box>

                                    ))}
                                    {answer.comments.length > 5 && (
                                        <Button variant="outlined" size="small" onClick={() => fetchMoreComments(answer.id)}>
                                            Load More Comments
                                        </Button>
                                    )}

                                    {/* Add Comment Section */}
                                    <Box sx={{ marginTop: '20px' }}>
                                        {showCommentForms[answer.id] && (
                                            <PostForm
                                                placeholder="Write your comment here..."
                                                buttonText="Submit Comment"
                                                onSubmit={(comment) => handleAnswerCommentSubmit(comment, answer.id)}
                                                onCancel={() => toggleCommentForm(answer.id)}  // Close the form on cancel
                                            />
                                        )}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => toggleCommentForm(answer.id)}
                                        >
                                            {showCommentForms[answer.id] ? "Close Comment" : "Add Comment"}
                                        </Button>
                                    </Box>


                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                    {/* Pagination Controls */}
                    <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button variant="outlined" disabled={currentPage === 0} onClick={() => handlePageChange(currentPage - 1)}>
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <Button
                                key={index}
                                variant={currentPage === index ? "contained" : "outlined"}
                                onClick={() => handlePageChange(index)}
                                sx={{ mx: 1 }}
                            >
                                {index + 1}
                            </Button>
                        ))}
                        <Button variant="outlined" disabled={currentPage + 1 >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                            Next
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ marginTop: '40px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '20px' }}>Your Answer</Typography>

                    <PostForm
                        placeholder="Write your answer here..."
                        buttonText="Submit Answer"
                        onSubmit={handleAnswerSubmit}
                        variant="filled"
                        className="inputField"
                        sx={{ backgroundColor: theme.palette.background.paper }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default QuestionPage;