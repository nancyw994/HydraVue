import React, { useState, useEffect } from "react";
import {
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
import { Sprout, CloudRain, Thermometer, MessageSquare } from "lucide-react";
import { ThemeProvider } from "@mui/material/styles";
import FarmForm from "./Components/FarmForm";
import ChatBox from "./Components/ChatBox";
import theme from "./theme"; // 我们会把主题配置移到单独的文件
import "./App.css";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState({
    temperature: null,
    humidity: null,
    rainfall: null
  });

  useEffect(() => {
    const initializeWeather = async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=358a237b0c7e4f56af130830252202&q=${latitude},${longitude}`
          );
          const data = await response.json();
          
          if (data.current) {
            setWeather({
              temperature: data.current.temp_c,
              humidity: data.current.humidity,
              rainfall: data.current.precip_mm
            });
          }
        } catch (error) {
          console.error("Weather initialization error:", error);
        }
      }
    };

    initializeWeather();
  }, []);

  const updateWeatherByAddress = async (address) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=358a237b0c7e4f56af130830252202&q=${encodeURIComponent(address)}`
      );
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

  const handleFormSubmit = async (farmData) => {
    setLoading(true);
    setError(null);
    
    try {
      setAdvice(farmData.waterAdvice || "No advice provided.");
      await updateWeatherByAddress(farmData.address);
    } catch (err) {
      console.error("Error in form submission:", err);
      setError("Unable to generate irrigation advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #E8F3F1 0%, #A3C4BC 100%)',
          position: 'relative',
          pb: 8 // Add padding bottom to avoid chat button overlap
        }}
      >
        {/* Header Section */}
        <Box 
          sx={{ 
            pt: 4, 
            pb: 3,
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Sprout size={32} color="#62958D" />
                <Typography variant="h1" sx={{ 
                  color: '#2C4D47',
                  textShadow: '0 1px 2px rgba(255,255,255,0.2)'
                }}>
                  Smart Farm Assistant
                </Typography>
              </Stack>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-[#62958D] hover:bg-[#4B746E] text-white rounded-full p-2 flex items-center gap-2 transition-all duration-200 shadow-md ${
                  isOpen ? 'bg-[#4B746E]' : ''
                }`}
              >
                <MessageSquare size={20} />
                <span className="text-sm font-medium">Chat with AI</span>
              </button>
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
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
          <Grid container spacing={4}>
            {/* Left Column - Form */}
            <Grid item xs={12} md={7}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(163, 196, 188, 0.2)',
                borderRadius: 4,
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
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(163, 196, 188, 0.2)',
                  borderRadius: 4,
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#2C4D47' }}>
                      Current Conditions
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <Stack alignItems="center" spacing={1}>
                          <Thermometer color="#62958D" size={28} />
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
                          <CloudRain color="#62958D" size={28} />
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
                          <Sprout color="#62958D" size={28} />
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
                    borderRadius: 4,
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                        Smart Irrigation Advice
                      </Typography>
                      <Box sx={{ 
                        mt: 2,
                        p: 2.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      }}>
                        <Typography sx={{ 
                          color: 'white',
                          fontWeight: 500,
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {advice}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {loading && (
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 4,
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Typography variant="h6" sx={{ color: '#2C4D47' }}>
                          Analyzing Farm Data
                        </Typography>
                        <LinearProgress sx={{ 
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#62958D'
                          }
                        }} />
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Error State */}
                {error && (
                  <Alert 
                    severity="error"
                    sx={{ 
                      borderRadius: 2,
                      backdropFilter: 'blur(8px)',
                      background: 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Chat Component */}
                <ChatBox />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;