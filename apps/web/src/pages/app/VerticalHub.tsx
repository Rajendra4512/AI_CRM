import React, { useState } from 'react'
import { AppLayout } from './AppLayout'

export const VerticalHub: React.FC = () => {
  const [activeVertical, setActiveVertical] = useState<'construction' | 'clinical' | 'maritime'>('construction')

  return (
    <AppLayout title="Vertical Workflow Engine">
      {/* Vertical Switcher Tabs */}
      <div className="vertical-tabs">
        <button
          className={`v-tab-btn ${activeVertical === 'construction' ? 'active' : ''}`}
          onClick={() => setActiveVertical('construction')}
        >
          🏗️ Construction & Trades
        </button>
        <button
          className={`v-tab-btn ${activeVertical === 'clinical' ? 'active' : ''}`}
          onClick={() => setActiveVertical('clinical')}
        >
          🧬 Clinical Trials & CTMS
        </button>
        <button
          className={`v-tab-btn ${activeVertical === 'maritime' ? 'active' : ''}`}
          onClick={() => setActiveVertical('maritime')}
        >
          🚢 Maritime & Freight Brokerage
        </button>
      </div>

      {/* Construction Module View */}
      {activeVertical === 'construction' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="metric-card">
              <div className="metric-label">Active RFQs</div>
              <div className="metric-value">14 Pending</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Approved Change Orders</div>
              <div className="metric-value">$84,500</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Schedule of Values (SOV)</div>
              <div className="metric-value">92% Billed</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Construction RFQs & Change Events (Procore Aligned)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 0' }}>Event #</th>
                  <th>Description</th>
                  <th>Trade Scope</th>
                  <th>Estimated Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 0' }}><strong>CE-012</strong></td>
                  <td>Additional Fire Stopping 4th Floor</td>
                  <td>Drywall & Insulation</td>
                  <td>$18,400</td>
                  <td><span style={{ color: '#16a34a', fontWeight: 600 }}>PCO Approved</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 0' }}><strong>CE-013</strong></td>
                  <td>Re-routing Conduit Main Run</td>
                  <td>Electrical</td>
                  <td>$24,200</td>
                  <td><span style={{ color: '#d97706', fontWeight: 600 }}>Under Review</span></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 0' }}><strong>CE-014</strong></td>
                  <td>Structural Tie-in Revision</td>
                  <td>Structural Steel</td>
                  <td>$42,000</td>
                  <td><span style={{ color: '#2563eb', fontWeight: 600 }}>RFQ Issued</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clinical Trials Module View */}
      {activeVertical === 'clinical' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="metric-card">
              <div className="metric-label">Active Clinical Studies</div>
              <div className="metric-value">6 Studies</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Consented Subjects</div>
              <div className="metric-value">284 Enrolled</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">GCP Compliance Score</div>
              <div className="metric-value">99.4%</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Active Protocol Lifecycles (CTMS / TrialX Aligned)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 0' }}>Protocol ID</th>
                  <th>Therapeutic Area</th>
                  <th>Target Sites</th>
                  <th>Recruitment</th>
                  <th>IRB Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 0' }}><strong>PROTO-NC-004</strong></td>
                  <td>Neurology (Alzheimer's Early Intervention)</td>
                  <td>8 Sites</td>
                  <td>82 / 100 Subjects</td>
                  <td><span style={{ color: '#16a34a', fontWeight: 600 }}>Active & Cleared</span></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 0' }}><strong>PROTO-CV-019</strong></td>
                  <td>Cardiovascular Stent Biocompatibility</td>
                  <td>12 Sites</td>
                  <td>145 / 150 Subjects</td>
                  <td><span style={{ color: '#16a34a', fontWeight: 600 }}>Active & Cleared</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maritime Module View */}
      {activeVertical === 'maritime' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="metric-card">
              <div className="metric-label">Active Sea Waybills</div>
              <div className="metric-value">38 Active</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">TEU Volume Booked</div>
              <div className="metric-value">1,420 TEU</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Average Transit Time</div>
              <div className="metric-value">18.4 Days</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Vessel Bookings & Bills of Lading (Magaya Aligned)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 0' }}>Booking / B/L #</th>
                  <th>Vessel / Carrier</th>
                  <th>Port of Loading (POL)</th>
                  <th>Port of Discharge (POD)</th>
                  <th>Milestone</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 0' }}><strong>BL-MAEU-9821</strong></td>
                  <td>MSC Gülsün (MSC)</td>
                  <td>Shanghai (CNSHA)</td>
                  <td>Long Beach (USLGB)</td>
                  <td><span style={{ color: '#2563eb', fontWeight: 600 }}>Customs Cleared</span></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 0' }}><strong>BL-CMA-4412</strong></td>
                  <td>CMA CGM Jacques Saadé</td>
                  <td>Rotterdam (NLRTM)</td>
                  <td>Singapore (SGSIN)</td>
                  <td><span style={{ color: '#16a34a', fontWeight: 600 }}>Discharged</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

