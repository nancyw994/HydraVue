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
  Divider,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { MapPin, Warehouse, Sprout, Navigation, ArrowRight } from "lucide-react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const theme = createTheme({
  // 你的主题配置...
});

const cropTypes = [
  { value: "Wheat", label: "Wheat" },
  { value: "Corn", label: "Corn" }
  // ...其他作物类型
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
  const [latInput, setLatInput] = useState(""); // 手动输入纬度
  const [lngInput, setLngInput] = useState(""); // 手动输入经度
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Weather API 调用（保持不变）
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

  // 表单字段变更处理（地址字段保持只读，由定位或手动输入经纬度更新）
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 根据经纬度查询地址（使用 thingproxy 代理调用 Nominatim 反向地理编码 API）
  const reverseGeocode = async (lat, lng) => {
    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        const response = await fetch(nominatimUrl);

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("📍 反向地理编码结果:", data); // ✅ 确保 API 返回数据

        if (data.display_name) {
            return data.display_name;
        }
    } catch (error) {
        console.error("❌ 反向地理编码失败:", error);
    }
    return "";
};


  // 处理手动输入经纬度时，按下 Enter 键
  const handleLatLngKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // 检查输入是否为有效数字
      const lat = parseFloat(latInput);
      const lng = parseFloat(lngInput);
      if (isNaN(lat) || isNaN(lng)) {
        setSnackbar({
          open: true,
          message: "Please enter valid numbers for latitude and longitude.",
          severity: "error"
        });
        return;
      }
      // 调用反向地理编码查询地址
      const address = await reverseGeocode(lat, lng);
      if (address) {
        setFormData(prev => ({ ...prev, address }));
        setLocation(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setSnackbar({
          open: true,
          message: "Address updated from coordinates.",
          severity: "success"
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to convert coordinates to address.",
          severity: "error"
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    const weatherData = await updateWeather(formData.address);
    console.log("Updated weather:", weatherData);
    const farmData = {
      farmName: formData.farmName,
      cropType: formData.cropType,
      area: parseFloat(formData.area),
      address: formData.address,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      weather: weatherData
        ? {
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            rainfall: weatherData.rainfall
          }
        : null
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

  // 使用浏览器定位自动获取地址（如果用户不手动输入经纬度时自动调用）
  useEffect(() => {
    if (navigator.geolocation && !latInput && !lngInput) {
      setLocation(prev => ({ ...prev, loading: true }));
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(prev => ({
            ...prev,
            latitude,
            longitude,
            loading: false
          }));
          const address = await reverseGeocode(latitude, longitude);
          if (address) {
            setFormData(prev => ({ ...prev, address }));
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
            error: "Location access denied. Please enter coordinates manually."
          }));
        }
      );
    }
  }, [latInput, lngInput]);

  return (
    <ThemeProvider theme={theme}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
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
              onKeyDown={handleLatLngKeyDown}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Longitude"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              onKeyDown={handleLatLngKeyDown}
              variant="outlined"
            />
          </Grid>

          {/* 自动获取的地址，地址输入框只读 */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Navigation size={24} style={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                Address
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
      </Box>
    </ThemeProvider>
  );
}

export default FarmForm;
