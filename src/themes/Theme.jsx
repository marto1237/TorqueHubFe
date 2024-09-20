import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1f1f1f',
        },
        primary: {
            main: '#B22222', // Deep red for luxurious accents
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            third: '#424242',
        },
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        h5: {
            fontWeight: 700,
        },
    },
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: '#e53935',
                        color: '#FFFFFF',
                    },
                    '&.Mui-unselected': {
                        backgroundColor: '#424242',
                        color: '#FFFFFF', 
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& label': {
                        color: '#000000', // Label color should be black when input is not focused
                    },
                    '& label.Mui-focused': {
                        color: '#000000', // Label color when focused
                    },
                    '& .MuiInputBase-root': {
                        color: '#000000', // Text color inside the input
                    },
                    '& .MuiInputBase-input': {
                        color: '#000000', // Input text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000', // Border color when not focused
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000', // Border color on hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000', // Border color when focused
                    },
                },
            },
        },
        // New variant for TextField with white text
        MuiTextFieldWhite: {
            styleOverrides: {
                root: {
                    '& label': {
                        color: '#FFFFFF', // White label
                    },
                    '& label.Mui-focused': {
                        color: '#FFFFFF', // White label on focus
                    },
                    '& .MuiInputBase-root': {
                        color: '#FFFFFF', // White text inside input
                    },
                    '& .MuiInputBase-input': {
                        color: '#FFFFFF', // Input white text
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFFFFF', // Border color (white)
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFFFFF', // Border color on hover (white)
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFFFFF', // Border color when focused (white)
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    backgroundColor: '#e53935', // Button color for dark theme
                    color: '#FFFFFF', // Text color on button
                },
                containedSecondary: {
                    backgroundColor: '#43a047', // Secondary button color for dark theme
                    color: '#000000', // Text color on secondary button
                },
                outlinedPrimary: {
                    borderColor: '#e53935', // Border color for outlined primary button
                    color: '#e53935', // Text color on outlined primary button
                },
                outlinedSecondary: {
                    borderColor: '#43a047', // Border color for outlined secondary button
                    color: '#43a047', // Text color on outlined secondary button
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        color: '#e53935', // Selected tab color
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#e53935', // Color of selected tab's underline
                },
            },
        },
    },
});

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#F5F5F5',
            paper: '#ECEFF1',
        },
        primary: {
            main: '#212121', // Deep red for exclusivity
            secondary: '#1565c0',
        },
        text: {
            primary: '#424242',
        },
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        h5: {
            fontWeight: 700,
        },
    },
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: '#424242',
                        color: '#FFFFFF',
                    },
                    '&.Mui-unselected': {
                        backgroundColor: '#e0e0e0',
                        color: '#757575',
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: '#1565c0', // Set default checkbox color to blue in light theme
                    '&.Mui-checked': {
                        color: '#1565c0', // Checkbox color when checked
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    backgroundColor: '#1565c0', // Button color for light theme
                    color: '#FFFFFF', // Text color on button
                },
                containedSecondary: {
                    backgroundColor: '#43a047', // Secondary button color for light theme
                    color: '#000000', // Text color on secondary button
                },
                outlinedPrimary: {
                    borderColor: '#1565c0', // Border color for outlined primary button
                    color: '#1565c0', // Text color on outlined primary button
                },
                outlinedSecondary: {
                    borderColor: '#43a047', // Border color for outlined secondary button
                    color: '#43a047', // Text color on outlined secondary button
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    color: '#424242',
                    '&.Mui-selected': {
                        color: '#1565c0',
                    },

                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#1565c0', // Color of selected tab's underline
                },
            },
        },
    },
});

export default function ThemedForm() {
    const [theme, setTheme] = useState('dark'); // Initialize state with 'dark'

    // Function to toggle between themes
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Function to scroll to the top of the page
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Choose the current theme
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    return (
        <ThemeProvider theme={currentTheme}>
            {/* Theme Toggle Button */}
            <Fab
                color="primary"
                aria-label="toggle theme"
                onClick={toggleTheme}
                sx={{
                    position: 'fixed',
                    bottom: 80, // Keeps it above the scroll-to-top button
                    right: 16,
                }}
            >
                {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </Fab>

            {/* Scroll-to-Top Button */}
            <Fab
                color="primary"
                aria-label="scroll to top"
                onClick={scrollToTop}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                }}
            >
                <KeyboardArrowUpIcon />
            </Fab>
        </ThemeProvider>
    );
}
export { darkTheme, lightTheme };