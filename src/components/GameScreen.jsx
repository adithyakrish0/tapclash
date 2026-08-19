import React, { useState, useEffect, useRef, useCallback } from 'react'

const GAME_DURATION = 10
const COMBO_THRESHOLD = 300 // ms between taps to maintain combo

function GameScreen({ onEnd, challenge }) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStarted, setGameStarted] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [popups, setPopups] = useState([])
  const [particles, setParticles] = useState([])
  const [combo, setCombo] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const [scorePulse, setScorePulse] = useState(false)

  const gameRef = useRef(null)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const scoreRef = useRef(0)
  const popupIdRef = useRef(0)
  const onEndRef = useRef(onEnd)
  const endedRef = useRef(false)
  const lastTapTime = useRef(0)
  const comboRef = useRef(0)

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

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        const remaining = Math.max(0, GAME_DURATION - elapsed)
        setTimeLeft(Math.ceil(remaining))

        if (remaining <= 0 && !endedRef.current) {
          endedRef.current = true
          clearInterval(timerRef.current)
          timerRef.current = null
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

  const createParticles = useCallback((x, y) => {
    const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981']
    const newParticles = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const velocity = 60 + Math.random() * 40
      newParticles.push({
        id: popupIdRef.current++,
        x,
        y,
        tx: Math.cos(angle) * velocity,
        ty: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)))
    }, 600)
  }, [])

  const handleTap = useCallback((e) => {
    if (!gameStarted || timeLeft <= 0) return

    const now = Date.now()
    if (gameRef.current && now - gameRef.current < 30) return
    gameRef.current = now

    // Update score
    const newScore = scoreRef.current + 1
    scoreRef.current = newScore
    setScore(newScore)

    // Score pulse animation
    setScorePulse(true)
    setTimeout(() => setScorePulse(false), 100)

    // Combo system
    if (now - lastTapTime.current < COMBO_THRESHOLD) {
      comboRef.current += 1
    } else {
      comboRef.current = 1
    }
    lastTapTime.current = now
    setCombo(comboRef.current)

    // Screen shake on high combo
    if (comboRef.current >= 10 && comboRef.current % 5 === 0) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 150)
    }

    // Get tap position
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2

    // Score popup
    const id = popupIdRef.current++
    setPopups(prev => [...prev, { id, x, y }])
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id))
    }, 800)

    // Particle burst
    createParticles(x, y)
  }, [gameStarted, timeLeft, createParticles])

  // Keyboard support
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

  const beatChallenge = challenge && score > challenge.challenger_score

  // Countdown screen
  if (!gameStarted) {
    return (
      <div className="game-screen">
        <div style={{
          fontSize: '10rem',
          fontFamily: "'Orbitron', monospace",
          fontWeight: 900,
          color: countdown > 0 ? 'var(--neon-purple)' : 'var(--neon-green)',
          textShadow: countdown > 0 
            ? '0 0 60px rgba(139, 92, 246, 0.8)' 
            : '0 0 60px rgba(16, 185, 129, 0.8)',
          animation: 'countdownPop 0.5s ease-out'
        }}>
          {countdown > 0 ? countdown : 'GO!'}
        </div>
        <style>{`
          @keyframes countdownPop {
            0% { transform: scale(2); opacity: 0; }
            50% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`game-screen ${isShaking ? 'shake' : ''}`}>
      {/* Challenge progress */}
      {challenge && (
        <div style={{
          textAlign: 'center',
          padding: '10px 20px',
          background: beatChallenge ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          borderRadius: 12,
          border: `1px solid ${beatChallenge ? 'var(--neon-green)' : 'var(--neon-red)'}`,
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{ 
            fontSize: '0.9rem', 
            fontFamily: "'Orbitron', monospace",
            fontWeight: 600 
          }}>
            {beatChallenge 
              ? '🎉 You\'re winning!' 
              : `Need ${Math.max(0, challenge.challenger_score + 1 - score)} more to beat ${challenge.challenger_name}`}
          </span>
        </div>
      )}

      {/* Timer */}
      <div className={`timer ${timeLeft <= 3 ? 'urgent' : ''}`}>
        {timeLeft}s
      </div>

      {/* Combo Display */}
      <div className={`combo-display ${combo >= 5 ? 'active' : ''} ${combo >= 15 ? 'fire' : ''}`}>
        {combo >= 5 && `🔥 ${combo}x COMBO`}
      </div>

      {/* Score */}
      <div className={`score-display ${scorePulse ? 'pulse' : ''}`}>
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
          <span className="tap-text">TAP!</span>

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

          {/* Particles */}
          {particles.map(p => (
            <span
              key={p.id}
              className="tap-particle"
              style={{
                left: p.x,
                top: p.y,
                background: p.color,
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`
              }}
            />
          ))}
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontFamily: "'Orbitron', monospace",
        letterSpacing: '1px'
      }}>
        TAP AS FAST AS YOU CAN 🚀
      </div>
    </div>
  )
}

export default GameScreen
