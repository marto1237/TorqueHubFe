import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Grid,
  Slider, LinearProgress, Card, CardContent, Snackbar, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const donationRanks = [
  { name: 'Garage Rookie', amount: 10, icon: '🧰' },
  { name: 'Piston Patron', amount: 25, icon: '🔩' },
  { name: 'Turbo Supporter', amount: 50, icon: '🌀' },
  { name: 'Gearhead Giver', amount: 100, icon: '⚙️' },
  { name: 'V8 Visionary', amount: 250, icon: '🏎️' },
  { name: 'Supercharger Elite', amount: 500, icon: '💨' },
  { name: 'Nitro Champion', amount: 1000, icon: '🏆' }
];

const getCurrentRank = (donatedAmount) => {
  return donationRanks.reduce((acc, rank) => (
    donatedAmount >= rank.amount ? rank : acc
  ), donationRanks[0]);
};

const getNextRank = (donatedAmount) => {
  return donationRanks.find(rank => rank.amount > donatedAmount);
};

const DonationPage = () => {
  const theme = useTheme();
  const [donationAmount, setDonationAmount] = useState(10);
  const [totalDonated, setTotalDonated] = useState(38);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentRank = getCurrentRank(totalDonated);
  const nextRank = getNextRank(totalDonated);
  const progress = nextRank ? Math.min((totalDonated / nextRank.amount) * 100, 100) : 100;
  const potentialRank = getCurrentRank(totalDonated + Number(donationAmount));

    const futureTotal = totalDonated + Number(donationAmount);
    const futureRank = getCurrentRank(futureTotal);
    const nextFutureRank = getNextRank(futureTotal);
    const dynamicProgress = nextFutureRank
    ? Math.min((futureTotal / nextFutureRank.amount) * 100, 100)
    : 100;

    const remainingForNext = nextFutureRank
    ? nextFutureRank.amount - futureTotal
    : null;

  const handleDonate = () => {
    setTotalDonated(prev => prev + Number(donationAmount));
    setShowSuccess(true);
    setDonationAmount(10);
    // TODO: Hook with Stripe or server API
  };

  return (
    <Box sx={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: theme.palette.background.default, px: 2 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom color="primary">
        ❤️ Support TorqueHub
      </Typography>
      <Typography align="center" color="textSecondary" mb={4}>
        Help us grow and earn special car-themed badges along the way!
      </Typography>

      <Box maxWidth={600} mx="auto">
        <Card sx={{ p: 4, borderRadius: 4 }} elevation={3}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Donation Progress
            </Typography>
            <LinearProgress variant="determinate" value={dynamicProgress} sx={{ height: 10, borderRadius: 5 }} />
            <Box mt={2} display="flex" justifyContent="space-between">
            <Typography variant="body2">€{Number(futureTotal).toFixed(2)} after donation</Typography>
            <Typography variant="body2" fontWeight="bold">
                Rank: {futureRank.icon} {futureRank.name}
            </Typography>
            </Box>

            
            {!nextFutureRank && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                You’ve reached the highest rank! 🚀
            </Typography>
            )}


            <Typography variant="subtitle1" fontWeight="bold" mt={4}>Choose an amount</Typography>
            <Slider
              value={donationAmount}
              onChange={(e, val) => setDonationAmount(val)}
              min={1}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              sx={{ mt: 1, mb: 2 }}
            />

            <TextField
              fullWidth
              label="Custom Amount (€)"
              type="number"
              step=".01"
              value={donationAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(val)) {
                  setDonationAmount(val);
                }
              }}
              inputProps={{ min: 1, step: "0.50" }}
              variant="filled"
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleDonate}
              disabled={!donationAmount || parseFloat(donationAmount) <= 0}
              sx={{ py: 1.5, fontWeight: 'bold', mt: 3 }}
            >
              Donate €{Number(donationAmount).toFixed(2)}
            </Button>

            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              You will become: <strong>{potentialRank.icon} {potentialRank.name}</strong>
            </Typography>

            {nextFutureRank && remainingForNext > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                €{Number(remainingForNext).toFixed(2)} away from <strong>{nextFutureRank.name}</strong>!
            </Typography>
            )}
            {!nextRank && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                You’ve reached the highest rank! 🚀
              </Typography>
            )}
          </CardContent>
        </Card>

        <Box mt={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
            Rank List
          </Typography>

          <Grid container spacing={2}>
            {donationRanks.map((rank) => (
              <Grid item xs={12} sm={6} md={4} key={rank.name}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper
                  }}
                  elevation={2}
                >
                  <Typography variant="h4">{rank.icon}</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">{rank.name}</Typography>
                  <Typography variant="body2" color="textSecondary">€{rank.amount}+ Donation</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Snackbar open={showSuccess} autoHideDuration={4000} onClose={() => setShowSuccess(false)}>
        <Alert onClose={() => setShowSuccess(false)} severity="success" variant="filled">
          Thank you for your support!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DonationPage;
