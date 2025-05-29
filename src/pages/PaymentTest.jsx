import React, { useState } from 'react';
import { 
    Box, Typography, TextField, Grid, Button, Paper, Alert, 
    CircularProgress, Chip, Card, CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PaymentIcon from '@mui/icons-material/Payment';
import paymentService, { PAYMENT_TYPES } from '../components/configuration/Services/PaymentService';

const PaymentTestPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get payment details from navigation state
    const paymentDetails = location.state?.paymentDetails || {
        amount: 1.00,
        description: 'TorqueHub Test Payment',
        type: PAYMENT_TYPES.DONATION
    };

    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);

    const handleTestPayment = async () => {
        setLoading(true);
        setPaymentStatus(null);

        try {
            console.log('🚀 Testing payment flow...');
            
            // Create payment intent
            const paymentResponse = await paymentService.createPaymentIntent({
                amount: paymentDetails.amount,
                currency: 'eur',
                description: paymentDetails.description,
                type: paymentDetails.type
            });

            if (!paymentResponse.success) {
                throw new Error(paymentResponse.message || 'Failed to create payment intent');
            }

            console.log('✅ Payment intent created:', paymentResponse.data);

            // Simulate successful payment by confirming immediately
            const confirmResponse = await paymentService.confirmPayment(
                paymentResponse.data.paymentIntentId
            );

            if (confirmResponse.success) {
                console.log('✅ Payment confirmed successfully');
                
                setPaymentResult({
                    success: true,
                    paymentIntentId: paymentResponse.data.paymentIntentId,
                    amount: paymentDetails.amount,
                    description: paymentDetails.description
                });

                setPaymentStatus({
                    type: 'success',
                    message: 'Payment test completed successfully!'
                });

                // Auto-redirect after 3 seconds
                setTimeout(() => {
                    navigate('/payment-success', {
                        state: {
                            paymentData: {
                                paymentIntentId: paymentResponse.data.paymentIntentId,
                                amount: paymentDetails.amount,
                                type: paymentDetails.type,
                                description: paymentDetails.description,
                                isTest: true
                            },
                            message: 'Test payment completed successfully!'
                        }
                    });
                }, 3000);

            } else {
                throw new Error(confirmResponse.message || 'Payment confirmation failed');
            }

        } catch (error) {
            console.error('❌ Payment test failed:', error);
            setPaymentStatus({
                type: 'error',
                message: error.message || 'Payment test failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

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
                    width: '100%',
                    maxWidth: 500,
                    padding: { xs: 3, sm: 4 },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        mb: 3,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: theme.palette.primary.main
                    }}
                >
                    Payment System Test
                </Typography>

                {/* Payment Summary */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Type
                                </Typography>
                                <Chip 
                                    label="Test Payment" 
                                    color="secondary" 
                                    size="small" 
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Amount
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {formatAmount(paymentDetails.amount)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body1">
                                    {paymentDetails.description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Payment Status Alert */}
                {paymentStatus && (
                    <Alert 
                        severity={paymentStatus.type} 
                        sx={{ mb: 3 }}
                        icon={paymentStatus.type === 'error' ? <ErrorIcon /> : <CheckCircleIcon />}
                    >
                        {paymentStatus.message}
                    </Alert>
                )}

                {/* Success State */}
                {paymentResult?.success && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" color="success.main" gutterBottom>
                            Payment Test Successful!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Payment Intent ID: {paymentResult.paymentIntentId}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Redirecting to success page...
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Test Button */}
                {!paymentResult?.success && (
                    <Button
                        fullWidth
                        onClick={handleTestPayment}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                        sx={{
                            paddingY: 1.5,
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {loading ? 'Testing Payment...' : `Test Payment ${formatAmount(paymentDetails.amount)}`}
                    </Button>
                )}

                {/* Info */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                    <Typography variant="caption" color="primary">
                        This is a test to verify the payment system backend integration.
                        No real payment will be processed.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default PaymentTestPage; 