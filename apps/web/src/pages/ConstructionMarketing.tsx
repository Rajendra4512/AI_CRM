import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Marketing.css'

const ConstructionMarketing: React.FC = () => {
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
        <section className="marketing-hero">
          <h1>Commercial Subcontractor & Trade Suite</h1>
          <p className="hero-subtitle">Built for the way subcontractors work - inspired by Procore & Contractor Foreman</p>
          <button className="cta-btn">Start Free Trial</button>
        </section>

        <section className="features-section">
          <h2>Purpose-Built for Construction Trades</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📋 Bid Management</h3>
              <p>Streamline RFQ tracking, bid board management, and competitive bidding workflows</p>
            </div>
            <div className="feature-card">
              <h3>💰 Estimating & Takeoffs</h3>
              <p>AI-assisted estimates with document intelligence for plans and specifications</p>
            </div>
            <div className="feature-card">
              <h3>🏗️ Project Management</h3>
              <p>Track projects from award to closeout with submittals, RFIs, and daily logs</p>
            </div>
            <div className="feature-card">
              <h3>📝 Change Orders</h3>
              <p>Manage change orders with approval workflows and impact tracking</p>
            </div>
            <div className="feature-card">
              <h3>💵 Financials</h3>
              <p>Pay applications, schedule of values, and lien waivers in one place</p>
            </div>
            <div className="feature-card">
              <h3>🤖 AI-Powered Insights</h3>
              <p>Predictive risk scoring and intelligent document Q&A with citations</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <p>&copy; 2026 SalesFortis. Commercial Subcontractor & Trade Suite.</p>
      </footer>
    </div>
  )
}

export default ConstructionMarketing
