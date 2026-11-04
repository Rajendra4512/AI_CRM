import React, { useEffect, useState } from 'react'
import { AppLayout } from './AppLayout'
import {
  BuildingIcon,
  UsersIcon,
  CheckCircleIcon,
  CalendarIcon,
  FileTextIcon,
} from '../../components/Icons'

interface AccountItem {
  id: string
  name: string
  account_type?: string
  industry?: string
  website?: string
  phone?: string
  email?: string
  isDemo?: boolean
}

interface ContactItem {
  id: string
  account_id?: string | null
  first_name: string
  last_name: string
  title?: string
  email?: string
  phone?: string
  isDemo?: boolean
}

interface OppSummary {
  id: string
  account_id?: string | null
  account_name?: string | null
  name: string
  amount: number
  stage: string
}

interface ActivityItem {
  id: string
  activity_type: string
  subject: string
  notes?: string
  created_at?: string
}

const CONSTRUCTION_RELATIONSHIP_TYPES = [
  'General Contractor',
  'Owner / Developer',
  'Specialty Subcontractor',
  'Material Supplier',
  'Architect / Engineer',
]

const DEMO_CONSTRUCTION_ACCOUNTS: AccountItem[] = [
  {
    id: 'demo-acc-1',
    name: 'Turner Preconstruction Group',
    account_type: 'General Contractor',
    industry: 'Healthcare & Commercial Building',
    website: 'https://turner-precon.example.com',
    phone: '(312) 555-0148',
    email: 'bids@turner-precon.example.com',
    isDemo: true,
  },
  {
    id: 'demo-acc-2',
    name: 'DPR Industrial Builders',
    account_type: 'General Contractor',
    industry: 'Mission Critical & Data Centers',
    website: 'https://dpr-industrial.example.com',
    phone: '(415) 555-0193',
    email: 'estimating@dpr-industrial.example.com',
    isDemo: true,
  },
  {
    id: 'demo-acc-3',
    name: 'Metro Health Facilities Authority',
    account_type: 'Owner / Developer',
    industry: 'Hospital & Acute Care Capital Projects',
    phone: '(312) 555-0177',
    email: 'capitalprojects@metrohealth.example.org',
    isDemo: true,
  },
  {
    id: 'demo-acc-4',
    name: 'Vulcan Structural Supply',
    account_type: 'Material Supplier',
    industry: 'CSI Div 05 Structural Steel & Decking',
    phone: '(214) 555-0162',
    email: 'quotes@vulcansupply.example.com',
    isDemo: true,
  },
]

const DEMO_CONSTRUCTION_CONTACTS: ContactItem[] = [
  {
    id: 'demo-con-1',
    account_id: 'demo-acc-1',
    first_name: 'Elena',
    last_name: 'Rostova',
    title: 'Chief Estimator',
    email: 'elena.rostova@turner-precon.example.com',
    phone: '(312) 555-0149',
    isDemo: true,
  },
  {
    id: 'demo-con-2',
    account_id: 'demo-acc-2',
    first_name: 'Marcus',
    last_name: 'Vance',
    title: 'VP of Preconstruction',
    email: 'm.vance@dpr-industrial.example.com',
    phone: '(415) 555-0199',
    isDemo: true,
  },
]

export const CompaniesContacts: React.FC = () => {
  const [activeIndustry, setActiveIndustry] = useState<string>(() =>
    (localStorage.getItem('sf_industry') || 'construction').toLowerCase()
  )
  const [tab, setTab] = useState<'companies' | 'contacts'>('companies')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [search, setSearch] = useState<string>('')

  const [accounts, setAccounts] = useState<AccountItem[]>([])
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [opportunities, setOpportunities] = useState<OppSummary[]>([])
  const [hasLiveRecords, setHasLiveRecords] = useState<boolean>(false)

  // Modals
  const [showAddCompany, setShowAddCompany] = useState<boolean>(false)
  const [compName, setCompName] = useState<string>('')
  const [compType, setCompType] = useState<string>('General Contractor')
  const [compScope, setCompScope] = useState<string>('')
  const [compPhone, setCompPhone] = useState<string>('')
  const [compEmail, setCompEmail] = useState<string>('')

  const [showAddContact, setShowAddContact] = useState<boolean>(false)
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [contactTitle, setContactTitle] = useState<string>('Chief Estimator')
  const [contactEmail, setContactEmail] = useState<string>('')
  const [contactPhone, setContactPhone] = useState<string>('')
  const [contactAccountId, setContactAccountId] = useState<string>('')

  // Selected Company Slide-Over
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null)
  const [accountActivities, setAccountActivities] = useState<ActivityItem[]>([])
  const [noteText, setNoteText] = useState<string>('')
  const [statusBanner, setStatusBanner] = useState<string>('')

  const loadDirectory = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [accRes, conRes, oppRes] = await Promise.all([
        fetch('/api/v1/crm/accounts', { headers }),
        fetch('/api/v1/crm/contacts', { headers }),
        fetch('/api/v1/crm/opportunities', { headers }),
      ])
      if (accRes.ok && conRes.ok) {
        const accData = await accRes.json()
        const conData = await conRes.json()
        const oppData = oppRes.ok ? await oppRes.json() : { opportunities: [] }
        const liveAccs: AccountItem[] = accData.accounts || []
        const liveCons: ContactItem[] = conData.contacts || []
        setAccounts(liveAccs)
        setContacts(liveCons)
        setOpportunities(oppData.opportunities || [])
        setHasLiveRecords(liveAccs.length > 0 || liveCons.length > 0)
      }
    } catch {
      // Offline preview tolerance
    }
  }

  useEffect(() => {
    const syncInd = () => setActiveIndustry((localStorage.getItem('sf_industry') || 'construction').toLowerCase())
    window.addEventListener('sf-tenant-updated', syncInd)
    loadDirectory()
    return () => window.removeEventListener('sf-tenant-updated', syncInd)
  }, [])

  useEffect(() => {
    if (!selectedAccount || selectedAccount.isDemo) {
      setAccountActivities([])
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetch(`/api/v1/crm/activities?resource_type=account&resource_id=${selectedAccount.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { activities: [] }))
      .then((d) => setAccountActivities(d.activities || []))
      .catch(() => setAccountActivities([]))
  }, [selectedAccount])

  const isConstruction = activeIndustry === 'all' || activeIndustry.includes('construction')

  const displayedAccounts = hasLiveRecords
    ? accounts
    : isConstruction
      ? DEMO_CONSTRUCTION_ACCOUNTS
      : []

  const displayedContacts = hasLiveRecords
    ? contacts
    : isConstruction
      ? DEMO_CONSTRUCTION_CONTACTS
      : []

  const accountMap = new Map(displayedAccounts.map((a) => [a.id, a.name]))

  const filteredAccounts = displayedAccounts.filter((a) => {
    const matchType = typeFilter === 'All' || (a.account_type || 'Customer') === typeFilter
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      (a.industry || '').toLowerCase().includes(q) ||
      (a.account_type || '').toLowerCase().includes(q)
    return matchType && matchSearch
  })

  const filteredContacts = displayedContacts.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    const full = `${c.first_name} ${c.last_name}`.toLowerCase()
    const org = (c.account_id ? accountMap.get(c.account_id) || '' : '').toLowerCase()
    return full.includes(q) || (c.title || '').toLowerCase().includes(q) || org.includes(q) || (c.email || '').toLowerCase().includes(q)
  })

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!compName.trim()) return
    const token = localStorage.getItem('access_token')
    if (token) {
      const res = await fetch('/api/v1/crm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: compName.trim(),
          account_type: compType,
          industry: compScope.trim() || undefined,
          phone: compPhone.trim() || undefined,
          email: compEmail.trim() || undefined,
        }),
      })
      if (res.ok) {
        await loadDirectory()
        setStatusBanner(`Saved organization "${compName.trim()}" (${compType}) to PostgreSQL.`)
      }
    } else {
      const localAcc: AccountItem = {
        id: `local-${Date.now()}`,
        name: compName.trim(),
        account_type: compType,
        industry: compScope.trim(),
        phone: compPhone.trim(),
        email: compEmail.trim(),
      }
      setAccounts((prev) => [localAcc, ...prev])
      setHasLiveRecords(true)
    }
    setCompName('')
    setCompScope('')
    setCompPhone('')
    setCompEmail('')
    setShowAddCompany(false)
  }

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    const token = localStorage.getItem('access_token')
    if (token) {
      const res = await fetch('/api/v1/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          title: contactTitle.trim() || undefined,
          email: contactEmail.trim() || undefined,
          phone: contactPhone.trim() || undefined,
          account_id: contactAccountId && !contactAccountId.startsWith('demo-') ? contactAccountId : undefined,
        }),
      })
      if (res.ok) {
        await loadDirectory()
        setStatusBanner(`Added contact "${firstName.trim()} ${lastName.trim()}" to CRM directory.`)
      }
    } else {
      setContacts((prev) => [
        {
          id: `local-c-${Date.now()}`,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          title: contactTitle.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          account_id: contactAccountId || null,
        },
        ...prev,
      ])
      setHasLiveRecords(true)
    }
    setFirstName('')
    setLastName('')
    setContactEmail('')
    setContactPhone('')
    setShowAddContact(false)
  }

  const handleLogAccountNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !noteText.trim()) return
    const token = localStorage.getItem('access_token')
    if (token && !selectedAccount.isDemo) {
      const res = await fetch('/api/v1/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          activity_type: 'note',
          subject: `GC Relationship Note — ${selectedAccount.name}`,
          resource_type: 'account',
          resource_id: selectedAccount.id,
          notes: noteText.trim(),
          completed: true,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setAccountActivities((prev) => [data.activity, ...prev])
        setNoteText('')
      }
    }
  }

  return (
    <AppLayout title="Companies & Contacts Directory">
      {/* Top Action & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={tab === 'companies' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('companies')}
          >
            <BuildingIcon size={15} /> Organizations ({displayedAccounts.length})
          </button>
          <button
            type="button"
            className={tab === 'contacts' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('contacts')}
          >
            <UsersIcon size={15} /> People &amp; Estimators ({displayedContacts.length})
          </button>

          {!hasLiveRecords && displayedAccounts.length > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#fff7ed',
                color: '#c2410c',
                border: '1px solid #fed7aa',
                padding: '0.28rem 0.65rem',
                borderRadius: '999px',
              }}
            >
              Sample Demo Directory • Add a Company to Persist Live Records
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search GC, trade scope, or estimator..."
            style={{
              padding: '0.48rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              minWidth: '240px',
            }}
          />
          <button type="button" className="btn-secondary" onClick={() => setShowAddContact(true)}>
            + Add Contact
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#ea580c', borderColor: '#ea580c' }}
            onClick={() => setShowAddCompany(true)}
          >
            + Add Company
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.65rem 1rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span><CheckCircleIcon size={15} color="#059669" /> {statusBanner}</span>
          <button
            type="button"
            onClick={() => setStatusBanner('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Construction Relationship Category Pills */}
      {tab === 'companies' && isConstruction && (
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          {['All', ...CONSTRUCTION_RELATIONSHIP_TYPES].map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setTypeFilter(rt)}
              style={{
                padding: '0.34rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: typeFilter === rt ? '1px solid #ea580c' : '1px solid #cbd5e1',
                background: typeFilter === rt ? '#fff7ed' : '#ffffff',
                color: typeFilter === rt ? '#c2410c' : '#475569',
              }}
            >
              {rt}
            </button>
          ))}
        </div>
      )}

      {/* Organizations Table */}
      {tab === 'companies' && (
        <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Relationship Role</th>
                <th>Trade / Market Focus</th>
                <th>Primary Phone &amp; Bid Email</th>
                <th>Linked Contacts</th>
                <th>Active Deals</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No organizations match this filter. Click <strong>+ Add Company</strong> to create a General Contractor, Owner, or Supplier record.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const linkedCons = displayedContacts.filter((c) => c.account_id === acc.id).length
                  const linkedOpps = opportunities.filter(
                    (o) => o.account_id === acc.id || o.account_name === acc.name
                  )
                  return (
                    <tr
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {acc.name}
                        {acc.isDemo && (
                          <span style={{ marginLeft: '0.45rem', fontSize: '0.68rem', color: '#9a3412', background: '#ffedd5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            Demo
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            background: acc.account_type === 'General Contractor' ? '#fff7ed' : '#f1f5f9',
                            color: acc.account_type === 'General Contractor' ? '#c2410c' : '#334155',
                          }}
                        >
                          {acc.account_type || 'General Contractor'}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>{acc.industry || 'Commercial Construction'}</td>
                      <td style={{ fontSize: '0.83rem', color: '#475569' }}>
                        {acc.phone || '—'} {acc.email ? `• ${acc.email}` : ''}
                      </td>
                      <td style={{ fontWeight: 600 }}>{linkedCons}</td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>
                        {linkedOpps.length > 0
                          ? `${linkedOpps.length} ($${linkedOpps.reduce((s, o) => s + (o.amount || 0), 0).toLocaleString()})`
                          : '0'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Contacts Table */}
      {tab === 'contacts' && (
        <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Role / Title</th>
                <th>Organization (GC / Owner)</th>
                <th>Email</th>
                <th>Direct Phone</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No contacts logged yet. Click <strong>+ Add Contact</strong> to add a Chief Estimator, Preconstruction Manager, or Project Manager.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {c.first_name} {c.last_name}
                    </td>
                    <td>{c.title || 'Estimator / PM'}</td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>
                      {(c.account_id && accountMap.get(c.account_id)) || 'Independent / Unlinked'}
                    </td>
                    <td>{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="copilot-backdrop" onClick={() => setShowAddCompany(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              margin: '8vh auto',
              boxShadow: '0 20px 40px rgba(15,23,42,0.22)',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Add Construction Organization</h3>
            <form onSubmit={handleCreateCompany} style={{ display: 'grid', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Company Name *</label>
                <input
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. McCarthy Building Companies"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Relationship Role</label>
                <select
                  value={compType}
                  onChange={(e) => setCompType(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {CONSTRUCTION_RELATIONSHIP_TYPES.map((rt) => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Primary Trade / Sector Focus</label>
                <input
                  value={compScope}
                  onChange={(e) => setCompScope(e.target.value)}
                  placeholder="e.g. Healthcare, Aviation & Commercial MEP"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Bid Desk Email</label>
                  <input
                    type="email"
                    value={compEmail}
                    onChange={(e) => setCompEmail(e.target.value)}
                    placeholder="estimating@gc.com"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Main Phone</label>
                  <input
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                    placeholder="(555) 234-5678"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddCompany(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>Save Organization</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="copilot-backdrop" onClick={() => setShowAddContact(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              margin: '8vh auto',
              boxShadow: '0 20px 40px rgba(15,23,42,0.22)',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Add Estimator / Customer Contact</h3>
            <form onSubmit={handleCreateContact} style={{ display: 'grid', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>First Name *</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jordan"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Last Name *</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Alvarez"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Role / Title</label>
                <input
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  placeholder="Chief Estimator / Preconstruction Manager"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Linked Organization</label>
                <select
                  value={contactAccountId}
                  onChange={(e) => setContactAccountId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">— Unlinked / Independent —</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.account_type || 'GC'})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="j.alvarez@gc.com"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Phone</label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(555) 890-1234"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddContact(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization 360 Relationship Slide-Over */}
      {selectedAccount && (
        <div className="copilot-backdrop" onClick={() => setSelectedAccount(null)}>
          <div className="copilot-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.15rem 1.25rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#fdba74', fontWeight: 700 }}>
                  {selectedAccount.account_type || 'General Contractor'} Relationship 360
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{selectedAccount.name}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'grid', gap: '1.15rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.9rem', fontSize: '0.84rem' }}>
                <div><strong>Market / Trade Scope:</strong> {selectedAccount.industry || 'Commercial Construction'}</div>
                <div style={{ marginTop: '0.3rem' }}><strong>Bid Desk Contact:</strong> {selectedAccount.email || 'Not recorded'} • {selectedAccount.phone || 'No phone'}</div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UsersIcon size={15} color="#ea580c" /> Linked Estimators &amp; Contacts
                </h4>
                {displayedContacts.filter((c) => c.account_id === selectedAccount.id).length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>No contacts linked to this company yet.</div>
                ) : (
                  displayedContacts
                    .filter((c) => c.account_id === selectedAccount.id)
                    .map((c) => (
                      <div key={c.id} style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '0.45rem', fontSize: '0.83rem' }}>
                        <strong>{c.first_name} {c.last_name}</strong> — {c.title || 'Estimator'}
                        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{c.email || ''} {c.phone ? `• ${c.phone}` : ''}</div>
                      </div>
                    ))
                )}
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileTextIcon size={15} color="#ea580c" /> Linked Bids &amp; Opportunities
                </h4>
                {opportunities.filter((o) => o.account_id === selectedAccount.id || o.account_name === selectedAccount.name).length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>No active or historical opportunities linked yet.</div>
                ) : (
                  opportunities
                    .filter((o) => o.account_id === selectedAccount.id || o.account_name === selectedAccount.name)
                    .map((o) => (
                      <div key={o.id} style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                        <span><strong>{o.name}</strong> ({o.stage})</span>
                        <span style={{ fontWeight: 700, color: '#059669' }}>${Number(o.amount || 0).toLocaleString()}</span>
                      </div>
                    ))
                )}
              </div>

              {!selectedAccount.isDemo && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CalendarIcon size={15} color="#ea580c" /> GC Relationship Timeline &amp; Notes
                  </h4>
                  <form onSubmit={handleLogAccountNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Log GC prequalification status, bonding limit, or bid preference..."
                      style={{ flex: 1, padding: '0.48rem 0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                    <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>Log Note</button>
                  </form>
                  {accountActivities.map((act) => (
                    <div key={act.id} style={{ padding: '0.55rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700 }}>{act.subject}</div>
                      {act.notes && <div style={{ color: '#475569', marginTop: '0.2rem' }}>{act.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

