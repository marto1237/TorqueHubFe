import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Button, Paper, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';

const PaymentPage = () => {
    const theme = useTheme();
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    const [focused, setFocused] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Ensure only numeric values for card number and CVC
        if ((name === 'number' || name === 'cvc') && !/^\d*$/.test(value)) {
            return;
        }

        // Format expiry date as MM/YY and prevent invalid months
        if (name === 'expiry') {
            let formattedValue = value.replace(/\D/g, ''); // Remove non-numeric characters

            // Ensure that the month part doesn't exceed 12
            if (formattedValue.length >= 2) {
                let month = parseInt(formattedValue.slice(0, 2), 10);
                if (month > 12) {
                    month = 12; // Set month to max 12 if entered value exceeds
                }
                formattedValue = month.toString().padStart(2, '0') + formattedValue.slice(2);
            }

            // Automatically add a slash after the month part
            if (formattedValue.length > 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }

            setCardDetails((prev) => ({ ...prev, expiry: formattedValue }));
        } else {
            setCardDetails((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleInputFocus = (e) => {
        setFocused(e.target.name);
    };

    // Validation function
    const validateForm = () => {
        const errors = {};
        const cardNumberRegex = /^\d{16}$/;
        const expiryRegex = /^\d{2}\/\d{2}$/;
        const cvcRegex = /^\d{3}$/;

        if (!cardDetails.number.match(cardNumberRegex)) {
            errors.number = 'Card number must be 16 digits.';
        }

        if (!cardDetails.name) {
            errors.name = 'Cardholder name is required.';
        }

        if (!cardDetails.expiry.match(expiryRegex)) {
            errors.expiry = 'Expiry date must be in MM/YY format.';
        }

        if (!cardDetails.cvc.match(cvcRegex)) {
            errors.cvc = 'CVC must be 3 digits.';
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Payment processed:', cardDetails);
        }
    };

    return (
        <Box
            sx={{
                padding: '20px',
                paddingTop: '50px',
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Paper elevation={3} sx={{ padding: '20px', maxWidth: 500, width: '100%' }}>
                <Typography variant="h5" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
                    Complete Your Payment
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Cards
                        cvc={cardDetails.cvc}
                        expiry={cardDetails.expiry}
                        focused={focused}
                        name={cardDetails.name}
                        number={cardDetails.number}
                    />
                </Box>

                {/* Payment Form */}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Card Number"
                                name="number"
                                value={cardDetails.number}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="1234 1234 1234 1234"
                                inputProps={{ maxLength: 16 }} // Limit to 16 digits
                                error={!!errors.number}
                                helperText={errors.number}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Cardholder Name"
                                name="name"
                                value={cardDetails.name}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="John Doe"
                                error={!!errors.name}
                                helperText={errors.name}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Expiry Date (MM/YY)"
                                name="expiry"
                                value={cardDetails.expiry}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="MM/YY"
                                inputProps={{ maxLength: 5 }} // Limit to MM/YY format
                                error={!!errors.expiry}
                                helperText={errors.expiry}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="CVC"
                                name="cvc"
                                value={cardDetails.cvc}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="123"
                                inputProps={{ maxLength: 3 }} // Limit to 3 digits
                                error={!!errors.cvc}
                                helperText={errors.cvc}
                                variant="outlined"
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
                                variant="contained"
                                color="primary"
                                type="submit"
                                sx={{ padding: '12px' }}
                            >
                                Pay Now
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default PaymentPage;
