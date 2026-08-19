import React, { useState, useEffect, useRef, useCallback } from 'react'

const GAME_DURATION = 10 // seconds

function GameScreen({ onEnd, challenge }) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStarted, setGameStarted] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [popups, setPopups] = useState([])
  const [ripples, setRipples] = useState([])
  const gameRef = useRef(null)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const scoreRef = useRef(0)
  const popupIdRef = useRef(0)
  const onEndRef = useRef(onEnd)
  const endedRef = useRef(false)

  // Keep onEnd ref updated
  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  // Countdown before game starts
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (!gameStarted) {
      setGameStarted(true)
      startTimeRef.current = Date.now()
      endedRef.current = false

      // Start the game timer
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        const remaining = Math.max(0, GAME_DURATION - elapsed)
        setTimeLeft(Math.ceil(remaining))

        if (remaining <= 0 && !endedRef.current) {
          endedRef.current = true
          clearInterval(timerRef.current)
          timerRef.current = null
          // Use ref for latest score
          onEndRef.current(scoreRef.current)
        }
      }, 50)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [countdown, gameStarted])

  const handleTap = useCallback((e) => {
    if (!gameStarted || timeLeft <= 0) return

    // Prevent rapid double-taps
    const now = Date.now()
    if (gameRef.current && now - gameRef.current < 30) return
    gameRef.current = now

    // Update both state and ref
    const newScore = scoreRef.current + 1
    scoreRef.current = newScore
    setScore(newScore)

    // Add score popup
    const id = popupIdRef.current++
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2

    setPopups(prev => [...prev, { id, x, y }])
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id))
    }, 500)

    // Add ripple effect
    const rippleId = id
    setRipples(prev => [...prev, { id: rippleId, x, y }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId))
    }, 300)
  }, [gameStarted, timeLeft])

  // Handle keyboard/spacebar tapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        const btn = document.querySelector('.tap-button')
        if (btn) btn.click()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Check if challenge is beat
  const beatChallenge = challenge && score > challenge.challenger_score

  if (!gameStarted) {
    return (
      <div className="game-screen">
        <div style={{
          fontSize: '8rem',
          fontWeight: 900,
          color: countdown > 0 ? 'var(--primary-light)' : 'var(--success)',
          animation: 'pulse 0.5s ease-in-out'
        }}>
          {countdown > 0 ? countdown : 'GO!'}
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen">
      {/* Challenge progress */}
      {challenge && (
        <div style={{
          textAlign: 'center',
          padding: '8px 16px',
          background: beatChallenge ? 'rgba(0, 184, 148, 0.2)' : 'rgba(255, 107, 107, 0.2)',
          borderRadius: 8,
          border: `1px solid ${beatChallenge ? 'var(--success)' : 'var(--danger)'}`
        }}>
          <span style={{ fontSize: '0.85rem' }}>
            {beatChallenge ? '🎉 You\'re winning!' : `Need ${challenge.challenger_score + 1 - score > 0 ? challenge.challenger_score + 1 - score : 0} more to beat ${challenge.challenger_name}`}
          </span>
        </div>
      )}

      {/* Timer */}
      <div className={`timer ${timeLeft <= 3 ? 'urgent' : ''}`}>
        {timeLeft}s
      </div>

      {/* Score */}
      <div className="score-display">
        {score}
      </div>

      {/* Tap Button */}
      <div style={{ position: 'relative' }}>
        <button
          className={`tap-button ${timeLeft <= 0 ? 'disabled' : ''}`}
          onClick={handleTap}
          disabled={timeLeft <= 0}
        >
          <span className="tap-icon">👆</span>
          <span>TAP!</span>

          {/* Score popups */}
          {popups.map(popup => (
            <span
              key={popup.id}
              className="score-popup"
              style={{ left: popup.x, top: popup.y }}
            >
              +1
            </span>
          ))}

          {/* Ripple effects */}
          {ripples.map(ripple => (
            <span
              key={ripple.id}
              style={{
                position: 'absolute',
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.6)',
                animation: 'ripple 0.3s ease-out',
                pointerEvents: 'none'
              }}
            />
          ))}
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        textAlign: 'center'
      }}>
        Tap as fast as you can! 🚀
      </div>
    </div>
  )
}

export default GameScreen
