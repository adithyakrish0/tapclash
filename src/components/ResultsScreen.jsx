import React, { useEffect, useState } from 'react'

function ResultsScreen({ score, bestScore, onPlayAgain, onShareChallenge, onShowLeaderboard, challenge }) {
  const [copied, setCopied] = useState(false)
  const isNewBest = score === bestScore && score > 0

  // Determine message based on score
  const getMessage = () => {
    if (challenge && score > challenge.challenger_score) {
      return `🎉 You beat ${challenge.challenger_name}!`
    }
    if (score >= 100) return '🔥 Insane! You might be a robot!'
    if (score >= 80) return '🚀 Superhuman speed!'
    if (score >= 60) return '⚡ Lightning fast!'
    if (score >= 40) return '💪 Solid tapping!'
    if (score >= 20) return '👍 Not bad!'
    return '😅 Keep practicing!'
  }

  // Confetti effect for high scores
  useEffect(() => {
    if (score >= 60) {
      // Simple confetti animation
      const container = document.querySelector('.results-screen')
      if (!container) return

      for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div')
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${['#6c5ce7', '#00b894', '#fdcb6e', '#ff6b6b', '#a29bfe'][Math.floor(Math.random() * 5)]};
          left: ${Math.random() * 100}vw;
          top: -10px;
          border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
          animation: fall ${2 + Math.random() * 3}s linear forwards;
          pointer-events: none;
          z-index: 100;
        `
        document.body.appendChild(confetti)
        setTimeout(() => confetti.remove(), 5000)
      }
    }
  }, [score])

  return (
    <div className="results-screen">
      {/* Score */}
      <div className="results-score">{score}</div>
      <div className="results-message">{getMessage()}</div>

      {isNewBest && (
        <div className="results-best">
          🏆 New Personal Best!
        </div>
      )}

      {!isNewBest && bestScore > 0 && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Best: {bestScore} | Games: {Math.round((bestScore / Math.max(score, 1))) || 1}+
        </div>
      )}

      {/* Challenge result */}
      {challenge && (
        <div style={{
          padding: '12px 20px',
          background: score > challenge.challenger_score
            ? 'rgba(0, 184, 148, 0.2)'
            : 'rgba(255, 107, 107, 0.2)',
          borderRadius: 12,
          border: `1px solid ${score > challenge.challenger_score ? 'var(--success)' : 'var(--danger)'}`
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {score > challenge.challenger_score ? '🏆 Victory!' : '💀 Defeated!'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {challenge.challenger_name}: {challenge.challenger_score} | You: {score}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="results-buttons">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          🔄 Play Again
        </button>

        <button className="btn btn-success" onClick={onShareChallenge}>
          📤 Challenge a Friend
        </button>

        <button className="btn btn-outline" onClick={onShowLeaderboard}>
          🏆 Leaderboard
        </button>
      </div>

      {/* Taunt button for challenge wins */}
      {challenge && score > challenge.challenger_score && (
        <button
          className="btn btn-danger"
          onClick={async () => {
            const msg = `😂 I just beat your score of ${challenge.challenger_score} with ${score} taps! Can you do better?`
            if (navigator.share) {
              await navigator.share({ text: msg })
            } else {
              await navigator.clipboard.writeText(msg)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }
          }}
          style={{ marginTop: 8, width: '100%', maxWidth: 300 }}
        >
          😈 Taunt {challenge.challenger_name}
        </button>
      )}

      {/* Share score card */}
      <button
        className="btn btn-outline"
        onClick={async () => {
          const text = `🎯 Tap Clash\n\nI scored ${score} taps in 10 seconds!\n${isNewBest ? '🏆 New Personal Best!' : `My best: ${bestScore}`}\n\nCan you beat me?`
          if (navigator.share) {
            await navigator.share({ text })
          } else {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }
        }}
        style={{ width: '100%', maxWidth: 300 }}
      >
        {copied ? '✅ Copied!' : '📋 Copy Score'}
      </button>
    </div>
  )
}

export default ResultsScreen
