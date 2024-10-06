import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { Undo, Redo, Settings, EmojiEmotions } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '@mui/material/styles';
import Picker from 'emoji-picker-react';

// Define toolbar options for the Quill editor
const toolbarOptions = [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    ['clean']
];

const PostForm = ({ placeholder, buttonText, onSubmit }) => {
    const theme = useTheme();
    const [postContent, setPostContent] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [history, setHistory] = useState([]); // Undo history stack
    const [redoHistory, setRedoHistory] = useState([]); // Redo stack
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const quillRef = React.useRef(null);

    // Save the current post content to history
    const saveToHistory = (content) => {
        setHistory([...history, content]);
        setRedoHistory([]); // Clear redo stack on new changes
    };

    // Handle changes in the Quill editor
    const handleQuillChange = (content, delta, source, editor) => {
        const text = editor.getText();
        if (text.trim()) {
            saveToHistory(postContent);
            setPostContent(content);
        }
    };

    // Undo functionality
    const handleUndo = () => {
        if (history.length > 0) {
            const prevContent = history[history.length - 1];
            setRedoHistory([postContent, ...redoHistory]);
            setPostContent(prevContent);
            setHistory(history.slice(0, history.length - 1));
        }
    };

    // Redo functionality
    const handleRedo = () => {
        if (redoHistory.length > 0) {
            const nextContent = redoHistory[0];
            setHistory([...history, postContent]);
            setPostContent(nextContent);
            setRedoHistory(redoHistory.slice(1));
        }
    };

    // Add emoji to post content
    const addEmoji = (emojiObject, event) => {
        console.log("Emoji Object:", emojiObject); // Now it should log the correct emoji object
        if (!emojiObject || !emojiObject.emoji) {
            console.error("Emoji object is undefined or does not have an emoji property.");
            return;
        }

        if (quillRef.current) {
            const quill = quillRef.current.getEditor(); // Get the Quill editor instance
            const selection = quill.getSelection(); // Get the cursor selection

            const contentLength = quill.getLength() || 0; // Ensure contentLength is defined

            if (!selection || selection.index === null || selection.index === undefined) {
                // If no valid selection, append the emoji at the end
                quill.insertText(contentLength - 1, emojiObject.emoji);
            } else {
                // If there is a valid selection, insert emoji at the cursor position
                const cursorPosition = selection.index; // Get the cursor position
                quill.insertText(cursorPosition, emojiObject.emoji); // Insert the emoji at the cursor position
                quill.setSelection(cursorPosition + 1); // Move the cursor after the emoji
            }

            setPostContent(quill.root.innerHTML); // Update state to reflect the new content
            setShowEmojiPicker(false); // Hide the emoji picker
        }
    };


    // Toggle between Preview and Edit mode
    const handlePreview = () => {
        setIsPreview(!isPreview);
    };

    // Handle form submission
    const handleSubmit = () => {
        if (postContent.trim()) {
            onSubmit(postContent);
            setPostContent('');
            setHistory([]);
        }
    };

    useEffect(() => {
        const tooltips = {
            bold: 'Bold',
            italic: 'Italic',
            underline: 'Underline',
            strike: 'Strikethrough',
            blockquote: 'Blockquote',
            'code-block': 'Code Block',
            ordered: 'Ordered List',
            bullet: 'Bullet List',
            link: 'Insert Link',
            image: 'Insert Image',
            color: 'Text Color',
            background: 'Background Color',
            header: 'Heading',
            font: 'Font Style',
            align: 'Text Align',
            sub: 'Subscript',
            super: 'Superscript',
            clean: 'Clear Formatting'
        };

        // Add tooltips to each button in the Quill toolbar
        Object.keys(tooltips).forEach((key) => {
            const buttons = document.querySelectorAll(`.ql-${key}`);
            buttons.forEach((button) => {
                button.setAttribute('title', tooltips[key]); // Add the title attribute for native tooltip
            });
        });
    }, []);

    return (
        <Paper sx={{ padding: '20px', borderRadius: '8px' }}>
            <Typography sx={{ mb: 2 }}>Your Answer</Typography>

            {/* Quill Editor */}
            {!isPreview && (
                <ReactQuill
                    ref={quillRef}
                    value={postContent}
                    onChange={handleQuillChange}
                    placeholder={placeholder}
                    theme="snow"
                    modules={{ toolbar: toolbarOptions }}
                    style={{
                        color: theme.palette.text.primary,
                        borderRadius: '4px',
                        border: '1px solid #555',
                    }}
                />
            )}

            {/* Toolbar for Undo, Redo, and Preview */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', mt: 2 }}>
                <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Undo">
                        <span>
                            <IconButton onClick={handleUndo} disabled={history.length === 0} sx={{ color: '#fff' }}>
                                <Undo />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Redo">
                        <span>
                            <IconButton onClick={handleRedo} disabled={redoHistory.length === 0} sx={{color: '#fff'}}>
                                <Redo/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    {/* Add emoji button */}
                    <Tooltip title="Insert Emoji">
                        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <EmojiEmotions />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Tooltip title="Preview">
                    <IconButton onClick={handlePreview}>
                        <Settings />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <Picker
                    onEmojiClick={(emojiObject, event) => addEmoji(emojiObject, event)} // Correct order of arguments
                />
            )}

            {/* Preview Mode */}
            {isPreview && (
                <Box sx={{ padding: '20px', borderRadius: '8px', boxShadow: 3, mt: 2 }}>
                    <Typography
                        variant="body1"
                        dangerouslySetInnerHTML={{ __html: postContent }}
                    />
                </Box>
            )}

            {/* Submit Post */}
            <Button variant="contained" onClick={handleSubmit}>
                {buttonText}
            </Button>
        </Paper>
    );
};

export default PostForm;
