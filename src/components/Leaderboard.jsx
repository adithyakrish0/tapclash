import React, { useState, useEffect } from 'react'

const API_BASE = ''

function Leaderboard({ onBack, userId }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard?limit=50')
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
        <span style={{ fontFamily: "'Orbitron', monospace" }}>LOADING...</span>
      </div>
    )
  }

  return (
    <>
      <div className="header">
        <h1>🏆 LEADERBOARD</h1>
        <p className="subtitle">GLOBAL RANKINGS</p>
      </div>

      <div className="leaderboard">
        {leaderboard.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎯</div>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: 8
            }}>NO SCORES YET!</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Be the first to play and claim the top spot.
            </div>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className="leaderboard-item"
                style={{
                  background: entry.user_id === userId
                    ? 'rgba(139, 92, 246, 0.2)'
                    : 'var(--bg-card)',
                  border: entry.user_id === userId
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className={`leaderboard-rank ${getRankClass(entry.rank)}`}>
                  {getRankEmoji(entry.rank)}
                </div>
                <div className="leaderboard-name">
                  {entry.username}
                  {entry.user_id === userId && (
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--neon-purple)',
                      marginLeft: 8,
                      fontFamily: "'Orbitron', monospace",
                      fontWeight: 700
                    }}>
                      (YOU)
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
        ← BACK TO GAME
      </button>
    </>
  )
}

export default Leaderboard
