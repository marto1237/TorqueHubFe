import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, Divider, Avatar, IconButton, Tabs, Tab, InputAdornment } from '@mui/material';
import { PhotoCamera, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNotifications, NotificationsProvider } from '@toolpad/core/useNotifications';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

const notificationsProviderSlots = {
    snackbar: styled(Snackbar)({ position: 'absolute' }),
};

const AccountSettingsPage = ({userDetails, updateAvatar }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [username, setUsername] = useState(userDetails?.username || '');
    const [email, setEmail] = useState(userDetails?.email || '');
    const [location, setLocation] = useState('Eindhoven');
    const [avatar, setAvatar] = useState(null); // Holds the avatar image URL
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
    const [errors, setErrors] = useState({});

    const notifications = useNotifications();

    // Fetch the profile image URL from Firebase Storage when the component mounts
    useEffect(() => {

        const fetchProfileImage = async () => {
            try {
                // Use the specific filename of the image stored in Firebase Storage
                const fileName = `profile.jpg`;  // Use the correct file name as shown in Firebase Storage
                const storageRef = ref(storage, `profileImages/${username}/${fileName}`);
                const downloadURL = await getDownloadURL(storageRef);
                setAvatar(downloadURL); // Store the image URL in state
            } catch (error) {
                console.error("Error fetching profile image:", error);
                setAvatar(null); // Set to null if no image is found
            }
        };
        if (typeof window !== 'undefined') {
            fetchProfileImage();
        }
    }, [username]);

    // Function to convert image to JPEG
    const convertToJPEG = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set canvas size to the image size
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw the image onto the canvas
                    ctx.drawImage(img, 0, 0, img.width, img.height);

                    // Convert the canvas to a blob in JPEG format
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Image conversion failed'));
                        },
                        'image/jpeg', // Desired format
                        0.8 // Quality (0 to 1), 0.8 for decent quality
                    );
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Handle avatar upload
    const handleAvatarChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]; // Get the selected file

            try{
                // Convert the image to JPEG format
                const jpegFile = await convertToJPEG(file);

                // Create a Firebase storage reference
                const storageRef = ref(storage, `profileImages/${username}/profile.jpg`);

                // Upload the file to Firebase Storage
                const uploadTask = uploadBytesResumable(storageRef, jpegFile);

                // Monitor the upload progress
                uploadTask.on(
                    'state_changed',  // Progress event, we don't handle progress here
                    null,  // No action on progress updates
                    (error) => {  // Error callback
                        console.error("Error during upload:", error);
                        notifications.show('Upload failed', { severity: 'error', autoHideDuration: 3000 });
                    },
                    async () => {  // Success callback
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setAvatar(downloadURL);  // Save the Firebase URL to the avatar state
                        updateAvatar(downloadURL);  // Notify the parent component to update the NavBar
                        notifications.show('Profile picture updated successfully!', { severity: 'success', autoHideDuration: 3000 });
                    });
            } catch (error) {
                notifications.show('Error processing image:', {severity: 'error', autoHideDuration: 3000});
            }
        }
    };

    // Validate profile form
    const validateProfileForm = () => {
        let formErrors = {};
        if (!username.trim()) formErrors.username = 'Username is required';
        if (!email.trim() || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) formErrors.email = 'Invalid email address';
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // Handle profile submission
    const handleSubmitProfile = (e) => {
        e.preventDefault();
        if (validateProfileForm()) {
            console.log({
                username,
                email,
                location,
                avatar,
            });
            // API call for profile update logic
        }
    };

    // Handle password validation
    const validatePasswordForm = () => {
        let formErrors = {};
        if (!newPassword.trim()) formErrors.newPassword = 'New password is required';
        if (newPassword.length < 8) formErrors.newPassword = 'Password should be at least 8 characters';
        if (newPassword !== confirmPassword) formErrors.confirmPassword = 'Passwords do not match';
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // Handle password change submission
    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (validatePasswordForm()) {
            console.log({
                newPassword,
            });
            // API call for password update logic
        }
    };

    // Toggle password visibility
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // Tabs change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ padding: '20px ', paddingTop: '100px',minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Paper sx={{ maxWidth: '800px', margin: 'auto', padding: '40px', borderRadius: '10px' }}>
                <Typography variant="h5" gutterBottom>
                    Account Settings
                </Typography>
                <Divider sx={{ marginBottom: '20px' }} />

                {/* Tabs for Profile, Password */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                    variant="fullWidth"
                >
                    <Tab label="Profile Settings" />
                    <Tab label="Password Settings" />
                </Tabs>

                {activeTab === 0 && (
                    <form onSubmit={handleSubmitProfile}>
                        <Grid container spacing={3} sx={{ marginTop: '20px' }}>
                            {/* Avatar Upload Section */}
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ marginBottom: '10px' }}>Avatar</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {/* Use avatar URL from Firebase to display the new profile picture */}
                                    <Avatar src={avatar} sx={{ width: 80, height: 80 }}>
                                        {username.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                                        Upload Avatar
                                        <input type="file" hidden onChange={handleAvatarChange} />
                                    </Button>
                                </Box>
                            </Grid>

                            {/* Username */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    fullWidth
                                    variant="filled"
                                    error={!!errors.username}
                                    helperText={errors.username}
                                />
                            </Grid>

                            {/* Email */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                    variant="filled"
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Grid>

                            {/* Location */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    fullWidth
                                    variant="filled"
                                />
                            </Grid>

                            {/* Save Profile Changes */}
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    Save Changes
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}

                {activeTab === 1 && (
                    <form onSubmit={handlePasswordChange}>
                        <Grid container spacing={3} sx={{ marginTop: '20px' }}>
                            {/* New Password */}
                            <Grid item xs={12}>
                                <TextField
                                    label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    fullWidth
                                    variant="filled"
                                    error={!!errors.newPassword}
                                    helperText={errors.newPassword}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Confirm Password */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Confirm Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    fullWidth
                                    variant="filled"
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Save Password */}
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    Update Password
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default function AccountSettings(props) {
    const { userDetails, updateAvatar } = props;
    return (
        <NotificationsProvider slots={notificationsProviderSlots}>
            <AccountSettingsPage userDetails={userDetails} updateAvatar={updateAvatar} />
        </NotificationsProvider>
    );
}
