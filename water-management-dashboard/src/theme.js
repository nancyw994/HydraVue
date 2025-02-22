import { createTheme } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: [
      "Quicksand",
      "-apple-system",
      "BlinkMacSystemFont",
      "Arial",
      "sans-serif"
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      letterSpacing: "0.02em",
      fontFamily: "Quicksand"
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
      fontFamily: "Quicksand"
    },
    h6: {
      fontFamily: "Quicksand",
      fontWeight: 600
    },
    subtitle1: {
      fontSize: "1.1rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
      fontWeight: 500
    }
  },
  palette: {
    primary: {
      main: "#62958D",
      light: "#89AEA8",
      dark: "#4B746E"
    },
    secondary: {
      main: "#A3C4BC",
      light: "#C2DAD4",
      dark: "#7FA199"
    },
    text: {
      primary: "#2C4D47",
      secondary: "#5C7972"
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 500,
          fontFamily: "Quicksand"
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "12px"
        }
      }
    }
  }
});

export default theme;