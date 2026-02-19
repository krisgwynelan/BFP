import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCnCmMg0yp-cZHjbNmkqTktWrigWMZSX2A",
  authDomain: "bfp-station1-cogon-561b7.firebaseapp.com",
  projectId: "bfp-station1-cogon-561b7",
  storageBucket: "bfp-station1-cogon-561b7.firebasestorage.app",
  messagingSenderId: "579230809737",
  appId: "1:579230809737:web:34693a9aca69e28e86d058",
};

// 🔥 IMPORTANT: app must be const
const app = initializeApp(firebaseConfig);

// 🔥 THESE EXPORTS MUST EXIST
export const db = getFirestore(app);
export const storage = getStorage(app);
