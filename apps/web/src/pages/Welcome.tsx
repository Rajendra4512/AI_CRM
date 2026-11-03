import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Welcome.css'

const Welcome: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 1.5rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
              <rect width="50" height="50" rx="8" fill="#2563eb"/>
              <path d="M15 20L25 15L35 20V35H15V20Z" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M22 35V28H28V35" stroke="white" strokeWidth="2"/>
            </svg>
            <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#1e293b' }}>SalesFortis</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/app/dashboard')}
              style={{
                background: '#2563eb',
                border: 'none',
                color: '#ffffff',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Launch CRM App →
            </button>
          </div>
        </div>
        <p className="tagline">AI-Native Multi-Vertical CRM SaaS Platform</p>
      </header>

      <main className="welcome-main">
        <section className="hero">
          <h2>Choose Your Industry Vertical</h2>
          <p>Select the vertical that best fits your business to see tailored solutions and specialized workflows</p>
        </section>

        <section className="verticals-grid">
          <div className="vertical-card" onClick={() => navigate('/vertical/construction')}>
            <div className="vertical-icon">🏗️</div>
            <h3>Commercial Subcontractor & Trade Suite</h3>
            <p>Streamline bids, estimates, projects, and change orders for construction trades</p>
            <button className="select-btn">Explore Construction CRM →</button>
          </div>

          <div className="vertical-card" onClick={() => navigate('/vertical/clinical')}>
            <div className="vertical-icon">🧬</div>
            <h3>Clinical Trials & Patient Recruitment Suite</h3>
            <p>Manage studies, sites, recruitment, and compliance with built-in safeguards</p>
            <button className="select-btn">Explore Clinical CRM →</button>
          </div>

          <div className="vertical-card" onClick={() => navigate('/vertical/maritime')}>
            <div className="vertical-icon">🚢</div>
            <h3>Maritime Logistics & Freight Brokerage Suite</h3>
            <p>Optimize enquiries, quotes, bookings, and shipments across global logistics</p>
            <button className="select-btn">Explore Maritime CRM →</button>
          </div>
        </section>
      </main>

      <footer className="welcome-footer">
        <p>&copy; 2026 SalesFortis. Enterprise-grade AI CRM Platform.</p>
      </footer>
    </div>
  )
}

export default Welcome
