import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AnswerList = ({ questionId }) => {
    // Fetch answers using questionId from forumService
    const answers = [
        { id: 1, content: 'This is an answer.', author: 'User1' },
        { id: 2, content: 'Another answer here.', author: 'User2' },
    ];

    return (
        <Box>
            {answers.map((answer) => (
                <Paper key={answer.id} sx={{ padding: '10px', marginTop: '10px' }}>
                    <Typography variant="body1">{answer.content}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        Answered by: {answer.author}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
};

export default AnswerList;
