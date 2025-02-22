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
  { value: "Wheat", label: "Wheat" },
  { value: "Corn", label: "Corn" },
  { value: "Rice", label: "Rice" },
  { value: "Soybean", label: "Soybean" },
  { value: "Cotton", label: "Cotton" },
  { value: "Potato", label: "Potato" },
  { value: "Tomato", label: "Tomato" },
  { value: "Cucumber", label: "Cucumber" },
  { value: "Sugarcane", label: "Sugarcane" },
  { value: "Rapeseed", label: "Rapeseed" },
  { value: "ChiliPepper", label: "Chili Pepper" },
  { value: "Spinach", label: "Spinach" }
];

// 地址自动补全组件（利用 Nominatim 搜索 API）
function AddressAutocomplete({ initialValue, onSelect }) {
  const [query, setQuery] = useState(initialValue || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
      { signal: controller.signal }
    )
      .then(response => response.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [query]);

  // 格式化地址：生成 "house_number road, suburb, city, state, postcode, country" 格式的地址
  const formatAddress = (addressData) => {
    const { house_number, road, suburb, city, state, postcode, country } =
      addressData.address || {};
    return [
      house_number && road ? `${house_number} ${road}` : road,
      suburb,
      city,
      state,
      postcode,
      country
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        fullWidth
        label="Enter full address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MapPin size={20} style={{ color: theme.palette.text.secondary }} />
            </InputAdornment>
          )
        }}
      />
      {loading && (
        <CircularProgress
          size={24}
          sx={{ position: "absolute", top: "50%", right: 16, marginTop: "-12px" }}
        />
      )}
      {results.length > 0 && (
        <List
          sx={{
            position: "absolute",
            zIndex: 1000,
            width: "100%",
            bgcolor: "background.paper",
            maxHeight: 200,
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 1,
            mt: 1
          }}
        >
          {results.map((result) => (
            <ListItem
              button
              key={result.place_id}
              onClick={() => {
                const formatted = formatAddress(result);
                setQuery(formatted);
                onSelect(formatted);
                setResults([]);
              }}
            >
              <ListItemText primary={result.display_name} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

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

  // 追踪地址是否被用户手动修改，防止自动覆盖
  const [addressEdited, setAddressEdited] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 根据地址调用 WeatherAPI 获取天气数据
  const updateWeather = async (address) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=358a237b0c7e4f56af130830252202&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.current) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "address") {
      setAddressEdited(true);
      setFormData(prev => ({ ...prev, address: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 每次点击 Complete Registration 时，先更新天气再提交数据
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 根据当前地址更新天气
    const weatherData = await updateWeather(formData.address);
    // 将 farmData、定位信息与天气数据一起传递出去
    onSubmit({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
      weather: weatherData
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

  // 自动定位获取地址（仅当用户未手动修改地址时）
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

          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`)
            .then(response => response.json())
            .then((data) => {
              if (data.display_name && !addressEdited) {
                const { house_number, road, suburb, city, state, postcode, country } = data.address || {};
                const formattedAddress = [
                  house_number && road ? `${house_number} ${road}` : road,
                  suburb,
                  city,
                  state,
                  postcode,
                  country
                ].filter(Boolean).join(", ");
                setFormData(prev => ({
                  ...prev,
                  address: formattedAddress
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
  }, [addressEdited]);

  return (
    <ThemeProvider theme={theme}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Sprout size={24} style={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600, fontFamily: 'Quicksand' }}>
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
                    <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                      acres
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Navigation size={24} style={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600, fontFamily: 'Quicksand' }}>
                Location Details
              </Typography>
            </Box>
            {/* 使用 AddressAutocomplete 组件，生成格式统一的地址，便于后续调用 WeatherAPI */}
            <AddressAutocomplete
              initialValue={formData.address}
              onSelect={(formattedAddress) => {
                setFormData(prev => ({ ...prev, address: formattedAddress }));
                setAddressEdited(true);
              }}
            />
          </Grid>
        </Grid>

        {location.loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', mt: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Detecting your location...
            </Typography>
          </Box>
        )}

        {location.error && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2, backgroundColor: 'rgba(229, 246, 253, 0.85)' }}>
            {location.error}
          </Alert>
        )}

        <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 4, height: '50px', display: 'flex', alignItems: 'center', gap: 1 }}>
          Complete Registration
          <ArrowRight size={20} />
        </Button>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default FarmForm;
