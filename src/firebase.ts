// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
export const auth = getAuth(app);
export const db = getFirestore(app);

// ... addPointsFromQr function here (the one we wrote earlier)


/**
 * Add points to the current user based on a QR code ID.
 * QR is fully re-scannable: every call just adds pointValue again.
 */
export async function addPointsFromQr(codeId: string): Promise<number> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to earn points.");
  }

  const codeRef = doc(db, "preGeneratedEarnCodes", codeId);
  const userRef = doc(db, "users", user.uid);

  const newTotal = await runTransaction(db, async (tx) => {
    // 1. Read the earn code
    const codeSnap = await tx.get(codeRef);
    if (!codeSnap.exists()) {
      throw new Error("Invalid QR code.");
    }
    const pointValue = codeSnap.data().pointValue ?? 0;

    // 2. Read current user points
    const userSnap = await tx.get(userRef);
    const currentPoints = userSnap.exists()
      ? userSnap.data().pointTotal ?? 0
      : 0;

    const updatedTotal = currentPoints + pointValue;

    // 3. Write updated points back
    tx.set(
      userRef,
      { pointTotal: updatedTotal },
      { merge: true }
    );

    return updatedTotal;
  });

  return newTotal;
}
