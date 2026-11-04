import React, { useEffect, useState } from 'react'
import { AppLayout } from './AppLayout'
import { useNavigate } from 'react-router-dom'
import {
  HardHatIcon,
  DnaIcon,
  ShipIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchIcon,
  UsersIcon,
  CalendarIcon,
  ContainerIcon,
  FileTextIcon,
  LayersIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../../components/Icons'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeIndustry, setActiveIndustry] = useState<string>(() => (localStorage.getItem('sf_industry') || 'all').toLowerCase())
  const [liveStats, setLiveStats] = useState<{
    sovAppsCount: number
    changeEventsCount: number
    clinicalRandomized: number
    rateCardsPending: number
  }>({
    sovAppsCount: 2,
    changeEventsCount: 3,
    clinicalRandomized: 82,
    rateCardsPending: 1,
  })

  useEffect(() => {
    const syncIndustry = () => {
      setActiveIndustry((localStorage.getItem('sf_industry') || 'all').toLowerCase())
    }
    window.addEventListener('sf-tenant-updated', syncIndustry)
    syncIndustry()
    return () => window.removeEventListener('sf-tenant-updated', syncIndustry)
  }, [])

  const entitledList = activeIndustry.split(',').map((s) => s.trim()).filter(Boolean)
  const isMulti = activeIndustry === 'all' || entitledList.length > 1
  const showConstruction = activeIndustry === 'all' || entitledList.includes('construction')
  const showClinical = activeIndustry === 'all' || entitledList.includes('clinical')
  const showMaritime = activeIndustry === 'all' || entitledList.includes('maritime')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    if (showConstruction) {
      fetch('/api/v1/verticals/construction/change-events', { headers })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.change_events) {
            setLiveStats((prev) => ({ ...prev, changeEventsCount: d.change_events.length }))
          }
        })
        .catch(() => {})
    }
    if (showClinical) {
      fetch('/api/v1/verticals/clinical/metrics', { headers })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.randomized !== undefined) {
            setLiveStats((prev) => ({ ...prev, clinicalRandomized: d.randomized }))
          }
        })
        .catch(() => {})
    }
    if (showMaritime) {
      fetch('/api/v1/verticals/maritime/rate-cards', { headers })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.rate_cards) {
            const pending = d.rate_cards.filter((c: any) => c.status === 'pending_approval').length
            setLiveStats((prev) => ({ ...prev, rateCardsPending: pending }))
          }
        })
        .catch(() => {})
    }
  }, [activeIndustry, showConstruction, showClinical, showMaritime])

  // --- Live Construction CRM analytics (tenant PostgreSQL) ---
  const isConstructionOnly = !isMulti && showConstruction && !showClinical && !showMaritime
  const [conCrm, setConCrm] = useState<Record<string, any> | null>(null)
  const [conBid, setConBid] = useState<Record<string, any> | null>(null)
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || !isConstructionOnly) return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/v1/crm/analytics', { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/v1/verticals/construction/bid-analytics', { headers }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([crm, bid]) => {
        setConCrm(crm)
        setConBid(bid)
      })
      .catch(() => {})
  }, [isConstructionOnly])
  const conHasLive = Boolean(conCrm?.has_tenant_records || conBid?.has_bid_records)
  const money = (n: number) => `$${Math.round(Number(n) || 0).toLocaleString()}`

  const kpiSummary = isMulti
    ? {
        pipeline: '$4,850,000',
        deals: '42 Deals',
        workflowsCount: '19 Active',
        workflowsSub: '12 RFQs / 4 Studies / 3 Shipments',
        conversion: '34.6%',
        conversionSub: '+4.1% AI-assisted lift',
        dashboardTitle: 'Executive CRM Dashboard',
      }
    : showClinical
    ? {
        pipeline: '$1,680,000',
        deals: '14 Studies & Sites',
        workflowsCount: '4 Active Protocols',
        workflowsSub: `240 Screened • 95 Consented • ${liveStats.clinicalRandomized} Randomized`,
        conversion: '39.6%',
        conversionSub: 'Screen-to-eICF conversion rate',
        dashboardTitle: 'Clinical Trials & Recruitment Dashboard',
      }
    : showMaritime
    ? {
        pipeline: '$2,140,000',
        deals: '18 Freight Accounts',
        workflowsCount: '9 Active Shipments',
        workflowsSub: `6 Ocean Containers • ${liveStats.rateCardsPending} Staged Tariff Cards`,
        conversion: '41.2%',
        conversionSub: 'Spot quote-to-booking ratio',
        dashboardTitle: 'Maritime Freight & Brokerage Dashboard',
      }
    : conHasLive
    ? {
        pipeline: money(conCrm?.open_pipeline_value ?? 0),
        deals: `${conCrm?.open_opportunities_count ?? 0} Open Bids`,
        workflowsCount: `${conBid?.rfqs_open ?? 0} Open RFQs`,
        workflowsSub: `${conBid?.rfqs_due_soon ?? 0} due ≤ 7d • ${conCrm?.open_activities_count ?? 0} open follow-ups`,
        conversion: `${conBid?.bid_hit_ratio_pct ?? conCrm?.win_rate_pct ?? 0}%`,
        conversionSub: 'Live bid-hit ratio (awarded ÷ decided)',
        dashboardTitle: 'Construction & Subcontractor Dashboard',
      }
    : {
        pipeline: '$3,120,000',
        deals: '16 Trade Packages',
        workflowsCount: `${liveStats.changeEventsCount + 9} Active Ops`,
        workflowsSub: `7 Open Bids • ${liveStats.changeEventsCount} Change Events / PCOs`,
        conversion: '31.8%',
        conversionSub: 'ITB bid-to-award hit rate',
        dashboardTitle: 'Construction & Subcontractor Dashboard',
      }

  const quickLaunchCards = showClinical && !isMulti
    ? [
        { title: 'eConsent & Randomization', sub: '21 CFR Part 50 Hard Gate', path: '/app/verticals?vertical=clinical&sub=ctms', icon: <ShieldCheckIcon size={18} color="#059669" /> },
        { title: 'Safe Harbor Referrals', sub: 'Pseudonymous Volunteer Intake', path: '/app/verticals?vertical=clinical&sub=referrals', icon: <UsersIcon size={18} color="#059669" /> },
        { title: 'Coordinator Visit Queue', sub: 'Prescreen Calls & Follow-Ups', path: '/app/verticals?vertical=clinical&sub=followups', icon: <CalendarIcon size={18} color="#059669" /> },
        { title: 'Protocol Eligibility AI', sub: 'I/E Parser + CRC Sign-Off', path: '/app/verticals?vertical=clinical&sub=protocol', icon: <SparklesIcon size={18} color="#059669" /> },
      ]
    : showMaritime && !isMulti
    ? [
        { title: 'Ocean Spot Quoting', sub: '20GP / 40HC + BAF/THC/PSS', path: '/app/verticals?vertical=maritime&sub=quoting', icon: <CalculatorIcon size={18} color="#0284c7" /> },
        { title: 'Container & LFD Control', sub: 'Milestones & Detention Guard', path: '/app/verticals?vertical=maritime&sub=tracking', icon: <ContainerIcon size={18} color="#0284c7" /> },
        { title: 'Carrier Tariff Governance', sub: 'CSV AI Staging & Approval', path: '/app/verticals?vertical=maritime&sub=tariffs', icon: <SparklesIcon size={18} color="#0284c7" /> },
        { title: 'House Bill of Lading', sub: 'Issue NVOCC HBL Documents', path: '/app/verticals?vertical=maritime&sub=hbl', icon: <FileTextIcon size={18} color="#0284c7" /> },
      ]
    : !isMulti
    ? [
        { title: 'Bid Desk & RFQs', sub: 'Bid/No-Bid, Estimates, Handover', path: '/app/verticals?vertical=construction&sub=bids', icon: <FileTextIcon size={18} color="#ea580c" /> },
        { title: 'AIA G702/G703 Billing', sub: 'SOV Retainage & CSV Export', path: '/app/verticals?vertical=construction&sub=sov', icon: <CalculatorIcon size={18} color="#ea580c" /> },
        { title: 'Change Events & PCOs', sub: 'RFQ → PCO Approval Ledger', path: '/app/verticals?vertical=construction&sub=pco', icon: <LayersIcon size={18} color="#ea580c" /> },
        { title: 'CSI Spec & Addendum AI', sub: '50-Div Citations & Scope Diff', path: '/app/verticals?vertical=construction&sub=spec', icon: <SparklesIcon size={18} color="#ea580c" /> },
      ]
    : []

  return (
    <AppLayout title={kpiSummary.dashboardTitle}>
      {isConstructionOnly && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.9rem' }}>
          <span
            data-testid="construction-data-source"
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '0.28rem 0.7rem',
              borderRadius: '999px',
              background: conHasLive ? '#ecfdf5' : '#fff7ed',
              color: conHasLive ? '#047857' : '#c2410c',
              border: `1px solid ${conHasLive ? '#a7f3d0' : '#fed7aa'}`,
            }}
          >
            {conHasLive ? 'Live Tenant Metrics — calculated from your PostgreSQL workspace' : 'Sample Demo Baseline — add leads, opportunities, or RFQs to see live metrics'}
          </span>
          <button type="button" className="btn-secondary" onClick={() => navigate('/app/leads')}>
            Open Bid Pipeline <ArrowRightIcon size={14} />
          </button>
        </div>
      )}

      {isConstructionOnly && conHasLive && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.1rem' }}>
          {[
            { lbl: 'Weighted Forecast', val: money(conCrm?.weighted_forecast_value ?? 0) },
            { lbl: 'Won / Awarded Revenue', val: money(conCrm?.won_value ?? 0) },
            { lbl: 'Estimated Value (All Revisions)', val: money(conBid?.total_estimated_value ?? 0) },
            { lbl: 'Awarded Backlog (Projects)', val: money(conBid?.total_awarded_contract_value ?? 0) },
            { lbl: 'Stale Deals ≥ 7d', val: String(conCrm?.stale_deals_count ?? 0), warn: (conCrm?.stale_deals_count ?? 0) > 0 },
            { lbl: 'Overdue Follow-Ups', val: String(conCrm?.overdue_activities_count ?? 0), warn: (conCrm?.overdue_activities_count ?? 0) > 0 },
            { lbl: 'Unqualified Leads', val: String(conCrm?.leads_unqualified ?? 0) },
            { lbl: 'No-Bid Decisions', val: String(conBid?.no_bid_count ?? 0) },
          ].map((k) => (
            <div key={k.lbl} className="metric-card" style={{ padding: '0.85rem 1rem' }}>
              <div className="metric-label">{k.lbl}</div>
              <div className="metric-value" style={{ fontSize: '1.25rem', color: k.warn ? '#b91c1c' : undefined }}>{k.val}</div>
            </div>
          ))}
        </section>
      )}

      {/* Executive KPI Strip */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Pipeline Value</div>
          <div className="metric-value">{kpiSummary.pipeline}</div>
          <div className="metric-trend">↑ 18.2% vs prior period</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Opportunities</div>
          <div className="metric-value">{kpiSummary.deals}</div>
          <div className="metric-trend">↑ 5 qualified this week</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open Vertical Workflows</div>
          <div className="metric-value">{kpiSummary.workflowsCount}</div>
          <div className="metric-trend" style={{ color: '#0284c7' }}>{kpiSummary.workflowsSub}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Win Conversion Rate</div>
          <div className="metric-value">{kpiSummary.conversion}</div>
          <div className="metric-trend">{kpiSummary.conversionSub}</div>
        </div>
      </section>

      {/* Single-Vertical Domain Module Launchpad */}
      {quickLaunchCards.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.9rem', marginBottom: '1.35rem' }}>
          {quickLaunchCards.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem 1.1rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.sub}</div>
                </div>
              </div>
              <ArrowRightIcon size={15} color="#94a3b8" />
            </button>
          ))}
        </section>
      )}

      {/* Split Operational Queue & Live Risk Telemetry */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.85fr 1.15fr', gap: '1.25rem' }}>
        <div className="sf-panel" style={{ marginBottom: 0 }}>
          <div className="sf-panel-header">
            <h3>Active Operational Queue</h3>
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => navigate('/app/verticals')}>
              Open Full Workbench →
            </button>
          </div>
          <table className="sf-data-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Reference Code</th>
                <th>Project / Study / Consignment</th>
                <th>Financial / SLA Metric</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {showConstruction && (
                <>
                  <tr>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <HardHatIcon size={15} color="#ea580c" /> Construction
                      </span>
                    </td>
                    <td className="sf-mono"><strong>RFQ-2026-081</strong></td>
                    <td>Harborview Medical Center Expansion</td>
                    <td className="sf-mono">$1,850,000 Contract</td>
                    <td><span className="sf-pill sf-pill-warn">ITB Bidding</span></td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '0.28rem 0.6rem', fontSize: '0.76rem' }} onClick={() => navigate('/app/verticals?vertical=construction&sub=sov')}>
                        Open SOV
                      </button>
                    </td>
                  </tr>
                  {!isMulti && (
                    <tr>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <HardHatIcon size={15} color="#ea580c" /> Construction
                        </span>
                      </td>
                      <td className="sf-mono"><strong>PCO-CE-002</strong></td>
                      <td>Main Electrical Conduit Re-Route (Div 26)</td>
                      <td className="sf-mono">+$24,200 PCO</td>
                      <td><span className="sf-pill sf-pill-info">PCO Submitted</span></td>
                      <td>
                        <button className="btn-secondary" style={{ padding: '0.28rem 0.6rem', fontSize: '0.76rem' }} onClick={() => navigate('/app/verticals?vertical=construction&sub=pco')}>
                          Review PCO
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              )}

              {showClinical && (
                <>
                  <tr>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <DnaIcon size={15} color="#059669" /> Clinical
                      </span>
                    </td>
                    <td className="sf-mono"><strong>STUDY-ONCO-401</strong></td>
                    <td>Phase III Solid Tumor Immunotherapy</td>
                    <td className="sf-mono">{liveStats.clinicalRandomized} / 100 Enrolled</td>
                    <td><span className="sf-pill sf-pill-info">Enrolling</span></td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '0.28rem 0.6rem', fontSize: '0.76rem' }} onClick={() => navigate('/app/verticals?vertical=clinical&sub=ctms')}>
                        CTMS View
                      </button>
                    </td>
                  </tr>
                  {!isMulti && (
                    <tr>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <DnaIcon size={15} color="#059669" /> Clinical
                        </span>
                      </td>
                      <td className="sf-mono"><strong>PROTO-NC-004</strong></td>
                      <td>Neurology Early Intervention • 8 Sites</td>
                      <td className="sf-mono">95 eICF Verified</td>
                      <td><span className="sf-pill sf-pill-success">IRB Cleared</span></td>
                      <td>
                        <button className="btn-secondary" style={{ padding: '0.28rem 0.6rem', fontSize: '0.76rem' }} onClick={() => navigate('/app/verticals?vertical=clinical&sub=referrals')}>
                          Referrals
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              )}

              {showMaritime && (
                <>
                  <tr>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <ShipIcon size={15} color="#0284c7" /> Maritime
                      </span>
                    </td>
                    <td className="sf-mono"><strong>SHP-EU-8924</strong></td>
                    <td>Rotterdam to Singapore Heavy Cargo</td>
                    <td className="sf-mono">4x 40HC • 28d SLA</td>
                    <td><span className="sf-pill sf-pill-success">In Transit</span></td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '0.28rem 0.6rem', fontSize: '0.76rem' }} onClick={() => navigate('/app/verticals?vertical=maritime&sub=tracking')}>
                        Track B/L
                      </button>
                    </td>
                  </tr>
                  {!isMulti && (
                    <tr>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <ShipIcon size={15} color="#0284c7" /> Maritime
                        </span>
                      </td>
                      <td className="sf-mono"><strong>BL-MAEU-9821</strong></td>
                      <td>Asia–USEC Savannah Terminal Discharge</td>
                      <td className="sf-mono">1 Free Day Left</td>
                      <td><span className="sf-pill sf-pill-danger">LFD Alert</span></td>
                      <td>
                        <button className="btn-secondary" style={{ padding: '0.28rem 0.6rem', fontSize: '0.76rem' }} onClick={() => navigate('/app/verticals?vertical=maritime&sub=tracking')}>
                          Mitigate
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Domain Risk & Compliance Telemetry */}
        <div className="sf-panel" style={{ marginBottom: 0 }}>
          <div className="sf-panel-header">
            <h3>
              <SparklesIcon size={16} color="#2563eb" /> Domain Compliance &amp; AI Telemetry
            </h3>
          </div>
          <div className="sf-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {showConstruction && (
              <div style={{ padding: '0.95rem', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.83rem', fontWeight: 700, color: '#c2410c', marginBottom: '0.3rem' }}>
                  <AlertTriangleIcon size={15} color="#ea580c" /> RFQ Scope Revision Warning
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c2d12', lineHeight: 1.5 }}>
                  RFQ-2026-081 contains 3 new addenda in CSI Section 08 80 00 (Glazing) requiring estimator delta review prior to G702/G703 lock.
                </p>
              </div>
            )}

            {showClinical && (
              <>
                <div style={{ padding: '0.95rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.83rem', fontWeight: 700, color: '#047857', marginBottom: '0.3rem' }}>
                    <CheckCircleIcon size={15} color="#059669" /> Recruitment Target Met • 21 CFR Part 50
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#065f46', lineHeight: 1.5 }}>
                    Site 04 (Boston Medical) achieved 100% electronic Informed Consent (eICF) verification prior to Cohort 2 subject randomization.
                  </p>
                </div>
                {!isMulti && (
                  <div style={{ padding: '0.95rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.83rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.3rem' }}>
                      <ShieldCheckIcon size={15} color="#2563eb" /> Protocol Criteria Verification Queue
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                      PROTO-NC-004 has extracted Inclusion/Exclusion thresholds awaiting Clinical Research Coordinator human-in-the-loop verification.
                    </p>
                  </div>
                )}
              </>
            )}

            {showMaritime && (
              <div style={{ padding: '0.95rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.83rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.3rem' }}>
                  <AlertTriangleIcon size={15} color="#dc2626" /> LFD Demurrage &amp; Detention Alert
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                  Master B/L BL-MAEU-9821 at Port of Savannah has 1 Last Free Day remaining prior to carrier terminal demurrage charges.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppLayout>
  )
}
