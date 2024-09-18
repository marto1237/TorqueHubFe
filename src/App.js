import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import './styles/style.css';

import { darkTheme, lightTheme } from './themes/Theme';
import LoadingComponent from './components/common/Loader';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';



// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage'));
const SignUp = lazy(() => import('./components/auth/SignUp'));
const LogIn = lazy(() => import('./components/auth/Login'));
const CarList = lazy(() => import('./components/cars/CarList'));
const CarForm = lazy(() => import('./components/cars/CarForm'));
const CreateQuestionPage = lazy(() => import('./pages/CreateQuestionPage'));

const App = () => {
    const [themeMode, setThemeMode] = useState('dark'); // Initialize state with 'dark'

    // Toggle theme function
    const toggleTheme = () => {
        setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Choose the current theme
    const theme = themeMode === 'light' ? lightTheme : darkTheme;

    return (
        <ThemeProvider theme={theme}>
            <Router>
                {/* Navbar is placed outside the routes so that it shows on all pages */}
                <Navbar />

                {/* All Routes */}
                <Suspense fallback={<LoadingComponent />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/login" element={<LogIn />} />
                        <Route path="/carlist" element={<CarList />} />
                        <Route path="/carform" element={<CarForm />} />
                        <Route path="/askquestion" element={<CreateQuestionPage />} />
                    </Routes>
                </Suspense>

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
                    {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
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
                <Footer />
            </Router>


        </ThemeProvider>
    );
};

export default App;
