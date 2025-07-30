import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlXnjOPQ5m55SguHsAkpMi4ccAaMIIG1Q",
  authDomain: "volvox-works.firebaseapp.com",
  projectId: "volvox-works",
  storageBucket: "volvox-works.firebasestorage.app",
  messagingSenderId: "149136369681",
  appId: "1:149136369681:web:b5fc986e2c9cd8729569b0",
};

// Initialize Firebase
// We add a check to see if an app is already initialized, which is important for how Next.js works.
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
