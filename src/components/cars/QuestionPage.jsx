import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Grid, Divider, Paper, Tooltip, Link, Chip } from '@mui/material';
import { Bookmark, CheckCircle, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import {BookmarkBorder} from "@material-ui/icons";
import { useTheme } from '@mui/material/styles';
import PostForm from "../forum/PostForm";
import {useParams , useNavigate} from "react-router-dom";
import axios from 'axios';
import QuestionService from '../configuration/Services/QuestionService';
import { useAppNotifications } from '../common/NotificationProvider';
import { timeAgo } from '../configuration/utils/TimeFormating';
import AnswerWebSocketService from '../configuration/WebSocket/AnswersWebSocketService'
import FollowService from '../configuration/Services/FollowService';
import BookmarkService from '../configuration/Services/BookmarkService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const QuestionPage = () => {

    const { questionId } = useParams();
    const navigate = useNavigate();

    const pageSize = 10;  // Number of answers per page
    const commentsPageSize = 5;  // Number of comments to load initially per answer
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [commentPages, setCommentPages] = useState({});
    const [comments, setComments] = useState({});
    const [questionComments, setQuestionComments] = useState([]);
    const [votes, setVotes] = useState(0);
    const [acceptedAnswerIndex, setAcceptedAnswerIndex] = useState(null);
    const [showCommentForms, setShowCommentForms] = useState([]); // Track visibility of comment forms
    const [isBookmarked, setIsBookmarked] = useState(false); // State to track bookmarked status
    const [isFollowing, setIsFollowing] = useState(false);   // State to track following status

    const notifications = useAppNotifications();
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [userVote, setUserVote] = useState(null);

    const [questionVotes, setQuestionVotes] = useState(0); // For question votes
    const [answerVotes, setAnswerVotes] = useState([]);    // For answer votes
    const [commentVotes, setCommentVotes] = useState({});  // For comment votes

    const questionUser = { username: 'QuestionUser123', profileLink: '/user/questionuser123' };
    const answerUser = { username: 'AnswerUser456', profileLink: '/user/answeruser456' };
    const commentUser = { username: 'CommentUser789', profileLink: '/user/commentuser789' }; // Static user for the example, can be dynamic

    const queryClient = useQueryClient(); // Access queryClient to manage cache

    // Fetch Question details and its answers using useQuery
    const { data: question, isLoading: isQuestionLoading } = useQuery({
        queryKey: ['question', questionId, currentPage], // Include page number in queryKey for pagination
        queryFn: async () => {
            const cachedData = queryClient.getQueryData(['question', questionId, currentPage]);
            if (cachedData) {
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

            queryClient.setQueryData(['question', questionId, currentPage], response); // Cache the fetched question data
            return response;
        }
    });


    const handleVote = (type) => {
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
                console.error('Error occurred while voting:', error);
                notifications.show('Error occurred while voting', { autoHideDuration: 3000, severity: 'error' });
            }
        }, 500);  // 500ms debounce time

        setDebounceTimeout(newDebounceTimeout);  // Update the debounce timeout
    };

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
                console.error('Error occurred while voting:', error);
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

        try {
            let response;
            const currentVotes = answerVotes[answerId] || 0;
            if (type === 'up') {
                response = await QuestionService.upvoteAnswer(answerId);
                const newVotes = userVote === 'up' ? currentVotes - 1 : userVote === 'down' ? currentVotes + 2 : currentVotes + 1;
                setAnswerVotes({ ...answerVotes, [answerId]: newVotes });
                setUserVote(userVote === 'up' ? null : 'up');
            } else if (type === 'down') {
                response = await QuestionService.downvoteAnswer(answerId);
                const newVotes = userVote === 'down' ? currentVotes + 1 : userVote === 'up' ? currentVotes - 2 : currentVotes - 1;
                setAnswerVotes({ ...answerVotes, [answerId]: newVotes });
                setUserVote(userVote === 'down' ? null : 'down');
            }
            notifications.show(response.message, { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            console.error('Error occurred while voting on answer:', error);
            notifications.show('Error occurred while voting on answer', { autoHideDuration: 3000, severity: 'error' });
        }
    };





    // Function to handle comment submission for answers
    const handleAnswerCommentSubmit = (comment, index) => {
        // Get the current time when the comment is submitted
        const currentTime = new Date().toISOString();

        const updatedAnswers = [...answers];
        updatedAnswers[index].comments.push({
            text: comment,
            user: commentUser,
            votes: 0,
            postedTime: currentTime  // Adding posted time here
        });
        setAnswers(updatedAnswers);

        // Hide the comment form and show the "Add Comment" button again
        toggleCommentForm(index);
    };

    // Function to handle comment voting
    const handleCommentVote = (answerIndex, commentIndex, type) => {
        const updatedAnswers = [...answers];
        const comment = updatedAnswers[answerIndex].comments[commentIndex];
        comment.votes += (type === 'up' ? 1 : -1); // Increase or decrease votes
        setAnswers(updatedAnswers);
    };


    // Handle bookmarking the question
    const handleBookmarkToggle = () => {
        setIsBookmarked(!isBookmarked);

        // Save to localStorage or send a request to save the bookmark on the server
        const bookmarkedQuestions = JSON.parse(sessionStorage.getItem('bookmarkedQuestions')) || [];
        if (isBookmarked) {
            // Remove bookmark
            const updatedBookmarks = bookmarkedQuestions.filter(id => id !== questionId);
            sessionStorage.setItem('bookmarkedQuestions', JSON.stringify(updatedBookmarks));
        } else {
            // Add bookmark
            sessionStorage.setItem('bookmarkedQuestions', JSON.stringify([...bookmarkedQuestions, questionId]));
        }
    };
    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
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


    const handleAnswerSubmit = (newAnswer) => {
        const currentTime = new Date().toISOString();
        setAnswers([...answers, {
            text: newAnswer,
            user: answerUser,
            comments: [],
            postedTime: currentTime
        }]);
    };


    const handleAcceptAnswer = (index) => {
        setAcceptedAnswerIndex(index);
    };

    const theme = useTheme();

    const toggleCommentForm = (index) => {
        const updatedVisibility = [...showCommentForms];
        updatedVisibility[index] = !updatedVisibility[index];
        setShowCommentForms(updatedVisibility);
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
        } catch (error) {
            console.error("Error fetching answers:", error);
        }
    };

    // Fetch initial 5 comments for an answer
    const fetchInitialComments = async (answerId) => {
        try {
            const response = await axios.get(`http://localhost:8080/comments/answer/${answerId}`, {
                params: { page: 0, size: commentsPageSize }
            });
            setComments(prev => ({ ...prev, [answerId]: response.data.content }));
            setCommentPages(prev => ({ ...prev, [answerId]: 0 })); // Initialize page number for this answer's comments
        } catch (error) {
            console.error("Error fetching initial comments:", error);
        }
    };

    const fetchAllComments = async (answerId) => {
        try {
            const response = await axios.get(`http://localhost:8080/comments/answer/${answerId}`, {
                params: { page: commentPages[answerId] + 1, size: commentsPageSize }
            });
            setComments(prev => ({
                ...prev,
                [answerId]: [...prev[answerId], ...response.data.content] // Append new comments
            }));
            setCommentPages(prev => ({ ...prev, [answerId]: commentPages[answerId] + 1 }));
        } catch (error) {
            console.error("Error fetching all comments:", error);
        }
    };
    // Handle pagination click
    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            fetchAnswers(page);
        }
    };

    useEffect(() => {
        const answerWebSocketService = AnswerWebSocketService(questionId, handleNewAnswer);
        answerWebSocketService.connect();
        return () => answerWebSocketService.disconnect(); // Cleanup WebSocket on component unmount
      }, [questionId]);

    

    const handleNewAnswer = (message) => {
        try {
            // Check if message.body exists before parsing
            const body = message.body ? message.body : message;

            // Ensure message.body is either a string or a valid object
            const newAnswer = typeof body === 'string' ? JSON.parse(body) : body;

            // Ensure votes field is initialized or defaulted
            newAnswer.votes = newAnswer.votes !== undefined ? newAnswer.votes : 0;

            // Safely update the state with the new answer
            setAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
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
            <Box sx={{ padding: '20px', maxWidth: '1000px', margin: 'auto', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
                <Typography variant="h5"
                            dangerouslySetInnerHTML={{ __html: formatTextWithTags(question.title) }}
                            sx={{
                                fontWeight: 'bold', marginBottom: '20px',
                                wordWrap: 'break-word',   // Breaks long words
                                overflowWrap: 'anywhere', // Allows breaking words anywhere
                                whiteSpace: 'pre-wrap',   // Preserves newlines and spaces while allowing wrapping
                            }}>
                </Typography>

                <Paper sx={{ padding: '20px', marginBottom: '40px', backgroundColor: theme.palette.background.paper }}>
                    <Grid container spacing={2}>
                        <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                            <Tooltip title="This question shows research effort; it is useful and clear" placement="right" arrow>
                                <IconButton onClick={() => handleQuestionVote('up')}>
                                    <KeyboardArrowUp color={userVote === 'up' ? 'primary' : 'inherit'}/>
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{votes}</Typography>
                            <Tooltip title="This question does not show any research effort; it is unclear or not useful" placement="right" arrow>
                                <IconButton onClick={() => handleQuestionVote('down')}>
                                    <KeyboardArrowDown color={userVote === 'down' ? 'primary' : 'inherit'} />
                                </IconButton>
                            </Tooltip>
                            {/* Bookmark Button */}
                            <Tooltip title={isBookmarked ? "Remove Bookmark" : "Bookmark this question"} placement="right" arrow>
                                <IconButton onClick={handleBookmarkQuestionToggle}>
                                    {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                                </IconButton>
                            </Tooltip>
                        </Grid>

                        <Grid item xs={10} sm={11}>
                            <Typography variant="body1"
                                        dangerouslySetInnerHTML={{ __html: formatTextWithTags(question.description) }}
                                        sx={{
                                            marginBottom: '10px',
                                            wordWrap: 'break-word',   // Breaks long words
                                            overflowWrap: 'anywhere', // Allows breaking words anywhere
                                            whiteSpace: 'pre-wrap',   // Preserves newlines and spaces while allowing wrapping
                                        }}>
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                {question.tags.map((tag, index) => (
                                    <Chip key={index} label={tag} className={'Mui-unselected'}
                                          sx={{
                                              cursor: 'pointer',
                                              '&:hover': {
                                                  opacity: 0.8, // Adds a hover effect
                                              },
                                          }}
                                    />
                                ))}
                            </Box>

                            <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
                                <Box sx={{  textAlign: 'left' }}>
                                    {/* Follow Button */}
                                    <Tooltip title={isFollowing ? "Unfollow this question" : "Follow this question"} placement="right" arrow>
                                        <Button onClick={handleFollowQuestionToggle} variant={isFollowing ? "contained" : "outlined"} size="small">
                                            {isFollowing ? "Following" : "Follow"}
                                        </Button>
                                    </Tooltip>
                                </Box>
                                {/* Ask time */}
                                <Typography variant="caption" color="textSecondary" sx={{ marginBottom: '5px', display: 'block' }}>
                                    {timeAgo(question.askedTime)}
                                </Typography>

                                {/* Username and reputation points */}
                                <Typography variant="caption" color="textSecondary">
                                    Asked by{' '}
                                    <Link href={questionUser.profileLink} color="primary" underline="hover">
                                        {question.userName} ({question.userPoints})
                                    </Link>
                                </Typography>

                                {/* Points  */}
                                <Box sx={{ marginTop: '5px' }}>
                                    <Tooltip title="Reputation score" placement="left-start" arrow>
                                        <Typography variant="caption" color="textSecondary">
                                            {answer.userPoints}
                                        </Typography>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Divider />

                <Box sx={{ marginTop: '20px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '20px' }}>Answers</Typography>

                    {question.answers.content.map((answer, index) => (
                        <Paper key={index} sx={{ padding: '20px', marginBottom: '20px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                                    <Tooltip title="This answer is useful" placement="right" arrow>
                                        <IconButton onClick={() => handleAnswerVote('up')}>
                                            <KeyboardArrowUp />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{answer.votes}</Typography>
                                    <Tooltip title="This answer is not useful" placement="right" arrow>
                                        <IconButton onClick={() => handleAnswerVote('down')}>
                                            <KeyboardArrowDown />
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
                                            <Tooltip title={isFollowing ? "Unfollow this answer" : "Follow this answer"} placement="right" arrow>
                                                <Button onClick={handleFollowToggle} variant={isFollowing ? "contained" : "outlined"} size="small">
                                                    {isFollowing ? "Following" : "Follow"}
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
                                    {answer.comments.map((comment, commentIndex) => (
                                        <Box key={commentIndex} sx={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '3px solid #ccc' }}>
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

                                                    {/* Points moved to new line */}
                                                    <Box sx={{ marginTop: '5px' }}>
                                                        <Tooltip title="Reputation score" placement="left-start" arrow>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {comment.reputationResponse}
                                                            </Typography>
                                                        </Tooltip>
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            <Box sx={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <IconButton onClick={() => handleCommentVote(index, commentIndex, 'up')}>
                                                    <KeyboardArrowUp />
                                                </IconButton>
                                                <Typography>{comment.votes}</Typography>
                                                <IconButton onClick={() => handleCommentVote(index, commentIndex, 'down')}>
                                                    <KeyboardArrowDown />
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

                                    {/* Add Comment Section */}
                                    <Box sx={{ marginTop: '20px' }}>
                                        {showCommentForms[index] ? (
                                            <PostForm
                                                placeholder="Write your comment here..."
                                                buttonText="Submit Answer"
                                                onSubmit={(comment) => handleAnswerCommentSubmit(comment, index)}
                                                onCancel={() => toggleCommentForm(index)}
                                            />
                                        ) : (
                                            <Button variant="outlined" size="small" onClick={() => toggleCommentForm(index)}>
                                                Add Comment
                                            </Button>
                                        )}
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