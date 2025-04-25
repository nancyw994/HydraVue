// App.js
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
  Grid,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  InputAdornment
} from "@mui/material";
import {
  Sprout,
  CloudRain,
  Thermometer,
  MessageSquare,
  Warehouse,
  Navigation,
  ArrowRight
} from "lucide-react";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import AirIcon from "@mui/icons-material/Air";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import ChatBox from "./Components/ChatBox";  // 引入 ChatBox 组件
import "./App.css";

import Login from "./Components/Login";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SmartIrrigationAdvice from "./Components/SmartIrrigationAdvice";


// 创建 MUI 主题
const theme = createTheme({
  palette: {
    primary: { main: "#62958D" },
    secondary: { main: "#A3C4BC" }
  },
  typography: {
    fontFamily: "Quicksand, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
  }
});

// reverseGeocode 函数（用于获取地址）
const reverseGeocode = async (lat, lng) => {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      headers: {
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

function FarmForm({ onSubmit, onAddressChange }) {
  const [formData, setFormData] = useState({
    farmName: "",
    cropType: "",
    soilMoisture: "",
    address: ""
  });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 手动更新地址
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const farmData = {
      farmName: formData.farmName,
      cropType: formData.cropType,
      soilMoisture: parseFloat(formData.soilMoisture),
      address: formData.address,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    };
    try {
      const docRef = await addDoc(collection(db, "farms"), farmData);
      console.log("Document written with ID: ", docRef.id);
      onSubmit && onSubmit({ ...farmData });
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

  // 自动定位并更新地址
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
          const proxyUrl = `https://thingproxy.freeboard.io/fetch/${nominatimUrl}`;
          fetch(proxyUrl)
            .then(response => {
              if (!response.ok) throw new Error("Network response was not ok");
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
    <Box component="form" onSubmit={handleSubmit}>
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
            name="cropType"
            label="Crop Type"
            value={formData.cropType}
            onChange={handleInputChange}
            variant="outlined"
            required
            placeholder="Enter the primary crop type"
          />
        </Grid>
        {/* Soil Moisture */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="soilMoisture"
            type="number"
            label="Soil Moisture"
            value={formData.soilMoisture}
            onChange={handleInputChange}
            variant="outlined"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>%</Typography>
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
        {/* Detected Address (只读) */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Navigation size={24} style={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              Detected Address
            </Typography>
          </Box>
          <TextField fullWidth name="address" label="Address" value={formData.address} variant="outlined" disabled />
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
    </Box>
  );
}

/* -------------------------
   3. Smart Irrigation Advice Component
--------------------------*/
/*
function calculateWaterIndex({ cropType, temperature, rainfall, humidity }) {
  if (!cropType || temperature == null || rainfall == null || humidity == null) {
    return null;
  }
  let base = 50;
  base += (temperature - 20) * 2;
  base -= rainfall * 2;
  base -= (humidity - 50) * 0.5;
  if (cropType === "Corn") {
    base += 10;
  }
  if (base < 0) base = 0;
  if (base > 100) base = 100;
  return Math.round(base);
}
*/

/*
function SmartIrrigationAdvice({ cropType, temperature, humidity, rainfall }) {
  const index = calculateWaterIndex({ cropType, temperature, rainfall, humidity });
  const dataEnough = index !== null;
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #62958D 0%, #89AEA8 100%)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(163, 196, 188, 0.2)"
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
          Smart Irrigation Advice
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.15)"
          }}
        >
          {!dataEnough && (
            <Typography sx={{ color: "white", fontWeight: 500 }}>
              Not enough data to calculate water need.
            </Typography>
          )}
          {dataEnough && <IrrigationBar index={index} />}
        </Box>
      </CardContent>
    </Card>
  );
}
*/

/*
function IrrigationBar({ index }) {
  const arrowPosition = `${index}%`;
  let waterMessage = "Water need is moderate.";
  if (index < 33) {
    waterMessage = "Doesn't need much water now.";
  } else if (index > 66) {
    waterMessage = "Needs more water!";
  }
  return (
    <>
      <Box
        sx={{
          position: "relative",
          height: 20,
          borderRadius: 2,
          background: "linear-gradient(to right, #43a047, #FFEB3B, #e53935)"
        }}
      >
        <ArrowDropDownCircleIcon
          sx={{
            position: "absolute",
            top: -16,
            left: arrowPosition,
            transform: "translateX(-50%)",
            fontSize: 32,
            color: "#455a64"
          }}
        />
      </Box>
      <Typography sx={{ mt: 2, color: "white", fontWeight: 500, textAlign: "center" }}>
        {waterMessage}
      </Typography>
    </>
  );
}
*/

/* -------------------------
   4. Main App Component
--------------------------*/
function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState({
    temperature: null,
    humidity: null,
    rainfall: null,
    windSpeed: null
  });
  const [farmData, setFarmData] = useState({});
  const [chatMessages, setChatMessages] = useState([
    {
      role: "system",
      content: "You are a highly experienced irrigation AI. Provide short, practical advice..."
    }
  ]);
  const [userChatInput, setUserChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // 自动定位并更新天气（使用 WeatherAPI）
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
              rainfall: data.current.precip_mm,
              windSpeed: data.current.wind_kph
            });
          }
        } catch (error) {
          console.error("Weather initialization error:", error);
        }
      }
    };
    initializeWeather();
  }, []);

  // 根据地址更新天气（使用 OpenWeatherMap）
  const updateWeatherByAddress = async (addr) => {
    try {
      const OPENWEATHER_API_KEY = "5f962e327bb28abe285f21f492592f3f";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        addr
      )}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.main) {
        setWeather({
          temperature: data.main.temp,
          humidity: data.main.humidity,
          rainfall: data.rain ? data.rain["1h"] || 0 : 0,
          windSpeed: data.wind?.speed || 0
        });
      }
    } catch (err) {
      console.error("Error updating weather:", err);
    }
  };

  // 根据经纬度更新天气
  const updateWeatherByCoordinates = async (lat, lng) => {
    if (lat == null || lng == null) {
      console.warn("Invalid coordinates, cannot update weather.");
      return;
    }
    try {
      const OPENWEATHER_API_KEY = "5f962e327bb28abe285f21f492592f3f";
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.main) {
        setWeather({
          temperature: data.main.temp,
          humidity: data.main.humidity,
          rainfall: data.rain ? data.rain["1h"] || 0 : 0,
          windSpeed: data.wind?.speed || 0
        });
      }
    } catch (err) {
      console.error("Error fetching weather by coordinates:", err);
    }
  };

  // 处理 FarmForm 提交
  const handleFormSubmit = async (submittedFarmData) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setFarmData(submittedFarmData);
      await updateWeatherByAddress(submittedFarmData.address);
    } catch (err) {
      console.error("Backend call failed:", err);
      setError("Unable to generate irrigation advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 当 FarmForm 更新地址时的回调
  const handleAddressChange = async (newAddress, lat, lng) => {
    setFarmData(prev => ({ ...prev, address: newAddress, latitude: lat, longitude: lng }));
    await updateWeatherByCoordinates(lat, lng);
  };

  // ChatBox（Gemini 模型调用示例）
  const GEMINI_API_KEY = "AIzaSyCESYMiKa5rTQLP2h1A8fDWUkQH73RRFzk";
  const handleSendChatMessage = async () => {
    if (!userChatInput.trim()) return;
    const updatedMessages = [...chatMessages, { role: "user", content: userChatInput }];
    setChatMessages(updatedMessages);
    setUserChatInput("");
    setChatLoading(true);
    try {
      const response = await fetch("https://api.gemini.example.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gemini-1",
          messages: updatedMessages,
          temperature: 0.7
        })
      });
      const data = await response.json();
      const geminiReply = data.choices?.[0]?.message?.content || "No response received.";
      setChatMessages(prev => [...prev, { role: "assistant", content: geminiReply }]);
    } catch (err) {
      console.error("Gemini Chat error:", err);
      setChatMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn’t generate a response." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to top, #62958D -5%, #A3C4BC 40%, #E8F3F1 100%)",
          position: "relative"
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            pt: 4,
            pb: 3,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(8px)"
          }}
        >
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">
              <Sprout size={32} style={{ color: "#62958D" }} />
              <Typography variant="h1" sx={{ color: "#2C4D47", textShadow: "0 1px 2px rgba(255,255,255,0.2)" }}>
                Smart Farm Assistant
              </Typography>
            </Stack>
            <Typography variant="subtitle1" align="center" sx={{ mt: 2, color: "#446B64", opacity: 0.9 }}>
              Sustainable farming through intelligent irrigation management
            </Typography>
          </Container>
        </Box>
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
          <Grid container spacing={4}>
            {/* Left Column - FarmForm */}
            <Grid item xs={12} md={7}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(163, 196, 188, 0.2)",
                  borderRadius: 4
                }}
              >
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
                    <FarmForm onSubmit={handleFormSubmit} onAddressChange={handleAddressChange} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            {/* Right Column */}
            <Grid item xs={12} md={5}>
              <Stack spacing={4}>
                {/* Environmental Stats */}
                <Card
  sx={{
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(163, 196, 188, 0.2)",
    borderRadius: 4
  }}
>
  <CardContent sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ color: "#2C4D47" }}>
      Current Conditions
    </Typography>
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Temperature */}
      <Grid item xs={6} md={3}>
        <Stack alignItems="center" spacing={1}>
          <Thermometer style={{ color: "#62958D" }} size={28} />
          <Typography variant="body2" sx={{ color: "#5C7972", fontWeight: 500 }}>
            Temperature
          </Typography>
          <Typography variant="h6" sx={{ color: "#2C4D47" }}>
            {weather.temperature !== null ? `${weather.temperature}°C` : "N/A"}
          </Typography>
        </Stack>
      </Grid>

      {/* Rainfall */}
      <Grid item xs={6} md={3}>
        <Stack alignItems="center" spacing={1}>
          <CloudRain style={{ color: "#62958D" }} size={28} />
          <Typography variant="body2" sx={{ color: "#5C7972", fontWeight: 500 }}>
            Rainfall
          </Typography>
          <Typography variant="h6" sx={{ color: "#2C4D47" }}>
            {weather.rainfall !== null ? `${weather.rainfall} mm` : "N/A"}
          </Typography>
        </Stack>
      </Grid>

      {/* Humidity */}
      <Grid item xs={6} md={3}>
        <Stack alignItems="center" spacing={1}>
          <Sprout style={{ color: "#62958D" }} size={28} />
          <Typography variant="body2" sx={{ color: "#5C7972", fontWeight: 500 }}>
            Humidity
          </Typography>
          <Typography variant="h6" sx={{ color: "#2C4D47" }}>
            {weather.humidity !== null ? `${weather.humidity}%` : "N/A"}
          </Typography>
        </Stack>
      </Grid>

      {/* 🌬️ Wind Speed */}
      <Grid item xs={6} md={3}>
        <Stack alignItems="center" spacing={1}>
          <AirIcon style={{ color: "#62958D" }} />
          <Typography variant="body2" sx={{ color: "#5C7972", fontWeight: 500 }}>
            Wind Speed
          </Typography>
          <Typography variant="h6" sx={{ color: "#2C4D47" }}>
            {weather.windSpeed !== null ? `${weather.windSpeed} km/h` : "N/A"}
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  </CardContent>
</Card>

                {/* Smart Irrigation Advice Card */}
                <SmartIrrigationAdvice
                  cropType={farmData.cropType}
                  temperature={weather.temperature}
                  humidity={weather.humidity}
                  rainfall={weather.rainfall}
                  windSpeed = {weather.windSpeed}
                />
                {/* ChatBox Component */}
                <ChatBox />
                {/* Loading State */}
                {loading && (
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.92)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 4
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Typography variant="h6" sx={{ color: "#2C4D47" }}>
                          Analyzing Farm Data
                        </Typography>
                        <LinearProgress
                          sx={{
                            "& .MuiLinearProgress-bar": { backgroundColor: "#62958D" }
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
                      backdropFilter: "blur(8px)",
                      background: "rgba(255, 255, 255, 0.92)"
                    }}
                  >
                    {error}
                  </Alert>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
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
      </Box>
    </ThemeProvider>
  );
}


// App.js
//import Dashboard from "./App"; // Assuming the Dashboard function is defined in the same file
 // If App is your full dashboard

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  

  if (loadingAuth) return <div>Loading...</div>;
  if (!user) return <Login onLogin={setUser} />;

  return (
    <>
      <Button
        onClick={handleLogout}
        variant="outlined"
        sx={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: "#fff",
        color: "#62958D",
        borderColor: "#62958D",
        "&:hover": {
          backgroundColor: "#f0f0f0"
      }
    }}
  >
    Logout
  </Button>
      <Dashboard /> {/* <- use renamed component */}
    </>
  );
}

export default AppWrapper;
