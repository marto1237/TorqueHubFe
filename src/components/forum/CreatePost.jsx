import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DOMPurify from 'dompurify';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle question submission logic (call forumService to submit)
    };

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Ask a Question
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                        label="Question Title"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Programming">Programming</MenuItem>
                        <MenuItem value="Hardware">Hardware</MenuItem>
                        {/* Add more categories as needed */}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                        label="Description"
                        variant="outlined"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        multiline
                        rows={6}
                        required
                    />
                </FormControl>

                <Button variant="contained" color="primary" type="submit">
                    Submit Question
                </Button>
            </form>
        </Box>
    );
};

export default CreatePost;
