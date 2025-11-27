import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBP1Ce5mzwR9jELtZEIAV8hRLHOVPVACfc",
  authDomain: "cafe-voltaire.firebaseapp.com",
  projectId: "cafe-voltaire",
  storageBucket: "cafe-voltaire.appspot.com",   // <-- FIXED
  messagingSenderId: "171244750915",
  appId: "1:171244750915:web:605dd661770e9396a26cf6",
  measurementId: "G-V30H6WQJ73"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
