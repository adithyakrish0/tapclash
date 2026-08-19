import React from 'react'

function StartScreen({ onStart, bestScore, gamesPlayed, challenge, username }) {
  return (
    <>
      <div className="header">
        <h1>TAP CLASH</h1>
        <p className="subtitle">PROVE YOUR SPEED</p>
      </div>

      {challenge && (
        <div className="challenge-banner">
          <h3>🔥 CHALLENGE FROM {challenge.challenger_name}</h3>
          <div className="vs-score">BEAT {challenge.challenger_score} TAPS!</div>
          <p style={{ 
            fontSize: '0.85rem', 
            marginTop: 8, 
            opacity: 0.9,
            fontFamily: "'Orbitron', monospace"
          }}>
            You need {challenge.challenger_score + 1} taps to win
          </p>
        </div>
      )}

      <div className="start-screen">
        {!challenge && bestScore > 0 && (
          <div className="start-stats">
            <div className="stat-label">YOUR BEST</div>
            <div className="stat-value">{bestScore}</div>
            <div className="stat-sub">{gamesPlayed} games played</div>
          </div>
        )}

        {!challenge && bestScore === 0 && (
          <div style={{ 
            textAlign: 'center',
            padding: '32px',
            background: 'var(--bg-card)',
            borderRadius: 20,
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎯</div>
            <div style={{ 
              fontFamily: "'Orbitron', monospace",
              fontSize: '1.2rem',
              fontWeight: 700,
              marginBottom: 8
            }}>
              READY TO PLAY?
            </div>
            <div style={{ 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              Tap as many times as you can in 10 seconds
            </div>
          </div>
        )}

        <button className="start-button" onClick={onStart}>
          {challenge ? '⚔️ ACCEPT CHALLENGE' : '🎮 PLAY NOW'}
        </button>

        {!challenge && (
          <div className="start-description">
            Challenge your friends. Climb the leaderboard. Prove you're the fastest tapper!
          </div>
        )}
      </div>
    </>
  )
}

export default StartScreen
