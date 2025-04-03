import React, { useState } from 'react';
import { 
    Box, Typography, TextField, Grid, Button, Paper, Alert 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

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

        if ((name === 'number' || name === 'cvc') && !/^\d*$/.test(value)) return;

        if (name === 'expiry') {
            let formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                let month = Math.min(parseInt(formattedValue.slice(0, 2), 10), 12);
                formattedValue = month.toString().padStart(2, '0') + formattedValue.slice(2);
            }
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

    const validateForm = () => {
        const errors = {};
        const cardNumberRegex = /^\d{16}$/;
        const expiryRegex = /^\d{2}\/\d{2}$/;
        const cvcRegex = /^\d{3}$/;

        if (!cardDetails.number.match(cardNumberRegex)) errors.number = 'Card number must be 16 digits.';
        if (!cardDetails.name.trim()) errors.name = 'Cardholder name is required.';
        if (!cardDetails.expiry.match(expiryRegex)) errors.expiry = 'Expiry must be in MM/YY format.';
        if (!cardDetails.cvc.match(cvcRegex)) errors.cvc = 'CVC must be 3 digits.';

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Processing payment with:', cardDetails);
            // simulate processing (or add your API logic)
            setTimeout(() => {
                navigate('/payment-success'); // ← Change this route to your confirmation page
            }, 500);
        }
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
                        color: theme.palette.primary.main,
                        fontFamily: theme.typography.fontFamily
                    }}
                >
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
                                inputProps={{ maxLength: 16 }}
                                error={!!errors.number}
                                helperText={errors.number}
                                variant="filled"
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
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Expiry Date"
                                name="expiry"
                                value={cardDetails.expiry}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="MM/YY"
                                inputProps={{ maxLength: 5 }}
                                error={!!errors.expiry}
                                helperText={errors.expiry}
                                variant="filled"
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
                                inputProps={{ maxLength: 3 }}
                                error={!!errors.cvc}
                                helperText={errors.cvc}
                                variant="filled"
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
                                sx={{
                                    paddingY: 1.5,
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    letterSpacing: '0.5px'
                                }}
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
