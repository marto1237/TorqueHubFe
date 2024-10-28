import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Chip,
    Typography,
    Grid,
    Tooltip,
    Autocomplete,
    Paper,
    Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Markdown from 'react-markdown';

const AskQuestion = () => {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [explanation, setExplanation] = useState('');
    const [tags, setTags] = useState([]);
    const [preview, setPreview] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [error, setError] = useState({
        title: false,
        body: false,
        explanation: false,
        tags: false,
    });

    const maxTags = 5;
    const maxTitleLength = 100;

    const availableTags = [
        { name: 'BMW' },
        { name: 'Engine' },
        { name: 'Radiator' },
        { name: 'Mazda' },
        { name: 'Alternator' },
        { name: 'Oil leak' },
    ];

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && currentTag && tags.length < maxTags) {
            setTags([...tags, currentTag.toLowerCase()]);
            setCurrentTag('');
            e.preventDefault();
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const validateForm = () => title.trim() && body.trim() && explanation.trim() && tags.length > 0;

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('Question submitted:', { title, body, explanation, tags });
            // Submission logic here
        } else {
            setError({
                title: !title.trim(),
                body: !body.trim(),
                explanation: !explanation.trim(),
                tags: tags.length === 0,
            });
        }
    };

    return (
        <Box sx={{ padding: { xs: '20px', md: '40px' }, backgroundColor: theme.palette.background.default }}>
            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                <Paper elevation={3} sx={{ padding: '30px', backgroundColor: theme.palette.background.paper }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
                        Ask a Question
                    </Typography>

                    <Divider sx={{ marginBottom: '20px' }} />

                    {/* Step-by-Step Helper Panel */}
                    <Box sx={{ marginBottom: '20px', backgroundColor: theme.palette.background.paper, padding: '20px', borderRadius: '8px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Writing a Good Title</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Your title should summarize the problem. You might find that you have a better idea of your title after writing out the rest of the question.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Title Input */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                variant="filled"
                                placeholder="e.g., Is there an R function for finding the index of an element in a vector?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                inputProps={{ maxLength: maxTitleLength }}
                                error={error.title}
                                helperText={error.title ? 'Title is required' : `${title.length}/${maxTitleLength} characters`}
                                required
                            />
                        </Grid>

                        {/* Body Input */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>What are the details of your problem?</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                multiline
                                rows={8}
                                placeholder="Introduce the problem and expand on what you put in the title. Minimum 20 characters."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                error={error.body}
                                helperText={error.body ? 'Body is required' : 'Markdown supported'}
                            />
                        </Grid>

                        {/* Explanation Input */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>What did you try and what were you expecting?</Typography>
                            <TextField
                                fullWidth
                                variant="filled"
                                multiline
                                rows={4}
                                placeholder="Describe what you tried, what you expected, and what actually resulted. Minimum 20 characters."
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                error={error.explanation}
                                helperText={error.explanation ? 'Explanation is required' : ''}
                            />
                        </Grid>

                        {/* Tags Input */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Tags</Typography>
                            <Autocomplete
                                multiple
                                options={availableTags}
                                getOptionLabel={(option) => option.name}
                                onChange={(event, newValue) => setTags(newValue.map((item) => item.name))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tags"
                                        placeholder="Add tags (up to 5)"
                                        variant="filled"
                                        error={error.tags}
                                        helperText={error.tags ? 'At least one tag is required' : ''}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.name === value.name}
                                limitTags={maxTags}
                            />
                            <Box sx={{ marginTop: '10px' }}>
                                {tags.map((tag, index) => (
                                    <Chip key={index} label={tag} onDelete={() => handleRemoveTag(tag)} sx={{ marginRight: '5px', marginBottom: '5px' }} />
                                ))}
                            </Box>
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
                                <Box sx={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: theme.palette.background.default }}>
                                    <Markdown>{body || 'Nothing to preview'}</Markdown>
                                </Box>
                            </Grid>
                        )}

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Ask Question
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Box>
    );
};

export default AskQuestion;
