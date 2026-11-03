import React from 'react'
import { AppLayout } from './AppLayout'
import { useNavigate } from 'react-router-dom'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <AppLayout title="Executive CRM Dashboard">
      {/* Key Metrics */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Pipeline Value</div>
          <div className="metric-value">$4,850,000</div>
          <div className="metric-trend">↑ 18.2% vs last month</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Opportunities</div>
          <div className="metric-value">42 Deals</div>
          <div className="metric-trend">↑ 5 new this week</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open Vertical Workflows</div>
          <div className="metric-value">19 Active</div>
          <div className="metric-trend" style={{ color: '#0284c7' }}>12 RFQs / 4 Studies / 3 Shipments</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Win Conversion Rate</div>
          <div className="metric-value">34.6%</div>
          <div className="metric-trend">↑ 4.1% AI-assisted lift</div>
        </div>
      </section>

      {/* Operational Sections */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Active Vertical Operations</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                <th style={{ padding: '0.75rem 0' }}>Vertical</th>
                <th>Reference ID</th>
                <th>Entity / Project</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0' }}>🏗️ Construction</td>
                <td><strong>RFQ-2026-081</strong></td>
                <td>Harborview Medical Center Expansion</td>
                <td><span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Bidding</span></td>
                <td><button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => navigate('/app/verticals')}>View</button></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0' }}>🧬 Clinical</td>
                <td><strong>STUDY-ONCO-401</strong></td>
                <td>Phase III Solid Tumor Immunotherapy</td>
                <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Enrolling</span></td>
                <td><button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => navigate('/app/verticals')}>View</button></td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0' }}>🚢 Maritime</td>
                <td><strong>SHP-EU-8924</strong></td>
                <td>Rotterdam to Singapore Heavy Cargo</td>
                <td><span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>In Transit</span></td>
                <td><button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => navigate('/app/verticals')}>View</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>AI Copilot Insights</h3>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#0369a1' }}>RFQ Scope Revision Warning</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>RFQ-2026-081 contains 3 new addenda in specification section 08-800 requiring glazier recalculation.</p>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#047857' }}>Recruitment Target Met</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>Site 04 (Boston Medical) achieved 100% consent completion for cohort 2.</p>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}

