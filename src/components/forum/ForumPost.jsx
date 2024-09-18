import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import AnswerForm from './AnswerForm';
import AnswerList from './AnswerList';

const ForumPost = ({ question }) => {
    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>{question.title}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
                Category: {question.category}
            </Typography>
            <Typography variant="body1" sx={{ marginTop: '20px' }}>
                {question.content}
            </Typography>
            <Divider sx={{ margin: '20px 0' }} />

            {/* Answers */}
            <Typography variant="h5">Answers</Typography>
            <AnswerList questionId={question.id} />

            {/* Form to answer the question */}
            <AnswerForm questionId={question.id} />
        </Box>
    );
};

export default ForumPost;
