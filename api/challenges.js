// In-memory store for challenges
const challenges = new Map();
let challengeCounter = 1;

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
      const { user_id, username, score } = req.body;
      
      if (!user_id || !score) {
        return res.status(400).json({ error: 'Missing user_id or score' });
      }
      
      const challengeId = challengeCounter++;
      const challenge = {
        id: challengeId,
        challenger_id: user_id,
        challenger_name: username || 'Anonymous',
        challenger_score: score,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      challenges.set(challengeId, challenge);
      
      return res.status(200).json({
        challenge_id: challengeId,
        challenger: username,
        score,
        share_url: `/challenge/${challengeId}`
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing challenge id' });
      }
      
      const challenge = challenges.get(parseInt(id));
      
      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }
      
      // Check if expired
      if (new Date(challenge.expires_at) < new Date()) {
        challenges.delete(parseInt(id));
        return res.status(404).json({ error: 'Challenge expired' });
      }
      
      return res.status(200).json(challenge);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
