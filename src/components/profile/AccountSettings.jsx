import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, Divider, Avatar, IconButton, Tabs, Tab, InputAdornment } from '@mui/material';
import { PhotoCamera, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

const AccountSettingsPage = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [username, setUsername] = useState('user1');
    const [email, setEmail] = useState('user1@gmail.com');
    const [location, setLocation] = useState('Eindhoven');
    const [avatar, setAvatar] = useState(null); // Holds the avatar image URL
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
    const [errors, setErrors] = useState({});

    // Fetch the profile image URL from Firebase Storage when the component mounts
    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                // Use the specific filename of the image stored in Firebase Storage
                const fileName = `Charles Leclerc Jesus.jpg`;  // Use the correct file name as shown in Firebase Storage
                const storageRef = ref(storage, `profileImages/${fileName}`);

                // Get the download URL
                const downloadURL = await getDownloadURL(storageRef);
                setAvatar(downloadURL); // Store the image URL in state
            } catch (error) {
                console.error("Error fetching profile image:", error);
                setAvatar(null); // Set to null if no image is found
            }
        };

        fetchProfileImage();
    }, []);

    // Handle avatar upload
    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]; // Get the selected file

            // Create a Firebase storage reference
            const storageRef = ref(storage, `profileImages/${file.name}`);

            // Upload the file to Firebase Storage
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Monitor the upload progress
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    // Handle errors
                    console.error("Upload failed", error);
                },
                () => {
                    // Get the download URL when the upload is complete
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log("File available at", downloadURL);
                        setAvatar(downloadURL); // Store the Firebase image URL in the state
                    });
                }
            );
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
        <Box sx={{ padding: '20px ', paddingTop: '100px', backgroundColor: 'background.default' }}>
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

export default AccountSettingsPage;
