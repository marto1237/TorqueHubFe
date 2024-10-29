import React, { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Typography,
    Autocomplete,
    TextField,
    Paper,
    Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AskQuestion = () => {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [preview, setPreview] = useState(false);
    const [error, setError] = useState({
        title: false,
        description: false,
        tags: false,
    });

    const maxTags = 5;
    const availableTags = [
        { name: 'BMW' },
        { name: 'Engine' },
        { name: 'Radiator' },
        { name: 'Mazda' },
        { name: 'Alternator' },
        { name: 'Oil leak' },
    ];

    const handleTagChange = (event, newValue) => {
        const uniqueTags = Array.from(new Set(newValue.map((item) => item.name)));
        setTags(uniqueTags.slice(0, maxTags));
    };

    const validateForm = () => title.trim() && description.trim() && tags.length > 0;

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('Question submitted:', { title, description, tags });
        } else {
            setError({
                title: !title.trim(),
                description: !description.trim(),
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

                    <Box component="form" noValidate autoComplete="off">
                        {/* Title Input with ReactQuill */}
                        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>Title:</Typography>
                        <ReactQuill
                            theme="snow"
                            value={title}
                            onChange={(value) => setTitle(value)}
                            placeholder="Enter the title of your question"
                            style={{ height: '100px', marginBottom: '24px' }}
                        />
                        {error.title && <Typography color="error" sx={{ mb: 2 }}>Title is required</Typography>}

                        <Divider sx={{ marginBottom: '25px' }} />

                        {/* Description Input with ReactQuill */}
                        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>Description:</Typography>
                        <ReactQuill
                            theme="snow"
                            value={description}
                            onChange={(value) => setDescription(value)}
                            placeholder="Describe the details of your problem here"
                            style={{ height: '200px', marginBottom: '24px' }}
                        />
                        {error.description && <Typography color="error" sx={{ mb: 2 }}>Description is required</Typography>}

                        <Divider sx={{ marginBottom: '25px' }} />

                        {/* Tags Input */}
                        <Autocomplete
                            multiple
                            options={availableTags}
                            getOptionLabel={(option) => option.name}
                            onChange={handleTagChange}
                            value={tags.map(tag => ({ name: tag }))}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        key={index}
                                        label={option.name}
                                        {...getTagProps({ index })}
                                        sx={{ m: 0.5 }}
                                    />
                                ))
                            }
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
                            limitTags={maxTags}
                            sx={{ mb: 3 }}
                        />

                        {/* Buttons aligned in a row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => setPreview(!preview)}
                                sx={{ minWidth: '150px' }}
                            >
                                {preview ? 'Hide Preview' : 'Show Preview'}
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                sx={{ minWidth: '150px' }}
                            >
                                Ask Question
                            </Button>
                        </Box>

                        {/* Styled Preview Section */}
                        {preview && (
                            <Paper variant="outlined" sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    <Box dangerouslySetInnerHTML={{ __html: title || "Title of the Question" }} />
                                </Typography>


                                

                                <Box sx={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: description || "<em>Description of the question appears here...</em>" }} />
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {tags.length > 0 ? (
                                        tags.map((tag, index) => (
                                            <Chip key={index} label={tag} size="small" sx={{ backgroundColor: '#333', color: '#fff' }} />
                                        ))
                                    ) : (
                                        <Chip label="No tags" size="small" disabled />
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />
                            </Paper>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default AskQuestion;
