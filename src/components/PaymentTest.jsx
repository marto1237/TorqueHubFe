import React, { useState } from 'react';
import {
    Box, Button, Card, CardContent, Typography, Grid,
    Alert, TextField, MenuItem, FormControl, InputLabel,
    Select, Chip, Divider, Paper, CardHeader, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import PaymentIcon from '@mui/icons-material/Payment';
import TestTubeIcon from '@mui/icons-material/Science';
import paymentService, { PAYMENT_TYPES } from './configuration/Services/PaymentService';

/**
 * PaymentTest Component
 * 
 * A test component for demonstrating and testing payment service functionality.
 * Provides buttons to test different payment scenarios and configurations.
 * Useful for development and testing purposes.
 */
const PaymentTest = () => {
    const navigate = useNavigate();
    
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customAmount, setCustomAmount] = useState(10.00);
    const [selectedType, setSelectedType] = useState(PAYMENT_TYPES.DONATION);

    // Pre-defined test scenarios
    const testScenarios = [
        {
            id: 'donation-small',
            name: 'Small Donation Test',
            description: 'Test $5 donation processing',
            amount: 5.00,
            type: PAYMENT_TYPES.DONATION
        },
        {
            id: 'donation-medium',
            name: 'Medium Donation Test',
            description: 'Test $25 donation processing',
            amount: 25.00,
            type: PAYMENT_TYPES.DONATION
        },
        {
            id: 'donation-large',
            name: 'Large Donation Test',
            description: 'Test $100 donation processing',
            amount: 100.00,
            type: PAYMENT_TYPES.DONATION
        },
        {
            id: 'subscription',
            name: 'Subscription Payment',
            description: 'Test subscription payment',
            amount: 29.99,
            type: PAYMENT_TYPES.SUBSCRIPTION
        }
    ];

    // Add test result to the list
    const addTestResult = (result) => {
        const timestamp = new Date().toLocaleTimeString();
        setTestResults(prev => [{
            ...result,
            timestamp,
            id: Date.now()
        }, ...prev].slice(0, 15)); // Keep only last 15 results
    };

    // Test connectivity to payment service
    const testConnectivity = async () => {
        setLoading(true);
        try {
            console.log('🧪 Testing payment service connectivity...');
            
            const response = await paymentService.testConnection();
            
            if (response.success) {
                addTestResult({
                    type: 'success',
                    test: 'Connectivity Test',
                    message: 'Payment service is reachable',
                    details: response.data
                });
                console.log('✅ Connectivity test passed');
            } else {
                throw new Error(response.message || 'Connectivity test failed');
            }
        } catch (error) {
            console.error('❌ Connectivity test failed:', error);
            addTestResult({
                type: 'error',
                test: 'Connectivity Test',
                message: error.message,
                details: null
            });
        } finally {
            setLoading(false);
        }
    };

    // Test payment intent creation
    const testPaymentIntent = async (scenario) => {
        setLoading(true);
        try {
            console.log(`🧪 Testing payment intent creation for: ${scenario.name}`);
            
            const response = await paymentService.createPaymentIntent({
                amount: scenario.amount,
                currency: 'usd',
                description: scenario.description,
                type: scenario.type
            });
            
            if (response.success) {
                addTestResult({
                    type: 'success',
                    test: `Payment Intent - ${scenario.name}`,
                    message: 'Payment intent created successfully',
                    details: {
                        paymentIntentId: response.data.paymentIntentId,
                        amount: response.data.amount,
                        status: response.data.status,
                        clientSecret: response.data.clientSecret ? '***hidden***' : 'not provided'
                    }
                });
                console.log('✅ Payment intent test passed');
            } else {
                throw new Error(response.message || 'Payment intent creation failed');
            }
        } catch (error) {
            console.error('❌ Payment intent test failed:', error);
            addTestResult({
                type: 'error',
                test: `Payment Intent - ${scenario.name}`,
                message: error.message,
                details: error.response?.data || null
            });
        } finally {
            setLoading(false);
        }
    };

    // Test Stripe configuration loading
    const testStripeConfig = async () => {
        setLoading(true);
        try {
            console.log('🧪 Testing Stripe configuration...');
            
            const response = await paymentService.getStripeConfig();
            
            if (response.success) {
                addTestResult({
                    type: 'success',
                    test: 'Stripe Configuration',
                    message: 'Configuration loaded successfully',
                    details: response.data
                });
                console.log('✅ Stripe configuration test passed');
            } else {
                throw new Error(response.message || 'Configuration loading failed');
            }
        } catch (error) {
            console.error('❌ Stripe configuration test failed:', error);
            addTestResult({
                type: 'error',
                test: 'Stripe Configuration',
                message: error.message,
                details: error.response?.data || null
            });
        } finally {
            setLoading(false);
        }
    };

    // Test customer creation
    const testCustomerCreation = async () => {
        setLoading(true);
        try {
            console.log('🧪 Testing customer creation...');
            
            const response = await paymentService.createCustomer({
                email: 'test@torquehub.com',
                name: 'Test Customer'
            });
            
            if (response.success) {
                addTestResult({
                    type: 'success',
                    test: 'Customer Creation',
                    message: 'Customer created successfully',
                    details: {
                        customerId: response.data.id,
                        email: response.data.email,
                        name: response.data.name
                    }
                });
                console.log('✅ Customer creation test passed');
            } else {
                throw new Error(response.message || 'Customer creation failed');
            }
        } catch (error) {
            console.error('❌ Customer creation test failed:', error);
            addTestResult({
                type: 'error',
                test: 'Customer Creation',
                message: error.message,
                details: error.response?.data || null
            });
        } finally {
            setLoading(false);
        }
    };

    // Test donation processing
    const testDonationProcessing = async (amount) => {
        setLoading(true);
        try {
            console.log(`🧪 Testing donation processing for $${amount}...`);
            
            const response = await paymentService.processDonation({
                amount: amount,
                message: `Test donation of $${amount}`
            });
            
            if (response.success) {
                addTestResult({
                    type: 'success',
                    test: `Donation Processing ($${amount})`,
                    message: 'Donation payment intent created successfully',
                    details: {
                        paymentIntentId: response.data.paymentIntentId,
                        amount: response.data.amount,
                        status: response.data.status
                    }
                });
                console.log('✅ Donation processing test passed');
            } else {
                throw new Error(response.message || 'Donation processing failed');
            }
        } catch (error) {
            console.error('❌ Donation processing test failed:', error);
            addTestResult({
                type: 'error',
                test: `Donation Processing ($${amount})`,
                message: error.message,
                details: error.response?.data || null
            });
        } finally {
            setLoading(false);
        }
    };

    // Test full payment flow
    const testFullPaymentFlow = (scenario) => {
        console.log(`🚀 Starting full payment flow test for: ${scenario.name}`);
        
        // Navigate to payment page with test data
        navigate('/payment', {
            state: {
                paymentDetails: {
                    amount: scenario.amount,
                    description: `TEST: ${scenario.description}`,
                    type: scenario.type
                }
            }
        });
    };

    // Test custom payment
    const testCustomPayment = () => {
        const customScenario = {
            name: 'Custom Payment',
            description: 'Custom payment test',
            amount: customAmount,
            type: selectedType
        };
        
        testFullPaymentFlow(customScenario);
    };

    // Clear test results
    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <TestTubeIcon sx={{ mr: 2 }} />
                Payment Service Test Suite - Spring Boot Integration
            </Typography>

            <Grid container spacing={3}>
                {/* Test Controls */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Service Tests (Spring Boot Endpoints)
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    onClick={testConnectivity}
                                    disabled={loading}
                                >
                                    Test Health (/test/health)
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    onClick={testStripeConfig}
                                    disabled={loading}
                                >
                                    Test Stripe Config (/test/stripe-config)
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    onClick={testCustomerCreation}
                                    disabled={loading}
                                >
                                    Test Customer Creation
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    onClick={clearResults}
                                    color="secondary"
                                >
                                    Clear Results
                                </Button>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Payment Intent Tests (/payments/create-payment-intent)
                            </Typography>
                            
                            <Grid container spacing={2}>
                                {testScenarios.map((scenario) => (
                                    <Grid item xs={12} sm={6} key={scenario.id}>
                                        <Card variant="outlined">
                                            <CardContent sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                    {scenario.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    ${scenario.amount} • {scenario.type}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => testPaymentIntent(scenario)}
                                                        disabled={loading}
                                                    >
                                                        Test Intent
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => testFullPaymentFlow(scenario)}
                                                        startIcon={<PaymentIcon />}
                                                    >
                                                        Full Test
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Donation Tests (Special Case)
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => testDonationProcessing(5)}
                                    disabled={loading}
                                    color="success"
                                >
                                    Test $5 Donation
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => testDonationProcessing(25)}
                                    disabled={loading}
                                    color="success"
                                >
                                    Test $25 Donation
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => testDonationProcessing(100)}
                                    disabled={loading}
                                    color="success"
                                >
                                    Test $100 Donation
                                </Button>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Custom Payment Test
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <TextField
                                    label="Amount"
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                                    size="small"
                                    sx={{ width: 120 }}
                                    inputProps={{ min: 0.50, step: 0.01 }}
                                />
                                
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Payment Type</InputLabel>
                                    <Select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        label="Payment Type"
                                    >
                                        {Object.values(PAYMENT_TYPES).map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <Button
                                    variant="contained"
                                    onClick={testCustomPayment}
                                    startIcon={<PaymentIcon />}
                                >
                                    Test Custom Payment
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Test Results */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Test Results ({testResults.length})
                                {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                            </Typography>
                            
                            {testResults.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No test results yet. Run some tests to see results here.
                                </Typography>
                            ) : (
                                <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                                    {testResults.map((result) => (
                                        <Alert 
                                            key={result.id}
                                            severity={result.type}
                                            sx={{ mb: 1 }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {result.test}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {result.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {result.timestamp}
                                                </Typography>
                                                {result.details && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Chip 
                                                            label="View Details" 
                                                            size="small" 
                                                            onClick={() => console.log('Test Details:', result.details)}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </Alert>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* API Endpoint Information */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Spring Boot API Endpoints Being Tested
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        This test suite is configured to test your Spring Boot payment endpoints:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                        <li>
                            <Typography variant="body2">
                                <strong>GET /api/test/health:</strong> Service health check
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>GET /api/test/stripe-config:</strong> Stripe configuration
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>POST /api/payments/create-payment-intent:</strong> Create payment intents
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>POST /api/payments/create-customer:</strong> Create Stripe customers
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>POST /api/payments/confirm-payment/[id]:</strong> Confirm payments
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>POST /api/payments/create-checkout-session:</strong> Create checkout sessions
                            </Typography>
                        </li>
                    </Box>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Development Note:</strong> Make sure your Spring Boot API is running on the correct port 
                            (8080 for development) and that CORS is properly configured to allow requests from your React frontend.
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PaymentTest; 