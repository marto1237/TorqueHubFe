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
        },
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        h5: {
            fontWeight: 700,
        },
    },
    components: {
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
            main: '#B22222', // Deep red for exclusivity
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