import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { predictCarPrice } from '../components/configuration/CarPriceApi';

const CarPricePredictor = () => {
  const theme = useTheme();

  // State for form fields
  const [carDetails, setCarDetails] = useState({
    year: '',
    manufacturer: '',
    model: '',
    condition: '',
    cylinders: '',
    fuel: '',
    odometer: '',
    transmission: '',
    drive: '',
    type: '',
    paint_color: '',
    state: ''
  });

  // State for the predicted price
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [histogram, setHistogram] = useState(null);
  const [error, setError] = useState(null);

  // Handle changes in any input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    setPredictedPrice(null);

      const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
      if (!userDetails || !userDetails.id) {
        setError("You must be logged in to use the car price predictor.");
        return;
      }
      
      try {
        // Call the helper instead of doing fetch here
        const data = await predictCarPrice(carDetails);
        console.log(data);
  
        // data is the full JSON response from your API
        // e.g., { predicted_price: 12345.67 }
        setPredictedPrice(data.average_predicted_price);
        setHistogram(data.histogram);
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      }
  };

  return (
    <Box sx={{ padding: '20px', paddingTop: '100px', minHeight: '100vh', backgroundColor: theme.palette.background.paper }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Card sx={{ borderRadius: '15px', overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Car Price Predictor
              </Typography>

              <Grid container spacing={2}>
                {/* YEAR */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    name="year"
                    label="Year"
                    value={carDetails.year}
                    onChange={handleChange}
                  />
                </Grid>

                {/* MANUFACTURER */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    variant="filled"
                    name="manufacturer"
                    label="Manufacturer"
                    value={carDetails.manufacturer}
                    onChange={handleChange}
                  />
                </Grid>

                {/* MODEL */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    variant="filled"
                    name="model"
                    label="Model"
                    value={carDetails.model}
                    onChange={handleChange}
                  />
                </Grid>

                {/* CONDITION */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    name="condition"
                    label="Condition"
                    value={carDetails.condition}
                    onChange={handleChange}
                  >
                    {['new', 'like new', 'excellent', 'good', 'fair', 'salvage'].map((cond) => (
                      <MenuItem key={cond} value={cond}>
                        {cond}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* CYLINDERS */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    name="cylinders"
                    label="Cylinders"
                    value={carDetails.cylinders}
                    onChange={handleChange}
                  >
                    {['4 cylinders', '6 cylinders', '8 cylinders', '10 cylinders', 'other'].map((cyl) => (
                      <MenuItem key={cyl} value={cyl}>
                        {cyl}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* FUEL */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    name="fuel"
                    label="Fuel"
                    value={carDetails.fuel}
                    onChange={handleChange}
                  >
                    {['gas', 'diesel', 'hybrid', 'electric', 'other'].map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* ODOMETER */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    name="odometer"
                    label="Odometer"
                    value={carDetails.odometer}
                    onChange={handleChange}
                  />
                </Grid>

                {/* TRANSMISSION */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    name="transmission"
                    label="Transmission"
                    value={carDetails.transmission}
                    onChange={handleChange}
                  >
                    {['automatic', 'manual', 'other'].map((trans) => (
                      <MenuItem key={trans} value={trans}>
                        {trans}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* DRIVE */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    name="drive"
                    label="Drive"
                    value={carDetails.drive}
                    onChange={handleChange}
                  >
                    {['fwd', 'rwd', '4wd'].map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* TYPE */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    name="type"
                    label="Type"
                    value={carDetails.type}
                    onChange={handleChange}
                  >
                    {['SUV', 'sedan', 'truck', 'coupe', 'hatchback', 'wagon', 'other'].map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* PAINT COLOR */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    name="paint_color"
                    label="Paint Color"
                    value={carDetails.paint_color}
                    onChange={handleChange}
                  />
                </Grid>

                {/* STATE */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    name="state"
                    label="State"
                    value={carDetails.state}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Predict Price
                </Button>
              </Box>

              {predictedPrice !== null && (
                <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                  Predicted Price: ${predictedPrice}
                </Typography>
              )}

                {histogram && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Price Distribution Histogram:</Typography>
                    <img src={`data:image/png;base64,${histogram}`} alt="Price Distribution Histogram" width="100%" />
                </Box>
                )}


              {error && (
                <Typography variant="body1" color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarPricePredictor;
