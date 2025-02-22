# HydraVue

## Table of Contents
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [System Integration & Testing](#system-integration--testing)
- [Deployment](#deployment)

---

## Project Overview
This project is an AI-driven water resource management system that helps farmers optimize irrigation strategies. It integrates geolocation services, Firebase for backend processing, and AI-powered irrigation advice.

### Features
- User-friendly UI for entering farm details
- Automatic location detection and address auto-completion
- AI-generated irrigation recommendations
- Data visualization using charts
- Cloud-based backend services

---

## Prerequisites
Ensure the following tools are installed:
- **[Node.js](https://nodejs.org/)** (LTS version)
- **[Git](https://git-scm.com/)**
- **Firebase CLI** (install via `npm install -g firebase-tools`)
- **A Firebase Account** ([Sign up here](https://console.firebase.google.com/))

Verify installation by running:
```bash
node -v
npm -v
git --version
firebase --version
```

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/water-management.git
cd water-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Firebase
1. Create a Firebase project in the **[Firebase Console](https://console.firebase.google.com/)**.
2. Retrieve Firebase SDK config and update `src/firebaseConfig.js`:
```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export default app;
```

---

## Frontend Development

### 1. Create a React Project
```bash
npx create-react-app water-management-dashboard
cd water-management-dashboard
npm install firebase
```

### 2. Build the UI
- **Form for Farm Data Input** (Name, Crop Type, Area, Address)
- **Geolocation & Address Auto-completion**
- **Dashboard for Irrigation Advice**

### 3. Implement Auto-Location
```js
useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        .then(response => response.json())
        .then(data => setAddress(data.display_name));
    });
  }
}, []);
```

### 4. Fetch AI-Generated Irrigation Advice
```js
fetch('https://<your-cloud-function-url>/getIrrigationAdvice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ farmName, cropType, area, address, latitude, longitude })
})
.then(response => response.json())
.then(data => setAdvice(data.advice));
```

---

## Backend Development

### 1. Initialize Firebase Cloud Functions
```bash
firebase init functions
```
Choose **JavaScript** and install dependencies:
```bash
cd functions
npm install node-fetch
```

### 2. Create AI Irrigation Function (`functions/index.js`)
```js
const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.getIrrigationAdvice = functions.https.onRequest(async (req, res) => {
  const { farmName, cropType, area, address, latitude, longitude } = req.body;

  try {
    const response = await fetch("https://api.gemeni.ai/your_endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: { latitude, longitude, address }, crop: { type: cropType, area } })
    });
    const result = await response.json();
    res.json({ advice: result.advice });
  } catch (error) {
    res.json({ advice: "Suggested irrigation: 500L per acre." });
  }
});
```

### 3. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

---

## System Integration & Testing
### 1. Frontend-Backend API Testing
- Ensure frontend correctly calls Cloud Function API
- Handle network errors and edge cases

### 2. Debugging
- Use **Postman** to test API response
- Verify UI interactions (geolocation, address auto-fill, dashboard updates)

---

## Deployment
### 1. Deploy Firebase Hosting
```bash
firebase init hosting
npm run build
firebase deploy --only hosting
```
### 2. Get Live URL
Firebase will generate a **free hosting URL** for public access.

## Summary
This README provides a structured step-by-step guide to:
- Setting up the project
- Developing the frontend and backend
- Deploying and testing the AI-powered irrigation system

We hope this project helps farmers optimize water usage efficiently!
