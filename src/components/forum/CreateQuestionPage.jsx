import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Chip,
    Typography,
    Autocomplete,
    TextField,
    Paper,
    Divider,
    IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Picker from 'emoji-picker-react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import { storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

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
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(null);

    const maxTags = 5;
    const availableTags = [
        { name: 'BMW' },
        { name: 'Engine' },
        { name: 'Radiator' },
        { name: 'Mazda' },
        { name: 'Alternator' },
        { name: 'Oil leak' },
    ];

    const descriptionModules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                ['clean']
            ]
        }
    };

    const handleEmojiClick = (emojiObject, target) => {
        const emoji = emojiObject.emoji;
        if (target === 'title') setTitle(title + emoji);
        if (target === 'description') setDescription(description + emoji);
        setEmojiPickerOpen(null); // Close picker after selection
    };

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
        <Box sx={{ padding: { xs: '1rem', sm: '1.25rem', md: '2rem' },paddingTop: { xs: '4.5rem', sm: '4rem', md: '5rem', }, backgroundColor: theme.palette.background.default }}>
            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                <Paper elevation={3} sx={{ padding: { xs: '1.25rem', md: '2rem' }, backgroundColor: theme.palette.background.paper, mb: { xs: '1.5rem', md: '2.5rem' } }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: { xs: '1rem', md: '1.5rem' }, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                        Ask a Question
                    </Typography>

                    <Divider sx={{ marginBottom: { xs: '1.25rem', md: '1.5rem' } }} />

                    <Box component="form" noValidate autoComplete="off">
                        {/* Title Input with ReactQuill */}
                        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: { xs: '0.5rem', md: '1rem' }, fontSize: '1rem' }}>Title:</Typography>
                        <Box sx={{ position: 'relative', mb: { xs: '1.5rem', md: '2rem' } }}>
                            <ReactQuill
                                theme="snow"
                                value={title}
                                modules={descriptionModules}
                                onChange={(value) => setTitle(value)}
                                placeholder="Enter the title of your question"
                                style={{
                                    height: '5rem',
                                    marginBottom: '0.5rem',
                                    maxWidth: '100%',
                                    overflowWrap: 'break-word',
                                }}
                            />
                            <IconButton
                                sx={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                                onClick={() => setEmojiPickerOpen(emojiPickerOpen === 'title' ? null : 'title')}
                            >
                                <InsertEmoticonIcon />
                            </IconButton>
                            {emojiPickerOpen === 'title' && (
                                <Box sx={{ position: 'absolute', top: '3rem', right: '0', zIndex: 10 }}>
                                    <Picker onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject, 'title')} />
                                </Box>
                            )}
                        </Box>
                        {error.title && <Typography color="error" sx={{ mb: '1rem' }}>Title is required</Typography>}

                        <Divider sx={{ marginBottom: { xs: '7.5rem', md: '3.5rem' } }} />

                        {/* Description Input with ReactQuill */}
                        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: { xs: '0.5rem', md: '1rem' }, fontSize: '1rem' }}>Description:</Typography>
                        <Box sx={{ position: 'relative', mb: { xs: '1.5rem', md: '2rem' } }}>
                            <ReactQuill
                                theme="snow"
                                value={description}
                                modules={descriptionModules}
                                onChange={(value) => setDescription(value)}
                                placeholder="Describe the details of your problem here"
                                style={{
                                    height: '10rem',
                                    marginBottom: '0.5rem',
                                    maxWidth: '100%',
                                    overflowWrap: 'break-word',
                                }}
                            />
                            <IconButton
                                sx={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                                onClick={() => setEmojiPickerOpen(emojiPickerOpen === 'description' ? null : 'description')}
                            >
                                <InsertEmoticonIcon />
                            </IconButton>
                            {emojiPickerOpen === 'description' && (
                                <Box sx={{ position: 'absolute', top: '3rem', right: '0', zIndex: 10 }}>
                                    <Picker onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject, 'description')} />
                                </Box>
                            )}
                        </Box>
                        {error.description && <Typography color="error" sx={{ mb: '1rem' }}>Description is required</Typography>}

                        <Divider sx={{ marginBottom: { xs: '7.5rem', md: '3.5rem' } }} />

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
                                        sx={{ m: '0.25rem' }}
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
                            sx={{ mb: { xs: '1rem', md: '1.5rem' } }}
                        />

                        {/* Buttons aligned in a row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: '1rem', md: '1.5rem' } }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => setPreview(!preview)}
                                sx={{ minWidth: '8rem', fontSize: { xs: '0.8rem', sm: '1rem' } }}
                            >
                                {preview ? 'Hide Preview' : 'Show Preview'}
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                sx={{ minWidth: '8rem', fontSize: { xs: '0.8rem', sm: '1rem' } }}
                            >
                                Ask Question
                            </Button>
                        </Box>

                        {/* Styled Preview Section */}
                        {preview && (
                            <Paper variant="outlined" sx={{ p: '1.5rem', backgroundColor: theme.palette.background.default, mb: { xs: '1.5rem', md: '2rem' } }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    <Box dangerouslySetInnerHTML={{ __html: title || "Title of the Question" }} />
                                </Typography>
                                <Box sx={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: description || "<em>Description of the question appears here...</em>" }} />
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', mb: 2 }}>
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
