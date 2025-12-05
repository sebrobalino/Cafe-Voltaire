// firebase-scripts/seedEarnCodes.js
//
// Run with:
//   npm run seed:codes -- COFFEE_BOOST_1 25
// or just `npm run seed:codes` to seed the default batch.

const admin = require("firebase-admin");

// This must point to your service-account JSON (DO NOT commit that file)
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("\n❌ ERROR: You must set GOOGLE_APPLICATION_CREDENTIALS");
  console.error("Example (PowerShell):");
  console.error('  $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\keys\\cafe-voltaire.json"');
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

async function upsertCode(id, pointValue) {
  await db.collection("preGeneratedEarnCodes").doc(id).set(
    { pointValue },
    { merge: true }
  );
  console.log(`✔️ Upserted ${id} → ${pointValue} points`);
}

async function main() {
  const [id, valueStr] = process.argv.slice(2);

  if (id && valueStr) {
    const pointValue = Number(valueStr);
    if (Number.isNaN(pointValue)) {
      throw new Error("pointValue must be a number");
    }
    await upsertCode(id, pointValue);
    return;
  }

  // Default batch – edit however you want
  const codes = [
    { id: "COFFEE_BOOST_1", pointValue: 25 },
    { id: "WELCOME_500", pointValue: 500 },
    { id: "HAPPY_HOUR_10", pointValue: 10 },
  ];

  for (const c of codes) {
    await upsertCode(c.id, c.pointValue);
  }

  console.log("\n🎉 Finished seeding earn codes.\n");
}

main().catch((err) => {
  console.error("❌ Error seeding codes:", err);
  process.exit(1);
});
