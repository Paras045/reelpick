import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDewMscq9C-eAXrKNmJP7maGJahAFbWlbI",
  authDomain: "reelpick-584c5.firebaseapp.com",
  projectId: "reelpick-584c5",
  storageBucket: "reelpick-584c5.firebasestorage.app",
  messagingSenderId: "538957167060",
  appId: "1:538957167060:web:ee1c0774f84ea42e833e41",
  measurementId: "G-0PWMFH1S8D"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
