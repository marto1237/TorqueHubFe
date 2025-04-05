import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const AdFreeDonationPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubscribe = () => navigate('/payment?plan=premium');
  const handleDonate = () => navigate('/donate'); // You can use Stripe Checkout or custom form here

  return (
    <Box
      sx={{
        paddingTop: '100px',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 800, padding: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" color="primary" fontWeight="bold">
            Support TorqueHub 💖
          </Typography>

          <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>
            Help us stay ad-free, keep improving the platform, and grow our community. Your support keeps TorqueHub running!
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Go Ad-Free
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Subscribe for $5/month to enjoy an ad-free experience and priority support.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleSubscribe}
                  >
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <FavoriteIcon sx={{ fontSize: 50, color: 'red' }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Make a Donation
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    One-time donation to help us with hosting and development costs.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleDonate}
                  >
                    Donate
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdFreeDonationPage;