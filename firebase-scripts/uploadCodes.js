// uploadCodes.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Your downloaded key
const earnCodesData = require('./earnCodes.json'); // Your QR code definitions

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadEarnCodes() {
  const batch = db.batch();
  const collectionRef = db.collection('preGeneratedEarnCodes');

  for (const code of earnCodesData) {
    // Using codeId as the document ID for easy lookup
    const docRef = collectionRef.doc(code.codeId);
    batch.set(docRef, code);
  }

  try {
    await batch.commit();
    console.log(`Successfully uploaded ${earnCodesData.length} earn codes to Firestore.`);
  } catch (error) {
    console.error('Error uploading earn codes:', error);
  }
  process.exit(); // Exit the script
}

uploadEarnCodes();
