import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Marketing.css'

const MaritimeMarketing: React.FC = () => {
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
        <section className="marketing-hero" style={{background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'}}>
          <h1>Maritime Logistics & Freight Brokerage Suite</h1>
          <p className="hero-subtitle">End-to-end freight management - inspired by Logitude World & Magaya Supply Chain</p>
          <button className="cta-btn">Start Free Trial</button>
        </section>

        <section className="features-section">
          <h2>Optimize Your Freight Operations</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📦 Freight Enquiries</h3>
              <p>Manage enquiries with route optimization and instant quote generation</p>
            </div>
            <div className="feature-card">
              <h3>💹 Rate Management</h3>
              <p>Centralize carrier rates, surcharges, and validity periods</p>
            </div>
            <div className="feature-card">
              <h3>📄 Quotations & Bookings</h3>
              <p>Generate professional quotes and convert to bookings seamlessly</p>
            </div>
            <div className="feature-card">
              <h3>🚢 Shipment Tracking</h3>
              <p>Track shipments with milestone updates and ETA predictions</p>
            </div>
            <div className="feature-card">
              <h3>🧾 Documentation</h3>
              <p>Manage Bills of Lading, manifests, and customs documentation</p>
            </div>
            <div className="feature-card">
              <h3>📊 Analytics & Profitability</h3>
              <p>Track margins, costs, and performance with AI-powered insights</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <p>&copy; 2026 SalesFortis. Maritime Logistics & Freight Brokerage Suite.</p>
      </footer>
    </div>
  )
}

export default MaritimeMarketing
