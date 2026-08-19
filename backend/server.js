const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// ============ DATABASE SETUP ============
const db = new Database('tapclash.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    username TEXT,
    score INTEGER NOT NULL,
    game_duration INTEGER NOT NULL DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenger_id TEXT NOT NULL,
    challenger_name TEXT,
    challenger_score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME DEFAULT (datetime('now', '+24 hours'))
  )
`);

// Prepared statements for performance
const insertScore = db.prepare(`
  INSERT INTO scores (user_id, username, score, game_duration, ip_hash)
  VALUES (?, ?, ?, ?, ?)
`);

const getTopScores = db.prepare(`
  SELECT user_id, username, MAX(score) as best_score, COUNT(*) as games_played
  FROM scores
  GROUP BY user_id
  ORDER BY best_score DESC
  LIMIT ?
`);

const getUserBest = db.prepare(`
  SELECT MAX(score) as best_score, COUNT(*) as games_played
  FROM scores WHERE user_id = ?
`);

const getRecentScores = db.prepare(`
  SELECT user_id, username, score, created_at
  FROM scores
  ORDER BY created_at DESC
  LIMIT ?
`);

const insertChallenge = db.prepare(`
  INSERT INTO challenges (challenger_id, challenger_name, challenger_score)
  VALUES (?, ?, ?)
`);

const getChallenge = db.prepare(`
  SELECT * FROM challenges WHERE id = ? AND expires_at > datetime('now')
`);

// ============ ANTI-CHEAT ============
const MAX_TAPS_IN_10_SECONDS = 150; // 15 taps/sec max (human max ~12)
const MIN_GAME_DURATION = 8; // Minimum game duration in seconds

function validateScore(score, gameDuration, userId) {
  // Basic validation
  if (score < 0 || score > MAX_TAPS_IN_10_SECONDS) {
    return { valid: false, reason: 'Score out of realistic range' };
  }

  if (gameDuration < MIN_GAME_DURATION || gameDuration > 15) {
    return { valid: false, reason: 'Invalid game duration' };
  }

  // Check taps per second
  const tapsPerSecond = score / gameDuration;
  if (tapsPerSecond > 15) {
    return { valid: false, reason: 'Taps per second too high (auto-clicker detected)' };
  }

  // Check for impossible scores (human max ~12 taps/sec for 10 seconds = ~120)
  if (score > 120) {
    return { valid: false, reason: 'Score exceeds human capability' };
  }

  // Rate limiting: max 20 games per minute per user
  const recentGames = db.prepare(`
    SELECT COUNT(*) as count FROM scores 
    WHERE user_id = ? AND created_at > datetime('now', '-1 minute')
  `).get(userId);

  if (recentGames.count >= 20) {
    return { valid: false, reason: 'Too many games, slow down' };
  }

  return { valid: true };
}

// ============ TELEGRAM BOT VERIFICATION ============
function verifyTelegramData(initData, botToken) {
  // In production, verify the initData hash from Telegram
  // For now, we'll do basic validation
  if (!initData) return { valid: false };

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const dataCheckString = [];

    for (const [key, value] of urlParams) {
      if (key !== 'hash') {
        dataCheckString.push(`${key}=${value}`);
      }
    }

    dataCheckString.sort();
    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secret).update(dataCheckString.join('\n')).digest('hex');

    return { valid: hmac === hash };
  } catch (e) {
    return { valid: false };
  }
}

// ============ ROUTES ============

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Tap Clash API is running! 🎯' });
});

// Submit a score
app.post('/api/scores', (req, res) => {
  try {
    const { user_id, username, score, game_duration, ip } = req.body;

    if (!user_id || score === undefined) {
      return res.status(400).json({ error: 'Missing user_id or score' });
    }

    // Anti-cheat check
    const validation = validateScore(score, game_duration || 10, user_id);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.reason });
    }

    // Hash IP for storage (privacy)
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16) : null;

    insertScore.run(user_id, username || 'Anonymous', score, game_duration || 10, ipHash);

    // Get user's best score after this game
    const userBest = getUserBest.get(user_id);

    res.json({
      success: true,
      score,
      best_score: userBest.best_score,
      games_played: userBest.games_played,
      message: score === userBest.best_score ? '🎉 New personal best!' : 'Keep trying!'
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get global leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const scores = getTopScores.all(limit);

    res.json({
      leaderboard: scores.map((s, index) => ({
        rank: index + 1,
        user_id: s.user_id,
        username: s.username,
        best_score: s.best_score,
        games_played: s.games_played
      }))
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's best score
app.get('/api/scores/:userId', (req, res) => {
  try {
    const userBest = getUserBest.get(req.params.userId);
    res.json({
      user_id: req.params.userId,
      best_score: userBest?.best_score || 0,
      games_played: userBest?.games_played || 0
    });
  } catch (error) {
    console.error('Error fetching user score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a challenge
app.post('/api/challenges', (req, res) => {
  try {
    const { user_id, username, score } = req.body;

    if (!user_id || !score) {
      return res.status(400).json({ error: 'Missing user_id or score' });
    }

    const result = insertChallenge.run(user_id, username || 'Anonymous', score);

    res.json({
      challenge_id: result.lastInsertRowid,
      challenger: username,
      score,
      share_url: `/challenge/${result.lastInsertRowid}`
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get challenge details
app.get('/api/challenges/:id', (req, res) => {
  try {
    const challenge = getChallenge.get(req.params.id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found or expired' });
    }

    res.json({
      id: challenge.id,
      challenger_id: challenge.challenger_id,
      challenger_name: challenge.challenger_name,
      challenger_score: challenge.challenger_score,
      created_at: challenge.created_at,
      expires_at: challenge.expires_at
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent scores (for activity feed)
app.get('/api/recent', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const scores = getRecentScores.all(limit);

    res.json({ recent: scores });
  } catch (error) {
    console.error('Error fetching recent scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 Tap Clash API running on port ${PORT}`);
  console.log(`📊 Database ready`);
});
