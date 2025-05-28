import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Chip, Divider,
    Alert, Card, CardContent, CircularProgress, Grid,
    Confetti
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import HomeIcon from '@mui/icons-material/Home';
import PaymentIcon from '@mui/icons-material/Payment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import paymentService, { PAYMENT_TYPES } from '../components/configuration/Services/PaymentService';

/**
 * PaymentSuccess Component
 * 
 * Displays payment confirmation details after successful payment processing.
 * Shows transaction details, payment method info, and provides options for
 * downloading receipt or returning to homepage.
 * Enhanced for donation payments with rank progression display.
 */
const PaymentSuccess = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get payment data from navigation state
    const { paymentData, confirmResponse, message } = location.state || {};
    
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfetti, setShowConfetti] = useState(true);

    // Load transaction details on component mount
    useEffect(() => {
        const loadTransactionDetails = async () => {
            // If no payment data, redirect to home
            if (!paymentData) {
                console.warn('⚠️ No payment data found, redirecting to home');
                navigate('/');
                return;
            }

            try {
                setLoading(true);
                
                // Fetch full transaction details using payment intent ID
                const response = await paymentService.getPaymentStatus(
                    paymentData.paymentIntentId
                );
                
                if (response.success) {
                    setTransactionDetails(response.data);
                    console.log('✅ Transaction details loaded');
                } else {
                    console.warn('⚠️ Could not load transaction details, using payment data');
                    // Use the payment data we have if API call fails
                    setTransactionDetails(paymentData);
                }
            } catch (error) {
                console.error('❌ Failed to load transaction details:', error);
                // Use the payment data we have if API call fails
                setTransactionDetails(paymentData);
                setError('Could not load full transaction details, but payment was successful');
            } finally {
                setLoading(false);
            }
        };

        loadTransactionDetails();

        // Hide confetti after 5 seconds
        const confettiTimer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);

        return () => clearTimeout(confettiTimer);
    }, [paymentData, navigate]);

    // Format currency amount
    const formatAmount = (amount, currency = 'EUR') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    // Format date for display
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get payment type display info
    const getPaymentTypeInfo = (type) => {
        switch (type) {
            case PAYMENT_TYPES.DONATION:
                return {
                    label: 'Donation',
                    icon: <FavoriteIcon />,
                    color: 'error',
                    message: 'Thank you for supporting TorqueHub! ❤️'
                };
            case PAYMENT_TYPES.SUBSCRIPTION:
                return {
                    label: 'Subscription',
                    icon: <EmojiEventsIcon />,
                    color: 'primary',
                    message: 'Welcome to TorqueHub Premium! 🎉'
                };
            default:
                return {
                    label: 'Payment',
                    icon: <PaymentIcon />,
                    color: 'success',
                    message: 'Payment completed successfully! ✅'
                };
        }
    };

    // Handle receipt download
    const handleDownloadReceipt = async () => {
        try {
            setLoading(true);
            
            // Generate receipt data
            const receiptData = {
                transactionId: paymentData.paymentIntentId,
                amount: paymentData.amount,
                currency: paymentData.currency || 'EUR',
                cardDetails: paymentData.cardDetails,
                timestamp: new Date().toISOString(),
                merchant: 'TorqueHub',
                status: 'Completed',
                type: paymentData.type,
                description: paymentData.description
            };

            // Create and download receipt as text file
            const receiptText = generateReceiptText(receiptData);
            const blob = new Blob([receiptText], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `TorqueHub_Receipt_${paymentData.paymentIntentId.slice(-8)}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Receipt downloaded successfully');
        } catch (error) {
            console.error('❌ Failed to download receipt:', error);
            setError('Failed to download receipt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Generate receipt text content
    const generateReceiptText = (receiptData) => {
        const typeInfo = getPaymentTypeInfo(receiptData.type);
        
        return `
TORQUEHUB ${typeInfo.label.toUpperCase()} RECEIPT
${'='.repeat(40)}

Transaction ID: ${receiptData.transactionId}
Date: ${formatDate(receiptData.timestamp)}
Amount: ${formatAmount(receiptData.amount, receiptData.currency)}
Type: ${typeInfo.label}
Description: ${receiptData.description}
Status: ${receiptData.status}

Payment Method: ${receiptData.cardDetails.brand} ending in ${receiptData.cardDetails.last4}
Expiry: ${receiptData.cardDetails.expiry}

Merchant: ${receiptData.merchant}
Website: https://torquehub.com

${typeInfo.message}

For any questions, please contact support at support@torquehub.com
        `.trim();
    };

    // Handle navigation back to home
    const handleGoHome = () => {
        navigate('/');
    };

    // Handle view payment history
    const handleViewPayments = () => {
        navigate('/dashboard/payments');
    };

    // Handle return to donations page
    const handleBackToDonations = () => {
        navigate('/donate');
    };

    // Show loading spinner if data is being loaded
    if (loading && !transactionDetails) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Show error if no payment data
    if (!paymentData) {
        return (
            <Box
                sx={{
                    padding: { xs: '16px', sm: '32px' },
                    paddingTop: { xs: '80px', sm: '100px' },
                    minHeight: '100vh',
                    backgroundColor: theme.palette.background.default,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        maxWidth: 500,
                        padding: 4,
                        textAlign: 'center',
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 3,
                    }}
                >
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        No payment information found.
                    </Alert>
                    <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={handleGoHome}
                    >
                        Go to Homepage
                    </Button>
                </Paper>
            </Box>
        );
    }

    const typeInfo = getPaymentTypeInfo(paymentData.type);

    return (
        <Box
            sx={{
                padding: { xs: '16px', sm: '32px' },
                paddingTop: { xs: '80px', sm: '100px' },
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}
        >
            {/* Confetti Effect for Donations */}
            {showConfetti && paymentData.type === PAYMENT_TYPES.DONATION && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 1000
                    }}
                >
                    {/* Simple confetti simulation with CSS */}
                    <style>
                        {`
                        @keyframes confetti-fall {
                            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                        }
                        .confetti {
                            position: absolute;
                            width: 10px;
                            height: 10px;
                            background: #ff6b6b;
                            animation: confetti-fall 3s linear infinite;
                        }
                        `}
                    </style>
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </Box>
            )}

            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: 600,
                    padding: { xs: 3, sm: 4 },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                }}
            >
                {/* Success Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <CheckCircleIcon 
                        sx={{ 
                            fontSize: 80, 
                            color: 'success.main', 
                            mb: 2 
                        }} 
                    />
                    <Typography 
                        variant="h4" 
                        fontWeight="bold" 
                        color="success.main" 
                        gutterBottom
                    >
                        {paymentData.type === PAYMENT_TYPES.DONATION ? 'Thank You!' : 'Payment Successful!'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {message || typeInfo.message}
                    </Typography>
                </Box>

                {/* Payment Details Card */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Transaction ID
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {paymentData.paymentIntentId.slice(-12).toUpperCase()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Amount
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    {formatAmount(paymentData.amount, paymentData.currency)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Payment Type
                                </Typography>
                                <Chip 
                                    label={typeInfo.label}
                                    color={typeInfo.color}
                                    icon={typeInfo.icon}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Date
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(new Date())}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body1">
                                    {paymentData.description}
                                </Typography>
                            </Grid>
                            {paymentData.cardDetails && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Payment Method
                                    </Typography>
                                    <Typography variant="body1">
                                        {paymentData.cardDetails.brand} ending in {paymentData.cardDetails.last4}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Donation-specific content */}
                {paymentData.type === PAYMENT_TYPES.DONATION && paymentData.donationData && (
                    <Card variant="outlined" sx={{ mb: 3, backgroundColor: theme.palette.success.light + '20' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                🎉 Rank Achievement!
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                You've progressed from <strong>{paymentData.donationData.currentRank}</strong> to <strong>{paymentData.donationData.targetRank}</strong>!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total contribution: {formatAmount(paymentData.donationData.totalAfterDonation, paymentData.currency)}
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Error Display */}
                {error && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadReceipt}
                            disabled={loading}
                        >
                            Download Receipt
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<HomeIcon />}
                            onClick={handleGoHome}
                        >
                            Back to Home
                        </Button>
                    </Grid>
                    {paymentData.type === PAYMENT_TYPES.DONATION && (
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="secondary"
                                startIcon={<FavoriteIcon />}
                                onClick={handleBackToDonations}
                                sx={{ mt: 1 }}
                            >
                                Make Another Donation
                            </Button>
                        </Grid>
                    )}
                </Grid>

                {/* Development Info */}
                {process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Development Mode | Transaction processed successfully
                            {transactionDetails && ` | Full details loaded`}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default PaymentSuccess; 