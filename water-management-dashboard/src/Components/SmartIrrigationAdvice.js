import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";

/**
 * 判断数据是否足够，若不足返回 null
 */
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

/**
 * 在同一个卡片内，既显示“温度/湿度/降雨量”信息
 * 又显示灌溉需求进度条和箭头
 */
export default function SmartIrrigationAdvice({
  cropType,
  temperature,
  rainfall,
  humidity
}) {
  const index = calculateWaterIndex({ cropType, temperature, rainfall, humidity });
  const dataEnough = (index !== null);

  // 保留原先“渐变背景 + 白色文字”的风格
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

        {/* 内部box，显示“温度/湿度/降雨量 + 需求进度条” */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.15)"
          }}
        >
          {/* 先显示温度/湿度/降雨量 */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: "white", fontWeight: 500 }}>
              Temperature: {temperature != null ? `${temperature}°C` : "N/A"}
              {",  "}
              Rainfall: {rainfall != null ? `${rainfall} mm` : "N/A"}
              {",  "}
              Humidity: {humidity != null ? `${humidity}%` : "N/A"}
            </Typography>
          </Box>

          {/* 如果数据不足 => 不显示箭头 */}
          {!dataEnough && (
            <Typography sx={{ color: "white", fontWeight: 500 }}>
              Not enough data to calculate water need.
            </Typography>
          )}

          {/* 如果数据足够 => 箭头 + 简短文案 */}
          {dataEnough && (
            <>
              {/* 灌溉需求条 */}
              <IrrigationBar index={index} />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * 渲染进度条 + 箭头 + 简短文案
 */
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

      {/* 简短提示 */}
      <Typography sx={{ mt: 2, color: "white", fontWeight: 500, textAlign: "center" }}>
        {waterMessage}
      </Typography>
    </>
  );
}
