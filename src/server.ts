import express from 'express';
import cors from 'cors';

type User = {
  id: string;
  name: string;
  email: string;
  password: string; // demo only
  points: number;
};

// In-memory demo data
const usersById: Record<string, User> = {
  '1': { id: '1', name: 'John Smith', email: 'john@example.com', password: 'password123', points: 450 },
};

function createToken(userId: string): string {
  return `demo-token-${userId}`;
}

function verifyToken(token?: string): User | null {
  if (!token) return null;
  const parts = token.replace('Bearer ', '').trim().split('demo-token-');
  const userId = parts.length === 2 ? parts[1] : undefined;
  if (!userId) return null;
  return usersById[userId] ?? null;
}

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Auth: very basic demo login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = Object.values(usersById).find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = createToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, points: user.points } });
});

// Get current points
app.get('/rewards/points', (req, res) => {
  const user = verifyToken(req.header('Authorization'));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ points: user.points });
});

// Earn points (demo: add fixed 50 or custom amount)
app.post('/rewards/earn', (req, res) => {
  const user = verifyToken(req.header('Authorization'));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const amount = typeof req.body?.amount === 'number' ? req.body.amount : 50;
  user.points = Math.max(0, user.points + amount);
  res.json({ points: user.points });
});

// Redeem points
app.post('/rewards/redeem', (req, res) => {
  const user = verifyToken(req.header('Authorization'));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const cost = typeof req.body?.points === 'number' ? req.body.points : 100;
  if (user.points < cost) return res.status(400).json({ error: 'Not enough points' });
  user.points -= cost;
  res.json({ points: user.points });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Cafe-Voltaire backend listening on http://localhost:${PORT}`);
});


