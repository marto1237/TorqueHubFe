import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
    Box,
    Divider,
    Paper,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import TimerIcon from '@mui/icons-material/Timer';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * Modal component displayed when a user is banned
 * @param {Object} props Component props
 * @param {boolean} props.open Whether the modal is open
 * @param {Function} props.onClose Callback when modal is closed
 * @param {Object} props.banDetails Ban details including reason, duration and expiration
 */
export default function BannedUserModal({ open, onClose, banDetails }) {
    const { reason, duration, expiration } = banDetails || {};
    
    const isPermanent = !expiration || expiration === 'permanent';
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderTop: '4px solid #d32f2f',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: '8px'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#d32f2f'
            }}>
                <BlockIcon color="error" fontSize="large" />
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                    Account Suspended
                </Typography>
            </DialogTitle>
            
            <Divider />
            
            <DialogContent>
                <Paper elevation={0} sx={{ 
                    padding: 2, 
                    backgroundColor: '#ffebee', 
                    marginBottom: 2,
                    borderRadius: '4px'
                }}>
                    <DialogContentText color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="error" />
                        <Typography variant="body1" fontWeight={500}>
                            Your account has been {isPermanent ? 'permanently banned' : 'temporarily suspended'}
                        </Typography>
                    </DialogContentText>
                </Paper>
                
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Reason for suspension:
                    </Typography>
                    <Typography variant="body1">
                        {reason || 'Violation of community guidelines or terms of service'}
                    </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                    }}>
                        <TimerIcon fontSize="small" />
                        Duration:
                    </Typography>
                    <Typography variant="body1">
                        {duration || (isPermanent ? 'Permanent' : 'Temporary')}
                    </Typography>
                    
                    {!isPermanent && expiration && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Your account will be restored on: {new Date(expiration).toLocaleDateString()} 
                            at {new Date(expiration).toLocaleTimeString()}
                        </Typography>
                    )}
                </Box>
                
                <DialogContentText variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    If you believe this is an error, please contact our support team at 
                    <Typography component="span" color="primary" sx={{ ml: 0.5 }}>
                        support@torquehub.com
                    </Typography>
                </DialogContentText>
            </DialogContent>
            
            <DialogActions sx={{ padding: 2 }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                >
                    I Understand
                </Button>
            </DialogActions>
        </Dialog>
    );
} 