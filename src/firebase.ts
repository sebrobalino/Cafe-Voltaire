// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 🔐 For demo: we just use a fixed user id
const DEMO_USER_ID = "demo-user-1";

// Get current points for the demo user
export async function getDemoUserPoints(): Promise<number> {
  const ref = doc(db, "users", DEMO_USER_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return 0;
  }
  return (snap.data().pointTotal as number | undefined) ?? 0;
}

// Add points based on a QR code (rescannable)
export async function addPointsFromQr(codeId: string): Promise<number> {
  const codeRef = doc(db, "preGeneratedEarnCodes", codeId);
  const userRef = doc(db, "users", DEMO_USER_ID);

  const updatedTotal = await runTransaction(db, async (tx) => {
    const codeSnap = await tx.get(codeRef);
    if (!codeSnap.exists()) {
      throw new Error("Invalid QR code.");
    }

    const pointValue = codeSnap.data().pointValue ?? 0;

    const userSnap = await tx.get(userRef);
    const currentPoints = userSnap.exists()
      ? userSnap.data().pointTotal ?? 0
      : 0;

    const newTotal = currentPoints + pointValue;

    tx.set(userRef, { pointTotal: newTotal }, { merge: true });

    return newTotal;
  });

  return updatedTotal;
}
