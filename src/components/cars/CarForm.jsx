import React, { useState } from 'react';
import { Box, Button, Typography, TextField, IconButton, Grid, Divider, Paper, Tooltip, Link } from '@mui/material';
import { Bookmark, CheckCircle, KeyboardArrowUp, KeyboardArrowDown, Done } from '@mui/icons-material';
import Markdown from 'react-markdown';
import { useTheme } from '@mui/material/styles';
import PostForm from "../forum/PostForm";

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
        const updatedAnswers = [...answers];
        updatedAnswers[index].comments.push({ text: comment, user: commentUser, votes: 0 }); // Add comment with user and initial votes
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

    return (
        <Box sx={{ padding: { xs: '20px', sm: '100px' }, backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ padding: '20px', maxWidth: '1000px', margin: 'auto', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    How can I optimize my React code?
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
                            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                                I am working on a React application, and I am noticing some performance issues. How can I improve the performance and optimize the code?
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <Typography variant="caption" sx={getTagStyles()}>
                                    react
                                </Typography>
                                <Typography variant="caption" sx={getTagStyles()}>
                                    performance
                                </Typography>
                            </Box>

                            <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
                                <Typography variant="caption" color="textSecondary">
                                    Asked by{' '}
                                    <Link href={questionUser.profileLink} color="primary" underline="hover">
                                        {questionUser.username}
                                    </Link>
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Divider />

                <Box sx={{ marginTop: '20px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '20px' }}>Answers</Typography>

                    {answers.map((ans, index) => (
                        <Paper key={index} sx={{ padding: '20px', marginBottom: '20px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                                    <Tooltip title="This answer is useful" placement="right" arrow>
                                        <IconButton onClick={() => handleVote('up')}>
                                            <KeyboardArrowUp />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{votes}</Typography>
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
                                        dangerouslySetInnerHTML={{ __html: formatTextWithTags(ans.text) }}
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
                                        <Typography variant="caption" color="textSecondary">
                                            Answered by{' '}
                                            <Link href={ans.user.profileLink} color="primary" underline="hover">
                                                {ans.user.username}
                                            </Link>
                                        </Typography>
                                    </Box>

                                    {/* Comments Section */}
                                    {ans.comments.map((comment, commentIndex) => (
                                        <Box key={commentIndex} sx={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '3px solid #ccc' }}>
                                            <Grid container>
                                                <Grid item xs={9}>
                                                    <Typography variant="body2" sx={{
                                                        wordWrap: 'break-word',   // Breaks long words
                                                        overflowWrap: 'anywhere', // Allows breaking words anywhere
                                                        whiteSpace: 'pre-wrap',   // Preserves newlines and spaces while allowing wrapping
                                                    }}
                                                    >
                                                        {comment.text}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={3} sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Commented by{' '}
                                                        <Link href={comment.user.profileLink} color="primary" underline="hover">
                                                            {comment.user.username}
                                                        </Link>
                                                    </Typography>
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
