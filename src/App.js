import React, {useState, Suspense, lazy, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Typography, } from '@mui/material';
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
import AuthService from "../src/components/configuration/Services/AuthService";
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
const UserShowcases = lazy(()=> import('./components/profile/ShowcaseListPage'));
const Showcase = lazy(() => import('./pages/Showcase'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const AccountSettings = lazy(() => import('./components/profile/AccountSettings'));
const QuestionListing = lazy(() => import('./components/cars/QuestionList'));
const NotFoundPage = lazy(() => import('./components/common/NotFoundPage'));
const PaymentPage = lazy(() => import('./pages/Payment'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const NotificationsPage = lazy(() => import('./components/common/NotificationPage'))
const CreateTagPage = lazy(() => import('./components/forum/CreateTagForm'))
const CreateShowcase = lazy(() => import('./components/forum/CreateShowcase'))
const CreateEvent = lazy(() => import('./components/forum/CreateEventForm'))
const CreateCarCategory = lazy(() => import('./components/forum/CreateCarCategoryForm'))
const CreateBrand = lazy(() => import('./components/forum/CreateBrand'))
const EventManagement = lazy(() => import('./components/forum/EventManagement'))
const ManageModelPage = lazy(() => import('./components/forum/ManageModelsPage'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const TicketTagsManage = lazy(() => import('./components/forum/ManageEventTags'))
const CarCategoryManage = lazy(() => import('./components/forum/CarCaterogyManagement'))
const CountryManage = lazy(() => import('./components/forum/ManageCountries'))
const GeneralAnnouncements = lazy(() => import('./components/forum/ManageGeneralAnnouncements'))
const AnnouncementDetails = lazy(() => import('./components/common/AnnouncementDetails')) ;
const EventAnnouncements = lazy(() => import('./components/forum/ManageEventAnnouncements'))
const OrginizerAnnouncements = lazy(() => import('./pages/OrganizerAnnouncementsPanel'))
const CarPricePredictor = lazy(() => import('./pages/CarPricePredictor'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const SuccessfulPayment = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'));
const AdFreeDonationPage = lazy(() => import('./pages/AdFreeDonationPage'));
const DonationPage = lazy(() => import('./pages/Donation'));
const RankPage = lazy(() => import('./pages/Ranks'));
const EmailPanel = lazy(() => import('./components/forum/EmailPanel'));
const ReportManagement = lazy(() => import('./pages/ReportManagement'));
const ModeratorPanel = lazy(() => import('./pages/ModeratorPanel'));
const ModerationLogs = lazy(() => import('./pages/ModerationLogs'));
const ReportConfigManagement = lazy(() => import('./pages/ReportConfigManagement'));

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
                                <Route path="/profile/:id" element={<Profile avatar={avatar} userDetails={userDetails} />} />
                                <Route path="/following" element={<Following />} />
                                <Route path="/bookmarks/:id" element={<Bookmarks />} />
                                <Route path="/usershowcase/:id" element={<UserShowcases />} />
                                <Route path="/myshowcase/:showcaseId" element={<MyShowcase />} />
                                <Route path="/showcase" element={<Showcase />} />
                                <Route path="/car/:id" element={<CarDetails />} />
                                <Route path="/accountsettings" element={<AccountSettings userDetails={userDetails} updateAvatar={handleAvatarUpdate} />} />
                                <Route path="/questions" element={<QuestionListing />} />
                                <Route path="/questions/:questionId" element={<QuestionPage />} />
                                <Route path="/payment" element={<PaymentPage />} />
                                <Route path="*" element={<NotFoundPage />} />
                                <Route path="/notifications" element={<NotificationsPage />} />
                                <Route path="/manage-events" element={<EventManagement />} />
                                <Route path="/subscription" element={<SubscriptionPlans />} />
                                <Route path="/payment-success" element={<SuccessfulPayment/> }/>
                                <Route path="/payment-failed" element={<PaymentFailedPage />} />
                                <Route path="/donate" element={<DonationPage />} /> 
                                <Route path="/rank" element={<RankPage />} />  
                                <Route
                                    path="/create-tag"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <CreateTagPage />
                                        </RoleProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/create-category"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <CreateCarCategory />
                                        </RoleProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/create-brand"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <CreateBrand />
                                        </RoleProtectedRoute>
                                    }
                                />
                                <Route path="/create-showcase" element={<CreateShowcase/>} />
                                <Route
                                    path="/create-event"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <CreateEvent />
                                        </RoleProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/manage-carModels"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <ManageModelPage />
                                        </RoleProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/eventTicketsTags"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <TicketTagsManage />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/carCategory"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <CarCategoryManage />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/countries"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <CountryManage />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/usersManagement"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN']} userDetails={userDetails}>
                                            <UsersManagement />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/manage-general-announcements"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN']} userDetails={userDetails}>
                                            <GeneralAnnouncements />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/manage-event-announcements"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <EventAnnouncements />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/organizer-announcements"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <OrginizerAnnouncements userId={userDetails?.id}/>
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route path="/announcement/:id" element={<AnnouncementDetails userId={userDetails?.id} />} />


                                <Route
                                    path="/adminPanel"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR', 'EVENT_ORGANISER']} userDetails={userDetails}>
                                            <AdminPanel />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                path="/admin/emails"
                                element={
                                    <RoleProtectedRoute roles={['ADMIN', 'MODERATOR']} userDetails={userDetails}>
                                    <EmailPanel />
                                    </RoleProtectedRoute>
                                }
                                />


                                <Route path="/AdFreeDonation" element={<AdFreeDonationPage />} />

                                <Route path="/CarPricePredictor" element={<CarPricePredictor />} />

                                <Route
                                    path="/report-management"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR']} userDetails={userDetails}>
                                            <ReportManagement />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/moderator-panel"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR']} userDetails={userDetails}>
                                            <ModeratorPanel />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/moderation-logs"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN', 'MODERATOR']} userDetails={userDetails}>
                                            <ModerationLogs />
                                        </RoleProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/report-config"
                                    element={
                                        <RoleProtectedRoute roles={['ADMIN']} userDetails={userDetails}>
                                            <ReportConfigManagement />
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
