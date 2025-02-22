import React, { useState, useEffect } from "react";
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
  Stack,
  Grid
} from "@mui/material";
import { Sprout, CloudRain, Thermometer } from 'lucide-react';
import FarmForm from "./Components/FarmForm";
import "./App.css";

// 导入 Google Fonts CSS in public/index.html:
// <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600&display=swap" rel="stylesheet">

const theme = createTheme({
  typography: {
    fontFamily: [
      'Quicksand',
      '-apple-system',
      'BlinkMacSystemFont',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontFamily: 'Quicksand',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontFamily: 'Quicksand',
    },
    h6: {
      fontFamily: 'Quicksand',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1.1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
      fontWeight: 500,
    }
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
          fontFamily: 'Quicksand',
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        }
      }
    }
  }
});

function App() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 用于存储天气数据
  const [weather, setWeather] = useState({
    temperature: null,
    humidity: null,
    rainfall: null
  });

  // 初始通过定位更新天气（可选）
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.weatherapi.com/v1/current.json?key=358a237b0c7e4f56af130830252202&q=${latitude},${longitude}`)
            .then(response => response.json())
            .then(data => {
              if(data.current) {
                setWeather({
                  temperature: data.current.temp_c,
                  humidity: data.current.humidity,
                  rainfall: data.current.precip_mm
                });
              }
            })
            .catch(err => {
              console.error("Weather API error:", err);
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  // 更新天气的函数，根据传入的地址字符串查询天气
  const updateWeatherByAddress = async (address) => {
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=358a237b0c7e4f56af130830252202&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data.current) {
        setWeather({
          temperature: data.current.temp_c,
          humidity: data.current.humidity,
          rainfall: data.current.precip_mm
        });
      }
    } catch (err) {
      console.error("Error updating weather:", err);
    }
  };

  // 当点击 Complete Registration 时，除了调用后端获取建议，还更新天气信息
  const handleFormSubmit = async (farmData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://<your-cloud-function-url>/getIrrigationAdvice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmData)
      });

      if (!response.ok) {
        throw new Error('Failed to get irrigation advice');
      }

      const data = await response.json();
      setAdvice(data.advice);

      // 使用用户输入的地址更新天气信息
      await updateWeatherByAddress(farmData.address);
    } catch (err) {
      console.error("Backend call failed:", err);
      setError("Unable to generate irrigation advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to top, #62958D -5%, #A3C4BC 40%, #E8F3F1 100%)',
        position: 'relative',
      }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            pt: 4, 
            pb: 3,
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">
              <Sprout size={32} style={{ color: '#62958D' }} />
              <Typography variant="h1" sx={{ 
                color: '#2C4D47',
                textShadow: '0 1px 2px rgba(255,255,255,0.2)'
              }}>
                Smart Farm Assistant
              </Typography>
            </Stack>
            <Typography 
              variant="subtitle1" 
              align="center" 
              sx={{ 
                mt: 2, 
                color: '#446B64',
                opacity: 0.9
              }}
            >
              Sustainable farming through intelligent irrigation management
            </Typography>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 2, position: 'relative' }}>
          <Grid container spacing={4}>
            {/* Left Column - Form */}
            <Grid item xs={12} md={7}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(163, 196, 188, 0.2)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="h2" color="#2C4D47" gutterBottom>
                        Your Farm Profile
                      </Typography>
                      <Typography variant="subtitle1" color="#5C7972">
                        Let's optimize your irrigation system with smart technology
                      </Typography>
                    </Box>
                    <FarmForm onSubmit={handleFormSubmit} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={5}>
              <Stack spacing={4}>
                {/* Environmental Stats */}
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(163, 196, 188, 0.2)',
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#2C4D47' }}>
                      Current Conditions
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <Stack alignItems="center" spacing={1}>
                          <Thermometer style={{ color: '#62958D' }} size={28} />
                          <Typography variant="body2" sx={{ color: '#5C7972', fontWeight: 500 }}>
                            Temperature
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#2C4D47' }}>
                            {weather.temperature !== null ? `${weather.temperature}°C` : "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack alignItems="center" spacing={1}>
                          <CloudRain style={{ color: '#62958D' }} size={28} />
                          <Typography variant="body2" sx={{ color: '#5C7972', fontWeight: 500 }}>
                            Rainfall
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#2C4D47' }}>
                            {weather.rainfall !== null ? `${weather.rainfall} mm` : "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack alignItems="center" spacing={1}>
                          <Sprout style={{ color: '#62958D' }} size={28} />
                          <Typography variant="body2" sx={{ color: '#5C7972', fontWeight: 500 }}>
                            Humidity
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#2C4D47' }}>
                            {weather.humidity !== null ? `${weather.humidity}%` : "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Advice Card */}
                {advice && !loading && !error && (
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #62958D 0%, #89AEA8 100%)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(163, 196, 188, 0.2)',
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                        Smart Irrigation Advice
                      </Typography>
                      <Box sx={{ 
                        mt: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      }}>
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                          {advice}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {loading && (
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Typography variant="h6" sx={{ color: '#2C4D47' }}>
                          Analyzing Farm Data
                        </Typography>
                        <LinearProgress 
                          sx={{ 
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#62958D'
                            }
                          }} 
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Error State */}
                {error && (
                  <Alert 
                    severity="error"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      backdropFilter: 'blur(8px)',
                      background: 'rgba(255, 255, 255, 0.92)',
                      border: '1px solid rgba(163, 196, 188, 0.2)',
                    }}
                  >
                    {error}
                  </Alert>
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
