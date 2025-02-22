import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Divider,
  Stack,
  Grid  // Added Grid import
} from "@mui/material";
import { Droplet, Leaf, Sun } from 'lucide-react';
import FarmForm from "./Components/FarmForm";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: '#0EA5E9',
      light: '#38BDF8',
      dark: '#0369A1',
    },
    secondary: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#15803D',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8FAFC',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    }
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#64748B',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        }
      }
    }
  }
});

function App() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (farmData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://<your-cloud-function-url>/getIrrigationAdvice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmData)
      });

      if (!response.ok) throw new Error('Failed to get irrigation advice');
      const data = await response.json();
      setAdvice(data.advice);
    } catch (error) {
      console.error("Backend call failed:", error);
      setError("Unable to generate irrigation advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)'
      }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            pt: 3, 
            pb: 2,
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Droplet size={24} className="text-blue-500" />
              <Typography variant="h1">
                Smart Irrigation
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {/* Left Column - Form */}
            <Grid item xs={12} md={7}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h2" gutterBottom>
                        Farm Details
                      </Typography>
                      <Typography variant="subtitle1">
                        Enter your farm information to get personalized irrigation advice
                      </Typography>
                    </Box>
                    <FarmForm onSubmit={handleFormSubmit} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Results & Stats */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                {/* Quick Stats */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Conditions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Stack alignItems="center" spacing={1}>
                          <Sun className="text-amber-500" />
                          <Typography variant="body2" color="text.secondary">
                            Sunny
                          </Typography>
                          <Typography variant="h6">
                            24°C
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack alignItems="center" spacing={1}>
                          <Droplet className="text-blue-500" />
                          <Typography variant="body2" color="text.secondary">
                            Humidity
                          </Typography>
                          <Typography variant="h6">
                            65%
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack alignItems="center" spacing={1}>
                          <Leaf className="text-green-500" />
                          <Typography variant="body2" color="text.secondary">
                            Soil
                          </Typography>
                          <Typography variant="h6">
                            Moist
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Advice Display */}
                {loading && (
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h6">
                          Generating Advice
                        </Typography>
                        <LinearProgress />
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {error && (
                  <Alert 
                    severity="error"
                    variant="outlined"
                  >
                    {error}
                  </Alert>
                )}

                {advice && !loading && !error && (
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                    color: 'white'
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                        Irrigation Recommendations
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {advice}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;