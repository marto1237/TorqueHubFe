import React, { useState } from 'react';
import {Box, Button, TextField, Chip, Typography, Grid, Divider, Tooltip, Autocomplete} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Markdown from 'react-markdown';

const AskQuestion = () => {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState([]);
    const [preview, setPreview] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [error, setError] = useState({
        title: false,
        body: false,
        tags: false,
    });

    const maxTags = 5;
    const maxTitleLength = 100;

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && currentTag && tags.length < maxTags) {
            setTags([...tags, currentTag.toLowerCase()]);
            setCurrentTag('');
            e.preventDefault(); // Prevents submitting form with Enter key
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const validateForm = () => {
        return title.trim() && body.trim() && tags.length > 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('Question submitted:', { title, body, tags });
            // Submit logic can be added here
        } else {
            setError({
                title: !title.trim(),
                body: !body.trim(),
                tags: tags.length === 0,
            });
        }
    };

    const availableTags = [
        { name: 'BMW' },
        { name: 'Engine' },
        { name: 'Radiator' },
        { name: 'Mazda' },
        { name: 'Alternator' },
        { name: 'Oil leak' },
    ];
    let selectedTags = [];
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
                        inputProps={{ maxLength: maxTitleLength }}
                        error={error.title}
                        helperText={
                            error.title
                                ? 'Title is required'
                                : `${title.length}/${maxTitleLength} characters`
                        }
                        required
                    />
                </Grid>
                <Autocomplete
                    multiple
                    options={availableTags} // fetched from backend
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => setTags(newValue.map((item) => item.name))}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Tags"
                            placeholder="Add tags (up to 5)"
                            error={error.tags}
                            helperText={error.tags ? 'At least one tag is required' : ''}
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option.name === value.name}
                    limitTags={maxTags}
                />


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
                        error={error.body}
                        helperText={error.body ? 'Body is required' : 'Markdown supported'}
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
                            <Markdown>{body || 'Nothing to preview'}</Markdown>
                        </Box>
                    </Grid>
                )}

                {/* Tags Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Tags"
                        variant="outlined"
                        placeholder="Press enter to add up to 5 tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleAddTag}
                        error={error.tags}
                        helperText={error.tags ? 'At least one tag is required' : ''}
                    />
                    <Box sx={{ marginTop: '10px' }}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                onDelete={() => handleRemoveTag(tag)}
                                sx={{ marginRight: '5px', marginBottom: '5px' }}
                            />
                        ))}
                    </Box>
                    {tags.length >= maxTags && (
                        <Typography variant="caption" color="error">
                            Maximum {maxTags} tags allowed
                        </Typography>
                    )}
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Ask Question
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AskQuestion;
