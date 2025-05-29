import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Button, Paper, Alert, 
    CircularProgress, Chip, Card, CardContent, Divider,
    Stepper, Step, StepLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PaymentIcon from '@mui/icons-material/Payment';
import paymentService, { PAYMENT_TYPES } from '../components/configuration/Services/PaymentService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_live_51RTLUdFqJMJZjXTUT8nhjOQL6Ub6SNj4X4u6kURdZCuItTSoCrfEen2tV41Tqfij4cKcrFP4XyyafbSkPIBLxrtd00OxXlk43Z');

// Payment Form Component using Stripe Elements
const PaymentForm = ({ paymentDetails, clientSecret, onSuccess, onError, loading, setLoading, cardPreview, setCardPreview }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [focused, setFocused] = useState('');

    // Listen to PaymentElement changes to update card preview
    useEffect(() => {
        if (!elements) return;

        const paymentElement = elements.getElement('payment');
        if (!paymentElement) return;

        const handleChange = (event) => {
            // Extract card details for preview (this is safe as it's just for display)
            if (event.value?.type === 'card') {
                // Update card preview based on what user is typing
                // Note: We can't get actual card details for security, so we'll show a generic preview
                setCardPreview(prev => ({
                    ...prev,
                    // We can't access real card details for security reasons
                    // So we'll show a placeholder that updates based on focus
                }));
            }
        };

        paymentElement.on('change', handleChange);
        
        return () => {
            paymentElement.off('change', handleChange);
        };
    }, [elements, setCardPreview]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setLoading(true);
        setMessage(null);

        try {
            console.log('🚀 Processing payment with Stripe Elements...');

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error('❌ Payment failed:', error);
                setMessage(error.message);
                onError(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('✅ Payment succeeded!', paymentIntent);
                onSuccess(paymentIntent);
            } else {
                console.log('🔄 Payment requires additional action or confirmation');
                setMessage('Payment processing...');
            }
        } catch (err) {
            console.error('❌ Payment processing error:', err);
            setMessage('An unexpected error occurred.');
            onError(err.message || 'Payment processing failed');
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    const paymentElementOptions = {
        layout: "tabs",
        defaultValues: {
            billingDetails: {
                name: cardPreview.name || '',
            }
        }
    };

    return (
        <Box>
            {/* Beautiful Credit Card Preview */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Cards
                    number={cardPreview.number || ''}
                    name={cardPreview.name || 'CARDHOLDER NAME'}
                    expiry={cardPreview.expiry || ''}
                    cvc={cardPreview.cvc || ''}
                    focused={focused}
                    placeholders={{
                        name: 'CARDHOLDER NAME',
                    }}
                />
            </Box>

            <Divider sx={{ mb: 3 }}>
                <Chip label="Secure Payment" color="primary" size="small" />
            </Divider>

            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        💳 Enter your payment details securely below
                    </Typography>
                    <PaymentElement 
                        id="payment-element" 
                        options={paymentElementOptions}
                        onFocus={() => setFocused('number')}
                    />
                </Box>

                {message && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading || !stripe || !elements}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <PaymentIcon />}
                    sx={{
                        paddingY: 1.5,
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        letterSpacing: '0.5px',
                    }}
                >
                    {isLoading ? 'Processing...' : `Pay ${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: paymentDetails.currency?.toUpperCase() || 'EUR',
                    }).format(paymentDetails.amount)}`}
                </Button>
            </form>
        </Box>
    );
};

const PaymentPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get payment details from navigation state or default values
    const paymentDetails = location.state?.paymentDetails || {
        amount: 10.00,
        description: 'TorqueHub Payment',
        type: PAYMENT_TYPES.ONE_TIME,
        currency: 'eur'
    };

    // Get any existing payment intent data
    const existingPaymentIntent = location.state?.paymentIntent;

    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentStep, setPaymentStep] = useState(0); // 0: Form, 1: Processing, 2: Complete
    const [paymentResult, setPaymentResult] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentIntentId, setPaymentIntentId] = useState('');
    
    // Card preview state for the visual component
    const [cardPreview, setCardPreview] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });

    // Payment steps for stepper
    const steps = ['Payment Details', 'Processing', 'Complete'];

    // Create payment intent when component mounts
    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                setLoading(true);
                console.log('🚀 Creating payment intent...');

                let paymentResponse;

                // Use existing payment intent if available
                if (existingPaymentIntent) {
                    console.log('📋 Using existing payment intent:', existingPaymentIntent.paymentIntentId);
                    setClientSecret(existingPaymentIntent.clientSecret);
                    setPaymentIntentId(existingPaymentIntent.paymentIntentId);
                    return;
                }

                // Create new payment intent based on type
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

                if (paymentResponse.success) {
                    console.log('✅ Payment intent created:', paymentResponse.data);
                    
                    // For checkout sessions (subscriptions), redirect to Stripe
                    if (paymentResponse.data.checkoutUrl) {
                        window.location.href = paymentResponse.data.checkoutUrl;
                        return;
                    }

                    // Set client secret for Payment Element
                    setClientSecret(paymentResponse.data.clientSecret);
                    setPaymentIntentId(paymentResponse.data.paymentIntentId);
                } else {
                    throw new Error(paymentResponse.message || 'Failed to create payment intent');
                }
            } catch (error) {
                console.error('❌ Failed to create payment intent:', error);
                setPaymentStatus({
                    type: 'error',
                    message: error.message || 'Failed to initialize payment. Please try again.'
                });
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, []);

    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            console.log('✅ Payment completed successfully');
            setPaymentStep(2); // Move to complete step
            
            // Notify our backend about the successful payment
            const confirmResponse = await paymentService.confirmPayment(paymentIntentId);

            setPaymentResult({
                success: true,
                paymentIntentId: paymentIntentId,
                amount: paymentDetails.amount,
                currency: paymentDetails.currency || 'eur',
                type: paymentDetails.type,
                description: paymentDetails.description,
                stripePaymentIntent: paymentIntent
            });

            setPaymentStatus({
                type: 'success',
                message: 'Payment completed successfully!'
            });

            // Auto-redirect to success page after 3 seconds
            setTimeout(() => {
                navigate('/payment-success', {
                    state: {
                        paymentData: {
                            paymentIntentId: paymentIntentId,
                            amount: paymentDetails.amount,
                            type: paymentDetails.type,
                            description: paymentDetails.description,
                            stripePaymentIntent: paymentIntent
                        },
                        confirmResponse: confirmResponse.data,
                        message: `Thank you! Your ${paymentDetails.type === PAYMENT_TYPES.DONATION ? 'donation' : 'payment'} has been processed successfully.`
                    }
                });
            }, 3000);

        } catch (error) {
            console.error('❌ Payment confirmation failed:', error);
            setPaymentStatus({
                type: 'warning',
                message: 'Payment succeeded but confirmation failed. Please contact support if needed.'
            });
        }
    };

    const handlePaymentError = (errorMessage) => {
        setPaymentStep(0); // Return to form step
        setPaymentStatus({
            type: 'error',
            message: errorMessage || 'Payment failed. Please try again.'
        });
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

    // Stripe Elements options
    const elementsOptions = {
        clientSecret,
        appearance: {
            theme: theme.palette.mode === 'dark' ? 'night' : 'stripe',
            variables: {
                colorPrimary: theme.palette.primary.main,
                colorBackground: theme.palette.background.paper,
                colorText: theme.palette.text.primary,
                colorDanger: theme.palette.error.main,
                fontFamily: theme.typography.fontFamily,
                borderRadius: '8px',
            },
        },
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

                {/* Stripe Elements Payment Form with Card Preview - only show when not processing and client secret is ready */}
                {paymentStep === 0 && clientSecret && (
                    <Elements stripe={stripePromise} options={elementsOptions}>
                        <PaymentForm
                            paymentDetails={paymentDetails}
                            clientSecret={clientSecret}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                            loading={loading}
                            setLoading={setLoading}
                            cardPreview={cardPreview}
                            setCardPreview={setCardPreview}
                        />
                    </Elements>
                )}

                {/* Loading state while creating payment intent */}
                {paymentStep === 0 && !clientSecret && loading && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            Preparing payment...
                        </Typography>
                    </Box>
                )}

                {/* Development Info */}
                {process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="caption" color="primary">
                            Development Mode | Payment Type: {paymentDetails.type}
                            {clientSecret && ` | Stripe Elements Loaded`}
                            {existingPaymentIntent && ` | Using existing payment intent`}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default PaymentPage;
