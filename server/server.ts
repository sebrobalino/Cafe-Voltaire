import express from "express";
import cors from "cors";
import admin from "./firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

const db = admin.firestore();

async function verifyToken(authHeader?: string) {
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

async function getUserPoints(userId: string): Promise<number> {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    console.log(`User document not found for userId: ${userId}, initializing with 0 points`);
    // Initialize user with 0 points if they don't exist
    await userRef.set({ pointTotal: 0 }, { merge: true });
    return 0;
  }
  
  const data = userDoc.data();
  const points = (data?.pointTotal as number | undefined) ?? 0;
  console.log(`Fetched points for userId ${userId}: ${points}`);
  return points;
}

async function updateUserPoints(userId: string, newPoints: number): Promise<number> {
  const userRef = db.collection("users").doc(userId);
  await userRef.set({ pointTotal: newPoints }, { merge: true });
  return newPoints;
}

app.get("/health", (_, res) => res.json({ ok: true }));

// Diagnostic endpoint to check user data
app.get("/debug/user", async (req, res) => {
  const user = await verifyToken(req.header("Authorization"));
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const userRef = db.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    
    const result = {
      userId: user.uid,
      email: user.email,
      documentExists: userDoc.exists,
      documentData: userDoc.exists ? userDoc.data() : null,
      allUsers: [] as any[]
    };

    // Also check all users in the collection (for debugging)
    const allUsersSnapshot = await db.collection("users").limit(10).get();
    result.allUsers = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));

    res.json(result);
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: "Failed to debug user" });
  }
});

app.get("/rewards/points", async (req, res) => {
  const user = await verifyToken(req.header("Authorization"));
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    console.log(`Fetching points for user: ${user.uid}, email: ${user.email}`);
    const points = await getUserPoints(user.uid);
    res.json({ points });
  } catch (error) {
    console.error("Error fetching points:", error);
    res.status(500).json({ error: "Failed to fetch points" });
  }
});

app.post("/rewards/earn", async (req, res) => {
  const user = await verifyToken(req.header("Authorization"));
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const amount = typeof req.body?.amount === "number" ? req.body.amount : 50;

  try {
    const currentPoints = await getUserPoints(user.uid);
    const newPoints = currentPoints + amount;
    await updateUserPoints(user.uid, newPoints);
    res.json({ points: newPoints });
  } catch (error) {
    console.error("Error earning points:", error);
    res.status(500).json({ error: "Failed to earn points" });
  }
});

app.post("/rewards/redeem", async (req, res) => {
  const user = await verifyToken(req.header("Authorization"));
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const cost = typeof req.body?.points === "number" ? req.body.points : 100;

  try {
    const currentPoints = await getUserPoints(user.uid);
    
    if (currentPoints < cost) {
      return res.status(400).json({ error: "Not enough points" });
    }

    const newPoints = currentPoints - cost;
    await updateUserPoints(user.uid, newPoints);
    res.json({ points: newPoints });
  } catch (error) {
    console.error("Error redeeming points:", error);
    res.status(500).json({ error: "Failed to redeem points" });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`Cafe-Voltaire backend running at http://localhost:${PORT}`);
});
