import React, { useState, useEffect } from 'react'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import ResultsScreen from './components/ResultsScreen'
import Leaderboard from './components/Leaderboard'

// Vercel serverless functions are at the same domain under /api
const API_BASE = ''

function App() {
  const [screen, setScreen] = useState('start') // start, playing, results, leaderboard
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [challenge, setChallenge] = useState(null)

  // Get user ID from Telegram or generate one
  const [userId, setUserId] = useState(null)
  const [username, setUsername] = useState('Player')

  useEffect(() => {
    // Try to get Telegram user data
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setUserId(tg.initDataUnsafe.user.id.toString())
        setUsername(tg.initDataUnsafe.user.first_name || 'Player')
      }
    }

    // Fallback: generate random user ID
    if (!userId) {
      const storedId = localStorage.getItem('tapclash_userId')
      if (storedId) {
        setUserId(storedId)
        const storedName = localStorage.getItem('tapclash_username')
        if (storedName) setUsername(storedName)
      } else {
        const newId = 'user_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('tapclash_userId', newId)
        setUserId(newId)
      }
    }
  }, [])

  // Check for challenge in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const challengeId = params.get('challenge')
    if (challengeId) {
      fetchChallenge(challengeId)
    }
  }, [])

  const fetchChallenge = async (challengeId) => {
    try {
      const res = await fetch(`/api/challenges?id=${challengeId}`)
      if (res.ok) {
        const data = await res.json()
        setChallenge(data)
        setScreen('start')
      }
    } catch (err) {
      console.error('Failed to load challenge:', err)
    }
  }

  const handleStartGame = () => {
    setScore(0)
    setScreen('playing')
  }

  const handleGameEnd = async (finalScore) => {
    setScore(finalScore)

    // Submit score to backend
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username,
          score: finalScore,
          game_duration: 10
        })
      })
      const data = await res.json()
      if (data.best_score) setBestScore(data.best_score)
      if (data.games_played) setGamesPlayed(data.games_played)
    } catch (err) {
      console.error('Failed to submit score:', err)
    }

    setScreen('results')
  }

  const handlePlayAgain = () => {
    setChallenge(null)
    handleStartGame()
  }

  const handleShareChallenge = async () => {
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username,
          score
        })
      })
      const data = await res.json()

      const challengeUrl = `${window.location.origin}?challenge=${data.challenge_id}`

      // Try Telegram share
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp
        tg.switchInlineQuery(
          `🎯 ${username} scored ${score} taps! Can you beat them? Play Tap Clash! ${challengeUrl}`,
          ['users', 'groups', 'channels']
        )
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `🎯 I scored ${score} taps in 10 seconds on Tap Clash!\n\nCan you beat me? Try it: ${challengeUrl}`
        )
        alert('Challenge link copied! Paste it in any Telegram chat.')
      }
    } catch (err) {
      console.error('Failed to create challenge:', err)
    }
  }

  // Floating particles
  const Particles = () => (
    <div className="particles">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
            background: ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)]
          }}
        />
      ))}
    </div>
  )

  return (
    <div className="app">
      <Particles />
      {screen === 'start' && (
        <StartScreen
          onStart={handleStartGame}
          bestScore={bestScore}
          gamesPlayed={gamesPlayed}
          challenge={challenge}
          username={username}
        />
      )}

      {screen === 'playing' && (
        <GameScreen
          onEnd={handleGameEnd}
          challenge={challenge}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          score={score}
          bestScore={bestScore}
          onPlayAgain={handlePlayAgain}
          onShareChallenge={handleShareChallenge}
          onShowLeaderboard={() => setScreen('leaderboard')}
          challenge={challenge}
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard
          onBack={() => setScreen(challenge ? 'start' : 'start')}
          userId={userId}
        />
      )}
    </div>
  )
}

export default App
