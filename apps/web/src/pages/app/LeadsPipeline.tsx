import React, { useEffect, useState } from 'react'
import { AppLayout } from './AppLayout'
import { PipelineIcon, FileTextIcon, BuildingIcon } from '../../components/Icons'
import { ConstructionPipeline } from './construction/ConstructionPipeline'

interface Deal {
  id: string
  dbId?: string
  title: string
  company: string
  value: string
  numericValue: number
  vertical: 'Construction' | 'Clinical' | 'Maritime'
  domainMeta: string
  stage: 'lead' | 'qualified' | 'proposal' | 'won'
}

const INITIAL_DEALS: Deal[] = [
  { id: 'D-101', title: 'HVAC Retrofit Bid', company: 'Turner Construction', value: '$340,000', numericValue: 340000, vertical: 'Construction', domainMeta: 'CSI Div 23 • Subcontract ITB', stage: 'proposal' },
  { id: 'D-104', title: 'Electrical Substation Package', company: 'Skanska USA', value: '$1,200,000', numericValue: 1200000, vertical: 'Construction', domainMeta: 'CSI Div 26 • SOV Active', stage: 'won' },
  { id: 'D-108', title: 'Curtain Wall & Glazing Scope', company: 'Clark Builders', value: '$485,000', numericValue: 485000, vertical: 'Construction', domainMeta: 'CSI Div 08 • Takeoff Review', stage: 'qualified' },
  { id: 'D-102', title: 'Cardiology Registry Pilot', company: 'Novartis Health', value: '$620,000', numericValue: 620000, vertical: 'Clinical', domainMeta: 'Phase III • 12 Sites • IRB Cleared', stage: 'qualified' },
  { id: 'D-105', title: 'Immunology Phase II Sites', company: 'Pfizer Bio', value: '$450,000', numericValue: 450000, vertical: 'Clinical', domainMeta: 'Phase II • 85 Target Subjects', stage: 'proposal' },
  { id: 'D-106', title: 'Oncology Biomarker Screening', company: 'Dana-Farber CRO', value: '$290,000', numericValue: 290000, vertical: 'Clinical', domainMeta: 'Safe Harbor Digital Prescreen', stage: 'lead' },
  { id: 'D-103', title: 'Charter Feeder Contract', company: 'Maersk Logistics', value: '$850,000', numericValue: 850000, vertical: 'Maritime', domainMeta: 'EUR-ASIA • 24x 40HC Allocation', stage: 'lead' },
  { id: 'D-107', title: 'Asia-USEC 40HC Reefer Allocation', company: 'MSC Global Forwarding', value: '$510,000', numericValue: 510000, vertical: 'Maritime', domainMeta: 'ASIA-USEC • Contract Rate Card', stage: 'proposal' },
  { id: 'D-109', title: 'Transatlantic Automotive Parts Tender', company: 'Hapag-Lloyd Shippers', value: '$390,000', numericValue: 390000, vertical: 'Maritime', domainMeta: 'TRANSATLANTIC • 11d Transit SLA', stage: 'qualified' },
]

const INDUSTRY_TO_VERTICAL: Record<string, Deal['vertical']> = {
  construction: 'Construction',
  clinical: 'Clinical',
  maritime: 'Maritime',
}

function parseCurrency(val: string): number {
  const cleaned = Number(String(val).replace(/[^0-9.]/g, ''))
  return Number.isFinite(cleaned) && cleaned > 0 ? cleaned : 100000
}

export const LeadsPipeline: React.FC = () => {
  const [activeIndustry, setActiveIndustry] = useState<string>(() => (localStorage.getItem('sf_industry') || 'all').toLowerCase())
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newMeta, setNewMeta] = useState('')

  const entitledVerticals: Deal['vertical'][] =
    activeIndustry === 'all'
      ? ['Construction', 'Clinical', 'Maritime']
      : activeIndustry
          .split(',')
          .map((k) => INDUSTRY_TO_VERTICAL[k.trim()])
          .filter((v): v is Deal['vertical'] => Boolean(v))

  const allowedVerticals: Deal['vertical'][] = entitledVerticals.length > 0 ? entitledVerticals : ['Construction']
  const [newVertical, setNewVertical] = useState<Deal['vertical']>(allowedVerticals[0])

  useEffect(() => {
    const sync = () => {
      const ind = (localStorage.getItem('sf_industry') || 'all').toLowerCase()
      setActiveIndustry(ind)
      if (INDUSTRY_TO_VERTICAL[ind]) {
        setNewVertical(INDUSTRY_TO_VERTICAL[ind])
      }
    }
    window.addEventListener('sf-tenant-updated', sync)
    sync()
    return () => window.removeEventListener('sf-tenant-updated', sync)
  }, [])

  // Load persisted tenant opportunities when authenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetch('/api/v1/crm/opportunities', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.opportunities && Array.isArray(data.opportunities) && data.opportunities.length > 0) {
          const defaultVert = allowedVerticals[0]
          const mapped: Deal[] = data.opportunities.map((o: any, idx: number) => {
            const amt = Number(o.amount || 100000)
            const stMap: Record<string, Deal['stage']> = {
              prospecting: 'lead',
              lead: 'lead',
              qualified: 'qualified',
              proposal: 'proposal',
              won: 'won',
              closed_won: 'won',
            }
            return {
              id: `OPP-${String(idx + 1).padStart(2, '0')}`,
              dbId: o.id,
              title: o.name,
              company: 'Tenant Account Record',
              value: `$${amt.toLocaleString()}`,
              numericValue: amt,
              vertical: defaultVert,
              domainMeta: `${defaultVert} Persisted Deal`,
              stage: stMap[o.stage] || 'lead',
            }
          })
          setDeals((prev) => {
            const existingTitles = new Set(prev.map((p) => p.title))
            const fresh = mapped.filter((m) => !existingTitles.has(m.title))
            return [...fresh, ...prev]
          })
        }
      })
      .catch(() => {})
  }, [activeIndustry])

  const visibleDeals = deals.filter((d) => allowedVerticals.includes(d.vertical))
  const totalPipelineAmount = visibleDeals.reduce((acc, d) => acc + d.numericValue, 0)

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newCompany) return
    const lockedVertical = allowedVerticals.includes(newVertical) ? newVertical : allowedVerticals[0]
    const parsedNum = parseCurrency(newValue || '$100,000')
    const formattedVal = newValue.trim().startsWith('$') ? newValue.trim() : `$${parsedNum.toLocaleString()}`

    const defaultDomainMeta =
      newMeta.trim() ||
      (lockedVertical === 'Construction'
        ? 'CSI Trade Bid Package'
        : lockedVertical === 'Clinical'
        ? 'Study Site Feasibility'
        : 'Ocean Spot / Contract Tender')

    let createdDbId: string | undefined
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const res = await fetch('/api/v1/crm/opportunities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newTitle,
            amount: parsedNum,
            stage: 'prospecting',
          }),
        })
        if (res.ok) {
          const data = await res.json()
          createdDbId = data.opportunity_id
        }
      } catch {
        // Optimistic local state continues seamlessly
      }
    }

    const newDeal: Deal = {
      id: `D-${Date.now().toString().slice(-3)}`,
      dbId: createdDbId,
      title: newTitle,
      company: newCompany,
      value: formattedVal,
      numericValue: parsedNum,
      vertical: lockedVertical,
      domainMeta: defaultDomainMeta,
      stage: 'lead',
    }
    setDeals([newDeal, ...deals])
    setNewTitle('')
    setNewCompany('')
    setNewValue('')
    setNewMeta('')
    setShowAddModal(false)
  }

  const moveStage = async (deal: Deal, nextStage: Deal['stage']) => {
    setDeals(deals.map((d) => (d.id === deal.id ? { ...d, stage: nextStage } : d)))
    const token = localStorage.getItem('access_token')
    if (token && deal.dbId) {
      try {
        await fetch(`/api/v1/crm/opportunities/${deal.dbId}/stage`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stage: nextStage }),
        })
      } catch {
        // Ignore network error on optimistic transition
      }
    }
  }

  const columns: { stage: Deal['stage']; title: string; count: number; sum: number }[] = [
    {
      stage: 'lead',
      title: 'Inbound Leads',
      count: visibleDeals.filter((d) => d.stage === 'lead').length,
      sum: visibleDeals.filter((d) => d.stage === 'lead').reduce((a, b) => a + b.numericValue, 0),
    },
    {
      stage: 'qualified',
      title: 'Qualified Deals',
      count: visibleDeals.filter((d) => d.stage === 'qualified').length,
      sum: visibleDeals.filter((d) => d.stage === 'qualified').reduce((a, b) => a + b.numericValue, 0),
    },
    {
      stage: 'proposal',
      title: 'Proposal / Estimate',
      count: visibleDeals.filter((d) => d.stage === 'proposal').length,
      sum: visibleDeals.filter((d) => d.stage === 'proposal').reduce((a, b) => a + b.numericValue, 0),
    },
    {
      stage: 'won',
      title: 'Closed Won',
      count: visibleDeals.filter((d) => d.stage === 'won').length,
      sum: visibleDeals.filter((d) => d.stage === 'won').reduce((a, b) => a + b.numericValue, 0),
    },
  ]

  return (
    <AppLayout title="Leads & Opportunity Pipeline">
      {activeIndustry === 'construction' ? (
        <ConstructionPipeline />
      ) : (
      <>
      {/* Pipeline Executive Control Bar */}
      <div className="sf-panel" style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              Active Pipeline Volume
            </div>
            <div className="sf-tabular" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              ${totalPipelineAmount.toLocaleString()}
            </div>
          </div>
          <div style={{ height: '28px', width: '1px', background: '#e2e8f0' }} />
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              Scoped Opportunities
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>
              {visibleDeals.length} Commercial Records
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              style={{
                background: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '0.35rem 0.7rem',
                borderRadius: '5px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: viewMode === 'kanban' ? '#0f172a' : '#64748b',
              }}
            >
              <PipelineIcon size={14} /> Board View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '0.35rem 0.7rem',
                borderRadius: '5px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: viewMode === 'table' ? '#0f172a' : '#64748b',
              }}
            >
              <FileTextIcon size={14} /> Ledger Register
            </button>
          </div>

          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Opportunity
          </button>
        </div>
      </div>

      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ background: '#ffffff', padding: '1.85rem', borderRadius: '12px', width: '440px', maxWidth: '94vw', border: '1px solid #cbd5e1', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', color: '#0f172a' }}>Create Commercial Opportunity</h3>
            <p style={{ margin: '0 0 1.15rem', fontSize: '0.8rem', color: '#64748b' }}>
              Persists to your tenant-scoped CRM opportunity register.
            </p>
            <form onSubmit={handleCreateDeal}>
              <div className="form-group">
                <label>Deal / Scope Title</label>
                <input
                  className="form-control"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Structural Steel Package"
                />
              </div>
              <div className="form-group">
                <label>Account / Counterparty</label>
                <input
                  className="form-control"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Bechtel Infrastructure"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Estimated Value</label>
                  <input
                    className="form-control"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. $500,000"
                  />
                </div>
                <div className="form-group">
                  <label>Industry Vertical</label>
                  <select
                    className="form-control"
                    value={allowedVerticals.includes(newVertical) ? newVertical : allowedVerticals[0]}
                    disabled={allowedVerticals.length === 1}
                    onChange={(e) => setNewVertical(e.target.value as Deal['vertical'])}
                  >
                    {allowedVerticals.includes('Construction') && <option value="Construction">Construction</option>}
                    {allowedVerticals.includes('Clinical') && <option value="Clinical">Clinical Trials</option>}
                    {allowedVerticals.includes('Maritime') && <option value="Maritime">Maritime Logistics</option>}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Specification / Protocol / Trade-Lane Tag (Optional)</label>
                <input
                  className="form-control"
                  value={newMeta}
                  onChange={(e) => setNewMeta(e.target.value)}
                  placeholder="e.g. CSI Div 05 • Bid Lock Q4"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          {columns.map((col) => (
            <div key={col.stage} className="kanban-col">
              <div className="kanban-col-header">
                <div>
                  <div>{col.title}</div>
                  <div className="sf-mono" style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.15rem' }}>
                    ${col.sum.toLocaleString()}
                  </div>
                </div>
                <span className="badge-count">{col.count}</span>
              </div>

              <div className="kanban-cards">
                {visibleDeals
                  .filter((d) => d.stage === col.stage)
                  .map((deal) => (
                    <div key={deal.id} className="kanban-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span className="sf-mono" style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
                          {deal.id}
                        </span>
                        <span className="sf-pill sf-pill-neutral" style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem' }}>
                          {deal.vertical}
                        </span>
                      </div>
                      <div className="kanban-card-title">{deal.title}</div>
                      <div className="kanban-card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <BuildingIcon size={12} color="#64748b" /> {deal.company}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#475569', background: '#f8fafc', border: '1px solid #f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', marginBottom: '0.55rem' }}>
                        {deal.domainMeta}
                      </div>
                      <div className="kanban-card-footer">
                        <span>{deal.value}</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {col.stage === 'lead' && (
                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.74rem' }} onClick={() => moveStage(deal, 'qualified')}>
                              Qualify →
                            </button>
                          )}
                          {col.stage === 'qualified' && (
                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.74rem' }} onClick={() => moveStage(deal, 'proposal')}>
                              Quote →
                            </button>
                          )}
                          {col.stage === 'proposal' && (
                            <button className="btn-primary" style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem' }} onClick={() => moveStage(deal, 'won')}>
                              Award
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sf-panel">
          <table className="sf-data-table">
            <thead>
              <tr>
                <th>Deal ID</th>
                <th>Opportunity / Scope</th>
                <th>Account</th>
                <th>Domain Classification</th>
                <th>Stage</th>
                <th>Estimated Value</th>
              </tr>
            </thead>
            <tbody>
              {visibleDeals.map((d) => (
                <tr key={d.id}>
                  <td className="sf-mono"><strong>{d.id}</strong></td>
                  <td><strong>{d.title}</strong></td>
                  <td>{d.company}</td>
                  <td>{d.domainMeta}</td>
                  <td><span className="sf-pill sf-pill-info" style={{ textTransform: 'capitalize' }}>{d.stage}</span></td>
                  <td className="sf-mono"><strong>{d.value}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}
    </AppLayout>
  )
}
