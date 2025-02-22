// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// 导出 app，供其他文件使用
export default app;
