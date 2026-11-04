import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  BrandMark,
  HardHatIcon,
  DnaIcon,
  ShipIcon,
  ShieldCheckIcon,
  LockIcon,
  CheckCircleIcon,
} from '../../components/Icons'
import './AppPortal.css'

const VALID_INDUSTRIES = ['construction', 'clinical', 'maritime'] as const
type IndustryChoice = typeof VALID_INDUSTRIES[number]

const INDUSTRY_THEME: Record<IndustryChoice, { label: string; accent: string; desc: string }> = {
  construction: {
    label: 'Construction & Commercial Subcontractors',
    accent: '#ea580c',
    desc: 'AIA G702/G703 SOV Progress Billing, Retainage, PCO Workflows, Field T&M & CSI Spec AI.',
  },
  clinical: {
    label: 'Clinical Trials, CTMS & Patient Recruitment',
    accent: '#059669',
    desc: 'HIPAA Safe Harbor Referral Firewall, 21 CFR Part 50 eConsent Gate, Visit Queue & Protocol AI.',
  },
  maritime: {
    label: 'Maritime Freight Forwarding & Supply Chain',
    accent: '#0284c7',
    desc: 'Ocean Carrier Tariff Control, BAF/THC/PSS Spot Quoting, House Bills of Lading & LFD Alerts.',
  },
}

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const initialMode = location.pathname === '/register' || searchParams.get('mode') === 'register' ? 'register' : 'login'
  const queryIndustry = (searchParams.get('industry') || '').toLowerCase()
  const hasExplicitIndustry = VALID_INDUSTRIES.includes(queryIndustry as IndustryChoice)
  const defaultIndustry: IndustryChoice = hasExplicitIndustry
    ? (queryIndustry as IndustryChoice)
    : 'construction'

  const defaultLoginEmail = hasExplicitIndustry ? `${defaultIndustry}.demo@salesfortis.com` : 'demo@salesfortis.com'

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState(initialMode === 'login' ? defaultLoginEmail : '')
  const [password, setPassword] = useState(initialMode === 'login' ? 'demopassword' : '')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState<IndustryChoice>(defaultIndustry)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const nextMode = location.pathname === '/register' || searchParams.get('mode') === 'register' ? 'register' : 'login'
    setMode(nextMode)
    const ind = (searchParams.get('industry') || '').toLowerCase()
    if (VALID_INDUSTRIES.includes(ind as IndustryChoice)) {
      setIndustry(ind as IndustryChoice)
      if (nextMode === 'login' && (email === '' || email === 'demo@salesfortis.com' || email.endsWith('.demo@salesfortis.com'))) {
        setEmail(`${ind}.demo@salesfortis.com`)
        setPassword('demopassword')
      }
    }
  }, [location.pathname, searchParams])

  const loginInstantVertical = async (targetInd: IndustryChoice) => {
    sessionStorage.removeItem('sf_logged_out')
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${targetInd}.demo@salesfortis.com`,
          password: 'demopassword',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('sf_token', data.access_token)
        localStorage.setItem('sf_is_superadmin', 'false')
        localStorage.setItem('sf_tenant_name', data.tenant?.name || `${targetInd.toUpperCase()} Demo`)
        localStorage.setItem('sf_industry', data.tenant?.industry || targetInd)
        navigate('/app/dashboard')
        return
      }
    } catch {
      // Offline preview fallback scoped strictly to chosen vertical
    }
    localStorage.removeItem('access_token')
    localStorage.setItem('sf_token', 'demo-jwt-token')
    localStorage.setItem('sf_is_superadmin', 'false')
    localStorage.setItem('sf_tenant_name', `${targetInd.charAt(0).toUpperCase() + targetInd.slice(1)} Demo Workspace`)
    localStorage.setItem('sf_industry', targetInd)
    navigate('/app/dashboard')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.detail || 'Authentication failed. Check your email and password.')
        setLoading(false)
        return
      }
      sessionStorage.removeItem('sf_logged_out')
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('sf_token', data.access_token)
      localStorage.setItem('sf_is_superadmin', data.user?.is_superadmin ? 'true' : 'false')
      if (data.tenant) {
        localStorage.setItem('sf_tenant_name', data.tenant.name || 'Workspace')
        localStorage.setItem('sf_industry', data.tenant.industry || 'construction')
        localStorage.setItem('sf_tier', data.tenant.subscription_tier || 'trial')
      }
      setLoading(false)
      navigate('/app/dashboard')
    } catch {
      if ((email === 'demo@salesfortis.com' || email.endsWith('.demo@salesfortis.com')) && password === 'demopassword') {
        const inferredInd = email.startsWith('clinical.')
          ? 'clinical'
          : email.startsWith('maritime.')
          ? 'maritime'
          : email.startsWith('construction.')
          ? 'construction'
          : 'all'
        sessionStorage.removeItem('sf_logged_out')
        localStorage.removeItem('access_token')
        localStorage.setItem('sf_token', 'demo-jwt-token')
        localStorage.setItem('sf_tenant_name', inferredInd === 'all' ? 'Apex Enterprise LLC' : `${inferredInd.toUpperCase()} Demo Workspace`)
        localStorage.setItem('sf_industry', inferredInd)
        setLoading(false)
        navigate('/app/dashboard')
        return
      }
      setErrorMessage('Unable to connect to authentication service.')
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          industry,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.detail || 'Workspace registration failed.')
        setLoading(false)
        return
      }
      setLoading(false)
      setSuccessMessage(`Workspace "${data.tenant?.name || companyName}" provisioned (${industry.toUpperCase()} Trial). Sign in below to launch your authorized CRM dashboard.`)
      setMode('login')
      navigate('/login', { replace: true })
    } catch {
      setErrorMessage('Unable to reach tenant provisioning API.')
      setLoading(false)
    }
  }

  const activeTheme = INDUSTRY_THEME[industry]

  return (
    <div className="login-wrapper">
      {/* Left Enterprise Architecture & Quick-Switch Brand Pane */}
      <div className="login-brand-pane">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '2.5rem' }} onClick={() => navigate('/')}>
            <BrandMark size={36} accent={hasExplicitIndustry ? activeTheme.accent : '#2563eb'} />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SalesFortis Cloud</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Enterprise Multi-Tenant Industry Systems</div>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.7rem', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.25)', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1rem' }}>
            <LockIcon size={13} color="#60a5fa" /> Zero Cross-Industry Data Leakage
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.18, margin: '0 0 1rem', letterSpacing: '-0.025em' }}>
            {hasExplicitIndustry ? activeTheme.label : 'Isolated Industry Workspaces for High-Compliance Teams'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.96rem', lineHeight: 1.6, margin: '0 0 2rem', maxWidth: '480px' }}>
            {hasExplicitIndustry
              ? activeTheme.desc
              : 'Provision a dedicated Construction, Clinical Trials, or Maritime Forwarding workspace backed by tenant-scoped PostgreSQL persistence and citation-verified AI.'}
          </p>

          {/* Direct Isolated Single-Vertical Live Sandboxes */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px', padding: '1.15rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Launch Isolated Single-Vertical Sandbox (Live PostgreSQL)
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => loginInstantVertical('construction')}
                style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(251,146,60,0.3)', color: '#ffedd5', padding: '0.6rem 0.85rem', borderRadius: '7px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.83rem', fontWeight: 600 }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HardHatIcon size={15} color="#fb923c" /> Construction Subcontractor Sandbox
                </span>
                <span className="sf-mono" style={{ fontSize: '0.72rem', color: '#fdba74' }}>construction.demo</span>
              </button>
              <button
                type="button"
                onClick={() => loginInstantVertical('clinical')}
                style={{ background: 'rgba(5,150,105,0.14)', border: '1px solid rgba(52,211,153,0.3)', color: '#d1fae5', padding: '0.6rem 0.85rem', borderRadius: '7px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.83rem', fontWeight: 600 }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DnaIcon size={15} color="#34d399" /> Clinical Trials &amp; CTMS Sandbox
                </span>
                <span className="sf-mono" style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>clinical.demo</span>
              </button>
              <button
                type="button"
                onClick={() => loginInstantVertical('maritime')}
                style={{ background: 'rgba(2,132,199,0.14)', border: '1px solid rgba(56,189,248,0.3)', color: '#e0f2fe', padding: '0.6rem 0.85rem', borderRadius: '7px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.83rem', fontWeight: 600 }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShipIcon size={15} color="#38bdf8" /> Maritime &amp; Freight Tower Sandbox
                </span>
                <span className="sf-mono" style={{ fontSize: '0.72rem', color: '#7dd3fc' }}>maritime.demo</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: '#94a3b8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheckIcon size={14} color="#60a5fa" /> JWT Revocation Blacklist
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircleIcon size={14} color="#34d399" /> Fail-Closed RBAC
          </span>
        </div>
      </div>

      {/* Right Authentication & Workspace Provisioning Form */}
      <div className="login-form-pane">
        <div className="login-card" style={{ maxWidth: mode === 'register' ? '490px' : '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'inline-flex', marginBottom: '0.5rem' }}>
              <BrandMark size={40} accent={hasExplicitIndustry ? activeTheme.accent : '#2563eb'} />
            </div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>SalesFortis CRM</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.86rem' }}>
              {mode === 'register'
                ? 'Provision your isolated single-vertical workspace'
                : 'Sign in to your authorized workspace'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setErrorMessage('')
                setMode('login')
                navigate(hasExplicitIndustry ? `/login?industry=${industry}` : '/login')
              }}
              style={{
                flex: 1,
                padding: '0.48rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'login' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMessage('')
                setSuccessMessage('')
                if (email === 'demo@salesfortis.com' || email.endsWith('.demo@salesfortis.com')) {
                  setEmail('')
                  setPassword('')
                }
                setMode('register')
                navigate(`/register?industry=${industry}`)
              }}
              style={{
                flex: 1,
                padding: '0.48rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'register' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
              }}
            >
              Create Workspace
            </button>
          </div>

          {errorMessage && (
            <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.7rem', borderRadius: '6px', fontSize: '0.83rem', marginBottom: '1rem' }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div role="status" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.7rem', borderRadius: '6px', fontSize: '0.83rem', marginBottom: '1rem' }}>
              {successMessage}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  name="email"
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
                  name="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.7rem', marginTop: '0.35rem', fontSize: '0.92rem' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Elena"
                    className="form-control"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Vance"
                    className="form-control"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. Pacific Trade Contractors LLC"
                  className="form-control"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Industry Suite Entitlement</label>
                <select
                  name="industry"
                  className="form-control"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as IndustryChoice)}
                >
                  <option value="construction">Construction &amp; Commercial Trades</option>
                  <option value="clinical">Clinical Trials &amp; Patient Recruitment</option>
                  <option value="maritime">Maritime Logistics &amp; Freight Brokerage</option>
                </select>
              </div>

              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password (min. 8 characters)</label>
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.7rem', marginTop: '0.35rem', fontSize: '0.92rem' }}
                disabled={loading}
              >
                {loading ? 'Provisioning Tenant...' : 'Provision Workspace →'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={async () => {
                if (hasExplicitIndustry || mode === 'register') {
                  await loginInstantVertical(industry)
                  return
                }
                sessionStorage.removeItem('sf_logged_out')
                try {
                  const res = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'demo@salesfortis.com', password: 'demopassword' }),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    localStorage.setItem('access_token', data.access_token)
                    localStorage.setItem('sf_token', data.access_token)
                    localStorage.setItem('sf_is_superadmin', 'false')
                    localStorage.setItem('sf_tenant_name', data.tenant?.name || 'Apex Enterprise LLC')
                    localStorage.setItem('sf_industry', data.tenant?.industry || 'all')
                    navigate('/app/dashboard')
                    return
                  }
                } catch {
                  // Offline fallback
                }
                localStorage.removeItem('access_token')
                localStorage.setItem('sf_token', 'demo-jwt-token')
                localStorage.setItem('sf_is_superadmin', 'false')
                localStorage.setItem('sf_tenant_name', 'Apex Enterprise LLC')
                localStorage.setItem('sf_industry', 'all')
                navigate('/app/dashboard')
              }}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.83rem' }}
            >
              {hasExplicitIndustry || mode === 'register'
                ? `One-Click Instant ${industry.charAt(0).toUpperCase() + industry.slice(1)} Demo Access`
                : 'One-Click Instant Demo Access'}
            </button>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <a href="/" style={{ color: '#2563eb', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Public Website
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
