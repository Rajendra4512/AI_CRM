import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Marketing.css'

const ClinicalMarketing: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="marketing-container">
      <header className="marketing-header">
        <div className="nav-bar">
          <div className="logo-small" onClick={() => navigate('/')}>
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
              <rect width="50" height="50" rx="8" fill="#2563eb"/>
              <path d="M15 20L25 15L35 20V35H15V20Z" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M22 35V28H28V35" stroke="white" strokeWidth="2"/>
            </svg>
            <span>SalesFortis</span>
          </div>
          <button className="back-btn" onClick={() => navigate('/')}>← Change Vertical</button>
        </div>
      </header>

      <main className="marketing-main">
        <section className="marketing-hero" style={{background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'}}>
          <h1>Clinical Trials & Patient Recruitment Suite</h1>
          <p className="hero-subtitle">Streamline study management and recruitment - inspired by TrialX & RealTime CTMS</p>
          <button className="cta-btn">Start Free Trial</button>
        </section>

        <section className="features-section">
          <h2>Designed for Clinical Research Teams</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔬 Study Management</h3>
              <p>Manage protocols, sites, sponsors, and CROs with full compliance tracking</p>
            </div>
            <div className="feature-card">
              <h3>👥 Patient Recruitment</h3>
              <p>AI-assisted prescreening with strict PHI controls and human oversight</p>
            </div>
            <div className="feature-card">
              <h3>✅ Consent Management</h3>
              <p>Electronic consent tracking with version control and audit trails</p>
            </div>
            <div className="feature-card">
              <h3>📅 Visit Tracking</h3>
              <p>Schedule and track study visits with automated reminders</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Compliance First</h3>
              <p>Built with GCP, HIPAA considerations and strict data segregation</p>
            </div>
            <div className="feature-card">
              <h3>🛡️ Human-in-the-Loop</h3>
              <p>AI never makes autonomous clinical decisions - always requires approval</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <p>&copy; 2026 SalesFortis. Clinical Trials & Patient Recruitment Suite.</p>
      </footer>
    </div>
  )
}

export default ClinicalMarketing
