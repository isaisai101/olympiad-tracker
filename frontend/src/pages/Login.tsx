import { useState } from 'react'
import { supabase } from '../api/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, App.tsx will detect the auth change and re-render
  }

  return (
    <div className="login-page">
      <div className="aurora">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🏆</div>
          <div className="login-title">Olympiad Tracker</div>
          <div className="login-sub">Sign in to your teacher account</div>
        </div>

        {error && <div className="login-err">{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="inp"
              type="email"
              placeholder="teacher@school.kz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="inp"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
