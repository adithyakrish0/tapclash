import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function Leaderboard({ onBack, userId }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all') // all, friends, recent

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard?limit=50`)
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return ''
  }

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading leaderboard...
      </div>
    )
  }

  return (
    <>
      <div className="header">
        <h1>🏆 Leaderboard</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          Global
        </button>
        <button
          className={`tab ${tab === 'recent' ? 'active' : ''}`}
          onClick={() => setTab('recent')}
        >
          Recent
        </button>
      </div>

      <div className="leaderboard">
        {leaderboard.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
            <div>No scores yet!</div>
            <div style={{ fontSize: '0.85rem', marginTop: 8 }}>
              Be the first to play and claim the top spot.
            </div>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className="leaderboard-item"
                style={{
                  background: entry.user_id === userId
                    ? 'rgba(108, 92, 231, 0.2)'
                    : 'var(--bg-card)',
                  border: entry.user_id === userId
                    ? '1px solid var(--primary)'
                    : '1px solid transparent'
                }}
              >
                <div className={`leaderboard-rank ${getRankClass(entry.rank)}`}>
                  {getRankEmoji(entry.rank)}
                </div>
                <div className="leaderboard-name">
                  {entry.username}
                  {entry.user_id === userId && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--primary-light)',
                      marginLeft: 8
                    }}>
                      (You)
                    </span>
                  )}
                </div>
                <div className="leaderboard-score">
                  {entry.best_score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-outline"
        onClick={onBack}
        style={{ marginTop: 16, width: '100%' }}
      >
        ← Back to Game
      </button>
    </>
  )
}

export default Leaderboard
