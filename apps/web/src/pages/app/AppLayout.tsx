import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BrandMark,
  DashboardIcon,
  PipelineIcon,
  LayersIcon,
  ShieldCheckIcon,
  GlobeIcon,
  LogOutIcon,
  BuildingIcon,
  SparklesIcon,
  HardHatIcon,
  DnaIcon,
  ShipIcon,
  CalculatorIcon,
  WrenchIcon,
  FileTextIcon,
  UsersIcon,
  CalendarIcon,
  ContainerIcon,
} from '../../components/Icons'
import './AppPortal.css'

interface AppLayoutProps {
  title: string
  children: React.ReactNode
}

const INDUSTRY_META: Record<string, { badge: string; edition: string; accent: string }> = {
  construction: {
    badge: 'Construction Suite',
    edition: 'Subcontractor & Project Ops',
    accent: '#ea580c',
  },
  clinical: {
    badge: 'Clinical Suite',
    edition: 'CTMS & Patient Recruitment',
    accent: '#059669',
  },
  maritime: {
    badge: 'Maritime Suite',
    edition: 'Freight Forwarding Control',
    accent: '#0284c7',
  },
  'construction,clinical,maritime': {
    badge: 'Multi-Vertical Demo',
    edition: 'Enterprise Multi-Vertical',
    accent: '#2563eb',
  },
  all: {
    badge: 'Multi-Vertical Demo',
    edition: 'Enterprise Multi-Vertical',
    accent: '#2563eb',
  },
}

export const AppLayout: React.FC<AppLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [tenantName, setTenantName] = useState<string>(() => localStorage.getItem('sf_tenant_name') || 'Apex Enterprise LLC')
  const [tenantIndustry, setTenantIndustry] = useState<string>(() => (localStorage.getItem('sf_industry') || 'all').toLowerCase())
  const [isSuperadmin, setIsSuperadmin] = useState<boolean>(() => localStorage.getItem('sf_is_superadmin') === 'true')

  // Live Tenant-Isolated AI Document Copilot Drawer State
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false)
  const [ragQuery, setRagQuery] = useState<string>('')
  const [ragLoading, setRagLoading] = useState<boolean>(false)
  const [ragAnswer, setRagAnswer] = useState<string>('')
  const [ragSources, setRagSources] = useState<Array<{ filename: string; snippet: string; score?: number }>>([])
  const [ingestTitle, setIngestTitle] = useState<string>('')
  const [ingestBody, setIngestBody] = useState<string>('')
  const [ingestNotice, setIngestNotice] = useState<string>('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const demoToken = localStorage.getItem('sf_token')
    const loggedOut = sessionStorage.getItem('sf_logged_out') === 'true'

    if (loggedOut && !token && !demoToken) {
      navigate('/login', { replace: true })
      return
    }

    if (token) {
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('sf_token')
            localStorage.removeItem('sf_tenant_name')
            localStorage.removeItem('sf_industry')
            sessionStorage.setItem('sf_logged_out', 'true')
            navigate('/login', { replace: true })
            return
          }
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              const superFlag = Boolean(data.user.is_superadmin)
              setIsSuperadmin(superFlag)
              localStorage.setItem('sf_is_superadmin', superFlag ? 'true' : 'false')
            }
            if (data.tenant) {
              const name = data.tenant.name || 'Apex Enterprise LLC'
              const ind = (data.tenant.industry || 'construction').toLowerCase()
              setTenantName(name)
              setTenantIndustry(ind)
              localStorage.setItem('sf_tenant_name', name)
              localStorage.setItem('sf_industry', ind)
              window.dispatchEvent(new Event('sf-tenant-updated'))
            }
          }
        })
        .catch(() => {
          // Offline preview tolerance
        })
    }
  }, [navigate])

  const handleLogout = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // Proceed with client session cleanup
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('sf_token')
    localStorage.removeItem('sf_tenant_name')
    localStorage.removeItem('sf_industry')
    localStorage.removeItem('sf_tier')
    localStorage.removeItem('sf_is_superadmin')
    sessionStorage.setItem('sf_logged_out', 'true')
    navigate('/login')
  }

  const meta = INDUSTRY_META[tenantIndustry] || {
    badge: `${tenantIndustry} Suite`,
    edition: 'Isolated Industry Workspace',
    accent: '#2563eb',
  }

  const entitledSet = tenantIndustry === 'all' ? ['construction', 'clinical', 'maritime'] : tenantIndustry.split(',').map((x) => x.trim())
  const searchParams = new URLSearchParams(location.search)
  const currentSub = searchParams.get('sub') || ''

  const domainSubLinks: Array<{ label: string; path: string; subKey: string; icon: React.ReactNode }> = []
  if (entitledSet.length === 1 && entitledSet[0] === 'construction') {
    domainSubLinks.push(
      { label: 'Bid Desk, RFQs & Handover', path: '/app/verticals?vertical=construction&sub=bids', subKey: 'bids', icon: <FileTextIcon size={14} /> },
      { label: 'AIA G702/G703 SOV Billing', path: '/app/verticals?vertical=construction&sub=sov', subKey: 'sov', icon: <CalculatorIcon size={14} /> },
      { label: 'Change Events & PCOs', path: '/app/verticals?vertical=construction&sub=pco', subKey: 'pco', icon: <LayersIcon size={14} /> },
      { label: 'Field T&M Crew Tickets', path: '/app/verticals?vertical=construction&sub=tm', subKey: 'tm', icon: <WrenchIcon size={14} /> },
      { label: 'CSI Spec & Addendum AI', path: '/app/verticals?vertical=construction&sub=spec', subKey: 'spec', icon: <SparklesIcon size={14} /> }
    )
  } else if (entitledSet.length === 1 && entitledSet[0] === 'clinical') {
    domainSubLinks.push(
      { label: 'eConsent & Cohort Gate', path: '/app/verticals?vertical=clinical&sub=ctms', subKey: 'ctms', icon: <ShieldCheckIcon size={14} /> },
      { label: 'Safe Harbor Referrals', path: '/app/verticals?vertical=clinical&sub=referrals', subKey: 'referrals', icon: <UsersIcon size={14} /> },
      { label: 'Visit & Follow-Up Queue', path: '/app/verticals?vertical=clinical&sub=followups', subKey: 'followups', icon: <CalendarIcon size={14} /> },
      { label: 'Protocol Eligibility AI', path: '/app/verticals?vertical=clinical&sub=protocol', subKey: 'protocol', icon: <FileTextIcon size={14} /> }
    )
  } else if (entitledSet.length === 1 && entitledSet[0] === 'maritime') {
    domainSubLinks.push(
      { label: 'Ocean Spot Quoting', path: '/app/verticals?vertical=maritime&sub=quoting', subKey: 'quoting', icon: <CalculatorIcon size={14} /> },
      { label: 'Container & LFD Control', path: '/app/verticals?vertical=maritime&sub=tracking', subKey: 'tracking', icon: <ContainerIcon size={14} /> },
      { label: 'Carrier Tariff & Cards', path: '/app/verticals?vertical=maritime&sub=tariffs', subKey: 'tariffs', icon: <SparklesIcon size={14} /> },
      { label: 'House Bill of Lading', path: '/app/verticals?vertical=maritime&sub=hbl', subKey: 'hbl', icon: <FileTextIcon size={14} /> }
    )
  }

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ragQuery.trim()) return
    setRagLoading(true)
    setRagAnswer('')
    setRagSources([])
    const token = localStorage.getItem('access_token') || ''
    try {
      const res = await fetch('/api/v1/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: ragQuery, top_k: 3 }),
      })
      if (res.ok) {
        const data = await res.json()
        setRagAnswer(data.answer || 'Query processed against isolated tenant document index.')
        setRagSources(data.citations || data.results || [])
      } else {
        setRagAnswer('Sign in with an authenticated workspace token to query live PostgreSQL RAG chunks.')
      }
    } catch {
      setRagAnswer('Tenant RAG index ready. Index a specification, protocol, or tariff document below to query citations.')
    } finally {
      setRagLoading(false)
    }
  }

  const handleIngestDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ingestTitle.trim() || !ingestBody.trim()) return
    const token = localStorage.getItem('access_token') || ''
    setIngestNotice('')
    try {
      const res = await fetch('/api/v1/ai/index-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ filename: ingestTitle, content: ingestBody }),
      })
      if (res.ok) {
        const data = await res.json()
        setIngestNotice(
          `Indexed "${data.filename}" (${data.chunks_indexed} chunks)${data.prompt_injection_sanitized ? ' • Prompt injection sanitized' : ''}.`
        )
        setIngestTitle('')
        setIngestBody('')
      } else {
        setIngestNotice('Requires live workspace session token to index documents.')
      }
    } catch {
      setIngestNotice('Unable to reach document indexing endpoint.')
    }
  }

  return (
    <div className="app-container">
      {/* Industry-Adaptive Enterprise Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <BrandMark size={30} accent={meta.accent} />
          <div>
            <h2>SalesFortis</h2>
            <span className="sidebar-edition-tag">{meta.edition}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Commercial CRM</div>
          <button
            className={`nav-link ${location.pathname === '/app/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/app/dashboard')}
          >
            <DashboardIcon size={16} /> Dashboard
          </button>
          <button
            className={`nav-link ${location.pathname === '/app/leads' ? 'active' : ''}`}
            onClick={() => navigate('/app/leads')}
          >
            <PipelineIcon size={16} /> Leads &amp; Pipeline
          </button>
          <button
            className={`nav-link ${location.pathname === '/app/contacts' ? 'active' : ''}`}
            onClick={() => navigate('/app/contacts')}
          >
            <UsersIcon size={16} /> Companies &amp; Contacts
          </button>

          <div className="sidebar-section-label">Operational Modules</div>
          <button
            className={`nav-link ${location.pathname === '/app/verticals' && !currentSub ? 'active' : ''}`}
            onClick={() => navigate('/app/verticals')}
          >
            {tenantIndustry === 'construction' ? (
              <HardHatIcon size={16} color="#fb923c" />
            ) : tenantIndustry === 'clinical' ? (
              <DnaIcon size={16} color="#34d399" />
            ) : tenantIndustry === 'maritime' ? (
              <ShipIcon size={16} color="#38bdf8" />
            ) : (
              <LayersIcon size={16} />
            )}
            Vertical Suites
          </button>

          {domainSubLinks.map((sub) => (
            <button
              key={sub.subKey}
              className={`nav-sublink ${location.pathname === '/app/verticals' && currentSub === sub.subKey ? 'active' : ''}`}
              onClick={() => navigate(sub.path)}
            >
              {sub.icon} {sub.label}
            </button>
          ))}

          {isSuperadmin && (
            <>
              <div className="sidebar-section-label">Platform Governance</div>
              <button
                className={`nav-link ${location.pathname === '/app/admin' ? 'active' : ''}`}
                onClick={() => navigate('/app/admin')}
              >
                <ShieldCheckIcon size={16} color="#60a5fa" /> Superadmin Console
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link" onClick={() => navigate('/')}>
            <GlobeIcon size={15} /> Public Website
          </button>
          <button className="nav-link" onClick={handleLogout} style={{ color: '#fca5a5' }}>
            <LogOutIcon size={15} color="#f87171" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            <div className="topbar-subtitle">
              Tenant-Isolated PostgreSQL Ledger • Role-Scoped Operational Environment
            </div>
          </div>

          <div className="topbar-actions">
            <span className="badge-tenant" data-testid="tenant-badge">
              <BuildingIcon size={14} color="#475569" /> {tenantName}
            </span>
            <span
              className="badge-tenant"
              data-testid="industry-badge"
              style={{
                background: `${meta.accent}14`,
                borderColor: `${meta.accent}40`,
                color: meta.accent,
              }}
            >
              {meta.badge}
            </span>
            <button className="btn-secondary" onClick={() => setCopilotOpen(true)}>
              <SparklesIcon size={15} color={meta.accent} /> AI Copilot
            </button>
            <button className="btn-primary" style={{ background: meta.accent, borderColor: meta.accent }} onClick={() => navigate('/app/leads')}>
              + New Deal
            </button>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      {/* Live Slide-Over Document RAG & Copilot Drawer */}
      {copilotOpen && (
        <div className="copilot-backdrop" onClick={() => setCopilotOpen(false)}>
          <div className="copilot-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <SparklesIcon size={18} color="#60a5fa" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tenant Document RAG Copilot</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Isolated Vector Context • {tenantName}</div>
                </div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.28rem 0.6rem', fontSize: '0.78rem' }} onClick={() => setCopilotOpen(false)}>
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <form onSubmit={handleAskCopilot} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
                <label className="sf-field-label">Query Specifications, Protocols, or Tariffs</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="form-control"
                    placeholder="e.g. Retainage terms or inclusion criteria..."
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" disabled={ragLoading}>
                    {ragLoading ? '...' : 'Ask'}
                  </button>
                </div>
                {ragAnswer && (
                  <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.83rem', color: '#1e293b' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#0f172a' }}>Citation-Grounded Response:</div>
                    <div>{ragAnswer}</div>
                    {ragSources.length > 0 && (
                      <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#475569' }}>
                        {ragSources.map((s, idx) => (
                          <div key={idx} className="sf-mono" style={{ marginBottom: '0.25rem' }}>
                            [{idx + 1}] {s.filename}: {s.snippet?.slice(0, 90)}...
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>

              <form onSubmit={handleIngestDoc} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.65rem', color: '#0f172a' }}>
                  Index New Workspace Document (Prompt-Injection Protected)
                </div>
                <div className="form-group">
                  <label>Document Filename / Reference</label>
                  <input
                    className="form-control"
                    placeholder="e.g. CSI-05-1200-Addendum2.txt"
                    value={ingestTitle}
                    onChange={(e) => setIngestTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Document Text Content</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Paste specification clause, clinical protocol amendment, or carrier rate rule..."
                    value={ingestBody}
                    onChange={(e) => setIngestBody(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-secondary" style={{ width: '100%' }}>
                  Sanitize &amp; Index into Tenant Store
                </button>
                {ingestNotice && (
                  <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                    {ingestNotice}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
