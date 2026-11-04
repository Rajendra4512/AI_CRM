import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PipelineIcon, FileTextIcon, BuildingIcon, DownloadIcon, SparklesIcon, CalendarIcon, AlertTriangleIcon, CheckCircleIcon, LayersIcon } from '../../../components/Icons'

/**
 * Construction CRM Pipeline Workspace (construction-only tenants).
 * Board (HTML5 drag-and-drop) | Register (table + CSV) | Leads Inbox (qualify) | Customize Stages.
 * Every live record is persisted through tenant-scoped FastAPI endpoints; unpersisted sample cards
 * are labelled "Demo Preview Cards".
 */

interface Stage {
  key: string
  label: string
  probability: number
}

interface Opp {
  id: string
  name: string
  amount: number
  stage: string
  probability?: string | null
  close_date?: string | null
  account_id?: string | null
  account_name?: string | null
  days_in_stage: number
  is_stale: boolean
  isDemo?: boolean
}

interface Lead {
  id: string
  first_name: string
  last_name: string
  company?: string
  email?: string
  phone?: string
  status?: string
  source?: string
}

interface Activity {
  id: string
  action: string
  activity_type: string
  subject: string
  notes?: string
  due_date?: string
  completed?: boolean
  created_at?: string
}

interface CoachResult {
  verified_facts: Record<string, string | number | null>
  bid_qualification: { score: number; recommendation_badge: string; factors: Array<{ factor: string; impact: string; detail: string }>; detected_csi_divisions: string[] }
  ai_recommendations: { model_generated: boolean; advisory_notice: string; next_best_actions: Array<{ priority: string; action: string; rationale: string }> }
}

const FALLBACK_STAGES: Stage[] = [
  { key: 'lead', label: 'Inbound Leads / ITBs', probability: 15 },
  { key: 'qualified', label: 'Qualified', probability: 30 },
  { key: 'rfq_takeoff', label: 'RFQ & Takeoff', probability: 50 },
  { key: 'proposal', label: 'Bid Submitted', probability: 65 },
  { key: 'negotiation', label: 'GC Negotiation', probability: 80 },
  { key: 'won', label: 'Contract Awarded', probability: 100 },
  { key: 'lost', label: 'Lost / No-Bid', probability: 0 },
]

const DEMO_OPPS: Opp[] = [
  { id: 'demo-1', name: 'HVAC Retrofit Bid', amount: 340000, stage: 'proposal', account_name: 'Turner Construction', days_in_stage: 3, is_stale: false, isDemo: true },
  { id: 'demo-2', name: 'Electrical Substation Package', amount: 1200000, stage: 'won', account_name: 'Skanska USA', days_in_stage: 1, is_stale: false, isDemo: true },
  { id: 'demo-3', name: 'Curtain Wall & Glazing Scope', amount: 485000, stage: 'rfq_takeoff', account_name: 'Clark Builders', days_in_stage: 9, is_stale: true, isDemo: true },
  { id: 'demo-4', name: 'Hospital Tower Fire Protection', amount: 265000, stage: 'lead', account_name: 'McCarthy Building', days_in_stage: 2, is_stale: false, isDemo: true },
]

const EMAIL_TEMPLATES = [
  { key: 'bid_submitted', label: 'Bid Submitted — Scope Confirmation', body: 'Thank you for the opportunity to bid. Attached is our proposal including base bid, alternates, and clarifications. Can we schedule a 15-minute scope review this week?' },
  { key: 'addendum', label: 'Addendum Acknowledgement', body: 'We acknowledge receipt of the latest addendum and have incorporated the revised scope into our pricing. Please confirm the bid due date remains unchanged.' },
  { key: 'post_award', label: 'Post-Award Kickoff', body: 'Thank you for the award. Please share the subcontract, insurance requirements, and submittal schedule so we can begin mobilization planning.' },
]

const SAVED_VIEWS = [
  { key: 'all', label: 'All Deals' },
  { key: 'high', label: 'High Value ≥ $250k' },
  { key: 'stale', label: 'Stale / Idle ≥ 7d' },
  { key: 'won', label: 'Awarded / Won' },
]

const fmt = (n: number) => `$${Math.round(n || 0).toLocaleString()}`

function parseCurrency(val: string): number {
  const cleaned = Number(String(val).replace(/[^0-9.]/g, ''))
  return Number.isFinite(cleaned) && cleaned > 0 ? cleaned : 100000
}

export const ConstructionPipeline: React.FC = () => {
  const token = localStorage.getItem('access_token') || ''
  const authHeaders = useMemo<Record<string, string>>(
    () => (token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' }),
    [token]
  )

  const [mode, setMode] = useState<'board' | 'register' | 'leads' | 'stages'>('board')
  const [stages, setStages] = useState<Stage[]>(FALLBACK_STAGES)
  const [opps, setOpps] = useState<Opp[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [hasLive, setHasLive] = useState(false)
  const [view, setView] = useState('all')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  // Add opportunity modal
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newValue, setNewValue] = useState('')

  // Lead create / qualify
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadFirst, setLeadFirst] = useState('')
  const [leadLast, setLeadLast] = useState('')
  const [leadCompany, setLeadCompany] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSource, setLeadSource] = useState('GC Bid Invitation')
  const [qualifyLead, setQualifyLead] = useState<Lead | null>(null)
  const [qOppName, setQOppName] = useState('')
  const [qAmount, setQAmount] = useState('250000')
  const [qCreateRfq, setQCreateRfq] = useState(true)
  const [qDueDays, setQDueDays] = useState('14')
  const [qScope, setQScope] = useState('')

  // Detail slide-over
  const [selected, setSelected] = useState<Opp | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editProb, setEditProb] = useState('')
  const [editClose, setEditClose] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [actType, setActType] = useState('call')
  const [actSubject, setActSubject] = useState('')
  const [actDue, setActDue] = useState('')
  const [noteText, setNoteText] = useState('')
  const [templateKey, setTemplateKey] = useState(EMAIL_TEMPLATES[0].key)
  const [coach, setCoach] = useState<CoachResult | null>(null)
  const [coachLoading, setCoachLoading] = useState(false)
  const [competitors, setCompetitors] = useState('3')
  const [margin, setMargin] = useState('14')

  const loadAll = useCallback(async () => {
    if (!token) return
    try {
      const [cfg, oppRes, leadRes] = await Promise.all([
        fetch('/api/v1/crm/pipeline-config', { headers: authHeaders }),
        fetch('/api/v1/crm/opportunities', { headers: authHeaders }),
        fetch('/api/v1/crm/leads', { headers: authHeaders }),
      ])
      if (cfg.ok) {
        const d = await cfg.json()
        if (Array.isArray(d.stages) && d.stages.length >= 2) setStages(d.stages)
      }
      if (oppRes.ok) {
        const d = await oppRes.json()
        const list: Opp[] = (d.opportunities || []).map((o: Opp) => ({
          ...o,
          stage: o.stage === 'prospecting' ? 'lead' : o.stage === 'closed_won' ? 'won' : o.stage,
        }))
        setOpps(list)
        setHasLive(list.length > 0)
      }
      if (leadRes.ok) {
        const d = await leadRes.json()
        setLeads(d.leads || [])
      }
    } catch {
      // Offline preview tolerance
    }
  }, [token, authHeaders])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const displayedOpps = hasLive ? opps : DEMO_OPPS
  const stageKeys = new Set(stages.map((s) => s.key))
  const probFor = (key: string) => stages.find((s) => s.key === key)?.probability ?? 30

  const filtered = displayedOpps.filter((o) => {
    const q = search.trim().toLowerCase()
    if (q && !o.name.toLowerCase().includes(q) && !(o.account_name || '').toLowerCase().includes(q)) return false
    if (view === 'high') return o.amount >= 250000
    if (view === 'stale') return o.is_stale
    if (view === 'won') return o.stage === 'won'
    return true
  })

  const openValue = filtered.filter((o) => o.stage !== 'won' && o.stage !== 'lost').reduce((a, o) => a + o.amount, 0)
  const weighted = filtered
    .filter((o) => o.stage !== 'won' && o.stage !== 'lost')
    .reduce((a, o) => a + o.amount * ((Number(o.probability) || probFor(o.stage)) / 100), 0)
  const staleCount = filtered.filter((o) => o.is_stale).length

  const flash = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(''), 4000)
  }

  const moveToStage = async (opp: Opp, stageKey: string) => {
    if (opp.stage === stageKey) return
    const prob = String(probFor(stageKey))
    if (opp.isDemo || !token) {
      if (!hasLive) return flash('Demo Preview Cards are read-only. Add an opportunity to persist live deals.')
    }
    setOpps((prev) => prev.map((o) => (o.id === opp.id ? { ...o, stage: stageKey, probability: prob, days_in_stage: 0, is_stale: false } : o)))
    try {
      const res = await fetch(`/api/v1/crm/opportunities/${opp.id}/stage`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ stage: stageKey }),
      })
      if (res.ok) {
        const label = stages.find((s) => s.key === stageKey)?.label || stageKey
        flash(`"${opp.name}" moved to ${label}${stageKey === 'proposal' || stageKey === 'won' ? ' • follow-up task auto-scheduled' : ''}.`)
      } else {
        flash('Stage change was not saved. Reloading pipeline.')
        loadAll()
      }
    } catch {
      loadAll()
    }
  }

  const handleDrop = (stageKey: string) => {
    const opp = displayedOpps.find((o) => o.id === dragId)
    setDragId(null)
    setDragOver(null)
    if (opp) moveToStage(opp, stageKey)
  }

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newCompany) return
    const amount = parseCurrency(newValue || '$100,000')
    if (!token) {
      const local: Opp = { id: `local-${Date.now()}`, name: newTitle, amount, stage: 'lead', account_name: newCompany, days_in_stage: 0, is_stale: false }
      setOpps((prev) => [local, ...(hasLive ? prev : [])])
      setHasLive(true)
    } else {
      let accountId: string | undefined
      try {
        const accRes = await fetch('/api/v1/crm/accounts', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ name: newCompany, account_type: 'General Contractor', industry: 'Commercial Construction' }),
        })
        if (accRes.ok) accountId = (await accRes.json()).account_id
        await fetch('/api/v1/crm/opportunities', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ name: newTitle, amount, stage: 'lead', account_id: accountId, probability: String(probFor('lead')) }),
        })
        await loadAll()
        flash(`Saved "${newTitle}" for ${newCompany} to your tenant pipeline.`)
      } catch {
        flash('Unable to save opportunity.')
      }
    }
    setNewTitle('')
    setNewCompany('')
    setNewValue('')
    setShowAdd(false)
  }

  const exportCsv = () => {
    const header = ['Opportunity', 'GC / Account', 'Stage', 'Probability %', 'Amount', 'Days In Stage', 'Stale']
    const safe = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v)
    const rows = filtered.map((o) => [
      safe(o.name),
      safe(o.account_name || ''),
      stages.find((s) => s.key === o.stage)?.label || o.stage,
      String(Number(o.probability) || probFor(o.stage)),
      String(o.amount),
      String(o.days_in_stage),
      o.is_stale ? 'yes' : 'no',
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `construction-pipeline-${view}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Leads Inbox ---
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadFirst || !leadLast || !token) return
    const res = await fetch('/api/v1/crm/leads', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ first_name: leadFirst, last_name: leadLast, company: leadCompany || undefined, email: leadEmail || undefined, source: leadSource, status: 'new' }),
    })
    if (res.ok) {
      flash(`Lead ${leadFirst} ${leadLast} captured in Leads Inbox.`)
      setLeadFirst('')
      setLeadLast('')
      setLeadCompany('')
      setLeadEmail('')
      setShowLeadForm(false)
      loadAll()
    }
  }

  const submitQualify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qualifyLead) return
    const res = await fetch(`/api/v1/crm/leads/${qualifyLead.id}/qualify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        account_type: 'General Contractor',
        contact_title: 'Chief Estimator',
        opportunity_name: qOppName || `${qualifyLead.company || 'GC'} Trade Package`,
        estimated_amount: parseCurrency(qAmount),
        initial_stage: qCreateRfq ? 'rfq_takeoff' : 'qualified',
        create_rfq: qCreateRfq,
        due_days: Math.max(1, Number(qDueDays) || 14),
        scope_notes: qScope || undefined,
      }),
    })
    if (res.ok) {
      flash(`Qualified ${qualifyLead.first_name} ${qualifyLead.last_name} → GC Account, Contact, Opportunity${qCreateRfq ? ' & RFQ' : ''} created.`)
      setQualifyLead(null)
      setQOppName('')
      setQScope('')
      await loadAll()
      setMode('board')
    } else {
      flash('Lead qualification failed.')
    }
  }

  // --- Stage customization ---
  const saveStages = async () => {
    if (!token) return flash('Sign in to a live workspace to save pipeline stages.')
    const res = await fetch('/api/v1/crm/pipeline-config', { method: 'PUT', headers: authHeaders, body: JSON.stringify({ stages }) })
    flash(res.ok ? 'Pipeline stages saved for your tenant.' : 'Unable to save stages (minimum 2 required).')
  }

  // --- Detail slide-over ---
  const openDetail = async (opp: Opp) => {
    setSelected(opp)
    setEditAmount(String(opp.amount))
    setEditProb(String(Number(opp.probability) || probFor(opp.stage)))
    setEditClose(opp.close_date ? opp.close_date.slice(0, 10) : '')
    setCoach(null)
    setActivities([])
    if (!opp.isDemo && token) {
      const res = await fetch(`/api/v1/crm/activities?resource_type=opportunity&resource_id=${opp.id}`, { headers: authHeaders })
      if (res.ok) setActivities((await res.json()).activities || [])
    }
  }

  const refreshActivities = async (oppId: string) => {
    const res = await fetch(`/api/v1/crm/activities?resource_type=opportunity&resource_id=${oppId}`, { headers: authHeaders })
    if (res.ok) setActivities((await res.json()).activities || [])
  }

  const saveDetail = async () => {
    if (!selected || selected.isDemo || !token) return
    const res = await fetch(`/api/v1/crm/opportunities/${selected.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        amount: parseCurrency(editAmount),
        probability: editProb,
        close_date: editClose ? new Date(editClose).toISOString() : undefined,
      }),
    })
    if (res.ok) {
      flash('Opportunity details saved.')
      await loadAll()
    }
  }

  const logActivity = async (type: string, subject: string, notes?: string, due?: string) => {
    if (!selected || selected.isDemo || !token) return
    await fetch('/api/v1/crm/activities', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        activity_type: type,
        subject,
        resource_type: 'opportunity',
        resource_id: selected.id,
        notes,
        due_date: due ? new Date(due).toISOString() : undefined,
      }),
    })
    await refreshActivities(selected.id)
  }

  const completeActivity = async (id: string) => {
    if (!selected) return
    await fetch(`/api/v1/crm/activities/${id}/complete`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ completed: true }) })
    await refreshActivities(selected.id)
  }

  const runCoach = async () => {
    if (!selected || selected.isDemo || !token) return
    setCoachLoading(true)
    try {
      const res = await fetch('/api/v1/ai/construction-deal-coach', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ opportunity_id: selected.id, competitor_count: Number(competitors) || 3, margin_target_pct: Number(margin) || 14 }),
      })
      if (res.ok) setCoach(await res.json())
    } finally {
      setCoachLoading(false)
    }
  }

  const tabBtn = (key: typeof mode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setMode(key)}
      style={{
        background: mode === key ? '#ffffff' : 'transparent',
        border: 'none',
        padding: '0.38rem 0.75rem',
        borderRadius: '5px',
        fontSize: '0.78rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        color: mode === key ? '#0f172a' : '#64748b',
        boxShadow: mode === key ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
      }}
    >
      {icon} {label}
    </button>
  )

  const activeLeads = leads.filter((l) => (l.status || 'new') !== 'qualified')

  return (
    <>
      {/* KPI & Control Bar */}
      <div className="sf-panel" style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Open Bid Pipeline</div>
            <div className="sf-tabular" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{fmt(openValue)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Weighted Forecast</div>
            <div className="sf-tabular" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c' }}>{fmt(weighted)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Stale ≥ 7d</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: staleCount ? '#dc2626' : '#059669' }}>{staleCount}</div>
          </div>
          {!hasLive && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
              Demo Preview Cards
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            {tabBtn('board', 'Pipeline Board', <PipelineIcon size={14} />)}
            {tabBtn('register', 'Pipeline Register', <FileTextIcon size={14} />)}
            {tabBtn('leads', `Leads Inbox (${activeLeads.length})`, <CalendarIcon size={14} />)}
            {tabBtn('stages', 'Customize Stages', <LayersIcon size={14} />)}
          </div>
          <button className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }} onClick={() => setShowAdd(true)}>
            + Add Opportunity
          </button>
        </div>
      </div>

      {notice && (
        <div role="status" style={{ margin: '0.75rem 0', padding: '0.6rem 0.9rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.84rem', fontWeight: 600 }}>
          {notice}
        </div>
      )}

      {(mode === 'board' || mode === 'register') && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', margin: '0.85rem 0' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SAVED_VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setView(v.key)}
                style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: view === v.key ? '1px solid #ea580c' : '1px solid #cbd5e1',
                  background: view === v.key ? '#fff7ed' : '#ffffff',
                  color: view === v.key ? '#c2410c' : '#475569',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals or GC..."
              className="form-control"
              style={{ minWidth: '220px', marginBottom: 0 }}
            />
            {mode === 'register' && (
              <button type="button" className="btn-secondary" onClick={exportCsv}>
                <DownloadIcon size={14} /> Export CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* Board */}
      {mode === 'board' && (
        <div className="kanban-board" style={{ overflowX: 'auto' }}>
          {stages.map((st) => {
            const cards = filtered.filter((o) => o.stage === st.key || (!stageKeys.has(o.stage) && st.key === stages[0].key))
            const sum = cards.reduce((a, o) => a + o.amount, 0)
            return (
              <div
                key={st.key}
                className="kanban-col"
                data-stage={st.key}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(st.key)
                }}
                onDragLeave={() => setDragOver((cur) => (cur === st.key ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(st.key)
                }}
                style={{ minWidth: '230px', outline: dragOver === st.key ? '2px dashed #ea580c' : 'none', outlineOffset: '-2px' }}
              >
                <div className="kanban-col-header">
                  <div>
                    <div>{st.label}</div>
                    <div className="sf-mono" style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.15rem' }}>
                      {fmt(sum)} • {st.probability}%
                    </div>
                  </div>
                  <span className="badge-count">{cards.length}</span>
                </div>
                <div className="kanban-cards">
                  {cards.map((o) => (
                    <div
                      key={o.id}
                      className="kanban-card"
                      draggable
                      data-opp-id={o.id}
                      onDragStart={(e) => {
                        setDragId(o.id)
                        e.dataTransfer.setData('text/plain', o.id)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => openDetail(o)}
                      style={{ cursor: 'grab', opacity: dragId === o.id ? 0.5 : 1 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.68rem', color: o.isDemo ? '#c2410c' : '#64748b', fontWeight: 700 }}>{o.isDemo ? 'DEMO' : 'LIVE'}</span>
                        {o.is_stale && (
                          <span style={{ fontSize: '0.66rem', color: '#b91c1c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <AlertTriangleIcon size={11} color="#b91c1c" /> Idle {o.days_in_stage}d
                          </span>
                        )}
                      </div>
                      <div className="kanban-card-title">{o.name}</div>
                      <div className="kanban-card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <BuildingIcon size={12} color="#64748b" /> {o.account_name || 'Unlinked GC'}
                      </div>
                      <div className="kanban-card-footer">
                        <span>{fmt(o.amount)}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{o.days_in_stage}d in stage</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Register */}
      {mode === 'register' && (
        <div className="sf-panel" style={{ overflowX: 'auto' }}>
          <table className="sf-data-table">
            <thead>
              <tr>
                <th>Opportunity / Trade Package</th>
                <th>GC / Account</th>
                <th>Stage</th>
                <th>Win %</th>
                <th>Bid Value</th>
                <th>Days in Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => openDetail(o)} style={{ cursor: 'pointer' }}>
                  <td><strong>{o.name}</strong>{o.isDemo && <span style={{ marginLeft: '0.4rem', fontSize: '0.66rem', color: '#c2410c' }}>Demo</span>}</td>
                  <td>{o.account_name || '—'}</td>
                  <td>
                    <span className="sf-pill sf-pill-info">{stages.find((s) => s.key === o.stage)?.label || o.stage}</span>
                  </td>
                  <td className="sf-mono">{Number(o.probability) || probFor(o.stage)}%</td>
                  <td className="sf-mono"><strong>{fmt(o.amount)}</strong></td>
                  <td style={{ color: o.is_stale ? '#b91c1c' : '#334155', fontWeight: o.is_stale ? 700 : 500 }}>{o.days_in_stage}{o.is_stale ? ' (stale)' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leads Inbox */}
      {mode === 'leads' && (
        <div className="sf-panel" style={{ marginTop: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Leads Inbox — ITBs, Referrals &amp; Inbound Requests</h3>
            <button type="button" className="btn-secondary" onClick={() => setShowLeadForm((v) => !v)} disabled={!token}>
              + Capture Lead
            </button>
          </div>
          {!token && <p style={{ fontSize: '0.84rem', color: '#64748b' }}>Sign in to a live construction workspace to capture and qualify leads.</p>}
          {showLeadForm && (
            <form onSubmit={handleCreateLead} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
              <input className="form-control" required placeholder="First name" value={leadFirst} onChange={(e) => setLeadFirst(e.target.value)} />
              <input className="form-control" required placeholder="Last name" value={leadLast} onChange={(e) => setLeadLast(e.target.value)} />
              <input className="form-control" placeholder="GC / Company" value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} />
              <input className="form-control" type="email" placeholder="Email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
              <select className="form-control" value={leadSource} onChange={(e) => setLeadSource(e.target.value)}>
                <option>GC Bid Invitation</option>
                <option>Plan Room ITB</option>
                <option>Owner Referral</option>
                <option>Website Inquiry</option>
                <option>Repeat Customer</option>
              </select>
              <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>Save Lead</button>
            </form>
          )}
          <table className="sf-data-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No leads yet. Capture an ITB or referral to begin qualification.</td></tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.first_name} {l.last_name}</strong><div style={{ fontSize: '0.74rem', color: '#64748b' }}>{l.email || ''}</div></td>
                    <td>{l.company || '—'}</td>
                    <td>{l.source || '—'}</td>
                    <td><span className="sf-pill sf-pill-neutral">{l.status || 'new'}</span></td>
                    <td>
                      {(l.status || 'new') === 'qualified' ? (
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem' }}><CheckCircleIcon size={13} color="#059669" /> Converted</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ background: '#ea580c', borderColor: '#ea580c', padding: '0.25rem 0.6rem', fontSize: '0.76rem' }}
                          onClick={() => {
                            setQualifyLead(l)
                            setQOppName(`${l.company || 'GC'} Trade Package`)
                          }}
                        >
                          Qualify → Opportunity
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customize Stages */}
      {mode === 'stages' && (
        <div className="sf-panel" style={{ marginTop: '0.85rem' }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>Customize Construction Pipeline Stages</h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>Rename stages and set win probabilities used for weighted backlog forecasting.</p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {stages.map((s, idx) => (
              <div key={s.key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px', gap: '0.6rem', alignItems: 'center' }}>
                <span className="sf-mono" style={{ fontSize: '0.76rem', color: '#64748b' }}>{s.key}</span>
                <input
                  className="form-control"
                  aria-label={`Stage label ${s.key}`}
                  value={s.label}
                  onChange={(e) => setStages((prev) => prev.map((p, i) => (i === idx ? { ...p, label: e.target.value } : p)))}
                />
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  max={100}
                  aria-label={`Stage probability ${s.key}`}
                  value={s.probability}
                  onChange={(e) => setStages((prev) => prev.map((p, i) => (i === idx ? { ...p, probability: Math.max(0, Math.min(100, Number(e.target.value) || 0)) } : p)))}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }} onClick={saveStages}>Save Pipeline Stages</button>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '1.85rem', borderRadius: '12px', width: '440px', maxWidth: '94vw', border: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem' }}>Create Construction Opportunity</h3>
            <p style={{ margin: '0 0 1.15rem', fontSize: '0.8rem', color: '#64748b' }}>Creates the GC organization and links the deal in your tenant pipeline.</p>
            <form onSubmit={handleCreateDeal}>
              <div className="form-group">
                <label>Trade Package / Scope</label>
                <input className="form-control" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Structural Steel Package" />
              </div>
              <div className="form-group">
                <label>General Contractor / Owner</label>
                <input className="form-control" required value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Bechtel Infrastructure" />
              </div>
              <div className="form-group">
                <label>Estimated Bid Value</label>
                <input className="form-control" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g. $500,000" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Qualify Lead Modal */}
      {qualifyLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '1.6rem', borderRadius: '12px', width: '480px', maxWidth: '94vw' }}>
            <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.05rem' }}>Qualify {qualifyLead.first_name} {qualifyLead.last_name}</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b' }}>Creates GC Account, Estimator Contact, Opportunity, optional RFQ, and a follow-up task in one step.</p>
            <form onSubmit={submitQualify}>
              <div className="form-group">
                <label>Opportunity Name</label>
                <input className="form-control" required value={qOppName} onChange={(e) => setQOppName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div className="form-group">
                  <label>Estimated Value</label>
                  <input className="form-control" value={qAmount} onChange={(e) => setQAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Bid Due (days)</label>
                  <input className="form-control" type="number" min={1} value={qDueDays} onChange={(e) => setQDueDays(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Scope Notes / CSI Sections</label>
                <input className="form-control" value={qScope} onChange={(e) => setQScope(e.target.value)} placeholder="e.g. Section 23 05 00 HVAC" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', margin: '0.4rem 0 1rem' }}>
                <input type="checkbox" checked={qCreateRfq} onChange={(e) => setQCreateRfq(e.target.checked)} /> Open RFQ on Bid Desk
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setQualifyLead(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>Qualify &amp; Create Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Opportunity Detail Slide-Over */}
      {selected && (
        <div className="copilot-backdrop" onClick={() => setSelected(null)}>
          <div className="copilot-drawer" onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 100vw)' }}>
            <div style={{ padding: '1.1rem 1.25rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#fdba74', fontWeight: 700 }}>
                  {stages.find((s) => s.key === selected.stage)?.label || selected.stage} • {selected.account_name || 'Unlinked GC'}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{selected.name}</div>
              </div>
              <button type="button" onClick={() => setSelected(null)} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer' }}>
                Close
              </button>
            </div>

            <div style={{ padding: '1.1rem 1.25rem', overflowY: 'auto', display: 'grid', gap: '1.1rem' }}>
              {selected.isDemo || !token ? (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '0.8rem', fontSize: '0.84rem', color: '#9a3412' }}>
                  This is a Demo Preview Card. Add a live opportunity to edit values, schedule activities, and run the AI Bid Coach.
                </div>
              ) : (
                <>
                  {/* Edit core fields */}
                  <section>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem' }}>Deal Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <input className="form-control" aria-label="Deal amount" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                      <input className="form-control" aria-label="Win probability" type="number" min={0} max={100} value={editProb} onChange={(e) => setEditProb(e.target.value)} />
                      <input className="form-control" aria-label="Expected close date" type="date" value={editClose} onChange={(e) => setEditClose(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <select className="form-control" style={{ maxWidth: '220px' }} value={selected.stage} onChange={(e) => { moveToStage(selected, e.target.value); setSelected({ ...selected, stage: e.target.value }) }} aria-label="Move stage">
                        {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                      <button type="button" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }} onClick={saveDetail}>Save Details</button>
                    </div>
                  </section>

                  {/* Activities */}
                  <section>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem' }}>Schedule Activity</h4>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!actSubject.trim()) return
                        logActivity(actType, actSubject.trim(), undefined, actDue)
                        setActSubject('')
                        setActDue('')
                      }}
                      style={{ display: 'grid', gridTemplateColumns: '120px 1fr 140px auto', gap: '0.45rem' }}
                    >
                      <select className="form-control" value={actType} onChange={(e) => setActType(e.target.value)} aria-label="Activity type">
                        <option value="call">Call</option>
                        <option value="site_walk">Site Walk</option>
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                        <option value="followup">Follow-Up</option>
                      </select>
                      <input className="form-control" placeholder="e.g. Pre-bid jobsite walk" value={actSubject} onChange={(e) => setActSubject(e.target.value)} aria-label="Activity subject" />
                      <input className="form-control" type="date" value={actDue} onChange={(e) => setActDue(e.target.value)} aria-label="Activity due date" />
                      <button type="submit" className="btn-secondary">Schedule</button>
                    </form>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!noteText.trim()) return
                        logActivity('note', 'Deal Note', noteText.trim())
                        setNoteText('')
                      }}
                      style={{ display: 'flex', gap: '0.45rem', marginTop: '0.5rem' }}
                    >
                      <input className="form-control" placeholder="Add a note (scope gaps, alternates, GC feedback)..." value={noteText} onChange={(e) => setNoteText(e.target.value)} aria-label="Deal note" />
                      <button type="submit" className="btn-secondary">Add Note</button>
                    </form>
                    <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.5rem' }}>
                      <select className="form-control" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)} aria-label="Email template">
                        {EMAIL_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                      </select>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          const t = EMAIL_TEMPLATES.find((x) => x.key === templateKey)!
                          logActivity('email', `Email sent: ${t.label}`, t.body)
                        }}
                      >
                        Log Email
                      </button>
                    </div>
                  </section>

                  <section>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem' }}>Activity Timeline</h4>
                    {activities.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No activities yet.</div>
                    ) : (
                      activities.map((a) => (
                        <div key={a.id} style={{ padding: '0.5rem 0.7rem', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', gap: '0.5rem', background: a.completed ? '#f8fafc' : '#ffffff' }}>
                          <div>
                            <div style={{ fontWeight: 700, textDecoration: a.completed && a.action === 'crm.activity' ? 'line-through' : 'none' }}>
                              <span style={{ textTransform: 'uppercase', fontSize: '0.66rem', color: '#ea580c', marginRight: '0.35rem' }}>{a.activity_type}</span>
                              {a.subject}
                            </div>
                            {a.notes && <div style={{ color: '#475569', marginTop: '0.15rem' }}>{a.notes}</div>}
                            {a.due_date && a.action === 'crm.activity' && <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Due {String(a.due_date).slice(0, 10)}</div>}
                          </div>
                          {a.action === 'crm.activity' && !a.completed && (
                            <button type="button" className="btn-secondary" style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem', height: 'fit-content' }} onClick={() => completeActivity(a.id)}>
                              Complete
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </section>

                  {/* AI Bid Coach */}
                  <section style={{ border: '1px solid #fed7aa', borderRadius: '8px', padding: '0.85rem', background: '#fffbf5' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <SparklesIcon size={15} color="#ea580c" /> AI Bid Qualification &amp; Deal Coach
                    </h4>
                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ fontSize: '0.76rem' }}>Competitors <input className="form-control" style={{ width: '70px', display: 'inline-block' }} type="number" min={1} value={competitors} onChange={(e) => setCompetitors(e.target.value)} /></label>
                      <label style={{ fontSize: '0.76rem' }}>Target Margin % <input className="form-control" style={{ width: '70px', display: 'inline-block' }} type="number" min={0} value={margin} onChange={(e) => setMargin(e.target.value)} /></label>
                      <button type="button" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }} onClick={runCoach} disabled={coachLoading}>
                        {coachLoading ? 'Analyzing...' : 'Run AI Bid Coach'}
                      </button>
                    </div>
                    {coach && (
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                          Score {coach.bid_qualification.score}/100 — {coach.bid_qualification.recommendation_badge}
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.6rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>Verified Workspace Facts</div>
                          {Object.entries(coach.verified_facts).filter(([k]) => k !== 'source').map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>{k.replace(/_/g, ' ')}</span>
                              <span style={{ fontWeight: 600 }}>{v === null ? '—' : String(v)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: '#ffffff', border: '1px dashed #fb923c', borderRadius: '6px', padding: '0.6rem' }}>
                          <div style={{ fontWeight: 700, color: '#c2410c', marginBottom: '0.3rem' }}>AI Sales Recommendations (model-generated)</div>
                          {coach.ai_recommendations.next_best_actions.map((r) => (
                            <div key={r.action} style={{ marginBottom: '0.35rem' }}>
                              <strong>[{r.priority}] {r.action}</strong>
                              <div style={{ color: '#475569' }}>{r.rationale}</div>
                            </div>
                          ))}
                          <div style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '0.3rem' }}>{coach.ai_recommendations.advisory_notice}</div>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

