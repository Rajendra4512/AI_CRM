import React, { useCallback, useEffect, useState } from 'react'
import { FileTextIcon, CheckCircleIcon, AlertTriangleIcon, BuildingIcon } from '../../../components/Icons'

/**
 * Preconstruction Bid Desk: RFQ / tender intake, Bid/No-Bid decisions, multi-version estimates,
 * and 1-click Award & Project Handover. All records persist via tenant-scoped construction endpoints.
 */

interface RfqItem {
  id: string
  project_name: string
  account_id?: string | null
  gc_name: string
  due_date?: string | null
  days_until_due?: number | null
  status: string
  description: string
  estimate_count: number
  latest_estimate_version?: string | null
  latest_estimate_amount: number
}

interface EstimateItem {
  id: string
  rfq_id?: string | null
  project_name: string
  version: string
  total_amount: number
  status: string
  created_at?: string | null
}

interface BidStats {
  has_bid_records: boolean
  rfqs_open: number
  rfqs_due_soon: number
  no_bid_count: number
  bids_submitted_count: number
  bids_awarded_count: number
  bids_lost_count: number
  bid_hit_ratio_pct: number
  total_estimated_value: number
  total_awarded_contract_value: number
  active_projects_count: number
}

interface AccountOpt {
  id: string
  name: string
  account_type?: string
}

const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  open: { label: 'Open — Review', bg: '#eff6ff', fg: '#1d4ed8' },
  bid_go: { label: 'Bid — Go', bg: '#ecfdf5', fg: '#047857' },
  estimating: { label: 'Estimating', bg: '#fff7ed', fg: '#c2410c' },
  submitted: { label: 'Bid Submitted', bg: '#f5f3ff', fg: '#6d28d9' },
  awarded: { label: 'Awarded', bg: '#dcfce7', fg: '#166534' },
  lost: { label: 'Lost', bg: '#fef2f2', fg: '#b91c1c' },
  no_bid: { label: 'No-Bid', bg: '#f1f5f9', fg: '#475569' },
}

const fmt = (n: number) => `$${Math.round(n || 0).toLocaleString()}`

export const BidDeskPanel: React.FC<{ authHeaders: Record<string, string> }> = ({ authHeaders }) => {
  const [rfqs, setRfqs] = useState<RfqItem[]>([])
  const [estimates, setEstimates] = useState<EstimateItem[]>([])
  const [stats, setStats] = useState<BidStats | null>(null)
  const [accounts, setAccounts] = useState<AccountOpt[]>([])
  const [message, setMessage] = useState('')
  const [isLive, setIsLive] = useState(false)

  const [showRfqForm, setShowRfqForm] = useState(false)
  const [rfqName, setRfqName] = useState('')
  const [rfqGc, setRfqGc] = useState('')
  const [rfqDue, setRfqDue] = useState('')
  const [rfqScope, setRfqScope] = useState('')

  const [selectedRfqId, setSelectedRfqId] = useState<string>('')
  const [estAmount, setEstAmount] = useState('250000')
  const [estSubmit, setEstSubmit] = useState(false)
  const [awardAmount, setAwardAmount] = useState('')

  const hasAuth = Boolean(authHeaders.Authorization)

  const load = useCallback(async () => {
    if (!hasAuth) return
    try {
      const [r, e, s, a] = await Promise.all([
        fetch('/api/v1/verticals/construction/rfqs', { headers: authHeaders }),
        fetch('/api/v1/verticals/construction/estimates', { headers: authHeaders }),
        fetch('/api/v1/verticals/construction/bid-analytics', { headers: authHeaders }),
        fetch('/api/v1/crm/accounts', { headers: authHeaders }),
      ])
      if (r.ok) {
        setRfqs((await r.json()).rfqs || [])
        setIsLive(true)
      }
      if (e.ok) setEstimates((await e.json()).estimates || [])
      if (s.ok) setStats(await s.json())
      if (a.ok) setAccounts((await a.json()).accounts || [])
    } catch {
      // Offline preview tolerance
    }
  }, [authHeaders, hasAuth])

  useEffect(() => {
    load()
  }, [load])

  const flash = (m: string) => {
    setMessage(m)
    window.setTimeout(() => setMessage(''), 5000)
  }

  const createRfq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rfqName.trim()) return
    const res = await fetch('/api/v1/verticals/construction/rfqs', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        project_name: rfqName.trim(),
        account_id: rfqGc || undefined,
        due_date: rfqDue ? new Date(rfqDue).toISOString() : undefined,
        description: rfqScope.trim() || undefined,
        status: 'open',
      }),
    })
    if (res.ok) {
      const d = await res.json()
      flash(`RFQ "${d.project_name}" logged on the Bid Desk.`)
      setRfqName('')
      setRfqScope('')
      setRfqDue('')
      setShowRfqForm(false)
      setSelectedRfqId(d.id)
      load()
    } else {
      flash('Unable to save RFQ.')
    }
  }

  const setDecision = async (rfq: RfqItem, status: string) => {
    const res = await fetch(`/api/v1/verticals/construction/rfqs/${rfq.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      flash(`${rfq.project_name}: ${STATUS_META[status]?.label || status}.`)
      load()
    }
  }

  const addEstimate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRfqId) return
    const res = await fetch('/api/v1/verticals/construction/estimates', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ rfq_id: selectedRfqId, total_amount: Number(estAmount.replace(/[^0-9.]/g, '')) || 0, status: estSubmit ? 'submitted' : 'draft' }),
    })
    if (res.ok) {
      const d = await res.json()
      flash(`Estimate v${d.version} saved (${fmt(d.total_amount)})${estSubmit ? ' and bid marked submitted' : ''}.`)
      load()
    }
  }

  const awardHandover = async (rfq: RfqItem) => {
    const amt = Number(awardAmount.replace(/[^0-9.]/g, '')) || undefined
    const res = await fetch(`/api/v1/verticals/construction/rfqs/${rfq.id}/award-handover`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ awarded_amount: amt }),
    })
    if (res.ok) {
      const d = await res.json()
      flash(`Awarded ${d.project_name} at ${fmt(d.awarded_value)} — active project created and GC kickoff follow-up scheduled.`)
      setAwardAmount('')
      load()
    } else {
      flash('Award & handover failed.')
    }
  }

  const selectedRfq = rfqs.find((r) => r.id === selectedRfqId) || null
  const rfqEstimates = estimates.filter((e) => e.rfq_id === selectedRfqId)

  return (
    <div className="sf-panel" data-testid="bid-desk-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileTextIcon size={16} color="#ea580c" /> Preconstruction Bid Desk: RFQs, Estimating &amp; Handover
          </h3>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Bid/No-Bid decisions, estimate revisions, and award handover into active projects.</div>
        </div>
        <button type="button" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }} onClick={() => setShowRfqForm((v) => !v)} disabled={!hasAuth}>
          + Log RFQ / Tender
        </button>
      </div>

      {/* Live bid analytics strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem', marginBottom: '0.9rem' }}>
        {[
          { lbl: 'Open RFQs', val: String(stats?.rfqs_open ?? 0) },
          { lbl: 'Due ≤ 7 Days', val: String(stats?.rfqs_due_soon ?? 0), warn: (stats?.rfqs_due_soon ?? 0) > 0 },
          { lbl: 'Bid-Hit Ratio', val: `${stats?.bid_hit_ratio_pct ?? 0}%` },
          { lbl: 'Estimated Value', val: fmt(stats?.total_estimated_value ?? 0) },
          { lbl: 'Awarded Backlog', val: fmt(stats?.total_awarded_contract_value ?? 0) },
          { lbl: 'Active Projects', val: String(stats?.active_projects_count ?? 0) },
        ].map((k) => (
          <div key={k.lbl} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.75rem', background: '#f8fafc' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{k.lbl}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: k.warn ? '#b91c1c' : '#0f172a' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {!hasAuth && (
        <div style={{ fontSize: '0.82rem', color: '#9a3412', background: '#fff7ed', border: '1px solid #fed7aa', padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '0.8rem' }}>
          Sample preview — sign in to a construction workspace to log RFQs, estimates, and awards.
        </div>
      )}

      {message && (
        <div role="status" style={{ fontSize: '0.84rem', color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.55rem 0.8rem', borderRadius: '6px', marginBottom: '0.8rem', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {showRfqForm && (
        <form onSubmit={createRfq} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.55rem', marginBottom: '1rem' }}>
          <input className="form-control" required placeholder="Project / trade package name" value={rfqName} onChange={(e) => setRfqName(e.target.value)} aria-label="RFQ project name" />
          <select className="form-control" value={rfqGc} onChange={(e) => setRfqGc(e.target.value)} aria-label="General contractor">
            <option value="">Direct / Plan Room ITB</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input className="form-control" type="date" value={rfqDue} onChange={(e) => setRfqDue(e.target.value)} aria-label="Bid due date" />
          <input className="form-control" placeholder="Scope / CSI sections" value={rfqScope} onChange={(e) => setRfqScope(e.target.value)} aria-label="RFQ scope" />
          <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>Save RFQ</button>
        </form>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="sf-data-table">
          <thead>
            <tr>
              <th>Project / Package</th>
              <th>GC</th>
              <th>Bid Due</th>
              <th>Status</th>
              <th>Latest Estimate</th>
              <th>Bid / No-Bid</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '1.25rem' }}>
                  {isLive ? 'No RFQs yet. Log an ITB or qualify a lead with "Open RFQ" to start the bid workflow.' : 'Bid Desk records appear here once signed in.'}
                </td>
              </tr>
            ) : (
              rfqs.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.open
                const dueWarn = r.days_until_due !== null && r.days_until_due !== undefined && r.days_until_due <= 3 && !['awarded', 'lost', 'no_bid', 'submitted'].includes(r.status)
                return (
                  <tr key={r.id} onClick={() => setSelectedRfqId(r.id)} style={{ cursor: 'pointer', background: selectedRfqId === r.id ? '#fff7ed' : undefined }}>
                    <td><strong>{r.project_name}</strong></td>
                    <td><BuildingIcon size={12} color="#64748b" /> {r.gc_name}</td>
                    <td style={{ color: dueWarn ? '#b91c1c' : '#334155', fontWeight: dueWarn ? 700 : 500 }}>
                      {r.due_date ? r.due_date.slice(0, 10) : '—'}
                      {r.days_until_due !== null && r.days_until_due !== undefined && <span style={{ fontSize: '0.72rem', marginLeft: '0.3rem' }}>({r.days_until_due}d)</span>}
                      {dueWarn && <AlertTriangleIcon size={12} color="#b91c1c" style={{ marginLeft: '0.25rem' }} />}
                    </td>
                    <td><span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.18rem 0.5rem', borderRadius: '999px', background: meta.bg, color: meta.fg }}>{meta.label}</span></td>
                    <td className="sf-mono">{r.latest_estimate_version ? `v${r.latest_estimate_version} • ${fmt(r.latest_estimate_amount)}` : '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {['open', 'estimating'].includes(r.status) ? (
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button type="button" className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.72rem' }} onClick={() => setDecision(r, 'bid_go')}>Bid</button>
                          <button type="button" className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.72rem' }} onClick={() => setDecision(r, 'no_bid')}>No-Bid</button>
                        </div>
                      ) : r.status === 'submitted' ? (
                        <button type="button" className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.72rem' }} onClick={() => setDecision(r, 'lost')}>Mark Lost</button>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedRfq && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.9rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem' }}>Estimate Revisions — {selectedRfq.project_name}</h4>
            {rfqEstimates.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>No estimates yet. Save v1.0 below.</div>
            ) : (
              rfqEstimates.map((e) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span className="sf-mono"><strong>v{e.version}</strong> • {e.status}</span>
                  <span className="sf-mono">{fmt(e.total_amount)}</span>
                </div>
              ))
            )}
            {!['awarded', 'lost', 'no_bid'].includes(selectedRfq.status) && (
              <form onSubmit={addEstimate} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input className="form-control" style={{ maxWidth: '150px', marginBottom: 0 }} value={estAmount} onChange={(e) => setEstAmount(e.target.value)} aria-label="Estimate amount" />
                <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <input type="checkbox" checked={estSubmit} onChange={(e) => setEstSubmit(e.target.checked)} /> Submit to GC
                </label>
                <button type="submit" className="btn-secondary">Save Estimate Revision</button>
              </form>
            )}
          </div>

          <div style={{ border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem', background: '#f0fdf4' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem' }}>Award &amp; Project Handover</h4>
            {selectedRfq.status === 'awarded' ? (
              <div style={{ fontSize: '0.84rem', color: '#166534', fontWeight: 700 }}>
                <CheckCircleIcon size={14} color="#16a34a" /> Awarded — project is active for SOV billing and change management.
              </div>
            ) : ['lost', 'no_bid'].includes(selectedRfq.status) ? (
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>This RFQ is closed ({STATUS_META[selectedRfq.status]?.label}).</div>
            ) : (
              <>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.5rem' }}>
                  Marks the RFQ and latest estimate awarded, creates an active project, sets the linked opportunity to won, and schedules the GC kickoff follow-up.
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <input
                    className="form-control"
                    style={{ maxWidth: '170px', marginBottom: 0 }}
                    placeholder={selectedRfq.latest_estimate_amount ? `Awarded (${fmt(selectedRfq.latest_estimate_amount)})` : 'Awarded amount'}
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(e.target.value)}
                    aria-label="Awarded contract amount"
                  />
                  <button type="button" className="btn-primary" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => awardHandover(selectedRfq)}>
                    Award &amp; Hand Over
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

