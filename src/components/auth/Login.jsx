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
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import '../../styles/SignUp.css';
import AuthService from '../configuration/Services/AuthService';
import { useAppNotifications } from '../common/NotificationProvider';
import { useEffect } from 'react';
import BannedUserModal from './BannedUserModal';


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
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [banDetails, setBanDetails] = useState(null);
    const navigate = useNavigate();
    const notifications = useAppNotifications();
    const [userDetails, setUserDetails] = useState(null);

    // Move fetchProfileImage outside handleSubmit
    const fetchProfileImage = async (username) => {
        try {
            const storageRef = ref(storage, `profileImages/${username}/profile.jpg`);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error fetching profile image:', error);
            return null;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Send login request
            const response = await AuthService.login({ email, password, rememberMe });
            const { jwtToken } = response;
            
            // Store token immediately
            sessionStorage.setItem('jwtToken', jwtToken);
            const decodedToken = jwtDecode(jwtToken);
            const userId = decodedToken.userID;

            // Create initial user details without profile image
            const userDetails = {
                username: decodedToken.username,
                email: decodedToken.email,
                role: decodedToken.role,
                id: userId,
                profileImage: null, // Initially null
            };

            // Store user details and complete login
            sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
            sessionStorage.setItem('loginSuccess', 'true');
            setLoggedIn(true, userDetails);

            // Fetch profile image in the background
            fetchProfileImage(decodedToken.username).then(profileImage => {
                if (profileImage) {
                    const updatedUserDetails = { ...userDetails, profileImage };
                    sessionStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));
                    setLoggedIn(true, updatedUserDetails); // Update with image
                }
            });

            // Navigate immediately, don't wait for image
            navigate('/');

        } catch (error) {
            // Check if this is a banned user error
            if (error.response && error.response.status === 403) {
                const banData = error.response.data;
                if (banData && banData.error === 'Account banned') {
                    // Show ban modal with details
                    setBanDetails({
                        reason: banData.reason,
                        duration: banData.duration,
                        expiration: banData.expiration
                    });
                    setBanModalOpen(true);
                    return;
                }
            }
            
            // Regular authentication error
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
                    Sign In
                </Typography>
                <form className="form" autoComplete="on" onSubmit={handleSubmit} noValidate>
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
            
            {/* Ban Modal */}
            <BannedUserModal
                open={banModalOpen}
                onClose={() => setBanModalOpen(false)}
                banDetails={banDetails}
            />
        </div>
    );
}

export default Login; 