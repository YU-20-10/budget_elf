import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_Firebase_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_Firebase_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_Firebase_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_Firebase_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_Firebase_MESSAGING_SENDERID,
  appId: process.env.NEXT_PUBLIC_Firebase_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);

export const firebaseAuth = getAuth(app);
