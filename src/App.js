import React, {useState, Suspense, lazy, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import './styles/style.css';
import ProtectedRoute from './components/auth/ProtectedRoute';

import { darkTheme, lightTheme } from './themes/Theme';
import LoadingComponent from './components/common/Loader';
import NotificationProvider from './components/common/NotificationProvider';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthService from "../src/components/configuration/Services/AnswerService";
import AuthVerify from './components/configuration/utils/AuthVerify';
import EventBus from "./components/configuration/utils/EventBus";
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';


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
const NotificationsPage = lazy(() => import('./components/common/NotificationPage'))
const CreateTagPage = lazy(() => import('./components/forum/CreateTagForm'))

const App = () => {
    const [themeMode, setThemeMode] = useState('dark'); // Initialize state with 'dark'
    const [loggedIn, setLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [avatar, setAvatar] = useState(null);

    // Create a client
    const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 300000, // 5 minutes before data becomes stale
            cacheTime: 600000, // Cache data for 10 minutes
            keepPreviousData: true, // Keep previous data until new data is fetched
            retry: 5, // Retry failed requests once
          },
        },
      });

      const logOut = async () => {
        try {
            await AuthService.logout(); // Ensure API logout request is handled
        } catch (error) {
            console.error("Logout API call failed:", error); // Log API logout errors
        } finally {
            sessionStorage.clear(); // Clear session storage
            localStorage.clear();   // Clear local storage if needed
            setLoggedIn(false);     // Update UI state
            window.location.href = "/login"; // Redirect to login page
        }
    };
    

    useEffect(() => {
        const handleLogout = () => logOut();
        EventBus.on("logout", handleLogout);
    
        return () => {
            EventBus.off("logout", handleLogout);
        };
    }, []);
    

    // Function to handle avatar updates
    const handleAvatarUpdate = (newAvatar) => {
        setAvatar(newAvatar);
    };

    useEffect(() => {
        // On component mount, check if sessionStorage has user details
        const storedUserDetails = JSON.parse(sessionStorage.getItem('userDetails'));
        if (storedUserDetails) {
            setUserDetails(storedUserDetails);
            setLoggedIn(true);
        }
    }, []);

    const handleLogin = (isLoggedIn, details) => {
        setLoggedIn(isLoggedIn);
        setUserDetails(details);
        setAvatar(details?.profileImage || null); // Store JWT token in localStorage
        sessionStorage.setItem('userDetails', JSON.stringify(details));
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
            <QueryClientProvider client={queryClient}>
                <Router>
                    {/* Navbar is placed outside the routes so that it shows on all pages */}
                    <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} userDetails={userDetails} avatar={avatar} />

                    {/* All Routes */}
                    <Suspense fallback={<LoadingComponent />}>
                    <AuthVerify logOut={logOut} /> {/* Monitors route changes */}
                        <NotificationProvider>
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
                                <Route path="/notifications" element={<NotificationsPage />} />
                                <Route
                                    path="/create-tag"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR']} userDetails={userDetails}>
                                            <CreateTagPage />
                                        </RoleProtectedRoute>
                                    }
                                />
                            </Routes>
                        </NotificationProvider>
                    </Suspense>

                    {/* Theme Toggle Button */}
                    <Fab
                        color="primary"
                        aria-label="toggle theme"
                        onClick={toggleTheme}
                        sx={{
                            position: 'fixed',
                            bottom: { xs: 70, sm: 80 }, // Position slightly higher on extra-small screens
                            right: { xs: 8, sm: 16 }, // Move closer to the edge on extra-small screens
                            width: { xs: 40, sm: 56 }, // Smaller button on extra-small screens
                            height: { xs: 40, sm: 56 }
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
                            bottom: { xs: 16, sm: 16 },
                            right: { xs: 8, sm: 16 },
                            width: { xs: 40, sm: 56 },
                            height: { xs: 40, sm: 56 }
                        }}
                    >
                        <KeyboardArrowUpIcon />
                    </Fab>
                    <Footer />
                </Router>
            </QueryClientProvider>


        </ThemeProvider>
    );
};

export default App;
