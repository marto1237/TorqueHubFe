import React from 'react';
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
import { useTheme } from '@mui/material/styles'; // Correct hook to access the theme
import '../../styles/SignUp.css';

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

export default function SignUp() {
    const theme = useTheme(); // Get the current theme using the useTheme hook

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
                <form className="form" noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        className="inputField"
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        className="inputField"
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
                        sx={{
                            backgroundColor: theme.palette.mode === 'light' ? '#1565c0' : '#e53935', // Blue in light mode, red in dark mode
                            color: '#FFFFFF', // White text in both themes
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'light' ? '#004ba0' : '#d32f2f', // Darker blue on hover in light theme, darker red in dark theme
                            },
                        }}
                        className="submitButton"
                    >
                        Sign Up
                    </Button>
                    <Box mt={2}>
                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    {"You already have an account? Log In"}
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
