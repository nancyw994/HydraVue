import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  ThemeProvider,
  createTheme
} from "@mui/material";
import { 
  MapPin, 
  Warehouse
} from 'lucide-react';

// Custom theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#f9a825',
      light: '#fbc02d',
      dark: '#f57f17',
    }
  }
});

const cropTypes = [
  "Vegetables",
  "Fruits",
  "Herbs",
  "Flowers",
  "Mixed Produce",
  "Other"
];

function FarmForm({ onSubmit }) {
  // Form data state
  const [formData, setFormData] = useState({
    farmName: "",
    cropType: "",
    area: "",
    address: ""
  });
  
  // Location state
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    loading: false,
    error: null
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude
    });
    setSnackbar({
      open: true,
      message: 'Farm registration submitted successfully!',
      severity: 'success'
    });
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Get location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: true }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(prev => ({
            ...prev,
            latitude,
            longitude,
            loading: false
          }));

          // Reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then((response) => response.json())
            .then((data) => {
              if (data.display_name) {
                setFormData(prev => ({
                  ...prev,
                  address: data.display_name
                }));
                setSnackbar({
                  open: true,
                  message: 'Location detected successfully',
                  severity: 'success'
                });
              }
            })
            .catch((error) => {
              setLocation(prev => ({
                ...prev,
                error: "Failed to fetch address. Please enter manually."
              }));
              setSnackbar({
                open: true,
                message: 'Failed to detect location. Please enter address manually.',
                severity: 'error'
              });
            });
        },
        (error) => {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: "Location access denied. Please enter address manually."
          }));
        }
      );
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                mb: 4 
              }}>
                <Warehouse className="mr-2" />
                Farm Registration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="farmName"
                    label="Farm Name"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    helperText="Enter your farm's business or trading name"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="cropType"
                    label="Primary Crop Type"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    helperText="Select your main type of produce"
                  >
                    {cropTypes.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="area"
                    type="number"
                    label="Farm Area"
                    value={formData.area}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    helperText="Enter area in acres"
                    InputProps={{
                      endAdornment: <Typography color="text.secondary">acres</Typography>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address"
                    label="Farm Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    helperText="Full address of your farm location"
                    InputProps={{
                      startAdornment: <MapPin className="mr-2 text-gray-400" size={20} />
                    }}
                  />
                </Grid>
              </Grid>

              {location.loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Detecting location...
                  </Typography>
                </Box>
              )}

              {location.error && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {location.error}
                </Alert>
              )}

              <Button 
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mt: 4 }}
              >
                Register Farm
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default FarmForm;