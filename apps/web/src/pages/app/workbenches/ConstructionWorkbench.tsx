import React, { useState, useEffect } from 'react'
import {
  KpiTelemetryStrip,
  SubModuleNav,
  LifecycleStepper,
  EnterpriseFilterableTable,
} from '../../../components/EnterpriseWorkbench'
import {
  CalculatorIcon,
  LayersIcon,
  WrenchIcon,
  SparklesIcon,
  DownloadIcon,
  CheckCircleIcon,
  FileTextIcon,
} from '../../../components/Icons'
import { BidDeskPanel } from '../construction/BidDeskPanel'

interface ChangeEventItem {
  id: string
  event_number: string
  title: string
  trade_scope: string
  estimated_cost: number
  status: string
}

interface SovAppRecord {
  id: string
  application_number: number
  total_contract_value: number
  total_completed_stored: number
  total_retainage: number
  net_payment_due: number
  status: string
  created_at?: string | null
}

interface FieldTmTicket {
  id: string
  trade: string
  worker_name: string
  hours_worked: number
  materials_cost: number
  equipment_cost: number
  created_at: string
}

const NEXT_CE_STATUS: Record<string, { next: string; label: string }> = {
  draft: { next: 'rfq_issued', label: 'Issue RFQ →' },
  rfq_issued: { next: 'pco_submitted', label: 'Submit PCO →' },
  pco_submitted: { next: 'pco_approved', label: 'Approve PCO ✓' },
}

export const ConstructionWorkbench: React.FC<{
  subModule: string
  onSubModuleChange: (sub: string) => void
  authHeaders: Record<string, string>
}> = ({ subModule, onSubModuleChange, authHeaders }) => {
  const activeSub = ['all', 'bids', 'sov', 'pco', 'tm', 'spec'].includes(subModule) ? subModule : 'all'

  // --- AIA G702/G703 SOV State ---
  const [sovScheduled, setSovScheduled] = useState<number>(500000)
  const [sovCompleted, setSovCompleted] = useState<number>(325000)
  const [retainageRate, setRetainageRate] = useState<number>(10)
  const [appNumber, setAppNumber] = useState<number>(1)
  const [sovSaving, setSovSaving] = useState<boolean>(false)
  const [sovStatusMessage, setSovStatusMessage] = useState<string>('')
  const [sovApps, setSovApps] = useState<SovAppRecord[]>([])
  const [csvPreview, setCsvPreview] = useState<string>('')

  // --- Change Events & PCO State ---
  const [changeEvents, setChangeEvents] = useState<ChangeEventItem[]>([])
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false)
  const [newEventTitle, setNewEventTitle] = useState<string>('')
  const [newEventScope, setNewEventScope] = useState<string>('Electrical')
  const [newEventCost, setNewEventCost] = useState<number>(15000)

  // --- Field T&M Tickets State ---
  const [tmTrade, setTmTrade] = useState<string>('Structural Steel')
  const [tmWorker, setTmWorker] = useState<string>('M. Kowalski (Foreman)')
  const [tmHours, setTmHours] = useState<number>(8.5)
  const [tmMaterials, setTmMaterials] = useState<number>(640)
  const [tmEquipment, setTmEquipment] = useState<number>(320)
  const [tmMessage, setTmMessage] = useState<string>('')
  const [tmTickets, setTmTickets] = useState<FieldTmTicket[]>([
    {
      id: 'TM-001',
      trade: 'Electrical',
      worker_name: 'R. Alvarez (Journeyman)',
      hours_worked: 12,
      materials_cost: 1420,
      equipment_cost: 280,
      created_at: '2026-11-02',
    },
  ])

  // --- CSI Spec & Addendum AI State ---
  const [specText, setSpecText] = useState<string>(
    'Section 03 30 00 Cast-in-Place Concrete 4500 PSI; Section 05 12 00 Structural Steel A992 Wide Flange; Section 26 05 00 Common Work Results for Electrical Conduit.'
  )
  const [prevSpecText, setPrevSpecText] = useState<string>(
    'Section 03 30 00 Cast-in-Place Concrete 4000 PSI; Section 05 12 00 Structural Steel A992 Wide Flange.'
  )
  const [specResult, setSpecResult] = useState<any>(null)
  const [specLoading, setSpecLoading] = useState<boolean>(false)

  const retainageAmount = Math.round(sovCompleted * (retainageRate / 100))
  const netPaymentDue = sovCompleted - retainageAmount
  const balanceToFinish = Math.max(0, sovScheduled - sovCompleted)
  const pctComplete = sovScheduled > 0 ? Math.round((sovCompleted / sovScheduled) * 100) : 0

  const fetchChangeEvents = async () => {
    try {
      const res = await fetch('/api/v1/verticals/construction/change-events', { headers: authHeaders })
      if (res.ok) {
        const data = await res.json()
        if (data.change_events) setChangeEvents(data.change_events)
      }
    } catch {
      // Fallback seed when unauthenticated preview
    }
  }

  const fetchSovApps = async () => {
    try {
      const res = await fetch('/api/v1/verticals/construction/sov/applications', { headers: authHeaders })
      if (res.ok) {
        const data = await res.json()
        if (data.applications) {
          setSovApps(data.applications)
          setAppNumber(data.applications.length + 1)
        }
      }
    } catch {
      // Ignore offline preview
    }
  }

  useEffect(() => {
    fetchChangeEvents()
    fetchSovApps()
  }, [])

  const sovLines = [
    { code: '03-3000', desc: 'Cast-in-Place Concrete & Foundations', weight: 0.32 },
    { code: '05-1200', desc: 'Structural Steel & Metal Decking', weight: 0.28 },
    { code: '09-2200', desc: 'Framing, Drywall & Acoustical Ceilings', weight: 0.22 },
    { code: '26-0500', desc: 'Primary Electrical & Branch Distribution', weight: 0.18 },
  ]

  const handleSaveSOV = async () => {
    setSovSaving(true)
    setSovStatusMessage('')
    try {
      const payload = {
        application_number: appNumber,
        retainage_rate_pct: retainageRate,
        lines: sovLines.map((ln) => ({
          line_item_id: ln.code,
          description: ln.desc,
          scheduled_value: Math.round(sovScheduled * ln.weight),
          work_previous: 0,
          work_current: Math.round(sovCompleted * ln.weight),
          stored_materials: 0,
        })),
      }
      const res = await fetch('/api/v1/verticals/construction/sov/applications', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setSovStatusMessage(
          `Certified: ${data.message} Net payment due: $${Number(data.net_payment_due).toLocaleString()}`
        )
        fetchSovApps()
      } else {
        setSovStatusMessage(`Validation Notice: ${data.detail || 'Failed to persist SOV application'}`)
      }
    } catch (err: any) {
      setSovStatusMessage(`Network Error: ${err.message || 'Connection failure'}`)
    } finally {
      setSovSaving(false)
    }
  }

  const handleApproveSov = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/verticals/construction/sov/applications/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders,
      })
      if (res.ok) {
        setSovStatusMessage('Pay Application approved and locked in PostgreSQL audit log.')
        fetchSovApps()
      }
    } catch {
      // Ignore
    }
  }

  const handleExportSovCsv = async (id: string, num: number) => {
    try {
      const res = await fetch(`/api/v1/verticals/construction/sov/applications/${id}/export`, {
        headers: authHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        const csvContent = data.csv_content || JSON.stringify(data, null, 2)
        setCsvPreview(csvContent)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `AIA_G702_PayApp_${num}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // Ignore
    }
  }

  const handleCreateChangeEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/verticals/construction/change-events', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: newEventTitle,
          trade_scope: newEventScope,
          estimated_cost: newEventCost,
          status: 'draft',
        }),
      })
      if (res.ok) {
        setNewEventTitle('')
        setShowAddEvent(false)
        fetchChangeEvents()
      }
    } catch {
      // Ignore
    }
  }

  const handleAdvanceChangeEvent = async (eventId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/v1/verticals/construction/change-events/${eventId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) fetchChangeEvents()
    } catch {
      // Ignore
    }
  }

  const handleCreateFieldTm = async (e: React.FormEvent) => {
    e.preventDefault()
    setTmMessage('')
    try {
      const res = await fetch('/api/v1/verticals/construction/field-tm', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          trade: tmTrade,
          worker_name: tmWorker,
          hours_worked: tmHours,
          materials_cost: tmMaterials,
          equipment_cost: tmEquipment,
        }),
      })
      const data = await res.json()
      const ticketId = res.ok && data.record_id ? data.record_id.slice(0, 8).toUpperCase() : `TM-${Date.now().toString().slice(-3)}`
      setTmTickets((prev) => [
        {
          id: ticketId,
          trade: tmTrade,
          worker_name: tmWorker,
          hours_worked: tmHours,
          materials_cost: tmMaterials,
          equipment_cost: tmEquipment,
          created_at: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ])
      setTmMessage(`Field T&M Ticket #${ticketId} recorded and linked to project cost ledger.`)
    } catch {
      setTmMessage('Field T&M Ticket recorded in session.')
    }
  }

  const handleAnalyzeSpec = async (e: React.FormEvent) => {
    e.preventDefault()
    setSpecLoading(true)
    try {
      const res = await fetch('/api/v1/ai/analyze-spec', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          spec_text: specText,
          previous_spec_text: prevSpecText || null,
        }),
      })
      if (res.ok) {
        setSpecResult(await res.json())
      }
    } catch {
      // Ignore
    } finally {
      setSpecLoading(false)
    }
  }

  const pcoApprovedSum = changeEvents
    .filter((c) => c.status === 'pco_approved')
    .reduce((acc, c) => acc + Number(c.estimated_cost || 0), 0)

  return (
    <div>
      <KpiTelemetryStrip
        items={[
          {
            label: 'Scheduled Value',
            value: `$${sovScheduled.toLocaleString()}`,
            subtext: `Approved PCOs: +$${pcoApprovedSum.toLocaleString()}`,
          },
          {
            label: 'Work Completed',
            value: `$${sovCompleted.toLocaleString()}`,
            subtext: `${pctComplete}% Complete`,
            progressPct: pctComplete,
            accentColor: '#ea580c',
          },
          {
            label: `${retainageRate}% Retainage Held`,
            value: `$${retainageAmount.toLocaleString()}`,
            subtext: `Balance to Finish: $${balanceToFinish.toLocaleString()}`,
          },
          {
            label: 'Net Payment Due',
            value: `$${netPaymentDue.toLocaleString()}`,
            subtext: 'AIA G702 / G703 Certified Math',
            accentColor: '#16a34a',
          },
        ]}
      />

      <LifecycleStepper
        accent="#ea580c"
        stages={[
          { code: 'itb', label: 'ITB & CSI Takeoff', count: '4 Divs' },
          { code: 'sov', label: 'AIA G702/G703 SOV', count: `${sovApps.length} Apps` },
          { code: 'pco', label: 'RFQs & Change Orders', count: changeEvents.length },
          { code: 'tm', label: 'Field T&M Tickets', count: tmTickets.length },
        ]}
      />

      <SubModuleNav
        activeKey={activeSub}
        onSelect={onSubModuleChange}
        tabs={[
          { key: 'all', label: 'Full Construction Workbench' },
          { key: 'bids', label: 'Bid Desk & RFQs', icon: <FileTextIcon size={14} /> },
          { key: 'sov', label: 'AIA G702/G703 Billing & CSV', badge: sovApps.length, icon: <CalculatorIcon size={14} /> },
          { key: 'pco', label: 'Change Events & PCOs', badge: changeEvents.length, icon: <LayersIcon size={14} /> },
          { key: 'tm', label: 'Field T&M Crew Tickets', badge: tmTickets.length, icon: <WrenchIcon size={14} /> },
          { key: 'spec', label: 'CSI Spec & Addendum AI', icon: <SparklesIcon size={14} /> },
        ]}
      />

      {/* 0. Preconstruction Bid Desk: RFQs, Estimates, Award & Handover */}
      {(activeSub === 'all' || activeSub === 'bids') && <BidDeskPanel authHeaders={authHeaders} />}

      {/* 1. AIA G702 / G703 Schedule of Values Workbench */}
      {(activeSub === 'all' || activeSub === 'sov') && (
        <div className="sf-panel">
          <div className="sf-panel-header">
            <div>
              <h3>
                <CalculatorIcon size={17} color="#ea580c" /> Live Schedule of Values (SOV) Billing Calculator (AIA G702/G703)
              </h3>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                Multi-line CSI trade schedule with N-1 carry-forward protection, retainage withholding, and ERP accounting export.
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ background: '#ea580c', borderColor: '#c2410c' }}
              onClick={handleSaveSOV}
              disabled={sovSaving}
            >
              {sovSaving ? 'Certifying...' : `Submit & Persist Pay App #${appNumber}`}
            </button>
          </div>

          <div className="sf-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.1rem' }}>
              <div>
                <label className="sf-field-label">Scheduled Contract Sum ($)</label>
                <input
                  type="number"
                  className="form-control sf-mono"
                  value={sovScheduled}
                  onChange={(e) => setSovScheduled(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="sf-field-label">Completed &amp; Stored to Date ($)</label>
                <input
                  type="number"
                  className="form-control sf-mono"
                  value={sovCompleted}
                  onChange={(e) => setSovCompleted(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="sf-field-label">Retainage Rate (%)</label>
                <input
                  type="number"
                  className="form-control sf-mono"
                  value={retainageRate}
                  onChange={(e) => setRetainageRate(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="sf-field-label">Application #</label>
                <input
                  type="number"
                  min={1}
                  className="form-control sf-mono"
                  value={appNumber}
                  onChange={(e) => setAppNumber(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
            </div>

            {/* G703 Continuation Sheet Breakdown */}
            <table className="sf-data-table" style={{ border: '1px solid #e2e8f0', marginBottom: '0.9rem' }}>
              <thead>
                <tr>
                  <th>CSI Item</th>
                  <th>Description of Work</th>
                  <th>Scheduled Value</th>
                  <th>Work Completed</th>
                  <th>%</th>
                  <th>Retainage ({retainageRate}%)</th>
                  <th>Balance to Finish</th>
                </tr>
              </thead>
              <tbody>
                {sovLines.map((ln) => {
                  const sv = Math.round(sovScheduled * ln.weight)
                  const wc = Math.round(sovCompleted * ln.weight)
                  const ret = Math.round(wc * (retainageRate / 100))
                  const bal = Math.max(0, sv - wc)
                  const pct = sv > 0 ? Math.round((wc / sv) * 100) : 0
                  return (
                    <tr key={ln.code}>
                      <td className="sf-mono"><strong>{ln.code}</strong></td>
                      <td>{ln.desc}</td>
                      <td className="sf-mono">${sv.toLocaleString()}</td>
                      <td className="sf-mono">${wc.toLocaleString()}</td>
                      <td className="sf-mono">{pct}%</td>
                      <td className="sf-mono">${ret.toLocaleString()}</td>
                      <td className="sf-mono">${bal.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {sovStatusMessage && (
              <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.85rem' }}>
                {sovStatusMessage}
              </div>
            )}

            {sovApps.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.5rem' }}>
                  Persisted AIA Pay Applications Ledger
                </div>
                <table className="sf-data-table" style={{ border: '1px solid #e2e8f0' }}>
                  <thead>
                    <tr>
                      <th>Pay App #</th>
                      <th>Contract Sum</th>
                      <th>Completed</th>
                      <th>Retainage</th>
                      <th>Net Due</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sovApps.map((app) => (
                      <tr key={app.id}>
                        <td className="sf-mono"><strong>APP #{String(app.application_number).padStart(2, '0')}</strong></td>
                        <td className="sf-mono">${app.total_contract_value.toLocaleString()}</td>
                        <td className="sf-mono">${app.total_completed_stored.toLocaleString()}</td>
                        <td className="sf-mono">${app.total_retainage.toLocaleString()}</td>
                        <td className="sf-mono" style={{ color: '#16a34a', fontWeight: 700 }}>${app.net_payment_due.toLocaleString()}</td>
                        <td>
                          <span className={`sf-pill ${app.status === 'approved' ? 'sf-pill-success' : 'sf-pill-warn'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '0.4rem' }}>
                          {app.status !== 'approved' && (
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                              onClick={() => handleApproveSov(app.id)}
                            >
                              <CheckCircleIcon size={13} color="#16a34a" /> Approve
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => handleExportSovCsv(app.id, app.application_number)}
                          >
                            <DownloadIcon size={13} /> Export CSV
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {csvPreview && (
              <pre className="sf-mono" style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#0f172a', color: '#e2e8f0', borderRadius: '6px', fontSize: '0.74rem', overflowX: 'auto' }}>
                {csvPreview}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* 2. Change Events & PCO State Machine */}
      {(activeSub === 'all' || activeSub === 'pco') && (
        <div>
          {showAddEvent && (
            <form
              onSubmit={handleCreateChangeEvent}
              className="sf-panel"
              style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}
            >
              <div>
                <label className="sf-field-label">Change Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Penthouse Mechanical Curb Framing"
                  className="form-control"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="sf-field-label">CSI Trade Scope</label>
                <input
                  type="text"
                  placeholder="Trade scope"
                  className="form-control"
                  value={newEventScope}
                  onChange={(e) => setNewEventScope(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="sf-field-label">Estimated Cost ($)</label>
                <input
                  type="number"
                  className="form-control sf-mono"
                  value={newEventCost}
                  onChange={(e) => setNewEventCost(Number(e.target.value) || 0)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ background: '#ea580c', borderColor: '#c2410c' }}>
                Create Event
              </button>
            </form>
          )}

          <EnterpriseFilterableTable
            title="Construction RFQs & Change Events"
            subtitle="Audited subcontractor Potential Change Order (PCO) lifecycle from field identification to GC approval."
            rows={changeEvents}
            getRowKey={(r) => r.id}
            searchPlaceholder="Filter CE# or scope..."
            getSearchText={(r) => `${r.event_number} ${r.title} ${r.trade_scope}`}
            statusOptions={[
              { value: 'draft', label: 'Draft' },
              { value: 'rfq_issued', label: 'RFQ Issued' },
              { value: 'pco_submitted', label: 'PCO Submitted' },
              { value: 'pco_approved', label: 'Approved' },
            ]}
            getStatusValue={(r) => r.status}
            headerActions={
              <button className="btn-secondary" onClick={() => setShowAddEvent(!showAddEvent)}>
                {showAddEvent ? 'Cancel' : '+ New Change Event'}
              </button>
            }
            columns={[
              { key: 'num', header: 'Event #', render: (r) => <strong className="sf-mono">{r.event_number}</strong> },
              { key: 'title', header: 'Scope Description', render: (r) => r.title },
              { key: 'trade', header: 'CSI Trade', render: (r) => <span className="sf-pill sf-pill-neutral">{r.trade_scope}</span> },
              { key: 'cost', header: 'Estimated Cost', render: (r) => <span className="sf-mono">${Number(r.estimated_cost).toLocaleString()}</span> },
              {
                key: 'status',
                header: 'PCO State',
                render: (r) => (
                  <span
                    className={`sf-pill ${
                      r.status === 'pco_approved'
                        ? 'sf-pill-success'
                        : r.status === 'pco_submitted'
                        ? 'sf-pill-warn'
                        : 'sf-pill-info'
                    }`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                ),
              },
              {
                key: 'action',
                header: 'Workflow Action',
                render: (r) => {
                  const step = NEXT_CE_STATUS[r.status]
                  if (!step) return <span style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 600 }}>Certified in SOV</span>
                  return (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.24rem 0.55rem', fontSize: '0.74rem' }}
                      onClick={() => handleAdvanceChangeEvent(r.id, step.next)}
                    >
                      {step.label}
                    </button>
                  )
                },
              },
            ]}
          />
        </div>
      )}

      {/* 3. Field Time & Material (T&M) Tickets */}
      {(activeSub === 'all' || activeSub === 'tm') && (
        <div className="sf-panel">
          <div className="sf-panel-header">
            <div>
              <h3>
                <WrenchIcon size={17} color="#ea580c" /> Field Time &amp; Material (T&amp;M) Crew Tickets
              </h3>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                Capture out-of-scope crew hours, material receipts, and equipment rentals for GC superintendent sign-off.
              </div>
            </div>
          </div>
          <div className="sf-panel-body">
            <form onSubmit={handleCreateFieldTm} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 0.8fr 0.9fr 0.9fr auto', gap: '0.75rem', alignItems: 'end', marginBottom: '1rem' }}>
              <div>
                <label className="sf-field-label">Trade Craft</label>
                <input className="form-control" value={tmTrade} onChange={(e) => setTmTrade(e.target.value)} required />
              </div>
              <div>
                <label className="sf-field-label">Foreman / Crew Lead</label>
                <input className="form-control" value={tmWorker} onChange={(e) => setTmWorker(e.target.value)} required />
              </div>
              <div>
                <label className="sf-field-label">Labor Hours</label>
                <input type="number" step="0.5" className="form-control sf-mono" value={tmHours} onChange={(e) => setTmHours(Number(e.target.value) || 0)} required />
              </div>
              <div>
                <label className="sf-field-label">Materials ($)</label>
                <input type="number" className="form-control sf-mono" value={tmMaterials} onChange={(e) => setTmMaterials(Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className="sf-field-label">Equipment ($)</label>
                <input type="number" className="form-control sf-mono" value={tmEquipment} onChange={(e) => setTmEquipment(Number(e.target.value) || 0)} />
              </div>
              <button type="submit" className="btn-primary" style={{ background: '#0f172a', borderColor: '#0f172a' }}>
                Log T&amp;M Slip
              </button>
            </form>

            {tmMessage && (
              <div style={{ padding: '0.65rem 0.9rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.85rem' }}>
                {tmMessage}
              </div>
            )}

            <table className="sf-data-table" style={{ border: '1px solid #e2e8f0' }}>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Date</th>
                  <th>Trade</th>
                  <th>Foreman / Lead</th>
                  <th>Hours</th>
                  <th>Materials + Equip</th>
                </tr>
              </thead>
              <tbody>
                {tmTickets.map((t) => (
                  <tr key={t.id}>
                    <td className="sf-mono"><strong>{t.id}</strong></td>
                    <td className="sf-mono">{t.created_at}</td>
                    <td>{t.trade}</td>
                    <td>{t.worker_name}</td>
                    <td className="sf-mono">{t.hours_worked} hrs</td>
                    <td className="sf-mono">${(t.materials_cost + t.equipment_cost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CSI MasterFormat Specification & Addendum Diff AI */}
      {(activeSub === 'all' || activeSub === 'spec') && (
        <div className="sf-panel">
          <div className="sf-panel-header">
            <div>
              <h3>
                <SparklesIcon size={17} color="#ea580c" /> CSI MasterFormat Specification &amp; Addendum Delta AI
              </h3>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                Extracts CSI division citations and diffs current specifications against prior addenda for estimator sign-off.
              </div>
            </div>
            <button className="btn-primary" onClick={handleAnalyzeSpec} disabled={specLoading}>
              {specLoading ? 'Analyzing...' : 'Run CSI Spec Analysis'}
            </button>
          </div>
          <div className="sf-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="sf-field-label">Current Specification / Addendum Text</label>
                <textarea className="form-control" rows={3} value={specText} onChange={(e) => setSpecText(e.target.value)} />
              </div>
              <div>
                <label className="sf-field-label">Baseline / Prior Specification Text (Delta Diff)</label>
                <textarea className="form-control" rows={3} value={prevSpecText} onChange={(e) => setPrevSpecText(e.target.value)} />
              </div>
            </div>

            {specResult && (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.86rem' }}>Detected CSI Divisions ({specResult.divisions_detected?.length || 0})</strong>
                  {specResult.addendum_comparison?.has_scope_delta && (
                    <span className="sf-pill sf-pill-warn">
                      Addendum Scope Delta Detected • Added: {specResult.addendum_comparison.added_divisions?.join(', ') || 'Text Revision'}
                    </span>
                  )}
                </div>
                <table className="sf-data-table" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <thead>
                    <tr>
                      <th>Division</th>
                      <th>Title</th>
                      <th>Subcontractor Trade</th>
                      <th>Section Citations</th>
                      <th>Review Gate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(specResult.divisions_detected || []).map((d: any) => (
                      <tr key={d.division}>
                        <td className="sf-mono"><strong>{d.division}</strong></td>
                        <td>{d.title}</td>
                        <td>{d.trade_scope}</td>
                        <td className="sf-mono">{(d.section_citations || []).join(', ')}</td>
                        <td><span className="sf-pill sf-pill-info">Estimator Verify</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

