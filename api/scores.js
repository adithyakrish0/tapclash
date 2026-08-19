const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

// Anti-cheat constants
const MAX_TAPS = 150;
const MIN_DURATION = 8;
const MAX_TAPS_PER_SECOND = 15;
const MAX_GAMES_PER_MINUTE = 20;

function validateScore(score, gameDuration, userId) {
  if (score < 0 || score > MAX_TAPS) return { valid: false, reason: 'Score out of range' };
  if (gameDuration < MIN_DURATION || gameDuration > 15) return { valid: false, reason: 'Invalid duration' };
  
  const tapsPerSecond = score / gameDuration;
  if (tapsPerSecond > MAX_TAPS_PER_SECOND) return { valid: false, reason: 'Too fast (auto-clicker?)' };
  if (score > 120) return { valid: false, reason: 'Exceeds human limit' };
  
  return { valid: true };
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    try {
      const { user_id, username, score, game_duration } = req.body;
      
      if (!user_id || score === undefined) {
        return res.status(400).json({ error: 'Missing user_id or score' });
      }
      
      const validation = validateScore(score, game_duration || 10, user_id);
      if (!validation.valid) {
        return res.status(403).json({ error: validation.reason });
      }
      
      // Get existing user data
      const userData = await redis.get(`user:${user_id}`) || {
        username: username || 'Anonymous',
        best_score: 0,
        games_played: 0,
        scores: []
      };
      
      // Update user data
      userData.username = username || userData.username;
      userData.games_played += 1;
      userData.scores.push(score);
      
      // Keep only last 100 scores per user
      if (userData.scores.length > 100) {
        userData.scores = userData.scores.slice(-100);
      }
      
      // Calculate best score
      const bestScore = Math.max(...userData.scores);
      const isNewBest = score > userData.best_score;
      userData.best_score = bestScore;
      
      // Save to Redis
      await redis.set(`user:${user_id}`, userData);
      
      // Update leaderboard sorted set (for global rankings)
      await redis.zadd('leaderboard', { score: bestScore, member: user_id });
      
      // Store username mapping
      await redis.set(`username:${user_id}`, username || 'Anonymous');
      
      return res.status(200).json({
        success: true,
        score,
        best_score: bestScore,
        games_played: userData.games_played,
        message: isNewBest ? '🎉 New personal best!' : 'Keep trying!'
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }
      
      const userData = await redis.get(`user:${userId}`);
      
      return res.status(200).json({
        user_id: userId,
        best_score: userData?.best_score || 0,
        games_played: userData?.games_played || 0
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
