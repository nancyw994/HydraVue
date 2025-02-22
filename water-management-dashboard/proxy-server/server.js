// server.js
require('dotenv').config();
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// 代理路由：当前端请求 /api/gemini 时，服务器转发请求给 Gemini API
app.post("/api/gemini", async (req, res) => {
  const requestBody = req.body;
  // 构造 Gemini API 的 URL，请确保你在 .env 文件中设置了 GEMINI_API_KEY
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-pro-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
