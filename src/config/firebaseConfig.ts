import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCiyDIVPAPD8khsSNV7qKcH_uGWDS5bpOA",
  authDomain: "myfypapp-c6dcb.firebaseapp.com",
  projectId: "myfypapp-c6dcb",
  storageBucket: "myfypapp-c6dcb.appspot.com",
  messagingSenderId: "627756446259",
  appId: "1:627756446259:web:5bccb4f6d587cabe1ce946",
};

// 只初始化一次
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db};
