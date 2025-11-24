// firebase-scripts/seedUsers.js
//
// Run with:
//   npm run seed:users -- someUserUID
// or just `npm run seed:users` to seed default test users.

const admin = require("firebase-admin");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("\n ERROR: You must set GOOGLE_APPLICATION_CREDENTIALS");
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

async function upsertUser(uid, data) {
  await db.collection("users").doc(uid).set(data, { merge: true });
  console.log(`✔️ Upserted user ${uid}`);
}

async function main() {
  const [uidArg] = process.argv.slice(2);

  // Option A — seed one user
  if (uidArg) {
    await upsertUser(uidArg, {
      pointTotal: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return;
  }

  // Option B — seed several test users
  const testUsers = [
    { uid: "TEST_USER_1", pointTotal: 0 },
    { uid: "TEST_USER_2", pointTotal: 10 },
  ];

  for (const u of testUsers) {
    await upsertUser(u.uid, {
      pointTotal: u.pointTotal,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log("\n Finished seeding test users.\n");
}

main().catch((err) => {
  console.error(" Error seeding users:", err);
  process.exit(1);
});
