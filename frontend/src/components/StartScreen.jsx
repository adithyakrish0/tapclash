import React from 'react'

function StartScreen({ onStart, bestScore, gamesPlayed, challenge, username }) {
  return (
    <>
      <div className="header">
        <h1>🎯 Tap Clash</h1>
        <p className="subtitle">Tap as fast as you can in 10 seconds!</p>
      </div>

      {challenge && (
        <div className="challenge-banner">
          <h3>🔥 Challenge from {challenge.challenger_name}</h3>
          <div className="vs-score">Beat {challenge.challenger_score} taps!</div>
          <p style={{ fontSize: '0.85rem', marginTop: 4, opacity: 0.9 }}>
            You need {challenge.challenger_score + 1} taps to win
          </p>
        </div>
      )}

      <div className="start-screen">
        {!challenge && bestScore > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Your Best</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-light)' }}>
              {bestScore}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {gamesPlayed} games played
            </div>
          </div>
        )}

        <button className="start-button" onClick={onStart}>
          {challenge ? '⚔️ Accept Challenge' : '🎮 Play Now'}
        </button>

        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)', 
          fontSize: '0.85rem',
          maxWidth: '280px',
          lineHeight: '1.5'
        }}>
          Tap the button as many times as you can in 10 seconds.
          Challenge your friends to beat your score!
        </div>
      </div>
    </>
  )
}

export default StartScreen
