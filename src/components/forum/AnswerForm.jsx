import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

const AnswerForm = ({ questionId }) => {
    const [answer, setAnswer] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle answer submission logic (call forumService to submit the answer)
    };

    return (
        <Box sx={{ marginTop: '20px' }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Your Answer"
                    variant="outlined"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    required
                />
                <Button variant="contained" color="primary" type="submit" sx={{ marginTop: '10px' }}>
                    Submit Answer
                </Button>
            </form>
        </Box>
    );
};

export default AnswerForm;
