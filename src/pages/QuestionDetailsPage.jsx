import React, { useState } from 'react';
import { Box, Button, Typography, TextField, IconButton, Grid , Divider} from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import Markdown from 'react-markdown';

const QuestionPage = () => {
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [votes, setVotes] = useState(0);

    const handleAnswerSubmit = () => {
        if (answer.trim()) {
            setAnswers([...answers, answer]);
            setAnswer('');
        }
    };

    const handleVote = (type) => {
        setVotes(type === 'up' ? votes + 1 : votes - 1);
    };

    return (
        <Box sx={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px' }}>
                How can I optimize my React code?
            </Typography>

            {/* Question Details */}
            <Box sx={{ marginBottom: '40px' }}>
                <Typography variant="body1" sx={{ marginBottom: '20px' }}>
                    I am working on a React application, and I am noticing some performance issues.
                    How can I improve the performance and optimize the code?
                </Typography>

                {/* Voting */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconButton onClick={() => handleVote('up')}>
                        <ThumbUp />
                    </IconButton>
                    <Typography variant="body1">{votes}</Typography>
                    <IconButton onClick={() => handleVote('down')}>
                        <ThumbDown />
                    </IconButton>
                </Box>
            </Box>

            <Divider />

            {/* Answers Section */}
            <Box sx={{ marginTop: '20px', marginBottom: '20px' }}>
                <Typography variant="h5" sx={{ marginBottom: '20px' }}>Answers</Typography>

                {answers.map((ans, index) => (
                    <Box key={index} sx={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                        <Markdown>{ans}</Markdown>
                    </Box>
                ))}
            </Box>

            <Divider />

            {/* Answer Input */}
            <Box sx={{ marginTop: '20px' }}>
                <Typography variant="h6">Your Answer</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={5}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write your answer here..."
                    sx={{ marginTop: '10px', marginBottom: '10px' }}
                />
                <Button variant="contained" color="primary" onClick={handleAnswerSubmit}>
                    Submit Answer
                </Button>
            </Box>
        </Box>
    );
};

export default QuestionPage;
