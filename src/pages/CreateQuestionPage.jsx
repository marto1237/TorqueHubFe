import React, { useState } from 'react';
import { Box, Button, TextField, Chip, Typography, Grid, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Markdown from 'react-markdown';

const AskQuestion = () => {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState([]);
    const [preview, setPreview] = useState(false);
    const [currentTag, setCurrentTag] = useState('');

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && currentTag) {
            setTags([...tags, currentTag]);
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <Box sx={{ padding: '100px', maxWidth: '900px', margin: 'auto' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px' }}>
                Ask a public question
            </Typography>

            <Grid container spacing={3}>
                {/* Title Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Title"
                        variant="outlined"
                        placeholder="What's your programming question? Be specific."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Grid>

                {/* Body Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Body"
                        variant="outlined"
                        multiline
                        rows={10}
                        placeholder="Provide details about your question, including what you have tried and what you expect."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                </Grid>

                {/* Markdown Preview Toggle */}
                <Grid item xs={12}>
                    <Button variant="outlined" onClick={() => setPreview(!preview)}>
                        {preview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                </Grid>

                {/* Markdown Preview */}
                {preview && (
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                backgroundColor: theme.palette.background.default,
                            }}
                        >
                            <Markdown>{body}</Markdown>
                        </Box>
                    </Grid>
                )}

                {/* Tags Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Tags"
                        variant="outlined"
                        placeholder="Press enter to add tag"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleAddTag}
                    />
                    <Box sx={{ marginTop: '10px' }}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                onDelete={() => handleRemoveTag(tag)}
                                sx={{ marginRight: '5px' }}
                            />
                        ))}
                    </Box>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                    <Button variant="contained" color="primary">
                        Ask Question
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AskQuestion;
