import React, { useState, useRef, useMemo } from 'react';
import {
    Box,
    Button,
    Chip,
    Typography,
    Autocomplete,
    TextField,
    Paper,
    Divider,
    IconButton,
    Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Picker from 'emoji-picker-react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import { storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import QuestionService from '../configuration/Services/QuestionService';
import TagService from '../configuration/Services/TagService';
import { useAppNotifications } from '../common/NotificationProvider';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DOMPurify from 'dompurify';

const AskQuestion = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const notifications = useAppNotifications();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [preview, setPreview] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploadedUrls, setUploadedUrls] = useState([]);
    const maxImages = 3;

    const [error, setError] = useState({
        title: false,
        description: false,
        tags: false,
    });
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(null);
    const [tagSearch, setTagSearch] = useState('');

    const maxTags = 5;
    const { data: availableTags = [] } = useQuery({
        queryKey: ['tags'],
        queryFn: TagService.getAllTags,
        staleTime: 5 * 60 * 1000, // Cache tags for 5 minutes
        refetchOnWindowFocus: false,
    });

    // Filter tags based on search input
    const filteredTags = useMemo(() => {
        return availableTags.filter(tag =>
            tag.name.toLowerCase().includes(tagSearch.toLowerCase())
        );
    }, [availableTags, tagSearch]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
    
        if (selectedFiles.length + files.length > maxImages) {
            notifications.show(`You can only upload up to ${maxImages} images per question.`, { autoHideDuration: 3000, severity: 'error' });
            return;
        }
    
         // Add file validation
        const validFiles = selectedFiles.filter(file => {
            // Check if it's actually an image
            if (!file.type.startsWith('image/')) {
                notifications.show(`${file.name} is not an image file`, { severity: 'error' });
                return false;
            }
            // Check file size (e.g., 5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                notifications.show(`${file.name} is too large (max 5MB)`, { severity: 'error' });
                return false;
            }
            return true;
        });

        const newFiles = validFiles.map((file) => ({
            file,
            previewURL: URL.createObjectURL(file),
            name: file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // Sanitize filename
        }));

        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };
    

    const uploadImages = async (questionId) => {
        if (!questionId) {
            console.error('No question ID provided for image upload');
            return [];
        }
    
        const uploadPromises = files.map(async ({ file, name }) => {
            try {
                const timestamp = new Date().getTime();
                const sanitizedName = `${timestamp}_${name}`; // Avoid conflicts with timestamp
                const fileRef = ref(storage, `questionImages/${questionId}/${sanitizedName}`);
    
                // Metadata for Firebase
                const metadata = {
                    contentType: file.type,
                };
    
                const uploadTask = uploadBytesResumable(fileRef, file, metadata);
    
                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        },
                        (error) => {
                            console.error('Upload error:', error);
                            notifications.show(`Error uploading ${name}: ${error.message}`, { 
                                severity: 'error',
                                autoHideDuration: 5000,
                            });
                            reject(error);
                        },
                        async () => {
                            try {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                resolve(downloadURL);
                            } catch (error) {
                                console.error('Error getting download URL:', error);
                                reject(error);
                            }
                        }
                    );
                });
            } catch (error) {
                console.error(`Error processing ${name}:`, error);
                return null;
            }
        });
    
        try {
            const urls = await Promise.all(uploadPromises);
            const validUrls = urls.filter((url) => url !== null);
            return validUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            return [];
        }
    }; 
    
    const titleModules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                ['clean']
            ]
        }
    };

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

    const validateForm = () => {
        const titleValid = title && DOMPurify.sanitize(title).trim().length >= 3;
        const sanitizedDescription = DOMPurify.sanitize(description);
        const plainTextDescription = sanitizedDescription.replace(/<[^>]+>/g, '').trim();
        const descriptionValid = plainTextDescription.length >= 3 && plainTextDescription.length <= 10000;

    
        const tagsValid = tags.length > 0;
    
        setError({
            title: !titleValid,
            description: !descriptionValid,
            tags: !tagsValid,
        });
    
        return titleValid && descriptionValid && tagsValid;
    };
    

    const handleSubmit = async () => {
        if (validateForm()) {
            const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
            if (!userDetails || !userDetails.id) {
                notifications.show('You need to be logged in', { autoHideDuration: 3000, severity: 'error' });
                return;
            }
            const userId = userDetails.id;
            const sanitizedTitle = DOMPurify.sanitize(title);
            const sanitizedDescription = DOMPurify.sanitize(description);
    
            const questionData = {
                title: sanitizedTitle,
                description: sanitizedDescription,
                tags: tags,
                userId: userId,
            };
    
            try {
                // Save question first
                const response = await QuestionService.askQuestion(questionData);
                const { id: questionId } = response.data;
    
    
                // Upload images associated with the question
                const imageUrls = await uploadImages(questionId);
                
    
                notifications.show('Question submitted successfully!', { autoHideDuration: 3000, severity: 'success' });
                navigate('/questions');
            } catch (error) {
                console.error('Error submitting question:', error);
                notifications.show('Failed to submit question', { autoHideDuration: 3000, severity: 'error' });
            }
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
                                modules={titleModules}
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

                        {/* Uploaded Images Preview */}
                            {uploadedUrls.length > 0 && (
                                <Box sx={{ my: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>Uploaded Images:</Typography>
                                    {files.map(({ previewURL }, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        width: { xs: '60%', sm: '30%', md: '45%' }, 
                                                        height: 'auto',
                                                        overflow: 'hidden',
                                                        borderRadius: '8px',
                                                        border: '1px solid #ccc',
                                                    }}
                                                >
                                                    <img
                                                        src={previewURL}
                                                        alt={`Preview ${index}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            ))}
                                </Box>
                            )}

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
                            options={filteredTags}
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
                        {/* Image Upload */}
                        <Typography variant="h6" sx={{ marginBottom: '0.5rem' }}>Upload Images</Typography>
                        <Button variant="contained" component="label" sx={{ marginBottom: '1rem' }}>
                            Add Images
                            <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                        </Button>
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
                                    <Box dangerouslySetInnerHTML={{ __html:  DOMPurify.sanitize(title) || "Title of the Question" }} />
                                </Typography>

                                    {/* Display Local Previews of Images */}
                                    {files.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', mb: 2 }}>
                                            {files.map(({ previewURL }, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        width: { xs: '80%', sm: '60%', md: '70%' }, 
                                                        height: 'auto',
                                                        overflow: 'hidden',
                                                        borderRadius: '8px',
                                                        border: '1px solid #ccc',
                                                    }}
                                                >
                                                    <img
                                                        src={previewURL}
                                                        alt={`Preview ${index}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                <Box sx={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) || "<em>Description of the question appears here...</em>" }} />
                                
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
