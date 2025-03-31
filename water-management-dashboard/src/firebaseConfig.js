// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCv8EODL9ZYpEb8wTJ4dFS52Wocc_5TCic",
  authDomain: "irrigasmart-91af4.firebaseapp.com",
  projectId: "irrigasmart-91af4",
  storageBucket: "irrigasmart-91af4.firebasestorage.app",
  messagingSenderId: "649946626422",
  appId: "1:649946626422:web:de0f1aa5a59cb71c662257",
  measurementId: "G-LBE1Y3NDHX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Export everything you need
export { db, auth };
