import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Use process.cwd() to get the project root directory
const serviceAccountPath = path.resolve(process.cwd(), "service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`ERROR: service-account.json not found at: ${serviceAccountPath}`);
  console.error(`Current working directory: ${process.cwd()}`);
  throw new Error(`service-account.json not found at ${serviceAccountPath}`);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log("Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  throw error;
}

export default admin;
