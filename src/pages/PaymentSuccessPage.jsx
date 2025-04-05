import React from 'react';
import { Box, Typography, Button, Card, CardContent, Slide, Fade } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const theme = useTheme();
  const location = useLocation();

  // Support passing a custom success message via route state
  const { message = 'Thank you for your purchase. Your tokens have been added!' } = location.state || {};

  const handleContinue = () => navigate('/');

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
      {/* Confetti Celebration */}
      <Confetti width={width} height={height} numberOfPieces={300} />

      <Slide direction="down" in timeout={500}>
        <CheckCircleIcon sx={{ fontSize: 80, color: theme.palette.success.main, mb: 2 }} />
      </Slide>

      <Fade in timeout={800}>
        <Card sx={{ maxWidth: 600, width: '90%', textAlign: 'center', padding: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              🎉 Payment Successful!
            </Typography>

            <Typography variant="h6" sx={{ mt: 2, color: theme.palette.text.secondary }}>
              {message}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleContinue}
              sx={{ mt: 4, px: 5, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default PaymentSuccessPage;
