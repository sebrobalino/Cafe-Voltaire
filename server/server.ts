import express from "express";
import cors from "cors";
import admin from "./firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

const usersById: Record<string, { points: number; email: string | null }> = {};

async function verifyToken(authHeader?: string) {
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

app.get("/health", (_, res) => res.json({ ok: true }));

app.get("/rewards/points", async (req, res) => {
  const user = await verifyToken(req.header("Authorization"));
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (!usersById[user.uid]) {
    usersById[user.uid] = { points: 450, email: user.email ?? null };
  }

  res.json({ points: usersById[user.uid].points });
});

app.post("/rewards/earn", async (req, res) => {
  const user = await verifyToken(req.header("Authorization"));
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const amount = typeof req.body?.amount === "number" ? req.body.amount : 50;

  if (!usersById[user.uid]) {
    usersById[user.uid] = { points: 450, email: user.email ?? null };
  }

  usersById[user.uid].points += amount;

  res.json({ points: usersById[user.uid].points });
});

app.post("/rewards/redeem", async (req, res) => {
  const user = await verifyToken(req.header("Authorization"));
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const cost = typeof req.body?.points === "number" ? req.body.points : 100;

  if (!usersById[user.uid]) {
    usersById[user.uid] = { points: 450, email: user.email ?? null };
  }

  if (usersById[user.uid].points < cost) {
    return res.status(400).json({ error: "Not enough points" });
  }

  usersById[user.uid].points -= cost;

  res.json({ points: usersById[user.uid].points });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`Cafe-Voltaire backend running at http://localhost:${PORT}`);
});
