import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const donationRanks = [
  { name: 'Garage Rookie', range: '€1 – €4.99', icon: '🧰', description: 'First-time donor' },
  { name: 'Piston Patron', range: '€5 – €9.99', icon: '🔩', description: 'Light contributor' },
  { name: 'Turbo Supporter', range: '€10 – €24.99', icon: '🌀', description: 'Mid-tier donor' },
  { name: 'Gearhead Giver', range: '€25 – €49.99', icon: '⚙️', description: 'Dedicated supporter' },
  { name: 'V8 Visionary', range: '€50 – €99.99', icon: '🏎️', description: 'Heavy contributor' },
  { name: 'Supercharger Elite', range: '€100 – €249.99', icon: '💨', description: 'Premium backer' },
  { name: 'Nitro Champion', range: '€250+', icon: '🏆', description: 'Ultimate supporter' },
];

const activityRanks = [
  { name: 'Engine Starter', points: '0–49', icon: '🚗', description: 'New user' },
  { name: 'Street Tuner', points: '50–149', icon: '🛠️', description: 'Getting involved' },
  { name: 'Track Day Driver', points: '150–299', icon: '🏁', description: 'Semi-active' },
  { name: 'Dyno Dominator', points: '300–499', icon: '📊', description: 'Regular contributor' },
  { name: 'Pit Crew Chief', points: '500–999', icon: '👨‍🔧', description: 'Team player' },
  { name: 'Torque Master', points: '1000–1999', icon: '🔧', description: 'Expert user' },
  { name: 'Fuel Injected Guru', points: '2000+', icon: '⛽', description: 'Legendary contributor' },
];

const RankCard = ({ icon, name, range, description }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center', height: '100%' }}>
    <Typography variant="h3" mb={1}>{icon}</Typography>
    <Typography variant="h6" fontWeight="bold">{name}</Typography>
    <Typography variant="body2" color="textSecondary">{range}</Typography>
    <Typography variant="body2" mt={1}>{description}</Typography>
  </Paper>
);

const RanksPage = () => {
  const theme = useTheme();

  return (
    <Box sx={{ pt: '100px', minHeight: '100vh', backgroundColor: theme.palette.background.default, px: 3 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" textAlign="center" gutterBottom>
        🎖️ User Ranks & Badges
      </Typography>
      <Typography align="center" color="textSecondary" mb={5}>
        Explore our car-themed ranking system and earn badges through donations or community participation.
      </Typography>

      <Typography variant="h5" fontWeight="bold" gutterBottom>🏁 Donation-Based Ranks</Typography>
      <Grid container spacing={3} mb={6}>
        {donationRanks.map((rank) => (
          <Grid item xs={12} sm={6} md={4} key={rank.name}>
            <RankCard {...rank} range={rank.range} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" fontWeight="bold" gutterBottom>🔧 Activity-Based Ranks</Typography>
      <Grid container spacing={3}>
        {activityRanks.map((rank) => (
          <Grid item xs={12} sm={6} md={4} key={rank.name}>
            <RankCard {...rank} range={`${rank.points} Points`} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RanksPage;
