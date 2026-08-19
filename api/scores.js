// In-memory store (resets on cold starts, fine for MVP)
// For production, use Vercel KV or a database
const scores = new Map();

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
  
  // Rate limit check
  const userScores = scores.get(userId) || [];
  const recentGames = userScores.filter(s => Date.now() - s.timestamp < 60000);
  if (recentGames.length >= MAX_GAMES_PER_MINUTE) return { valid: false, reason: 'Slow down!' };
  
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
      
      // Store score
      const userScores = scores.get(user_id) || [];
      const newScore = {
        score,
        username: username || 'Anonymous',
        game_duration: game_duration || 10,
        timestamp: Date.now()
      };
      userScores.push(newScore);
      scores.set(user_id, userScores);
      
      // Calculate best score
      const bestScore = Math.max(...userScores.map(s => s.score));
      
      return res.status(200).json({
        success: true,
        score,
        best_score: bestScore,
        games_played: userScores.length,
        message: score === bestScore ? '🎉 New personal best!' : 'Keep trying!'
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
      
      const userScores = scores.get(userId) || [];
      const bestScore = userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0;
      
      return res.status(200).json({
        user_id: userId,
        best_score: bestScore,
        games_played: userScores.length
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
