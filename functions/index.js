// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.earnPointsWithQr = functions.https.onCall(async (data, context) => {
  // 1. Authenticate user (required for onCall functions)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const userId = context.auth.uid; // The authenticated user's ID
  const { codeId } = data; // codeId from the QR scan

  if (!codeId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing codeId for earning points.');
  }

  try {
    // 2. Check if this specific codeId exists and get its point value
    const earnCodeDocRef = db.collection('preGeneratedEarnCodes').doc(codeId);
    const earnCodeDoc = await earnCodeDocRef.get();

    if (!earnCodeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invalid or unknown QR code.');
    }

    const { pointValue } = earnCodeDoc.data();

    // 3. Check if user has already claimed this multi-use code
    const userClaimedCodeDocRef = db.collection('userClaimedCodes').doc(`${userId}_${codeId}`);
    const userClaimedCodeDoc = await userClaimedCodeDocRef.get();

    if (userClaimedCodeDoc.exists) {
      throw new functions.https.HttpsError('already-exists', 'You have already claimed points from this QR code.');
    }

    // 4. Start a transaction to update user points and record the claim atomically
    await db.runTransaction(async (transaction) => {
      const userDocRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
      }

      const currentPoints = userDoc.data().pointTotal || 0;
      const newPoints = currentPoints + pointValue;

      // Update user's points
      transaction.update(userDocRef, { pointTotal: newPoints });

      // Record that this user claimed this code
      transaction.set(userClaimedCodeDocRef, {
        userId: userId,
        codeId: codeId,
        claimedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    console.log(`User ${userId} successfully earned ${pointValue} points with code ${codeId}.`);
    // Return the new point total to the client
    const userDocAfterTransaction = await db.collection('users').doc(userId).get();
    return { success: true, points: userDocAfterTransaction.data().pointTotal };

  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw already handled HTTP errors
    }
    console.error('Error processing earnPointsWithQr:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process points earning.', error.message);
  }
});
