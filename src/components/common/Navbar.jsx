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
import '../../styles/NavBar.css';

const logo = "/Logo.png";

function NavBar({ toggleTheme }) {
    const [scrollingDown, setScrollingDown] = useState(false);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [navBarVisible, setNavBarVisible] = useState(true);
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [anchorElNotif, setAnchorElNotif] = useState(null);
    const [loggedIn, setLoggedIn] = React.useState(false);

    const navigate = useNavigate();
    const theme = useTheme(); // Use theme


    const [notifications, setNotifications] = useState([
        { id: 1, title: "Reboot required", description: "Server needs to be rebooted", date: "4 Jun 2021", unread: true },
        { id: 2, title: "Server unreachable", description: "We were unable to connect to this server", date: "2 Jun 2021", unread: true },
        { id: 3, title: "Move completed", description: "The site has been cloned to server 50gb-testing", date: "1 Jun 2021", unread: false },
    ]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollTop = window.pageYOffset;

            if (currentScrollTop > lastScrollTop) {
                // Scrolling down
                setNavBarVisible(false);
            } else if (currentScrollTop < lastScrollTop && currentScrollTop > 50) {
                // Scrolling up
                setNavBarVisible(true);
            }

            setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop); // For Mobile or negative scrolling
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollTop]);

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
        //navigate('/login');
        setLoggedIn(true);
    };

    const handleLogout = () => {
        setLoggedIn(false);
    };

    const handleSignUp = () => {
        navigate('/signup');
    };

    const handleEventClick= () => {
        navigate('/events');
    };
    const handleMyProfileClick = () => {
        navigate('/profile');
    };
    const handleFollowingClick = () => {
        navigate('/following');
    }

    const  handleBookmarksClick = () => {
        navigate('/bookmarks');
    }
    const handleMyShowcaseClick = () => {
        navigate('/myshowcase');
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
                <Toolbar disableGutters>

                    {/* LOGO for large and medium screens */}
                    <Box component="a" href="/" className="logo-md">
                        <Box component="img" src={logo} alt="Logo" sx={{ height: '100%' }} />
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
                    <Box className="menu-btn-xs">
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
                            <MenuItem onClick={handleCloseUserMenu} className="MuiMenuItem-root">
                                <AccountCircle sx={{ mr: 2 }} /> My Profile
                            </MenuItem>
                            <MenuItem onClick={handleCloseNavMenu} className="MuiMenuItem-root">
                                Car Forms
                            </MenuItem>
                            <MenuItem onClick={handleCloseNavMenu} className="MuiMenuItem-root">
                                Events
                            </MenuItem>
                            <MenuItem onClick={handleCloseNavMenu} className="MuiMenuItem-root">
                                Showcase
                            </MenuItem>
                            <MenuItem onClick={handleCloseNavMenu} className="MuiMenuItem-root">
                                Search
                            </MenuItem>
                            <MenuItem onClick={handleCloseNavMenu} className="MuiMenuItem-root">
                                About Us
                            </MenuItem>
                        </Menu>
                    </Box>

                    {/* LOGO for small screens */}
                    <Box component="a" href="/" className="logo-xs">
                        <Box component="img" src={logo} alt="Logo" sx={{ height: '100%' }} />
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
                        <MenuItem>
                            <IconButton
                                size="large"
                                aria-label="show notifications"
                                color="inherit"
                                onClick={handleOpenNotifMenu}
                            >
                                <Badge badgeContent={notifications.filter(n => n.unread).length} color="error">
                                    <NotificationsIcon sx={{ color: theme.palette.mode === 'light' ? 'black' : 'white' }}/>
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

                                {notifications.map((notif) => (
                                    <MenuItem key={notif.id} onClick={handleCloseNotifMenu} sx={{ py: 2 }}>
                                        <ListItemIcon>
                                            <Avatar sx={{ bgcolor: notif.unread ? 'error.main' : 'grey.500' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={notif.title}
                                            secondary={notif.description}
                                            sx={{ ml: 1 }}
                                        />
                                        <Typography variant="caption" sx={{ color: 'grey.600', ml: 'auto' }}>
                                            {notif.date}
                                        </Typography>
                                    </MenuItem>
                                ))}
                                <Divider />
                                <MenuItem onClick={handleCloseNotifMenu}>
                                    <Typography textAlign="center">Mark all as read</Typography>
                                </MenuItem>
                            </Menu>
                            </MenuItem>
                            <MenuItem>
                                <IconButton
                                    size="large"
                                    aria-label="show 4 new mails"
                                    color={theme.palette.mode === 'light' ? 'default' : 'inherit'}
                                >
                                    <Badge badgeContent={4} color="error">
                                        <MailIcon
                                            sx={{ color: theme.palette.mode === 'light' ? 'black' : 'white' }}
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
                                        <Avatar alt="User" src="/static/images/avatar/2.jpg" />
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
