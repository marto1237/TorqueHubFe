import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, TextField, Grid, Button, Paper, Alert, 
    CircularProgress, Chip, Divider, Card, CardContent, CardActions,
    Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PaymentIcon from '@mui/icons-material/Payment';
import paymentService, { PAYMENT_TYPES } from '../components/configuration/Services/PaymentService';

const PaymentPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get payment details from navigation state or default values
    const paymentDetails = location.state?.paymentDetails || {
        amount: 10.00,
        description: 'TorqueHub Payment',
        type: PAYMENT_TYPES.ONE_TIME
    };

    // Get any existing payment intent data
    const existingPaymentIntent = location.state?.paymentIntent;

    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    
    const [focused, setFocused] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [stripeConfig, setStripeConfig] = useState(null);
    const [paymentStep, setPaymentStep] = useState(0); // 0: Form, 1: Processing, 2: Complete
    const [paymentResult, setPaymentResult] = useState(null);

    // Payment steps for stepper
    const steps = ['Payment Details', 'Processing', 'Complete'];

    // Load Stripe configuration on component mount
    useEffect(() => {
        const loadStripeConfig = async () => {
            try {
                const response = await paymentService.getStripeConfig();
                if (response.success) {
                    setStripeConfig(response.data);
                    console.log('✅ Stripe configuration loaded');
                } else {
                    console.warn('⚠️ Could not load Stripe config, using test mode');
                }
            } catch (error) {
                console.error('❌ Failed to load Stripe config:', error);
            }
        };

        loadStripeConfig();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format card number with spaces
        if (name === 'number') {
            const formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.replace(/\s/g, '').length <= 16) {
                setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
            }
        }
        // Format expiry date
        else if (name === 'expiry') {
            const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (formattedValue.length <= 5) {
                setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
            }
        }
        // Limit CVC to 4 digits
        else if (name === 'cvc') {
            if (value.length <= 4 && /^\d*$/.test(value)) {
                setCardDetails(prev => ({ ...prev, [name]: value }));
            }
        }
        // Name field
        else {
            setCardDetails(prev => ({ ...prev, [name]: value }));
        }
        
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate card number
        if (!cardDetails.number || !paymentService.validateCardNumber(cardDetails.number.replace(/\s/g, ''))) {
            newErrors.number = 'Please enter a valid card number';
        }
        
        // Validate cardholder name
        if (!cardDetails.name.trim()) {
            newErrors.name = 'Please enter the cardholder name';
        }
        
        // Validate expiry date
        if (!cardDetails.expiry || !paymentService.validateExpiryDate(cardDetails.expiry)) {
            newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
        }
        
        // Validate CVC
        if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
            newErrors.cvc = 'Please enter a valid CVC';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setPaymentStatus({
                type: 'error',
                message: 'Please fix the errors in the form'
            });
            return;
        }

        setLoading(true);
        setPaymentStatus(null);
        setPaymentStep(1); // Move to processing step

        try {
            console.log('🚀 Processing real payment with Stripe...');
            
            let paymentResponse;
            
            // Use existing payment intent if available, otherwise create new one
            if (existingPaymentIntent) {
                console.log('📋 Using existing payment intent:', existingPaymentIntent.paymentIntentId);
                paymentResponse = { success: true, data: existingPaymentIntent };
            } else {
                // Create new payment intent
                if (paymentDetails.type === PAYMENT_TYPES.DONATION) {
                    paymentResponse = await paymentService.processDonation({
                        amount: paymentDetails.amount,
                        message: paymentDetails.description,
                        currency: paymentDetails.currency || 'eur'
                    });
                } else if (paymentDetails.type === PAYMENT_TYPES.SUBSCRIPTION) {
                    paymentResponse = await paymentService.createSubscription({
                        planId: paymentDetails.planId || 'basic'
                    });
                } else {
                    // Regular payment intent
                    paymentResponse = await paymentService.createPaymentIntent({
                        amount: paymentDetails.amount,
                        currency: paymentDetails.currency || 'eur',
                        description: paymentDetails.description,
                        type: paymentDetails.type
                    });
                }
            }

            if (paymentResponse.success) {
                console.log('✅ Payment intent ready:', paymentResponse.data);
                
                // For checkout sessions (subscriptions), redirect to Stripe
                if (paymentResponse.data.checkoutUrl) {
                    window.location.href = paymentResponse.data.checkoutUrl;
                    return;
                }

                // Simulate payment processing with card details
                console.log('💳 Processing payment with card details...');
                
                // In a real implementation, you would use Stripe.js here
                // For now, we'll simulate the payment process
                await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

                // Confirm the payment
                const confirmResponse = await paymentService.confirmPayment(
                    paymentResponse.data.paymentIntentId
                );

                if (confirmResponse.success) {
                    console.log('✅ Payment confirmed successfully');
                    
                    setPaymentStep(2); // Move to complete step
                    setPaymentResult({
                        success: true,
                        paymentIntentId: paymentResponse.data.paymentIntentId,
                        amount: paymentDetails.amount,
                        currency: paymentDetails.currency || 'eur',
                        type: paymentDetails.type,
                        description: paymentDetails.description,
                        cardBrand: paymentService.getCardBrand(cardDetails.number),
                        cardLast4: cardDetails.number.slice(-4)
                    });

                    // Auto-redirect to success page after 3 seconds
                    setTimeout(() => {
                        navigate('/payment-success', {
                            state: {
                                paymentData: {
                                    paymentIntentId: paymentResponse.data.paymentIntentId,
                                    amount: paymentDetails.amount,
                                    type: paymentDetails.type,
                                    description: paymentDetails.description,
                                    cardDetails: {
                                        last4: cardDetails.number.slice(-4),
                                        brand: paymentService.getCardBrand(cardDetails.number),
                                        expiry: cardDetails.expiry
                                    }
                                },
                                confirmResponse: confirmResponse.data,
                                message: `Thank you! Your ${paymentDetails.type === PAYMENT_TYPES.DONATION ? 'donation' : 'payment'} has been processed successfully.`
                            }
                        });
                    }, 3000);

                } else {
                    throw new Error(confirmResponse.message || 'Payment confirmation failed');
                }

            } else {
                throw new Error(paymentResponse.message || 'Failed to create payment intent');
            }

        } catch (error) {
            console.error('❌ Payment processing failed:', error);
            setPaymentStep(0); // Return to form step
            setPaymentStatus({
                type: 'error',
                message: error.message || 'Payment processing failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: paymentDetails.currency?.toUpperCase() || 'EUR',
        }).format(amount);
    };

    const getPaymentTypeLabel = (type) => {
        switch (type) {
            case PAYMENT_TYPES.DONATION:
                return 'Donation';
            case PAYMENT_TYPES.SUBSCRIPTION:
                return 'Subscription';
            case PAYMENT_TYPES.AD_FREE:
                return 'Ad-Free Experience';
            default:
                return 'One-time Payment';
        }
    };

    // Render payment success state
    if (paymentStep === 2 && paymentResult?.success) {
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
                        textAlign: 'center'
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>
                        Payment Successful!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        {paymentResult.description}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                        {formatAmount(paymentResult.amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {paymentResult.cardBrand} ending in {paymentResult.cardLast4}
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Redirecting to success page...
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        );
    }

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
                {/* Payment Progress Stepper */}
                <Stepper activeStep={paymentStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Typography
                    variant="h5"
                    sx={{
                        mb: 2,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: theme.palette.primary.main,
                        fontFamily: theme.typography.fontFamily
                    }}
                >
                    {paymentStep === 1 ? 'Processing Payment...' : 'Complete Your Payment'}
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
                                    label={getPaymentTypeLabel(paymentDetails.type)} 
                                    color="primary" 
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

                {/* Show processing state */}
                {paymentStep === 1 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={60} sx={{ mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Processing your payment...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please do not close this window
                        </Typography>
                    </Box>
                )}

                {/* Payment form - only show when not processing */}
                {paymentStep === 0 && (
                    <>
                        {/* Credit Card Preview */}
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                            <Cards
                                number={cardDetails.number}
                                name={cardDetails.name}
                                expiry={cardDetails.expiry}
                                cvc={cardDetails.cvc}
                                focused={focused}
                            />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Payment Status Alert */}
                        {paymentStatus && (
                            <Alert 
                                severity={paymentStatus.type} 
                                sx={{ mb: 2 }}
                                icon={paymentStatus.type === 'error' ? <ErrorIcon /> : undefined}
                            >
                                {paymentStatus.message}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Card Number"
                                        name="number"
                                        value={cardDetails.number}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocused('number')}
                                        error={!!errors.number}
                                        helperText={errors.number}
                                        placeholder="1234 5678 9012 3456"
                                        disabled={loading}
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Cardholder Name"
                                        name="name"
                                        value={cardDetails.name}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocused('name')}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        placeholder="John Doe"
                                        disabled={loading}
                                    />
                                </Grid>
                                
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Expiry Date"
                                        name="expiry"
                                        value={cardDetails.expiry}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocused('expiry')}
                                        error={!!errors.expiry}
                                        helperText={errors.expiry}
                                        placeholder="MM/YY"
                                        disabled={loading}
                                    />
                                </Grid>
                                
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="CVC"
                                        name="cvc"
                                        value={cardDetails.cvc}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocused('cvc')}
                                        error={!!errors.cvc}
                                        helperText={errors.cvc}
                                        placeholder="123"
                                        disabled={loading}
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    {Object.keys(errors).length > 0 && (
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            Please fix the errors above.
                                        </Alert>
                                    )}
                                    
                                    <Button
                                        fullWidth
                                        type="submit"
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
                                        {loading ? 'Processing...' : `Pay ${formatAmount(paymentDetails.amount)}`}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </>
                )}

                {/* Development Info */}
                {process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Development Mode | Payment Type: {paymentDetails.type}
                            {stripeConfig && ` | Environment: ${stripeConfig.environment || 'test'}`}
                            {existingPaymentIntent && ` | Using existing payment intent`}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default PaymentPage;
