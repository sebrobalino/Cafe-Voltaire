// updateUserPoints.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addPointTotalToUsers() {
  console.log('Starting to update user documents...');
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  const batch = db.batch();
  let updatedCount = 0;

  if (snapshot.empty) {
    console.log('No user documents found to update.');
    process.exit();
  }

  snapshot.forEach(doc => {
    const userData = doc.data();
    // Only update if 'pointTotal' field is missing or undefined
    if (userData.pointTotal === undefined) {
      const userDocRef = usersRef.doc(doc.id);
      batch.update(userDocRef, { pointTotal: 0 }); // Initialize to 0 points
      updatedCount++;
    }
  });

  try {
    await batch.commit();
    console.log(`Successfully updated ${updatedCount} user documents with 'pointTotal: 0'.`);
  } catch (error) {
    console.error('Error updating user documents:', error);
  }
  process.exit();
}

addPointTotalToUsers();