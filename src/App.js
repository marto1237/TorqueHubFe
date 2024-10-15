import React, {useState, Suspense, lazy, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import './styles/style.css';
import {jwtDecode}  from 'jwt-decode';
import ProtectedRoute from './components/auth/ProtectedRoute';

import { darkTheme, lightTheme } from './themes/Theme';
import LoadingComponent from './components/common/Loader';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';



// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage'));
const SignUp = lazy(() => import('./components/auth/SignUp'));
const LogIn = lazy(() => import('./components/auth/Login'));
const CarList = lazy(() => import('./components/cars/CarList'));
const QuestionPage = lazy(() => import('./components/cars/QuestionPage'));
const CreateQuestionPage = lazy(() => import('./components/forum/CreateQuestionPage'));
const EventList = lazy(() => import('./pages/EventList'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Profile = lazy(() => import('./components/profile/MyProfile'));
const Following = lazy(() => import('./components/profile/Following'));
const Bookmarks = lazy(() => import('./components/profile/Bookmarks'));
const MyShowcase = lazy(() => import('./components/profile/MyShowCase'));
const Showcase = lazy(() => import('./pages/Showcase'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const AccountSettings = lazy(() => import('./components/profile/AccountSettings'));
const QuestionListing = lazy(() => import('./components/cars/QuestionList'));
const NotFoundPage = lazy(() => import('./components/common/NotFoundPage'));
const PaymentPage = lazy(() => import('./pages/Payment'));
const Users = lazy(() => import('./pages/Users'));

const App = () => {
    const [themeMode, setThemeMode] = useState('dark'); // Initialize state with 'dark'
    const [loggedIn, setLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [avatar, setAvatar] = useState(null);

    // Function to get the JWT token from localStorage
    const getJWTToken = () => {
        return localStorage.getItem('jwtToken');
    };

    // Function to handle avatar updates
    const handleAvatarUpdate = (newAvatar) => {
        setAvatar(newAvatar);
    };

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {

                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    // Token has expired
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userDetails');
                    setLoggedIn(false);
                } else {
                    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
                    setUserDetails(storedUserDetails);
                    setAvatar(storedUserDetails.profileImage || null);
                    setLoggedIn(true);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                setLoggedIn(false);
            }
        }
    }, []);

    const handleLogin = (isLoggedIn, details) => {
        setLoggedIn(isLoggedIn);
        setUserDetails(details);
        setAvatar(details?.profileImage || null); // Store JWT token in localStorage
    };

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
                <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} userDetails={userDetails} avatar={avatar} />

                {/* All Routes */}
                <Suspense fallback={<LoadingComponent />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/signup" element={<ProtectedRoute loggedIn={loggedIn}>
                            <SignUp setLoggedIn={setLoggedIn}  />
                        </ProtectedRoute>} />
                        <Route path="/login" element={ <ProtectedRoute loggedIn={loggedIn}>
                            <LogIn setLoggedIn={handleLogin} />
                        </ProtectedRoute>} />
                        <Route path="/carlist" element={<CarList />} />
                        <Route path="/carform" element={<QuestionPage />} />
                        <Route path="/askquestion" element={<CreateQuestionPage />} />
                        <Route path="/events" element={<EventList />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/following" element={<Following />} />
                        <Route path="/bookmarks" element={<Bookmarks />} />
                        <Route path="/myshowcase" element={<MyShowcase />} />
                        <Route path="/showcase" element={<Showcase />} />
                        <Route path="/car/:id" element={<CarDetails />} />
                        <Route path="/accountsettings" element={<AccountSettings userDetails={userDetails} updateAvatar={handleAvatarUpdate} />} />
                        <Route path="/questions" element={<QuestionListing />} />
                        <Route path="/questions/:questionId" element={<QuestionPage />} />
                        <Route path="/payment" element={<PaymentPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                        <Route path={"/users"} element={<Users />} />

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
