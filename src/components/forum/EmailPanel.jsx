import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, MenuItem, Paper, Divider
} from '@mui/material';
import EmailService from '../configuration/Services/EmailService';
import { useAppNotifications } from '../common/NotificationProvider';
import { useTheme } from '@mui/material/styles';

const emailTypes = [
    { label: "Ticket Email", value: "ticket" },
    { label: "Platform Update", value: "platform" },
    { label: "Ban Notification", value: "ban" },
    { label: "Password Reset", value: "reset" },
];

const EmailPanel = () => {
    const theme = useTheme();
    const [type, setType] = useState('welcome');
    const [to, setTo] = useState('');
    const [username, setUsername] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const notifications = useAppNotifications();

    const handleSend = async () => {
        try {
            if (!to) {
                return notifications.show("Recipient email is required.", { severity: "warning" });
            }

            switch (type) {
                case 'welcome':
                    await EmailService.sendWelcomeEmail({ to, username });
                    break;
                case 'ticket':
                    await EmailService.sendTicketEmail({ to, eventName: subject, qrCodeBase64: "dummyQrCodeBase64" });
                    break;
                case 'platform':
                    await EmailService.sendPlatformUpdate({ to, updateTitle: subject, updateContent: message });
                    break;
                case 'ban':
                    await EmailService.sendBanNotification({ to, reason: subject, duration: message });
                    break;
                case 'reset':
                    await EmailService.sendPasswordResetEmail({ to, resetLink: message });
                    break;
                default:
                    break;
            }

            notifications.show('📨 Email sent successfully!', { severity: 'success' });
        } catch (err) {
            notifications.show('❌ Failed to send email', { severity: 'error' });
        }
    };

    return (
        <Box sx={{ 
                paddingTop: { xs: '4rem', sm: '6rem', md: '8rem' },
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
            }}>
            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5" mb={2}>📧 Email Sender Panel</Typography>
                    <Divider sx={{ mb: 3 }} />

                    <TextField
                        select
                        fullWidth
                        label="Email Type"
                        value={type}
                        variant="filled"
                        onChange={(e) => setType(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        {emailTypes.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Recipient Email"
                        variant="filled"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {(type === 'welcome') && (
                        <TextField
                            fullWidth
                            label="Username"
                            variant="filled"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    )}

                    {(type !== 'welcome') && (
                        <TextField
                            fullWidth
                            label="Subject / Title"
                            variant="filled"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    )}

                    {(type !== 'welcome') && (
                        <TextField
                            fullWidth
                            multiline
                            label="Message / Extra Info"
                            value={message}
                            variant="filled"
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            sx={{ mb: 2 }}
                        />
                    )}

                    <Button fullWidth variant="contained" color="primary" onClick={handleSend}>
                        Send Email
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
};

export default EmailPanel;
