import React from 'react';
import { Box, Typography, Paper, Divider, useMediaQuery, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';

const donationRanks = [
  { name: 'Garage Rookie', range: '€1 – €24.99', icon: '🧰', description: 'First-time donor' },
  { name: 'Piston Patron', range: '€25 – €49.99', icon: '🔩', description: 'Light contributor' },
  { name: 'Turbo Supporter', range: '€50 – €99.99', icon: '🌀', description: 'Mid-tier donor' },
  { name: 'Gearhead Giver', range: '€100 – €249.99', icon: '⚙️', description: 'Dedicated supporter' },
  { name: 'V8 Visionary', range: '€250 – €499.99', icon: '🏎️', description: 'Heavy contributor' },
  { name: 'Supercharger Elite', range: '€500 – €999.99', icon: '💨', description: 'Premium backer' },
  { name: 'Nitro Champion', range: '€1000+', icon: '🏆', description: 'Ultimate supporter' },
];

const activityRanks = [
  { name: 'Engine Starter', points: '0–500', icon: '🚗', description: 'New user' },
  { name: 'Street Tuner', points: '501–1500', icon: '🛠️', description: 'Getting involved' },
  { name: 'Track Day Driver', points: '1501–4500', icon: '🏁', description: 'Semi-active' },
  { name: 'Dyno Dominator', points: '4501– 15k', icon: '📊', description: 'Regular contributor' },
  { name: 'Pit Crew Chief', points: '15k– 40k', icon: '👨‍🔧', description: 'Team player' },
  { name: 'Torque Master', points: '40k – 100k', icon: '🔧', description: 'Expert user' },
  { name: 'Fuel Injected Guru', points: '100k +', icon: '⛽', description: 'Legendary contributor' },
];

const loopPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(255, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
`;

const RankCard = ({ icon, name, range, description, highlight, pulse }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={highlight ? 6 : 3}
      sx={{
        width: 180,
        minHeight: 240,
        p: 2,
        mx: 1,
        borderRadius: 3,
        textAlign: 'center',
        background: theme.palette.background.paper,
        border: highlight ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
        boxShadow: highlight ? `0 0 20px ${theme.palette.primary.main}` : theme.shadows[2],
        transition: 'all 0.3s ease-in-out',
        animation: pulse ? `${loopPulse} 2s infinite` : undefined,
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: `0 0 20px ${theme.palette.primary.light}`
        }
      }}
    >
      <Typography variant="h2">{icon}</Typography>
      <Typography variant="subtitle1" fontWeight="bold" color={highlight ? 'primary' : 'text.primary'}>{name}</Typography>
      <Typography variant="body2" color="text.secondary">{range}</Typography>
      <Typography variant="caption" color="text.secondary">{description}</Typography>
    </Paper>
  );
};

const RanksPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userDonationRank = null; // Replace with user's donation rank name if exists
  const userActivityRank = 'Street Tuner'; // Replace with user's activity rank name if exists

  return (
    <Box sx={{ pt: '100px', minHeight: '100vh', backgroundColor: theme.palette.background.default, px: 2 }}>
      <Typography variant="h3" color="primary" fontWeight="bold" textAlign="center" gutterBottom>
        🏆 User Ranks & Badges
      </Typography>
      <Typography align="center" color="text.secondary" mb={6} >
        Progress through car-themed tiers and unlock prestige by supporting or contributing to TorqueHub.
      </Typography>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }} color ="primary" textAlign="center">🏁 Donation-Based Ranks</Typography>
      <Typography align="center" color="text.secondary" mb={6} >
          These are earned by donating to the platform. Each level unlocks badges
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mb: 8 }}>
        {donationRanks.map((rank, i) => (
          <RankCard key={rank.name} {...rank} highlight={i === donationRanks.length - 1} pulse={userDonationRank === rank.name} />
        ))}
      </Box>

      <Divider sx={{ my: 6 }} />

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }} color ="primary" textAlign="center">🔧 Activity-Based Ranks</Typography>
      <Typography align="center" color="text.secondary" mb={6} >
        These are earned through likes, questions, answers, comments, etc.

      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {activityRanks.map((rank, i) => (
          <RankCard key={rank.name} {...rank} range={`${rank.points} Points`} highlight={i === activityRanks.length - 1} pulse={userActivityRank === rank.name}/>
        ))}
      </Box>
    </Box>
  );
};

export default RanksPage;
