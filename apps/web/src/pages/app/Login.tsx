import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AppPortal.css'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@salesfortis.com')
  const [password, setPassword] = useState('demopassword')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API auth or call endpoint
    setTimeout(() => {
      localStorage.setItem('sf_token', 'demo-jwt-token')
      setLoading(false)
      navigate('/app/dashboard')
    }, 400)
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <svg width="44" height="44" viewBox="0 0 50 50" fill="none">
            <rect width="50" height="50" rx="10" fill="#2563eb"/>
            <path d="M15 20L25 15L35 20V35H15V20Z" stroke="white" strokeWidth="3" fill="none"/>
          </svg>
          <h2>SalesFortis CRM</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Sign in to your multi-vertical workspace</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Work Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              localStorage.setItem('sf_token', 'demo-jwt-token')
              navigate('/app/dashboard')
            }}
            className="btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            ⚡ One-Click Instant Demo Access
          </button>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <a
            href="/"
            style={{ color: '#2563eb', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            ← Back to Public Website
          </a>
        </div>
      </div>
    </div>
  )
}

