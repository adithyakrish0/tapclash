import React, { useEffect, useState } from 'react'

function ResultsScreen({ score, bestScore, onPlayAgain, onShareChallenge, onShowLeaderboard, challenge }) {
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const isNewBest = score === bestScore && score > 0

  const getMessage = () => {
    if (challenge && score > challenge.challenger_score) {
      return `🎉 YOU BEAT ${challenge.challenger_name}!`
    }
    if (score >= 100) return '🔥 INSANE! YOU MIGHT BE A ROBOT!'
    if (score >= 80) return '🚀 SUPERHUMAN SPEED!'
    if (score >= 60) return '⚡ LIGHTNING FAST!'
    if (score >= 40) return '💪 SOLID TAPPING!'
    if (score >= 20) return '👍 NOT BAD!'
    return '😅 KEEP PRACTICING!'
  }

  const getMedal = () => {
    if (score >= 100) return '🏆'
    if (score >= 80) return '🥇'
    if (score >= 60) return '🥈'
    if (score >= 40) return '🥉'
    return '🎯'
  }

  // Confetti for high scores
  useEffect(() => {
    if (score >= 40) {
      setShowConfetti(true)
      const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
      
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div')
          confetti.className = 'confetti'
          confetti.style.cssText = `
            left: ${Math.random() * 100}vw;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            width: ${8 + Math.random() * 8}px;
            height: ${8 + Math.random() * 8}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            animation-duration: ${2 + Math.random() * 2}s;
          `
          document.body.appendChild(confetti)
          setTimeout(() => confetti.remove(), 4000)
        }, i * 30)
      }
    }
  }, [score])

  return (
    <div className="results-screen">
      {/* Medal */}
      <div style={{ fontSize: '4rem', animation: 'scoreReveal 0.5s ease-out' }}>
        {getMedal()}
      </div>

      {/* Score */}
      <div className="results-score">{score}</div>

      {/* Message */}
      <div className="results-message">{getMessage()}</div>

      {/* Best Score */}
      {isNewBest && (
        <div className="results-best">
          🏆 NEW PERSONAL BEST!
        </div>
      )}

      {!isNewBest && bestScore > 0 && (
        <div style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          fontFamily: "'Orbitron', monospace"
        }}>
          BEST: {bestScore}
        </div>
      )}

      {/* Challenge Result */}
      {challenge && (
        <div style={{
          padding: '16px 24px',
          background: score > challenge.challenger_score
            ? 'rgba(16, 185, 129, 0.2)'
            : 'rgba(239, 68, 68, 0.2)',
          borderRadius: 14,
          border: `1px solid ${score > challenge.challenger_score ? 'var(--neon-green)' : 'var(--neon-red)'}`,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700, 
            marginBottom: 8,
            fontSize: '1.1rem'
          }}>
            {score > challenge.challenger_score ? '🏆 VICTORY!' : '💀 DEFEATED!'}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            fontFamily: "'Orbitron', monospace"
          }}>
            {challenge.challenger_name}: {challenge.challenger_score} | You: {score}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="results-buttons">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          🔄 PLAY AGAIN
        </button>

        <button className="btn btn-success" onClick={onShareChallenge}>
          📤 CHALLENGE A FRIEND
        </button>

        <button className="btn btn-outline" onClick={onShowLeaderboard}>
          🏆 LEADERBOARD
        </button>
      </div>

      {/* Taunt Button */}
      {challenge && score > challenge.challenger_score && (
        <button
          className="btn btn-fire"
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
          style={{ marginTop: 8, width: '100%', maxWidth: 320 }}
        >
          😈 TAUNT {challenge.challenger_name}
        </button>
      )}

      {/* Copy Score */}
      <button
        className="btn btn-outline"
        onClick={async () => {
          const text = `🎯 TAP CLASH\n\nI scored ${score} taps in 10 seconds!\n${isNewBest ? '🏆 New Personal Best!' : `My best: ${bestScore}`}\n\nCan you beat me?`
          if (navigator.share) {
            await navigator.share({ text })
          } else {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }
        }}
        style={{ width: '100%', maxWidth: 320 }}
      >
        {copied ? '✅ COPIED!' : '📋 COPY SCORE'}
      </button>
    </div>
  )
}

export default ResultsScreen
