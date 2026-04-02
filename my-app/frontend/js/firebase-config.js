import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace these with your actual Firebase project config when deploying
const firebaseConfig = {
  apiKey: "AIzaSyBqODdB9wWWWE6sdiaAnkQpcP94KQpWx34",
  authDomain: "ai-exam-analyser.firebaseapp.com",
  projectId: "ai-exam-analyser",
  storageBucket: "ai-exam-analyser.firebasestorage.app",
  messagingSenderId: "253089830001",
  appId: "1:253089830001:web:d5a74cf3f4937eb439f7d0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
