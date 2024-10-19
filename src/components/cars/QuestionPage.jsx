import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Grid, TextField,  Divider, Paper, Tooltip, Link, Chip } from '@mui/material';
import { Bookmark, CheckCircle, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import {BookmarkBorder} from "@material-ui/icons";
import { useTheme } from '@mui/material/styles';
import PostForm from "../forum/PostForm";
import {useParams , useNavigate} from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useNotifications, NotificationsProvider } from '@toolpad/core/useNotifications';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import WebSocketClient from '../configuration/WebSocket/websocketClient';
import { WEBSOCKET_URL } from '../configuration/config';
import QuestionService from '../configuration/Services/QuestionService';

const notificationsProviderSlots = {
    snackbar: styled(Snackbar)(),
};

const QuestionPage = () => {

    const { questionId } = useParams();
    const socketUrl = 'ws://localhost:8080/ws';
    const [question, setQuestion] = useState(null);
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

    const notifications = useNotifications();
    const jwtToken = localStorage.getItem('jwtToken');

    const questionUser = { username: 'QuestionUser123', profileLink: '/user/questionuser123' };
    const answerUser = { username: 'AnswerUser456', profileLink: '/user/answeruser456' };
    const commentUser = { username: 'CommentUser789', profileLink: '/user/commentuser789' }; // Static user for the example, can be dynamic


    const isUserLoggedIn = () => {
        // Retrieve all cookies
        const cookies = document.cookie;

        // Find the jwtToken cookie
        const jwtCookie = cookies
            .split('; ')
            .find(row => row.startsWith('jwtToken='));

        // Check if the cookie exists and has a valid token value
        return jwtCookie !== undefined && jwtCookie.split('=')[1] !== '';
    };

    const handleVote = async (type) => {
        const jwtToken = localStorage.getItem('jwtToken'); // Retrieve token from localStorage
        if (!jwtToken) {
            notifications.show('You need to be logged in to vote', { autoHideDuration: 3000, severity: 'error' });
            return;  // Stop execution if the user is not logged in
        }
        try {
            const voteUrl = `http://localhost:8080/questions/${questionId}/${type === 'up' ? 'upvote' : 'downvote'}`;

            // Send the request with the Authorization header
            const response = await axios.post(voteUrl, {}, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`, // Include the JWT token in the request header
                },
                // You can remove withCredentials if not using cookies for authentication
            });

            // Handle success: update vote count and show notification
            setVotes((prevVotes) => prevVotes + (type === 'up' ? 1 : -1));
            notifications.show('Vote submitted successfully', { autoHideDuration: 3000, severity: 'success' });

            // Optionally update the UI with additional data from response
            if (response.data.reputation) {
                setQuestion((prevQuestion) => ({
                    ...prevQuestion,
                    userReputation: response.data.reputation,
                }));
            }
        } catch (error) {
            console.error('Error occurred while voting:', error);
            notifications.show('Error occurred while voting', { autoHideDuration: 3000, severity: 'error' });
        }
    };

    const handleUpvote = async (questionId) => {
        const token = localStorage.getItem('jwtToken');  // Retrieve the JWT token from localStorage
        try {
            const response = await axios.post(`http://localhost:8080/questions/${questionId}/upvote`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,  // Add JWT token to the request
                },
            });
            setVotes((prevVotes) => prevVotes + 1);

            notifications.show('Vote submitted successfully', { autoHideDuration: 3000, severity: 'success' });
        } catch (error) {
            notifications.show('Error occurred while voting', { autoHideDuration: 3000, severity: 'error' });
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
        const bookmarkedQuestions = JSON.parse(localStorage.getItem('bookmarkedQuestions')) || [];
        if (isBookmarked) {
            // Remove bookmark
            const updatedBookmarks = bookmarkedQuestions.filter(id => id !== questionId);
            localStorage.setItem('bookmarkedQuestions', JSON.stringify(updatedBookmarks));
        } else {
            // Add bookmark
            localStorage.setItem('bookmarkedQuestions', JSON.stringify([...bookmarkedQuestions, questionId]));
        }
    };

    // Handle following the question for notifications
    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);


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


    // Fetch question details (and initial answers)
    useEffect(() => {
        loadQuestion();
    }, [questionId]);

    // Function to load question and initial answers
    const loadQuestion = async () => {
        try {
            const fetchedQuestion = await QuestionService.getQuestionById(questionId, currentPage, pageSize);
            setQuestion(fetchedQuestion);
            setVotes(fetchedQuestion.votes);
            setAnswers(fetchedQuestion.answers.content);
            setTotalPages(fetchedQuestion.answers.totalPages);
            setCurrentPage(fetchedQuestion.answers.pageable.pageNumber);
        } catch (error) {
            console.error("Error loading question:", error);
            navigate('/questions'); // Redirect if question not found
        }
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
        const webSocketClient = WebSocketClient(WEBSOCKET_URL);

        webSocketClient.connect(() => {
            // Subscribe to new answers
            webSocketClient.subscribe(`/topic/answers/${questionId}`, (newAnswer) => {
                setAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
                console.log('New answer received:', newAnswer);
            });

            // Subscribe to new comments
            webSocketClient.subscribe(`/topic/comments/${questionId}`, (newComment) => {
                const answerId = newComment.answerId;
                setComments((prevComments) => ({
                    ...prevComments,
                    [answerId]: [...(prevComments[answerId] || []), newComment],
                }));
            });
        });

        return () => {
            webSocketClient.disconnect();  // Clean up on component unmount
        };
    }, [questionId]);


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

    // Utility to calculate how long ago something was posted
    const timeAgo = (date) => {
        if (!date) {
            return 'Unknown time'; // Handle case where date is null or undefined
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return 'Unknown time'; // Handle invalid date format
        }

        return formatDistanceToNow(parsedDate, { addSuffix: true });
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
                                <IconButton onClick={() => handleUpvote(question.id)}>
                                    <KeyboardArrowUp />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{votes}</Typography>
                            <Tooltip title="This question does not show any research effort; it is unclear or not useful" placement="right" arrow>
                                <IconButton onClick={() => handleVote('down')}>
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
                                        <Button onClick={handleFollowToggle} variant={isFollowing ? "contained" : "outlined"} size="small">
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

                    {answers.map((answer, index) => (
                        <Paper key={index} sx={{ padding: '20px', marginBottom: '20px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                                    <Tooltip title="This answer is useful" placement="right" arrow>
                                        <IconButton onClick={() => handleVote('up')}>
                                            <KeyboardArrowUp />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{answer.votes}</Typography>
                                    <Tooltip title="This answer is not useful" placement="right" arrow>
                                        <IconButton onClick={() => handleVote('down')}>
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

export default function QuestionPageWithNotification() {
    return (
        <NotificationsProvider slots={notificationsProviderSlots}>
            <QuestionPage  />
        </NotificationsProvider>
    );
}
