import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Slide, Fade } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import Lottie from 'lottie-react';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const [animationData, setAnimationData] = useState(null);

  // Optional custom failure message
  const { message = 'Something went wrong with your transaction. Please try again or choose another method.' } =
    location.state || {};

  // Load Lottie animation from public
  useEffect(() => {
    fetch('/Animation - payment-failed.json')
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(console.error);
  }, []);

  const handleRetry = () => {
    navigate('/subscription');
  };

  return (
    <Box
      sx={{
        paddingTop: '100px',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Slide direction="down" in timeout={500}>
        <CancelIcon sx={{ fontSize: 80, color: theme.palette.error.main, mb: 2 }} />
      </Slide>

      <Fade in timeout={800}>
        <Card sx={{ maxWidth: 600, width: '90%', textAlign: 'center', padding: 4, borderRadius: 4 }}>
          <CardContent>
            {/* Lottie error animation */}
            {animationData && (
              <Box sx={{ maxWidth: 200, mx: 'auto', mb: 2 }}>
                <Lottie animationData={animationData}  />
              </Box>
            )}

            <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
            💳 Payment Failed
            </Typography>

            <Typography variant="h6" sx={{ mt: 2, color: theme.palette.text.secondary }}>
              {message}
            </Typography>

            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={handleRetry}
              sx={{ mt: 4, px: 5, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default PaymentFailedPage;
