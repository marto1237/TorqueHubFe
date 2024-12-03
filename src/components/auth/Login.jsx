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
import AuthService from '../configuration/Services/AuthService';
import { useAppNotifications } from '../common/NotificationProvider';

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
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const notifications = useAppNotifications();
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

        if (!validateForm()) {
            return;
        }

        try {
            // Send login request (access and refresh tokens are stored in cookies)
            const response = await AuthService.login({ email, password, rememberMe });

            // Assuming the login was successful
            const { jwtToken } = response;
            sessionStorage.setItem('jwtToken', jwtToken);
            const decodedToken = jwtDecode(jwtToken);
            const profileImage = await fetchProfileImage(decodedToken.username);
            const userId = decodedToken.userID;

            // Store the token and user details
            const userDetails = {
                username: decodedToken.username,
                email: decodedToken.email,
                role: decodedToken.role,
                id: userId,
                profileImage,
            };

            sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
            sessionStorage.setItem('loginSuccess', 'true');
            setLoggedIn(true, userDetails);
            navigate('/');


        } catch (error) {
            setError('Invalid email or password');
            notifications.show('Invalid credentials', { autoHideDuration: 3000, severity: 'error' });
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        let valid = true;

        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!isValidEmail(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        } else {
            setPasswordError('');
        }

        return valid;
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
                        error={!!emailError}
                        helperText={emailError}
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
                        error={!!passwordError}
                        helperText={passwordError}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormControlLabel
                        control={<Checkbox value={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary"  />}
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

export default Login;
