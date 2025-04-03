import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const plans = [
  {
    name: 'Free',
    price: '$0',
    tokens: '5 Tokens',
    description: 'Try out 5 free predictions',
    buttonText: 'Start Free',
  },
  {
    name: 'Basic',
    price: '$9.99',
    tokens: '50 Tokens',
    description: '50 predictions per month',
    buttonText: 'Buy Now',
  },
  {
    name: 'Pro',
    price: '$24.99',
    tokens: '200 Tokens',
    description: 'Best for frequent users',
    buttonText: 'Buy Now',
  },
  {
    name: 'Unlimited',
    price: '$49.99',
    tokens: '∞ Tokens',
    description: 'Unlimited monthly access',
    buttonText: 'Buy Now',
  },
];

const SubscriptionPlans = () => {
  const theme = useTheme();

  return (
    <Box sx={{ padding: '20px', paddingTop: '100px', minHeight: '100vh', backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
        Choose a Subscription Plan
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: theme.palette.background.default,
              textAlign: 'center',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {plan.name}
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
                {plan.price}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                {plan.tokens}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ color: theme.palette.text.secondary }}>
                {plan.description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, fontWeight: 'bold' }}
              >
                {plan.buttonText}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SubscriptionPlans;
