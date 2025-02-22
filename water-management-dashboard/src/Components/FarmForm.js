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
  createTheme,
  InputAdornment,
  Divider
} from "@mui/material";
import { 
  MapPin, 
  Warehouse,
  Sprout,
  Navigation,
  ArrowRight
} from 'lucide-react';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Quicksand',
      '-apple-system',
      'BlinkMacSystemFont',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  palette: {
    primary: {
      main: '#62958D',
      light: '#89AEA8',
      dark: '#4B746E',
    },
    secondary: {
      main: '#A3C4BC',
      light: '#C2DAD4',
      dark: '#7FA199',
    },
    text: {
      primary: '#2C4D47',
      secondary: '#5C7972',
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 0 0 2px rgba(98, 149, 141, 0.2)',
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '1rem',
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: 'Quicksand',
        }
      }
    }
  }
});

const cropTypes = [
  { value: "Vegetables", icon: "🥬" },
  { value: "Fruits", icon: "🍎" },
  { value: "Herbs", icon: "🌿" },
  { value: "Flowers", icon: "🌸" },
  { value: "Mixed Produce", icon: "🌾" },
  { value: "Other", icon: "📦" }
];

function FarmForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    farmName: "",
    cropType: "",
    area: "",
    address: ""
  });
  
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    loading: false,
    error: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
            });
        },
        (error) => {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: "Location access denied. Please enter manually."
          }));
        }
      );
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 2 
            }}>
              <Sprout size={24} style={{ color: theme.palette.primary.main }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontFamily: 'Quicksand'
                }}
              >
                Basic Information
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="farmName"
              label="Farm Name"
              value={formData.farmName}
              onChange={handleInputChange}
              variant="outlined"
              required
              placeholder="Enter your farm's name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Warehouse size={20} style={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
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
            >
              {cropTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{option.icon}</span>
                    <span>{option.value}</span>
                  </Box>
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontWeight: 500 
                      }}
                    >
                      acres
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 1 
            }}>
              <Navigation size={24} style={{ color: theme.palette.primary.main }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontFamily: 'Quicksand'
                }}
              >
                Location Details
              </Typography>
            </Box>
            <TextField
              fullWidth
              name="address"
              label="Farm Address"
              value={formData.address}
              onChange={handleInputChange}
              variant="outlined"
              required
              placeholder="Enter full address"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MapPin size={20} style={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {location.loading && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            justifyContent: 'center', 
            mt: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}>
            <CircularProgress size={20} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500
              }}
            >
              Detecting your location...
            </Typography>
          </Box>
        )}

        {location.error && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(229, 246, 253, 0.85)'
            }}
          >
            {location.error}
          </Alert>
        )}

        <Button 
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ 
            mt: 4,
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Complete Registration
          <ArrowRight size={20} />
        </Button>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default FarmForm;