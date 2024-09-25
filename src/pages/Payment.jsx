import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Button, MenuItem, FormControl, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { VisaCreditCard as VisaCard } from "react-fancy-visa-card";

const PaymentPage = () => {
    const theme = useTheme(); // Access the Material-UI theme
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expirationMonth: '',
        expirationYear: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };

    return (
        <Box
            sx={{
                padding: '20px',
                paddingTop: '100px',
                backgroundColor: theme.palette.background.default, // Background color from theme
                minHeight: '100vh'
            }}
        >
            <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
                Complete Your Payment
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                {/* VisaCard component with themed color scheme */}
                <VisaCard
                    cardNumber={cardDetails.number}
                    cardHolder={cardDetails.name}
                    expiryMonth={cardDetails.expirationMonth}
                    expiryYear={cardDetails.expirationYear}
                    cvv={cardDetails.cvv}
                />
            </Box>

        </Box>
    );
};

export default PaymentPage;
