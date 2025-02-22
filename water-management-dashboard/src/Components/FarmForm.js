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
import { MapPin, Warehouse, Sprout, Navigation, ArrowRight } from "lucide-react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const theme = createTheme({
  // 你的主题配置...
});

const cropTypes = [
  { value: "Wheat", label: "Wheat" },
  { value: "Corn", label: "Corn" }
  // ...其他作物类型
];

const GEMINI_API_KEY = "AIzaSyCESYMiKa5rTQLP2h1A8fDWUkQH73RRFzk";

// 使用 Google Gemini API 生成用水建议
const fetchWaterAdviceGemini = async (formData, safeWeatherData, location) => {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const promptText = `You are an expert agricultural irrigation consultant specialized in sustainable farming. Based on the following farm details:
  - Address: ${formData.address}
  - Crop type: ${formData.cropType}
  - Farm area: ${formData.area} acres
  - Location coordinates: (${location.latitude}, ${location.longitude})
  - Current weather conditions: Temperature ${safeWeatherData.temperature}°C, Humidity ${safeWeatherData.humidity}%, Rainfall ${safeWeatherData.rainfall} 
  Please provide a detailed recommendation(Give a specific number based on pervious dataset) for the daily water usage per acre in liters. Explain your reasoning briefly, including factors such as crop water requirements, weather conditions, and local climate considerations. Give your answer in english
`;
  console.log(promptText);
  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error fetching water advice from Gemini:", error);
    return null;
  }
};

const updateWeather = async (address) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=358a237b0c7e4f56af130830252202&q=${encodeURIComponent(address)}`
    );
    const data = await response.json();
    console.log("Weather API data:", data);
    if (data && data.current) {
      return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        rainfall: data.current.precip_mm
      };
    }
  } catch (error) {
    console.error("Error updating weather:", error);
  }
  return null;
};

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
    message: "",
    severity: "success"
  });
  const [waterAdvice, setWaterAdvice] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    
    // 获取天气数据
    const weatherData = await updateWeather(formData.address);
    console.log("Updated weather:", weatherData);
    const safeWeatherData = weatherData || {
      temperature: "N/A",
      humidity: "N/A",
      rainfall: "N/A"
    };

    // 调用 Gemini API 获取用水建议
    const advice = await fetchWaterAdviceGemini(formData, safeWeatherData, location);
    console.log("Water advice from Gemini:", advice);
    setWaterAdvice(advice);

    const farmData = {
      farmName: formData.farmName,
      cropType: formData.cropType,
      area: parseFloat(formData.area),
      address: formData.address,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      weather: safeWeatherData,
      waterAdvice: advice
    };

    try {
      const docRef = await addDoc(collection(db, "farms"), farmData);
      console.log("Document written with ID: ", docRef.id);
      onSubmit && onSubmit(farmData);
      setSnackbar({
        open: true,
        message: "Farm registration submitted successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      setSnackbar({
        open: true,
        message: "Failed to submit registration. Please try again.",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // 自动定位并调用反向地理编码获取地址
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
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
          // 此处仍使用 thingproxy 代理请求，如果不稳定建议换用其他服务或 Google Geocoding API
          const proxyUrl = `https://thingproxy.freeboard.io/fetch/${nominatimUrl}`;
          fetch(proxyUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then(data => {
              console.log("Reverse geocode data:", data);
              if (data.display_name) {
                setFormData(prev => ({ ...prev, address: data.display_name }));
                setSnackbar({
                  open: true,
                  message: "Location detected successfully",
                  severity: "success"
                });
              }
            })
            .catch(error => {
              console.error("Reverse geocode error:", error);
              setLocation(prev => ({
                ...prev,
                error: "Failed to fetch address. Please try again."
              }));
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: "Location access denied. Please try again."
          }));
        }
      );
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box component="form" onSubmit={handleSubmit}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Sprout size={24} style={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
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
                  )
                }}
              />
            </Grid>

            {/* Crop Type */}
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
                {cropTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{option.icon}</span>
                      <span>{option.value}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Farm Area */}
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
                      <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        acres
                      </Typography>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Detected Address (只读) */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Navigation size={24} style={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                  Detected Address
                </Typography>
              </Box>
              <TextField
                fullWidth
                name="address"
                label="Address"
                value={formData.address}
                variant="outlined"
                disabled
              />
            </Grid>
          </Grid>

          {location.loading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                justifyContent: "center",
                mt: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.5)"
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Detecting your location...
              </Typography>
            </Box>
          )}

          {location.error && (
            <Alert
              severity="info"
              sx={{ mt: 3, borderRadius: 2, backgroundColor: "rgba(229, 246, 253, 0.85)" }}
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
              height: "50px",
              display: "flex",
              alignItems: "center",
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
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%", borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default FarmForm;
