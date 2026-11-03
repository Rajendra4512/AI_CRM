import React, { useState } from 'react'
import { AppLayout } from './AppLayout'

interface Deal {
  id: string
  title: string
  company: string
  value: string
  vertical: string
  stage: 'lead' | 'qualified' | 'proposal' | 'won'
}

const INITIAL_DEALS: Deal[] = [
  { id: 'D-101', title: 'HVAC Retrofit Bid', company: 'Turner Construction', value: '$340,000', vertical: 'Construction', stage: 'proposal' },
  { id: 'D-102', title: 'Cardiology Registry Pilot', company: 'Novartis Health', value: '$620,000', vertical: 'Clinical', stage: 'qualified' },
  { id: 'D-103', title: 'Charter Feeder Contract', company: 'Maersk Logistics', value: '$850,000', vertical: 'Maritime', stage: 'lead' },
  { id: 'D-104', title: 'Electrical Substation Package', company: 'Skanska USA', value: '$1,200,000', vertical: 'Construction', stage: 'won' },
  { id: 'D-105', title: 'Immunology Phase II Sites', company: 'Pfizer Bio', value: '$450,000', vertical: 'Clinical', stage: 'proposal' },
]

export const LeadsPipeline: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newVertical, setNewVertical] = useState('Construction')

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newCompany) return
    const newDeal: Deal = {
      id: `D-${Date.now().toString().slice(-3)}`,
      title: newTitle,
      company: newCompany,
      value: newValue || '$100,000',
      vertical: newVertical,
      stage: 'lead'
    }
    setDeals([newDeal, ...deals])
    setNewTitle('')
    setNewCompany('')
    setNewValue('')
    setShowAddModal(false)
  }

  const moveStage = (dealId: string, nextStage: Deal['stage']) => {
    setDeals(deals.map(d => d.id === dealId ? { ...d, stage: nextStage } : d))
  }

  const columns: { stage: Deal['stage']; title: string; count: number }[] = [
    { stage: 'lead', title: '📥 Inbound Leads', count: deals.filter(d => d.stage === 'lead').length },
    { stage: 'qualified', title: '🎯 Qualified Deals', count: deals.filter(d => d.stage === 'qualified').length },
    { stage: 'proposal', title: '📝 Proposal / Estimate', count: deals.filter(d => d.stage === 'proposal').length },
    { stage: 'won', title: '🏆 Closed Won', count: deals.filter(d => d.stage === 'won').length },
  ]

  return (
    <AppLayout title="Leads & Opportunity Pipeline">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, color: '#64748b' }}>
          Drag or advance commercial deals through domain stages with automated compliance checks.
        </p>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Opportunity
        </button>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Create New Commercial Deal</h3>
            <form onSubmit={handleCreateDeal}>
              <div className="form-group">
                <label>Deal / Scope Title</label>
                <input className="form-control" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Structural Steel Package" />
              </div>
              <div className="form-group">
                <label>Account / Company</label>
                <input className="form-control" required value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="e.g. Bechtel Infrastructure" />
              </div>
              <div className="form-group">
                <label>Estimated Value</label>
                <input className="form-control" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="e.g. $500,000" />
              </div>
              <div className="form-group">
                <label>Industry Vertical</label>
                <select className="form-control" value={newVertical} onChange={e => setNewVertical(e.target.value)}>
                  <option value="Construction">🏗️ Construction</option>
                  <option value="Clinical">🧬 Clinical Trials</option>
                  <option value="Maritime">🚢 Maritime Logistics</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Stages */}
      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.stage} className="kanban-col">
            <div className="kanban-col-header">
              <span>{col.title}</span>
              <span className="badge-count">{col.count}</span>
            </div>

            <div className="kanban-cards">
              {deals.filter(d => d.stage === col.stage).map(deal => (
                <div key={deal.id} className="kanban-card">
                  <div className="kanban-card-title">{deal.title}</div>
                  <div className="kanban-card-subtitle">{deal.company}</div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', color: '#475569' }}>
                      {deal.vertical}
                    </span>
                  </div>
                  <div className="kanban-card-footer">
                    <span>{deal.value}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {col.stage === 'lead' && <button className="btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => moveStage(deal.id, 'qualified')}>Advance →</button>}
                      {col.stage === 'qualified' && <button className="btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => moveStage(deal.id, 'proposal')}>Advance →</button>}
                      {col.stage === 'proposal' && <button className="btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => moveStage(deal.id, 'won')}>Win 🏆</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}

