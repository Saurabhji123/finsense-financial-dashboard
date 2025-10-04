import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBUTDkqMX-Isr9NCQn-jZEi-UiKDfzfkXw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "finsense-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "finsense-app",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "finsense-app.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "965273800289",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:965273800289:web:516cebe190bd4f10c7e420",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-1T8L637GLG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// For development, you can connect to emulators
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;