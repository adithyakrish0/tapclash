// Import scores from scores module (shared in-memory store)
// In production, use Vercel KV or a database
const scores = new Map();

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
      
      // Calculate best scores for all users
      const leaderboard = [];
      for (const [userId, userScores] of scores.entries()) {
        if (userScores.length === 0) continue;
        
        const bestScore = Math.max(...userScores.map(s => s.score));
        const username = userScores[userScores.length - 1]?.username || 'Anonymous';
        
        leaderboard.push({
          user_id: userId,
          username,
          best_score: bestScore,
          games_played: userScores.length
        });
      }
      
      // Sort by best score descending
      leaderboard.sort((a, b) => b.best_score - a.best_score);
      
      // Take top N and add rank
      const topScores = leaderboard.slice(0, limit).map((entry, index) => ({
        rank: index + 1,
        ...entry
      }));
      
      return res.status(200).json({ leaderboard: topScores });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
