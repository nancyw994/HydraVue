// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAXaNxV3fwMKi95GiqhFu8VqU4MpNpBPu4",
    authDomain: "leaksentinel-4c6e1.firebaseapp.com",
    projectId: "leaksentinel-4c6e1",
    storageBucket: "leaksentinel-4c6e1.firebasestorage.app",
    messagingSenderId: "899027065295",
    appId: "1:899027065295:web:a2a365b35739d021b6daba",
    measurementId: "G-2REX8XPGHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);