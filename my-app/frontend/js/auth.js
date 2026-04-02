import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Helper to use username instead of email for this specific app requirement
const toEmail = (username) => `${username}@eduai.local`;

export async function loginUser(username, password) {
  const userCredential = await signInWithEmailAndPassword(auth, toEmail(username), password);
  const token = await userCredential.user.getIdToken();
  localStorage.setItem("token", token);
  
  // Fetch role from Firestore
  const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    localStorage.setItem("role", data.role);
    return data;
  }
  return null;
}

export async function signupUser(username, password, role, name) {
  const userCredential = await createUserWithEmailAndPassword(auth, toEmail(username), password);
  const uid = userCredential.user.uid;
  
  const userData = {
    uid: uid,
    username: username,
    name: name,
    role: role,
    createdAt: serverTimestamp(),
    avatar: name.substring(0, 2).toUpperCase()
  };
  
  await setDoc(doc(db, "users", uid), userData);
  const token = await userCredential.user.getIdToken();
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  return userData;
}

export async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}

export function protectRoute(expectedRole) {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.replace("index.html");
      return;
    }
    const role = localStorage.getItem("role");
    if (role !== expectedRole && expectedRole !== 'any') {
      window.location.replace("index.html");
    }
  });
}
