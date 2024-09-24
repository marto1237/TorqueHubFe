import React, { useState } from 'react';
import {Box, Button, Typography, Grid,Paper,Chip,IconButton,Link,Tooltip,} from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, Bookmark } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const questions = [
    {
        id: 1,
        title: 'Is it possible to create a certificate for a subdomain although wildcard certificate exists?',
        tags: ['ssl-certificate', 'subdomain', 'wildcard', 'wildcard-subdomain'],
        user: { name: 'AntonSack', points: 1041 },
        views: 2,
        answers: 0,
        votes: 0,
        askedTime: '1 min ago',
    },
    {
        id: 2,
        title: 'Issue with Adding a Temperature Sensor to DCPM Motor Model in OpenModelica',
        tags: ['sensors', 'modelica', 'openmodelica', 'temperature'],
        user: { name: 'Astha', points: 1 },
        views: 4,
        answers: 0,
        votes: 0,
        askedTime: '38 secs ago',
    },
    // Additional questions...
];

const QuestionListPage = () => {
    const theme = useTheme();
    const [selectedTags, setSelectedTags] = useState([]); // Holds selected tags for filtering
    const navigate = useNavigate();

    const handleTagClick = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    };

    const handleQuestionClick = (questionId) => {
        navigate(`/questions/${questionId}`); // Navigate to the question details page
    };

    const handleAskQuestionClick = () => {
        navigate('/askquestion'); // Navigate to the Ask Question page
    };

    // Filter questions based on selected tags
    const filteredQuestions = selectedTags.length > 0
        ? questions.filter((question) =>
            selectedTags.every((tag) => question.tags.includes(tag))
        )
        : questions; // If no tags selected, show all questions

    return (
        <Box sx={{ padding: '20px', paddingTop: '100px' , backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ maxWidth: '900px', margin: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Typography variant="h5" color="textSecondary">Top Questions</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAskQuestionClick}
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Ask Question
                    </Button>
                </Box>


                {/* Render selected tags */}
                {selectedTags.length > 0 && (
                    <Box sx={{ marginBottom: '20px' }}>
                        <Typography variant="body2" color="textSecondary">Selected Tags:</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {selectedTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={
                                        selectedTags.includes(tag)
                                            ? 'Mui-selected'
                                            : 'Mui-unselected'
                                    }
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 0.8, // Adds a hover effect
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Render questions */}
                <Grid container spacing={3}>
                    {filteredQuestions.map((question) => (
                        <Grid item xs={12} key={question.id}>
                            <Paper sx={{ padding: '20px', marginBottom: '20px' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                                        <Tooltip title="Upvote">
                                            <IconButton>
                                                <KeyboardArrowUp />
                                            </IconButton>
                                        </Tooltip>
                                        <Typography variant="body1">{question.votes}</Typography>
                                        <Tooltip title="Downvote">
                                            <IconButton>
                                                <KeyboardArrowDown />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Bookmark">
                                            <IconButton>
                                                <Bookmark />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={10} sm={11}>
                                        <Typography
                                            variant="h6"
                                            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                            onClick={() => handleQuestionClick(question.id)}
                                        >
                                            {question.title}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                            {question.tags.map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    onClick={() => handleTagClick(tag)}
                                                    className={
                                                        selectedTags.includes(tag)
                                                            ? 'Mui-selected'
                                                            : 'Mui-unselected'
                                                    }
                                                    sx={{
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            opacity: 0.8, // Adds a hover effect
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Box>

                                        <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">
                                                {question.votes} votes | {question.answers} answers | {question.views} views
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Asked by{' '}
                                                <Link href={`/user/${question.user.name}`} color="primary">
                                                    {question.user.name} ({question.user.points})
                                                </Link>{' '}
                                                {question.askedTime}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default QuestionListPage;
