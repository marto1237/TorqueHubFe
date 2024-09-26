import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Grid, TextField,  Divider, Paper, Tooltip, Link, Chip } from '@mui/material';
import { Bookmark, CheckCircle, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PostForm from "../forum/PostForm";
import {useParams , useNavigate} from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';

// Sample questions data
const questions = [
    {
        "id": 1,
        "title": "Is it possible to create a certificate for a subdomain although wildcard certificate exists?",
        "description": "I have a wildcard certificate for my main domain (*.example.com), but I need a specific certificate for a subdomain (sub.example.com) for a particular use case. Is it possible to create a separate SSL certificate for this subdomain, even if the wildcard certificate covers it? What are the implications of doing so?",
        "tags": ["ssl-certificate", "subdomain", "wildcard", "wildcard-subdomain"],
        "user": {
            "name": "AntonSack",
            "points": 1041
        },
        "views": 20,
        "answers": 3,
        "votes": 4,
        "askedTime": "2024-09-24T14:00:00Z",
        "comments": [
            {
                "commentId": 1,
                'votes': 0,
                "text": "Yes, it is possible to create a specific certificate for a subdomain even with a wildcard certificate. It can be useful in cases where the subdomain has different security or certificate requirements.",
                "user": {
                    "name": "CertMaster",
                    "points": 561
                },
                "postedTime": "2024-09-24T14:10:00Z"
            },
            {
                "commentId": 2,
                "text": "You should consider how often you need to update both certificates and manage them separately.",
                "user": {
                    "name": "SecurityGuy",
                    "points": 752
                },
                "postedTime": "2024-09-24T14:12:00Z"
            }
        ],
        "answersDetails": [
            {
                "answerId": 1,
                "text": "Yes, it's definitely possible, but you'll need to generate a new CSR for the subdomain and go through the certificate issuance process for that specific subdomain. The wildcard won't interfere, but be mindful of the additional management overhead.",
                "votes": 2,
                "user": {
                    "name": "Techie123",
                    "points": 820
                },
                "postedTime": "2024-09-22T14:48:00Z",
                "comments": []
            },
            {
                "answerId": 2,
                "text": "Absolutely! In some environments, having a dedicated certificate for a subdomain makes sense, especially if the security policies differ between subdomains.",
                "votes": 1,
                "user": {
                    "name": "SSLGuru",
                    "points": 1135
                },
                "postedTime": "2024-09-21T14:48:00Z",
                "comments": [
                    {
                        "commentId": 1,
                        "votes": 2,
                        "text": "What about renewal processes for the subdomain-specific certificate?",
                        "user": {
                            "name": "JohnDoe",
                            "points": 110
                        },
                        "postedTime": "2024-09-22T14:48:00Z",
                    }
                ]
            }
        ]
    },
    // Other questions...
];

const QuestionPage = () => {

    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [questionComments, setQuestionComments] = useState([]);
    const [votes, setVotes] = useState(0);
    const [acceptedAnswerIndex, setAcceptedAnswerIndex] = useState(null);
    const [showCommentForms, setShowCommentForms] = useState([]); // Track visibility of comment forms

    const questionUser = { username: 'QuestionUser123', profileLink: '/user/questionuser123' };
    const answerUser = { username: 'AnswerUser456', profileLink: '/user/answeruser456' };
    const commentUser = { username: 'CommentUser789', profileLink: '/user/commentuser789' }; // Static user for the example, can be dynamic


    // Function to handle comment submission for answers
    const handleAnswerCommentSubmit = (comment, index) => {
        // Get the current time when the comment is submitted
        const currentTime = new Date().toLocaleString();

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

    const handleAnswerSubmit = (newAnswer) => {
        setAnswers([...answers, { text: newAnswer, user: answerUser, comments: [] }]);
    };

    const handleVote = (type) => {
        setVotes(type === 'up' ? votes + 1 : votes - 1);
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
    });

    const formatTextWithTags = (text) => {
        return text
            .replace(/\[b\](.*?)\[\/b\]/g, '<b>$1</b>')
            .replace(/\[i\](.*?)\[\/i\]/g, '<i>$1</i>')
            .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
            .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>');
    };

    const { questionId } = useParams();
    const [question, setQuestion] = useState(null);
    const navigate = useNavigate();

    // Fetch question based on questionId
    useEffect(() => {
        const foundQuestion = questions.find(q => q.id === parseInt(questionId));
        if (foundQuestion) {
            setQuestion(foundQuestion);
            setAnswers(foundQuestion.answersDetails); // Load answers from the question
            setVotes(foundQuestion.votes); // Set initial votes
        }
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

    // Utility to calculate how long ago something was posted
    const timeAgo = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
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
                                <IconButton onClick={() => handleVote('up')}>
                                    <KeyboardArrowUp />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{votes}</Typography>
                            <Tooltip title="This question does not show any research effort; it is unclear or not useful" placement="right" arrow>
                                <IconButton onClick={() => handleVote('down')}>
                                    <KeyboardArrowDown />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Save this question." placement="right" arrow>
                                <IconButton>
                                    <Bookmark />
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
                                    <Chip key={index} label={tag} sx={getTagStyles()} />
                                ))}
                            </Box>

                            <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
                                {/* Ask time */}
                                <Typography variant="caption" color="textSecondary" sx={{ marginBottom: '5px', display: 'block' }}>
                                    {timeAgo(question.askedTime)}
                                </Typography>

                                {/* Username and reputation points */}
                                <Typography variant="caption" color="textSecondary">
                                    Asked by{' '}
                                    <Link href={questionUser.profileLink} color="primary" underline="hover">
                                        {question.user.name}
                                    </Link>
                                </Typography>
                                {/* Points  */}
                                <Box sx={{ marginTop: '5px' }}>
                                    <Tooltip title="Reputation score" placement="left-start" arrow>
                                        <Typography variant="caption" color="textSecondary">
                                            {question.user.points}
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
                                    <Tooltip title="Save this answer" placement="right" arrow>
                                        <IconButton>
                                            <Bookmark />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>

                                <Grid item xs={10} sm={11}>
                                    <Typography
                                        variant="body1"
                                        dangerouslySetInnerHTML={{ __html: formatTextWithTags(answer.text) }}
                                    />

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
                                        {/* Post time */}
                                        <Typography variant="caption" color="textSecondary" sx={{ marginBottom: '5px', display: 'block' }}>
                                            {timeAgo(answer.postedTime)}
                                        </Typography>
                                        {/* Username and points */}
                                        <Typography variant="caption" color="textSecondary">
                                            Answered by{' '}
                                            <Link href={`/user/${answer.user.name}`} color="primary" underline="hover">
                                                {answer.user.name}
                                            </Link>
                                        </Typography>

                                        {/* Points moved to new line */}
                                        <Box sx={{ marginTop: '5px' }}>
                                            <Tooltip title="Reputation score" placement="left-start" arrow>
                                                <Typography variant="caption" color="textSecondary">
                                                    {answer.user.points}
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
                                                        <Link href={`/user/${comment.user.name}`} color="primary" underline="hover">
                                                            {comment.user.name}
                                                        </Link>
                                                    </Typography>

                                                    {/* Points moved to new line */}
                                                    <Box sx={{ marginTop: '5px' }}>
                                                        <Tooltip title="Reputation score" placement="left-start" arrow>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {comment.user.points}
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
                </Box>

                <Box sx={{ marginTop: '40px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '20px' }}>Your Answer</Typography>

                    <PostForm
                        placeholder="Write your answer here..."
                        buttonText="Submit Answer"
                        onSubmit={handleAnswerSubmit} />
                </Box>
            </Box>
        </Box>
    );
};

export default QuestionPage;
