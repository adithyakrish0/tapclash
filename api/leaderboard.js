const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      
      // Get top scores from sorted set (highest first)
      const topUsers = await redis.zrange('leaderboard', 0, limit - 1, { rev: true, withScores: true });
      
      const leaderboard = [];
      
      // Process results (alternating member, score pairs)
      for (let i = 0; i < topUsers.length; i += 2) {
        const userId = topUsers[i];
        const bestScore = topUsers[i + 1];
        
        // Get username
        const username = await redis.get(`username:${userId}`) || 'Anonymous';
        
        // Get games played
        const userData = await redis.get(`user:${userId}`);
        
        leaderboard.push({
          rank: leaderboard.length + 1,
          user_id: userId,
          username,
          best_score: bestScore,
          games_played: userData?.games_played || 0
        });
      }
      
      return res.status(200).json({ leaderboard });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
