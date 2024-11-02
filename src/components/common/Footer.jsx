import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useTheme } from '@mui/material/styles';
import '../../styles/Footer.css';

const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: theme.palette.background.paper,
                padding: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                borderTop: `1px solid ${theme.palette.divider}`,
                mt: 'auto',   // Pushes footer to the bottom
                overflow: 'hidden', // Ensures no clipping of content
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* About Section */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="h6" gutterBottom color="textSecondary">
                            About Us
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            We are a dedicated team providing quality services to help you achieve your goals. Our mission is to deliver the best experience and support.
                        </Typography>
                    </Grid>

                    {/* Contact Section */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="h6" gutterBottom color="textSecondary">
                            Contact Us
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Email:</strong> <Link href="mailto:support@example.com">support@example.com</Link>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Phone:</strong> +1 (555) 123-4567
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Address:</strong> 123 Main Street, City, Country
                        </Typography>
                    </Grid>

                    {/* Social Media Links */}
                    <Grid item xs={12} sm={12} md={4}>
                        <Typography variant="h6" gutterBottom color="textSecondary">
                            Follow Us
                        </Typography>
                        <Box sx={{ display: 'flex', gap: { xs: '0.5rem', sm: '1rem' }, overflow: 'visible' }}>
                            <IconButton component="a" href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton component="a" href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                                <TwitterIcon />
                            </IconButton>
                            <IconButton component="a" href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                                <InstagramIcon />
                            </IconButton>
                            <IconButton component="a" href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                                <LinkedInIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Typography variant="body2" color="textSecondary">
                        © {new Date().getFullYear()} Torque Hub. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
