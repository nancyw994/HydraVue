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
  InputAdornment
} from "@mui/material";
import { MapPin, Warehouse, Sprout, Navigation, ArrowRight } from "lucide-react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
// import 你的 google gemini 相关代码...

const theme = createTheme({
  // 你的主题配置...
});

const cropTypes = [
  { value: "Wheat", label: "Wheat" },
  { value: "Corn", label: "Corn" }
  // ...其他作物类型
];

// 反向地理编码函数
const reverseGeocode = async (lat, lng) => {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      headers: {
        // 为避免 Nominatim 拒绝请求，加入自定义 User-Agent
        "User-Agent": "MyFarmApp/1.0 (contact@example.com)"
      }
    });
    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }
    const data = await response.json();
    console.log("Nominatim response:", data);
    if (data.display_name) {
      return data.display_name;
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
  }
  return "";
};

// 如果你还有其他函数，比如 updateWeather、fetchWaterAdviceGemini，都保持不变
// ...

function FarmForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    farmName: "",
    cropType: "",
    area: "",
    address: ""
  });

  // 手动输入的纬度/经度
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");

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

  // -----------------------------
  // 点击“Update Address”按钮逻辑
  // -----------------------------
  const handleUpdateAddress = async () => {
    // 1. 解析为数字
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    // 2. 校验是否有效
    if (isNaN(lat) || isNaN(lng)) {
      setSnackbar({
        open: true,
        message: "Please enter valid numbers for latitude and longitude.",
        severity: "error"
      });
      return;
    }

    if (lat < -90 || lat > 90) {
      setSnackbar({
        open: true,
        message: "Latitude must be between -90 and +90.",
        severity: "error"
      });
      return;
    }

    if (lng < -180 || lng > 180) {
      setSnackbar({
        open: true,
        message: "Longitude must be between -180 and +180.",
        severity: "error"
      });
      return;
    }

    // 3. 调用 Nominatim 反向地理编码
    const foundAddress = await reverseGeocode(lat, lng);

    if (foundAddress) {
      // 更新到表单
      setFormData((prev) => ({ ...prev, address: foundAddress }));
      // 更新到 location state
      setLocation((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
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
  };

  // -----------------------------
  // 你已有的 handleSubmit 逻辑
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);

    // 1. 获取天气数据 (如果有的话)
    // const weatherData = await updateWeather(formData.address);
    // ...

    // 2. 调用 Gemini API (如果有的话)
    // const advice = await fetchWaterAdviceGemini(...);
    // ...

    // 3. 整理最终要保存的数据
    const farmData = {
      ...formData,
      area: parseFloat(formData.area),
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      }
      // weather, waterAdvice, ...
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

  // -----------------------------
  // 自动地理定位（保留原逻辑）
  // -----------------------------
  useEffect(() => {
    if (navigator.geolocation) {
      setLocation((prev) => ({ ...prev, loading: true }));
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Auto-detected lat/lng:", latitude, longitude);
          setLocation((prev) => ({
            ...prev,
            latitude,
            longitude,
            loading: false
          }));
          // 调用 Nominatim 反向地理编码
          const addr = await reverseGeocode(latitude, longitude);
          if (addr) {
            setFormData((prev) => ({ ...prev, address: addr }));
            setSnackbar({
              open: true,
              message: "Location detected automatically",
              severity: "success"
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation((prev) => ({
            ...prev,
            loading: false,
            error: "Location access denied. Please try again."
          }));
        }
      );
    }
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // -----------------------------
  // 渲染 UI
  // -----------------------------
  return (
    <ThemeProvider theme={theme}>
      <Box component="form" onSubmit={handleSubmit}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Farm Name */}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, farmName: e.target.value }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cropType: e.target.value }))
                }
                variant="outlined"
                required
              >
                {cropTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, area: e.target.value }))
                }
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

            {/* 手动输入纬度经度 */}
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

            {/* 只读地址框 */}
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

          {/* Geolocation loading */}
          {location.loading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                justifyContent: "center",
                mt: 3,
                p: 2,
                borderRadius: 2
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Detecting your location...
              </Typography>
            </Box>
          )}

          {/* Geolocation error */}
          {location.error && (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              {location.error}
            </Alert>
          )}

          {/* 提交按钮 */}
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

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%", borderRadius: 2 }}
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
