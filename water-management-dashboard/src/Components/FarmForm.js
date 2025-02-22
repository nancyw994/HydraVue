import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  ThemeProvider,
  createTheme,
  InputAdornment
} from "@mui/material";
import { MapPin, Warehouse, Sprout, Navigation, ArrowRight } from "lucide-react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const theme = createTheme({
  // 你的主题配置...
});

// 使用 AllOrigins 代理的 reverseGeocode 函数
const reverseGeocode = async (lat, lng) => {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const allOriginsUrl = `https://api.allorigins.hexocode.repl.co/get?disableCache=true&url=${encodeURIComponent(nominatimUrl)}`;
    const response = await fetch(allOriginsUrl);
    if (!response.ok) {
      throw new Error(`AllOrigins error: ${response.status}`);
    }
    const data = await response.json();
    // AllOrigins 返回的数据在 data.contents 内，是字符串格式的 JSON
    const contents = JSON.parse(data.contents);
    console.log("Reverse geocode data:", contents);
    return contents.display_name || "";
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "";
  }
};

const fetchWaterAdviceGemini = async (formData, safeWeatherData, location) => {
  const genAI = new GoogleGenerativeAI("AIzaSyCESYMiKa5rTQLP2h1A8fDWUkQH73RRFzk");
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const promptText = `You are an expert agricultural irrigation consultant specialized in sustainable farming. Based on the following farm details:
  - Address: ${formData.address}
  - Crop type: ${formData.cropType}
  - Soil moisture: ${formData.soilMoisture}%
  - Location coordinates: (${location.latitude}, ${location.longitude})
  - Current weather conditions: Temperature ${safeWeatherData.temperature}°C, Humidity ${safeWeatherData.humidity}%, Rainfall ${safeWeatherData.rainfall}
  Please provide a detailed recommendation (Give a specific number based on previous dataset) for the daily water usage per acre in liters. Explain your reasoning briefly, including factors such as crop water requirements, weather conditions, and local climate considerations. Give your answer in English.
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

function FarmForm({ onSubmit, onAddressChange }) {
  const [formData, setFormData] = useState({
    farmName: "",
    cropType: "",
    soilMoisture: "",
    address: ""
  });
  // 手动输入经纬度状态
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  // 用于地理定位状态
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

  // 使用手动输入的经纬度更新地址
  const handleUpdateAddress = async () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSnackbar({
        open: true,
        message: "Please enter valid latitude and longitude values.",
        severity: "error"
      });
      return;
    }

    const foundAddress = await reverseGeocode(lat, lng);
    if (foundAddress) {
      setFormData(prev => ({ ...prev, address: foundAddress }));
      setLocation({ latitude: lat, longitude: lng, loading: false, error: null });
      setSnackbar({
        open: true,
        message: "Address updated from coordinates.",
        severity: "success"
      });
      onAddressChange && onAddressChange(foundAddress, lat, lng);
    } else {
      setSnackbar({
        open: true,
        message: "Failed to convert coordinates to address.",
        severity: "error"
      });
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    const weatherData = await updateWeather(formData.address);
    console.log("Updated weather:", weatherData);
    const safeWeatherData = weatherData || {
      temperature: "N/A",
      humidity: "N/A",
      rainfall: "N/A"
    };

    const advice = await fetchWaterAdviceGemini(formData, safeWeatherData, location);
    console.log("Water advice from Gemini:", advice);
    setWaterAdvice(advice);

    const farmData = {
      ...formData,
      soilMoisture: parseFloat(formData.soilMoisture),
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      weather: safeWeatherData,
      waterAdvice: advice
    };

    try {
      const docRef = await addDoc(collection(db, "farms"), farmData);
      console.log("Document written with ID:", docRef.id);
      onSubmit && onSubmit(farmData);
      setSnackbar({
        open: true,
        message: "Farm registration submitted successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error adding document:", error);
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
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Auto-detected lat/lng:", latitude, longitude);
          setLocation(prev => ({
            ...prev,
            latitude,
            longitude,
            loading: false
          }));
          const addr = await reverseGeocode(latitude, longitude);
          console.log("Auto-detected address:", addr);
          if (addr) {
            setFormData(prev => ({ ...prev, address: addr }));
            setSnackbar({
              open: true,
              message: "Location detected automatically",
              severity: "success"
            });
          }
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                {/* 在此添加 cropTypes 选项 */}
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

            {/* 手动输入经纬度 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                variant="outlined"
                placeholder="e.g. -35.1234"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                variant="outlined"
                placeholder="e.g. 149.1234"
              />
            </Grid>

            {/* Update Address 按钮 */}
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleUpdateAddress}>
                Update Address
              </Button>
            </Grid>

            {/* 只读地址 */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Navigation size={24} style={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Current Address
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
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              {location.error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
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
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%", borderRadius: 2 }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default FarmForm;
