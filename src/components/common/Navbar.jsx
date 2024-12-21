import React, { useState, useEffect } from 'react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {
    AppBar, Box, Badge, Toolbar, IconButton, Typography, Menu, MenuItem,
    Avatar, Button, Tooltip, Container, Divider, ListItemText, ListItemIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase';
import axios from 'axios';
import '../../styles/NavBar.css';
import NotificationWebSocketService from '../configuration/WebSocket/NotificationWebSocketService'; // Adjust path as necessary
import NotificationService from "../configuration/Services/NotificationService";
import { timeAgo } from  "../configuration/utils/TimeFormating"
import AuthService from '../configuration/Services/AuthService';

const logo = "/Logo.webp";

function NavBar({ toggleTheme, loggedIn, setLoggedIn, userDetails, avatar }) {
    const [scrollingDown, setScrollingDown] = useState(false);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [navBarVisible, setNavBarVisible] = useState(true);
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    //Notification properties
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorElNotif, setAnchorElNotif] = useState(null);
    let notificationService;

    const [avatarURL, setAvatarURL] = useState(avatar);

    const navigate = useNavigate();
    const theme = useTheme(); // Use theme

    const storedUserDetails = userDetails || JSON.parse(sessionStorage.getItem('userDetails'));
    const userId = storedUserDetails?.id;

    useEffect(() => {
        if (loggedIn && userDetails?.username) {
            // If profile image is already in userDetails, use it
            if (userDetails.profileImage) {
                setAvatarURL(userDetails.profileImage);
            } else {
                // Otherwise, fetch from Firebase
                const storageRef = ref(storage, `profileImages/${userDetails.username}/profile.jpg`);
                getDownloadURL(storageRef)
                    .then((url) => setAvatarURL(url))
                    .catch(() => console.log('No profile image found.'));
            }
        }

        if (loggedIn && userId) {
            const fetchUnreadNotifications = async () => {
                try {
                    const unreadNotifications = await NotificationService.getUnreadNotifications(userId);
                    setNotifications(unreadNotifications);
                    setUnreadCount(unreadNotifications[0].count );
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };

            fetchUnreadNotifications();

            // Initialize WebSocket connection and subscribe to notifications
            const notificationService = NotificationWebSocketService(userId, handleNotificationReceived);
            notificationService.connect();

            // Cleanup function to close the WebSocket connection on unmount
            return () => {
                notificationService.disconnect();
            };
        }
    }, [loggedIn, userId, userDetails]);

    const handleShowAllNotifications = () => {
        handleCloseNotifMenu();
        navigate('/notifications');
    };



    // Handle user logout
    const handleLogout = async () => {
        try {
            await AuthService.logout();  // Use AuthService instead of axios directly
            sessionStorage.clear();
            localStorage.clear();
            setLoggedIn(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleScroll = () => {
        const currentScrollTop = window.pageYOffset;
        setNavBarVisible(currentScrollTop < lastScrollTop || currentScrollTop <= 50);
        setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollTop]);



    const handleNotificationReceived = (notification) => {

        setNotifications((prevNotifications) => [notification, ...prevNotifications]);

        setUnreadCount((prevCount) => prevCount + 1);
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await NotificationService.markNotificationAsRead(notificationId);

            // Update the notification state to reflect the read status
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notif) => notif.id !== notificationId)
            );

            setUnreadCount((prevCount) => prevCount - 1); // Decrease the unread count
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };


    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignUp = () => {
        navigate('/signup');
    };

    const handleCarFormClick = () => {
        navigate('/questions');
    }
    const handleEventClick= () => {
        navigate('/events');
    };
    const handleMyProfileClick = () => {
        const userId = userDetails?.id;
        if (userId) {
            navigate(`/profile/${userId}`); // Pass the ID in the URL
        }
    };
    const handleFollowingClick = () => {
        navigate('/following');
    }

    const  handleBookmarksClick = () => {
        const userId = userDetails?.id;
        if (userId) {
            navigate(`/bookmarks/${userId}`); 
        }
    }
    const handleMyShowcaseClick = () => {
        console.log("Navigating with userId:", userId);

        navigate(`/usershowcase/${userId}`);
    }
    const handleShowcaseClick = () => {
        navigate('/showcase');
    }
    const handleAccountSettingClick = () => {
        navigate('/accountsettings');
    }

    const handleOpenNotifMenu = (event) => {
        setAnchorElNotif(event.currentTarget);
    };

    const handleCloseNotifMenu = () => {
        setAnchorElNotif(null);
    };

    const handleMarkAllAsRead = async () => {
        try {
            // Call service to mark all notifications as read
            await NotificationService.markAllAsRead(userId);

            // Clear all notifications from the list
            setNotifications([]);
            setUnreadCount(0);
            handleCloseNotifMenu();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notificationId, url) => {
        try {
            await markNotificationAsRead(notificationId);  // Remove the notification when clicked

            if (url) {
                window.location.href = url; // Redirect to the notification link if it exists
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };


    function stringToColor(string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name) {
        if (!name) {
            // Fallback if no name is provided
            return {
                sx: {
                    bgcolor: '#ccc', // Default background color
                },
                children: '?', // Default avatar content
            };
        }

        return {
            sx: {
                bgcolor: stringToColor(name),
                width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }
                
            },
            children: `${name[0].toUpperCase()}`,
        };
    }

    return (
        <AppBar
            position="fixed"
            sx={{
                backgroundColor: theme.palette.background.default,
                transition: 'transform 0.3s ease-in-out',
                transform: navBarVisible ? 'translateY(0)' : 'translateY(-100%)'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>

                    {/* LOGO for large and medium screens */}
                    <Box component="a" href="/" className="logo-md" >
                        <Box component="img" src={logo} alt="Logo" loading="eager" sx={{ height: '100%' }} />
                    </Box>

                    {/* This Typography is only for large and medium screens */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        className="typography-md"
                    >
                        {/* Content here */}
                    </Typography>

                    {/* Menu button for small screens */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon sx={{ color: theme.palette.mode === 'light' ? 'black' : 'white' }} />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            <MenuItem onClick={() => {handleCloseNavMenu();handleCarFormClick();}} className="MuiMenuItem-root">
                                <AccountCircle sx={{ mr: 2 }} /> My Profile
                            </MenuItem>
                            <MenuItem onClick={() => {handleCloseNavMenu();handleCarFormClick();}} className="MuiMenuItem-root">
                                Car Forms
                            </MenuItem>
                            <MenuItem onClick={() => {handleCloseNavMenu();handleEventClick();}} className="MuiMenuItem-root">
                                Events
                            </MenuItem>
                            <MenuItem onClick={() => {handleCloseNavMenu();handleShowcaseClick();}} className="MuiMenuItem-root">
                                Showcase
                            </MenuItem>
                            <MenuItem onClick={() => {handleCloseNavMenu();}} className="MuiMenuItem-root">
                                Search
                            </MenuItem>
                            <MenuItem onClick={() => {handleCloseNavMenu();}} className="MuiMenuItem-root">
                                About Us
                            </MenuItem>
                        </Menu>
                    </Box>

                    {/* LOGO for small screens */}
                    <Box component="a" href="/" className="logo-xs">
                        <Box component="img" src={logo} alt="Logo" loading="eager" sx={{ height: '100%' }} />
                    </Box>

                    {/* Typography for small screens */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        className="typography-xs"
                    >
                        {/* Content here */}
                    </Typography>

                    {/* Pages displayed as buttons on large and medium screens */}
                    <Box className="pages-btn-md">
                        <Button
                            color="inherit"
                            onClick={handleCarFormClick}
                            sx={{
                                mr: 2,
                                color: theme.palette.mode === 'light' ? 'black' : 'white',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            Car Forms
                        </Button>
                        <Button
                            color="inherit"
                            onClick={handleEventClick}
                            sx={{
                                mr: 2,
                                color: theme.palette.mode === 'light' ? 'black' : 'white',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            Events

                        </Button>
                        <Button
                            color="inherit"
                            onClick={handleShowcaseClick}
                            sx={{
                                mr: 2,
                                color: theme.palette.mode === 'light' ? 'black' : 'white',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            Showcase
                        </Button>
                        <Button
                            color="inherit"
                            sx={{
                                mr: 2,
                                color: theme.palette.mode === 'light' ? 'black' : 'white',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            Search
                        </Button>
                        <Button
                            color="inherit"
                            sx={{
                                mr: 2,
                                color: theme.palette.mode === 'light' ? 'black' : 'white',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            About Us
                        </Button>
                    </Box>

                    {/* Notification and email for large screens */}
                    {loggedIn && (
                        <>
                        <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: { xs: '0.0rem', md: '1rem' } }}>
                            <IconButton
                                size="small" // Reduce icon button size for mobile
                                aria-label="show notifications"
                                color="inherit"
                                onClick={handleOpenNotifMenu}
                                sx={{ padding: { xs: '4px', sm: '6px' } }}
                            >
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsIcon sx={{ fontSize: { xs: '1.0rem', sm: '1.5rem' }, color: theme.palette.mode === 'light' ? 'black' : 'white' }}/>
                                </Badge>
                            </IconButton>

                            {/* Notification dropdown */}
                            <Menu
                                anchorEl={anchorElNotif}
                                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                open={Boolean(anchorElNotif)}
                                onClose={handleCloseNotifMenu}
                                sx={{ mt: '45px' }}
                            >
                                <Typography variant="h6" sx={{ px: 2, py: 1 }}>
                                    Notifications
                                </Typography>
                                <Divider />

                                {notifications.length === 0 ? (
                                    <MenuItem>
                                        <Typography>No notifications available</Typography>
                                    </MenuItem>
                                ) : notifications.map((notif, index) => (
                                    <MenuItem
                                        key={index}
                                        style={{ fontWeight: notif.isRead ? 'normal' : 'bold' }} // Bold if unread
                                    >
                                        <ListItemIcon>
                                            <IconButton onClick={() => window.location.href = `/profile/${notif.voterId}`}>
                                                {notif.voter && notif.voter.profileImage ? (
                                                    <Avatar src={notif.voter.profileImage} />
                                                ) : (
                                                    <Avatar>{notif.voter ? notif.voter.username[0].toUpperCase() : 'U'}</Avatar>
                                                )}
                                            </IconButton>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <span
                                                    onClick={() => handleNotificationClick(notif.id, notif.url)}
                                                    style={{ cursor: 'pointer', wordWrap: 'break-word', overflowWrap: 'anywhere' }}
                                                    dangerouslySetInnerHTML={{ __html: notif.message }} // Render HTML formatting
                                                />
                                            }
                                            secondary={timeAgo(notif.createdAt).toLocaleString()}
                                        />
                                        {!notif.isRead && (
                                            <Button
                                                onClick={() => handleNotificationClick(notif.id)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ ml: 2 }}
                                            >
                                                Mark as read
                                            </Button>
                                        )}
                                    </MenuItem>
                                ))}

                                <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
                                        <Button onClick={handleMarkAllAsRead} variant="text" size="small">
                                            Mark All as Read
                                        </Button>
                                        <Button onClick={handleShowAllNotifications} variant="text" size="small">
                                            Show All
                                        </Button>
                                    </Box>
                            </Menu>
                            </MenuItem>
                            <MenuItem>
                                <IconButton
                                    size="small" // Reduce icon button size for mobile
                                    aria-label="show mails"
                                    color={theme.palette.mode === 'light' ? 'default' : 'inherit'}
                                    sx={{ padding: { xs: '4px', sm: '6px' } }} 
                                >
                                    <Badge badgeContent={4} color="error">
                                        <MailIcon
                                            sx={{ fontSize: { xs: '1rem', sm: '1.5rem' },color: theme.palette.mode === 'light' ? 'black' : 'white' }}
                                        />
                                    </Badge>
                                </IconButton>
                            </MenuItem>

                        </>
                    )}

                    {/* User settings and login/signup buttons */}
                    <Box sx={{ flexGrow: 0 }}>
                        {loggedIn ? (
                            <>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        {/* Display the profile image if it exists, else display the default avatar */}
                                        {avatarURL ?(
                                            <Avatar src={avatarURL} sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                                            alt={userDetails?.username ? `${userDetails.username}'s profile picture` : 'User profile picture'} />
                                        ) : (
                                            <Avatar {...stringAvatar(userDetails?.username ? userDetails.username[0] : 'User' )} />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem onClick={() => {handleCloseUserMenu(); handleMyProfileClick()  }}>
                                        <AccountCircle sx={{ mr: 2 }} /> My Profile
                                    </MenuItem>
                                    <MenuItem onClick={() => {handleCloseUserMenu(); handleFollowingClick() }}>
                                        <ControlPointIcon sx={{ mr: 2 }} /> Following
                                    </MenuItem>
                                    <MenuItem onClick={() => {handleCloseUserMenu(); handleBookmarksClick() }}>
                                        <BookmarksIcon sx={{ mr: 2 }} /> Bookmarks
                                    </MenuItem>
                                    <MenuItem onClick={() => {handleCloseUserMenu(); handleMyShowcaseClick() }}>
                                        <AutoAwesomeIcon sx={{ mr: 2 }} /> My Showcase
                                    </MenuItem>
                                    <MenuItem onClick={() => {handleCloseUserMenu(); handleAccountSettingClick() }}>
                                        <ManageAccountsIcon sx={{ mr: 2 }} /> Account Settings
                                    </MenuItem>
                                    <MenuItem sx={{ justifyContent: 'center' }} onClick={() => { handleLogout(); handleCloseUserMenu(); }}>
                                        <Button variant="contained" color="error">Logout</Button>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box className="login-signup-container">
                                <Button
                                    variant="outlined"
                                    onClick={handleLogin}
                                    sx={{
                                        borderColor: theme.palette.mode === 'light' ? 'black' : 'white',
                                        color: theme.palette.mode === 'light' ? 'black' : 'white',
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                        },
                                    }}
                                >
                                    Log In
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSignUp}
                                    sx={{
                                        backgroundColor: theme.palette.mode === 'light' ? '#1565c0' : '#e53935', // Blue in light mode, red in dark mode
                                        color: '#FFFFFF', // White text in both themes
                                        '&:hover': {
                                            backgroundColor: theme.palette.mode === 'light' ? '#004ba0' : '#d32f2f', // Darker blue on hover in light theme, darker red in dark theme
                                        },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default NavBar;
