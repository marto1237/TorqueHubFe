import React, { useState } from 'react';
import { Box, Button, Typography, TextField, IconButton, Grid, Divider, Paper, Tooltip, Link } from '@mui/material';
import { Bookmark, CheckCircle, KeyboardArrowUp, KeyboardArrowDown, Done } from '@mui/icons-material';
import Markdown from 'react-markdown';
import { useTheme } from '@mui/material/styles';

const QuestionPage = () => {
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [votes, setVotes] = useState(0);
    const [acceptedAnswerIndex, setAcceptedAnswerIndex] = useState(null);

    // Example user data (Replace this with actual data from props or state)
    const questionUser = { username: 'QuestionUser123', profileLink: '/user/questionuser123' };
    const answerUser = { username: 'AnswerUser456', profileLink: '/user/answeruser456' };

    const handleAnswerSubmit = () => {
        if (answer.trim()) {
            setAnswers([...answers, { text: answer, user: answerUser }]);  // Save the answer with the user info
            setAnswer('');
        }
    };

    const handleVote = (type) => {
        setVotes(type === 'up' ? votes + 1 : votes - 1);
    };

    const handleAcceptAnswer = (index) => {
        setAcceptedAnswerIndex(index);
    };

    const theme = useTheme();

    // Dynamically style tags based on the theme
    const getTagStyles = () => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e1ecf4',
        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary,
        padding: '5px',
        borderRadius: '3px',
    });

    return (
        <Box sx={{ padding: { xs: '20px', sm: '100px' }, backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ padding: '20px', maxWidth: '1000px', margin: 'auto', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>

                {/* Question Title */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    How can I optimize my React code?
                </Typography>

                {/* Question Section */}
                <Paper sx={{ padding: '20px', marginBottom: '40px', backgroundColor: theme.palette.background.paper }}>
                    <Grid container spacing={2}>
                        {/* Voting Section */}
                        <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                            <Tooltip title="This question shows research effort; it is useful and clear" placement="right" arrow>
                                <IconButton
                                    onClick={() => handleVote('up')}
                                    sx={{
                                        backgroundColor: theme.palette.background.default,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: '50%',
                                        color: theme.palette.text.primary,
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        },
                                    }}
                                >
                                    <KeyboardArrowUp />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{votes}</Typography>
                            <Tooltip title="This question does not show any research effort; it is unclear or not useful" placement="right" arrow>
                                <IconButton
                                    onClick={() => handleVote('down')}
                                    sx={{
                                        backgroundColor: theme.palette.background.default,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: '50%',
                                        color: theme.palette.text.primary,
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        },
                                    }}
                                >
                                    <KeyboardArrowDown />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Save this question." placement="right" arrow>
                                <IconButton>
                                    <Bookmark />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Accepted" placement="right" arrow>
                                <IconButton>
                                    <Done sx={{ color: theme.palette.success.main }} />
                                </IconButton>
                            </Tooltip>
                        </Grid>

                        {/* Question Content */}
                        <Grid item xs={10} sm={11}>
                            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                                I am working on a React application, and I am noticing some performance issues. How can I improve the performance and optimize the code?
                            </Typography>

                            {/* Tags */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <Typography variant="caption" sx={getTagStyles()}>
                                    react
                                </Typography>
                                <Typography variant="caption" sx={getTagStyles()}>
                                    performance
                                </Typography>
                            </Box>

                            {/* Question Username */}
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

                {/* Answers Section */}
                <Box sx={{ marginTop: '20px' }}>
                    <Typography variant="h6" sx={{ marginBottom: '20px' }}>Answers</Typography>

                    {answers.map((ans, index) => (
                        <Paper
                            key={index}
                            sx={{
                                padding: '20px',
                                marginBottom: '20px',
                                borderLeft: acceptedAnswerIndex === index ? `5px solid ${theme.palette.success.main}` : '5px solid transparent',
                                backgroundColor: acceptedAnswerIndex === index ? theme.palette.success.light : theme.palette.background.paper,
                            }}
                        >
                            <Grid container spacing={2}>
                                {/* Voting Section */}
                                <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                                    <Tooltip title="This answer is useful" placement="right" arrow>
                                        <IconButton
                                            onClick={() => handleVote('up')}
                                            sx={{
                                                backgroundColor: theme.palette.background.default,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: '50%',
                                                color: theme.palette.text.primary,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover,
                                                },
                                            }}
                                        >
                                            <KeyboardArrowUp />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="body1" sx={{ marginTop: '5px', marginBottom: '5px' }}>{votes}</Typography>
                                    <Tooltip title="This answer is not useful" placement="right" arrow>
                                        <IconButton
                                            onClick={() => handleVote('down')}
                                            sx={{
                                                backgroundColor: theme.palette.background.default,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: '50%',
                                                color: theme.palette.text.primary,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover,
                                                },
                                            }}
                                        >
                                            <KeyboardArrowDown />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Save this answer" placement="right" arrow>
                                        <IconButton>
                                            <Bookmark />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="The question owner accepted this as the best" placement="right" arrow>
                                        <IconButton>
                                            <Done sx={{ color: theme.palette.success.main }} />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>

                                {/* Answer Content */}
                                <Grid item xs={10} sm={11}>
                                    <Markdown>{ans.text}</Markdown>

                                    {/* Accept Answer Button */}
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

                                    {/* Answer Username */}
                                    <Box sx={{ marginTop: '10px', textAlign: 'right' }}>
                                        <Typography variant="caption" color="textSecondary">
                                            Answered by{' '}
                                            <Link href={ans.user.profileLink} color="primary" underline="hover">
                                                {ans.user.username}
                                            </Link>
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>

                <Divider />

                {/* Answer Input Section */}
                <Box sx={{ marginTop: '20px' }}>
                    <Typography variant="h6">Your Answer</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Write your answer here..."
                        sx={{
                            marginTop: '10px',
                            marginBottom: '10px',
                            '& .MuiInputBase-input': {
                                color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,  // Text color
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,  // Border color
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,  // Border color on hover
                            },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.primary.main,  // Border color on focus
                            },
                            '& label.Mui-focused': {
                                color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,  // Label color on focus
                            },
                        }}
                    />
                    <Button variant="contained" color="primary" onClick={handleAnswerSubmit}>
                        Submit Answer
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default QuestionPage;
