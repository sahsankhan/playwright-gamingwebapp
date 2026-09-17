const crypto = require('crypto');
const express = require('express');
const path = require('path');

const PORT = Number(process.env.PORT ?? 3000);
const app = express();

/** @type {Map<string, UserRecord>} */
const usersByEmail = new Map();

/** @type {Map<string, { email: string, username: string }>} */
const sessions = new Map();

const games = [
  {
    slug: 'brick-blitz',
    title: 'Brick Blitz',
    genre: 'Arcade',
    description: 'Break neon blocks and chase combo streaks in a classic arcade lane.',
    entryFee: 0,
  },
  {
    slug: 'star-dodge',
    title: 'Star Dodge',
    genre: 'Runner',
    description: 'Dodge falling stars, collect shields, and push your reflex score higher.',
    entryFee: 25,
  },
];

const shopItems = [
  { id: 'neon-trail', name: 'Neon Trail', price: 200, type: 'cosmetic', description: 'Cosmetic trail effect in lobby.' },
  { id: 'coin-doubler', name: 'Coin Doubler', price: 350, type: 'boost', description: 'Doubles coin rewards for the next session.' },
  { id: 'vip-badge', name: 'VIP Badge', price: 150, type: 'badge', description: 'Shows a VIP badge on profile and leaderboard.' },
];

function createToken() {
  return crypto.randomBytes(24).toString('hex');
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createUser(email, username, password) {
  return {
    email,
    username,
    password,
    highScore: 0,
    coins: 150,
    avatar: 'rookie',
    inventory: [],
    dailyBonusClaimedAt: null,
    gamesPlayed: 0,
    totalScore: 0,
    activeBoost: null,
  };
}

function publicUser(user) {
  return {
    email: user.email,
    username: user.username,
    highScore: user.highScore,
    coins: user.coins,
    avatar: user.avatar,
    inventory: user.inventory,
    dailyBonusClaimedAt: user.dailyBonusClaimedAt,
    gamesPlayed: user.gamesPlayed,
    totalScore: user.totalScore,
    activeBoost: user.activeBoost,
  };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = session;
  req.token = token;
  return next();
}

function getUserRecord(email) {
  return usersByEmail.get(email);
}

function scoreReward(score, user) {
  const base = Math.max(10, Math.floor(score / 10));
  return user.activeBoost === 'coin-doubler' ? base * 2 : base;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', (req, res) => {
  const email = normalizeEmail(req.body.email ?? '');
  const password = String(req.body.password ?? '');
  const username = String(req.body.username ?? '').trim();

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (usersByEmail.has(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = createUser(email, username, password);
  usersByEmail.set(email, user);
  const token = createToken();
  sessions.set(token, { email, username });

  return res.status(201).json({ token, user: publicUser(user) });
});

app.post('/api/login', (req, res) => {
  const email = normalizeEmail(req.body.email ?? '');
  const password = String(req.body.password ?? '');
  const user = usersByEmail.get(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createToken();
  sessions.set(token, { email: user.email, username: user.username });

  return res.json({ token, user: publicUser(user) });
});

app.post('/api/logout', authMiddleware, (req, res) => {
  sessions.delete(req.token);
  return res.json({ ok: true });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = getUserRecord(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json(publicUser(user));
});

app.post('/api/daily-bonus', authMiddleware, (req, res) => {
  const user = getUserRecord(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const today = todayKey();
  if (user.dailyBonusClaimedAt === today) {
    return res.status(409).json({ error: 'Daily bonus already claimed today.' });
  }

  user.dailyBonusClaimedAt = today;
  user.coins += 500;

  return res.json({
    coinsAwarded: 500,
    coins: user.coins,
    claimedOn: today,
  });
});

app.get('/api/games', authMiddleware, (_req, res) => {
  return res.json({ games });
});

app.get('/api/games/:slug', authMiddleware, (req, res) => {
  const game = games.find((item) => item.slug === req.params.slug);
  if (!game) {
    return res.status(404).json({ error: 'Game not found.' });
  }
  return res.json({ game });
});

app.post('/api/games/:slug/session', authMiddleware, (req, res) => {
  const game = games.find((item) => item.slug === req.params.slug);
  if (!game) {
    return res.status(404).json({ error: 'Game not found.' });
  }

  const difficulty = String(req.body.difficulty ?? 'normal');
  if (!['easy', 'normal', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty.' });
  }

  const user = getUserRecord(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const entryFee = difficulty === 'hard' ? 50 : game.entryFee;
  if (user.coins < entryFee) {
    return res.status(402).json({ error: 'Not enough coins to start this session.' });
  }

  user.coins -= entryFee;

  return res.json({
    sessionId: createToken(),
    game: game.title,
    difficulty,
    entryFee,
    coins: user.coins,
  });
});

app.post('/api/games/:slug/score', authMiddleware, (req, res) => {
  const slug = req.params.slug;
  const score = Number(req.body.score ?? 0);
  const game = games.find((item) => item.slug === slug);
  if (!game) {
    return res.status(404).json({ error: 'Game not found.' });
  }

  const user = getUserRecord(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.gamesPlayed += 1;
  user.totalScore += score;
  if (score > user.highScore) {
    user.highScore = score;
  }

  const coinsEarned = scoreReward(score, user);
  user.coins += coinsEarned;
  if (user.activeBoost === 'coin-doubler') {
    user.activeBoost = null;
  }

  return res.json({
    game: game.title,
    score,
    highScore: user.highScore,
    coinsEarned,
    coins: user.coins,
    gamesPlayed: user.gamesPlayed,
  });
});

app.get('/api/shop/items', authMiddleware, (_req, res) => {
  return res.json({ items: shopItems });
});

app.post('/api/shop/purchase', authMiddleware, (req, res) => {
  const itemId = String(req.body.itemId ?? '');
  const item = shopItems.find((entry) => entry.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Shop item not found.' });
  }

  const user = getUserRecord(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (user.inventory.includes(itemId)) {
    return res.status(409).json({ error: 'Item already owned.' });
  }
  if (user.coins < item.price) {
    return res.status(402).json({ error: 'Not enough coins.' });
  }

  user.coins -= item.price;
  user.inventory.push(itemId);
  if (item.type === 'boost') {
    user.activeBoost = itemId;
  }

  return res.json({
    item,
    coins: user.coins,
    inventory: user.inventory,
    activeBoost: user.activeBoost,
  });
});

app.get('/api/leaderboard', authMiddleware, (req, res) => {
  const rows = [...usersByEmail.values()]
    .map((user) => ({
      username: user.username,
      highScore: user.highScore,
      gamesPlayed: user.gamesPlayed,
      avatar: user.avatar,
      vip: user.inventory.includes('vip-badge'),
    }))
    .sort((a, b) => b.highScore - a.highScore || a.username.localeCompare(b.username));

  const rank = rows.findIndex((row) => row.username === req.user.username) + 1;

  return res.json({
    entries: rows.slice(0, 10),
    currentPlayerRank: rank || null,
  });
});

app.patch('/api/profile', authMiddleware, (req, res) => {
  const user = getUserRecord(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const avatar = String(req.body.avatar ?? user.avatar);
  const allowed = ['rookie', 'veteran', 'legend'];
  if (!allowed.includes(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar selection.' });
  }

  user.avatar = avatar;
  return res.json(publicUser(user));
});

app.patch('/api/test/wallet', authMiddleware, (req, res) => {
  if (process.env.ALLOW_TEST_SEED === 'false') {
    return res.status(403).json({ error: 'Test seeding disabled.' });
  }

  const user = getUserRecord(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (req.body.coins !== undefined) {
    user.coins = Number(req.body.coins);
  }

  return res.json(publicUser(user));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Arcade Portal demo running at http://localhost:${PORT}`);
  });
}

module.exports = app;
