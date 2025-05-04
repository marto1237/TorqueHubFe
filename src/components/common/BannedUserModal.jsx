import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #f44336',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  textAlign: 'center'
};

const iconStyle = {
  fontSize: 60,
  color: '#f44336',
  margin: '0 auto',
  display: 'block',
  marginBottom: 2
};

const BannedUserModal = ({ open, onClose, banDetails }) => {
  if (!banDetails) return null;

  const isPermanent = banDetails.duration === 'permanent';

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="banned-user-modal"
      aria-describedby="modal-explaining-user-ban"
    >
      <Box sx={modalStyle}>
        <BlockIcon sx={iconStyle} />
        <Typography id="banned-user-modal" variant="h5" component="h2" gutterBottom>
          Account Banned
        </Typography>
        
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          {isPermanent ? (
            "Your account has been permanently banned."
          ) : (
            `Your account has been temporarily banned for ${banDetails.expiration}.`
          )}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Reason: {banDetails.reason}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          If you believe this is a mistake, please contact our support team.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onClose}
          fullWidth
        >
          I Understand
        </Button>
      </Box>
    </Modal>
  );
};

export default BannedUserModal; 