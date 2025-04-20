import api from '../api';

const EmailService = {
    sendWelcomeEmail: (emailData) => {
        return api.post('/emails/send-welcome-email', emailData)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    },
    sendPlatformUpdate: (data) => {
        return api.post('/emails/send-platform-update', data)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    sendTicketEmail: (data) => {
        return api.post('/emails/send-ticket', data)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    sendBanNotification: (data) => {
        return api.post('/emails/send-ban-email', data)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    sendReportTicketEmail: (data) => {
        return api.post('/emails/send-report-ticket', data)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    sendPasswordResetEmail: (data) => {
        return api.post('/emails/send-password-reset', data)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },

    sendEmailResetEmail: (data) => {
        return api.post('/emails/send-email-reset', data)
            .then(res => res.data)
            .catch(err => Promise.reject(err));
    },
    
};

export default EmailService;
