// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

console.log(process.env.NEXT_PUBLIC_MORALIS_APP_ID, 'ee');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_APIKEY ||
    "AIzaSyBzJLms6P1gAmiksq9d8gNf44F2arvWoeg",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN ||
    "clover-6aac1.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASEURL ||
    "https://clover-6aac1-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID || "clover-6aac1",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET ||
    "clover-6aac1.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID || "1036733483114",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APPID ||
    "1:1036733483114:web:45b3b72229e5c58041e213",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID || "G-PFZ9MWN052",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);