import React, { useState } from 'react';
import { Box, TextField, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { FormatBold, FormatItalic, FormatUnderlined, FormatStrikethrough, Settings } from '@mui/icons-material';

const PostForm = ({ placeholder, buttonText, onSubmit }) => {
    const [postContent, setPostContent] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);

    // Handle text selection
    const handleTextSelect = (e) => {
        setSelectionStart(e.target.selectionStart);
        setSelectionEnd(e.target.selectionEnd);
    };

    // Apply formatting to selected text
    const applyFormatting = (tag) => {
        if (selectionStart !== selectionEnd) {
            const before = postContent.slice(0, selectionStart);
            const selectedText = postContent.slice(selectionStart, selectionEnd);
            const after = postContent.slice(selectionEnd);
            setPostContent(`${before}[${tag}]${selectedText}[/${tag}]${after}`);
        }
    };

    // Toggle between Preview and Edit mode
    const handlePreview = () => {
        setIsPreview(!isPreview);
    };

    // Convert custom tags to HTML for preview
    const formatPostForPreview = (text) => {
        return text
            .replace(/\[b\](.*?)\[\/b\]/g, '<b>$1</b>')
            .replace(/\[i\](.*?)\[\/i\]/g, '<i>$1</i>')
            .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
            .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>');
    };

    // Handle form submission
    const handleSubmit = () => {
        if (postContent.trim()) {
            onSubmit(postContent);
            setPostContent(''); // Clear the input
        }
    };

    return (
        <Box>
            <TextField
                variant="filled"
                fullWidth
                multiline
                minRows={4}
                value={postContent}
                placeholder={placeholder}
                onSelect={handleTextSelect}
                onChange={(e) => setPostContent(e.target.value)}
                sx={{ borderRadius: '8px', mb: 2 }}
            />

            {/* Toolbar for Formatting */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', padding: '10px', mb: 2 }}>
                <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Bold">
                        <IconButton onClick={() => applyFormatting('b')}>
                            <FormatBold />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Italic">
                        <IconButton onClick={() => applyFormatting('i')}>
                            <FormatItalic />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Underline">
                        <IconButton onClick={() => applyFormatting('u')}>
                            <FormatUnderlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Strikethrough">
                        <IconButton onClick={() => applyFormatting('s')}>
                            <FormatStrikethrough />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box>
                    <Tooltip title="Preview">
                        <IconButton onClick={handlePreview}>
                            <Settings />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Preview */}
            {isPreview && (
                <Box sx={{ padding: '20px', backgroundColor: '#333', borderRadius: '8px', boxShadow: 3, mt: 2 }}>
                    <Typography
                        variant="body1"
                        sx={{ color: '#fff' }}
                        dangerouslySetInnerHTML={{ __html: formatPostForPreview(postContent) }}
                    />
                </Box>
            )}

            {/* Submit Post */}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                {buttonText}
            </Button>
        </Box>
    );
};

export default PostForm;
