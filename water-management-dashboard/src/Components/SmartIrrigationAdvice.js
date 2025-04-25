import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import { calculateETc, normalizeWaterIndex } from "./utils";

export default function SmartIrrigationAdvice({
  cropType,
  temperature,
  rainfall,
  humidity,
  windSpeed
}) {
  const etc = calculateETc({ temperature, humidity, windSpeed, cropType });
  const index = normalizeWaterIndex(etc);
  const dataEnough = !isNaN(etc) && index !== null;

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

          {dataEnough && (
            <>
              <IrrigationBar index={index} />
              <Typography
                sx={{
                  mt: 2,
                  color: "white",
                  fontWeight: 500,
                  textAlign: "center"
                }}
              >
                Estimated ET<sub>c</sub>: {etc.toFixed(2)} mm/day
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function IrrigationBar({ index }) {
  const arrowPosition = `${index}%`;
  let waterMessage = "Water need is moderate.";
  if (index < 33) waterMessage = "Doesn't need much water now.";
  else if (index > 66) waterMessage = "Needs more water!";

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

      <Typography
        sx={{
          mt: 2,
          color: "white",
          fontWeight: 500,
          textAlign: "center",
          fontFamily:"Work Sans, sans-serif",
          letterSpacing: "0.5px"
        }}
      >
        {waterMessage}
      </Typography>
    </>
  );
}
