import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './AppPortal.css'

interface AppLayoutProps {
  title: string
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('sf_token')
    navigate('/')
  }

  const navItems = [
    { label: '📊 Dashboard', path: '/app/dashboard' },
    { label: '💼 Leads & Pipeline', path: '/app/leads' },
    { label: '⚙️ Vertical Suites', path: '/app/verticals' },
  ]

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <svg width="28" height="28" viewBox="0 0 50 50" fill="none">
            <rect width="50" height="50" rx="8" fill="#2563eb"/>
            <path d="M15 20L25 15L35 20V35H15V20Z" stroke="white" strokeWidth="3" fill="none"/>
          </svg>
          <h2>SalesFortis</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link" onClick={() => navigate('/')}>
            🌐 Public Website
          </button>
          <button className="nav-link" onClick={handleLogout} style={{ color: '#f87171' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <span className="badge-tenant">🏢 Apex Enterprise LLC</span>
            <button className="btn-secondary" onClick={() => alert('AI Assistant: No anomalies detected across active vertical pipelines.')}>
              ✨ AI Copilot
            </button>
            <button className="btn-primary" onClick={() => navigate('/app/leads')}>
              + New Deal
            </button>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  )
}

