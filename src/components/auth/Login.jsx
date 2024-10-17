import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import  {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    NotificationsProvider,
    useNotifications,
} from '@toolpad/core/useNotifications';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import '../../styles/SignUp.css';

const notificationsProviderSlots = {
    snackbar: styled(Snackbar)({ position: 'absolute' }),
};

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Torque Hub
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

function Login({ setLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [userDetails, setUserDetails] = useState(null);

    // Function to fetch profile image from Firebase storage
    const fetchProfileImage = async (username) => {
        try {
            const storageRef = ref(storage, `profileImages/${username}/profile.jpg`);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error fetching profile image:', error);
            return null; // Return null if image not found
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Make the login request
            const response = await axios.post('http://localhost:8080/auth/login', {
                email,
                password,
            }, {
                withCredentials: true, // Send credentials (cookies), remove if unnecessary
            });

            // Assuming the login was successful
            const { jwtToken } = response.data;
            console.log('Received jwtToken:', jwtToken); // Add this line
            const decodedToken = jwtDecode(jwtToken);
            const username = decodedToken.username;
            const userId = decodedToken.id;

            const profileImage = await fetchProfileImage(username);
            if (jwtToken && jwtToken.split('.').length === 3) {
                localStorage.setItem('jwtToken', jwtToken); // Store token in localStorage
                console.log('Stored jwtToken in localStorage'); // Add this line
                const decodedToken = jwtDecode(jwtToken);
                const userDetails = {
                    username: decodedToken.username,
                    email: decodedToken.email,
                    role: decodedToken.role,
                    profileImage,
                };


                if (profileImage) {
                    localStorage.setItem('profileImage', profileImage);
                }
                localStorage.setItem('userDetails', JSON.stringify(userDetails));
                setLoggedIn(true, userDetails);
                navigate('/');
            } else {
                console.error('Invalid token format received from the server.');
            }

        } catch (error) {
            console.error('Login error:', error); // Add this line
            setError('Invalid email or password');
            notifications.show('Invalid credentials', { autoHideDuration: 3000, severity: 'error' });
        }
    };

    return (
        <div className="root">
            <CssBaseline />
            <div className="glassForm">
                <Avatar className="avatar">
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" className="signInText">
                    Sign Up
                </Typography>
                <form className="form" noValidate onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoFocus
                        autoComplete="email"
                        className="inputField"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        className="inputField"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                        className="rememberMe"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className="submitButton"
                    >
                        Log in
                    </Button>
                    <Box mt={2}>
                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link href="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={5}>
                        <Copyright />
                    </Box>
                </form>
            </div>
        </div>
    );
}

export default function LoginWithNotifications({ setLoggedIn, handleAvatarUpdate }) {
    return (
        <NotificationsProvider slots={notificationsProviderSlots}>
            <Login setLoggedIn={setLoggedIn} handleAvatarUpdate={handleAvatarUpdate} />
        </NotificationsProvider>
    );
}
