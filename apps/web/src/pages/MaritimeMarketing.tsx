import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrandMark,
  ShipIcon,
  ContainerIcon,
  GlobeIcon,
  CalculatorIcon,
  FileTextIcon,
  SparklesIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../components/Icons'
import './Marketing.css'

const MaritimeMarketing: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="marketing-container">
      {/* Sticky Maritime Commercial Header */}
      <header className="marketing-header">
        <div className="nav-bar">
          <div className="logo-small" onClick={() => navigate('/')}>
            <BrandMark size={32} accent="#0284c7" />
            <span>SalesFortis</span>
            <span className="nav-suite-pill" style={{ borderColor: 'rgba(56,189,248,0.4)', color: '#7dd3fc' }}>
              Freight Forwarding CRM &amp; Supply Chain Tower
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button className="back-btn" onClick={() => navigate('/')}>← All Verticals</button>
            <button className="back-btn" onClick={() => navigate('/login?industry=maritime')}>Sign In</button>
            <button
              className="cta-btn"
              style={{ background: '#0284c7', padding: '0.48rem 1rem', fontSize: '0.85rem' }}
              onClick={() => navigate('/register?industry=maritime')}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      <main className="marketing-main">
        {/* Split Logitude World + Magaya Inspired Hero */}
        <section
          className="marketing-hero"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(2, 132, 199, 0.28), transparent 46%), linear-gradient(180deg, #071120 0%, #0f172a 100%)',
          }}
        >
          <div className="mkt-hero-inner">
            <div>
              <div
                className="mkt-eyebrow"
                style={{ background: 'rgba(2, 132, 199, 0.18)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#7dd3fc' }}
              >
                <ShipIcon size={14} color="#38bdf8" /> Freight Forwarding CRM + Ocean Rate Engine &amp; Demurrage Control
              </div>
              <h1>Maritime Logistics &amp; Freight Brokerage Suite</h1>
              <p className="hero-subtitle">
                Purpose-built for NVOCCs, ocean freight forwarders, and 3PL brokers. Convert shipper enquiries into
                margin-protected multimodal quotes in seconds, govern carrier tariff rate sheets, issue House Bills of
                Lading (HBL), and eliminate port detention &amp; demurrage surprises.
              </p>

              <div className="mkt-cta-group">
                <button
                  className="cta-btn"
                  style={{ background: '#0284c7' }}
                  onClick={() => navigate('/register?industry=maritime')}
                >
                  Start Free Trial <ArrowRightIcon size={16} />
                </button>
                <button
                  className="mkt-demo-btn"
                  onClick={() => navigate('/login?industry=maritime')}
                >
                  Launch Live Freight Control Demo
                </button>
              </div>

              <div className="mkt-compliance-strip">
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#38bdf8" /> 20GP / 40GP / 40HC / Reefer Quoting</span>
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#38bdf8" /> BAF + THC + PSS Surcharge Engine</span>
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#38bdf8" /> Last Free Day (LFD) Risk Alerts</span>
              </div>
            </div>

            {/* Live Freight Forwarding & Rate Control Preview */}
            <div className="mkt-workbench-card">
              <div className="mkt-wb-header">
                <span>DIGITAL FREIGHT TOWER • MASTER B/L BL-MAEU-9821</span>
                <span style={{ color: '#7dd3fc' }}>ASIA-USEC • 3x 40HC</span>
              </div>
              <div className="mkt-wb-body">
                <div className="mkt-wb-metrics">
                  <div className="mkt-wb-metric">
                    <span>Base Ocean / 40HC</span>
                    <strong>$3,950 USD</strong>
                  </div>
                  <div className="mkt-wb-metric">
                    <span>BAF + THC + PSS</span>
                    <strong style={{ color: '#fbbf24' }}>+$810 / Box</strong>
                  </div>
                  <div className="mkt-wb-metric">
                    <span>Locked Quote Total</span>
                    <strong style={{ color: '#38bdf8' }}>$14,280 USD</strong>
                  </div>
                </div>

                <table className="mkt-wb-table">
                  <thead>
                    <tr>
                      <th>Document / Ref</th>
                      <th>Trade Lane / Port Event</th>
                      <th>Free Days</th>
                      <th>Control State</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="sf-mono">BL-MAEU-9821</td>
                      <td>Port of Savannah • Vessel Discharged</td>
                      <td style={{ color: '#f87171', fontWeight: 700 }}>1 LFD Left</td>
                      <td style={{ color: '#fca5a5' }}>Detention Alert</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">HBL-2026-884</td>
                      <td>CNSHA → USSAV • 42,800 kg / 196 CBM</td>
                      <td className="sf-mono">7 Days</td>
                      <td style={{ color: '#4ade80' }}>HBL Issued</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">RC-MAERSK-09</td>
                      <td>TRANSATLANTIC 40HC Contract Sheet</td>
                      <td className="sf-mono">11d Transit</td>
                      <td style={{ color: '#4ade80' }}>Active Card</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">CSV-TARIFF</td>
                      <td>MSC Q4 Spot Surcharge Upload</td>
                      <td className="sf-mono">90d Valid</td>
                      <td style={{ color: '#fbbf24' }}>Pending Approval</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Stage Forwarding Lifecycle Strip */}
        <section className="mkt-lifecycle-band">
          <div className="mkt-lifecycle-inner">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#0284c7' }}>
              Quote-to-Delivery NVOCC &amp; Freight Forwarding Workflow
            </div>
            <div className="mkt-lifecycle-steps">
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#0284c7' }}>01 • Freight CRM</div>
                <div className="mkt-step-title">Shipper Enquiries</div>
                <div className="mkt-step-desc">Capture shipper &amp; consignee tenders, lane TEU volumes, and commercial stage velocity.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#0284c7' }}>02 • Rate Tower</div>
                <div className="mkt-step-title">AI Tariff Ingestion</div>
                <div className="mkt-step-desc">Normalize carrier CSV/text rate sheets into staged rate cards for pricing manager approval.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#0284c7' }}>03 • Instant Quoting</div>
                <div className="mkt-step-title">Landed Surcharge Math</div>
                <div className="mkt-step-desc">Calculate base ocean freight plus BAF, THC, and Peak Season Surcharges across container sizes.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#0284c7' }}>04 • Documentation</div>
                <div className="mkt-step-title">House Bill of Lading</div>
                <div className="mkt-step-desc">Generate structured NVOCC House Bills of Lading with POL/POD, weights (kg), and CBM.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#0284c7' }}>05 • Port Execution</div>
                <div className="mkt-step-title">Milestones &amp; LFD Guard</div>
                <div className="mkt-step-desc">Monitor gate-in, departure, discharge, and Last Free Day countdowns to stop demurrage fees.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 8 Core Maritime Modules */}
        <section className="features-section">
          <div className="mkt-section-head">
            <h2>Complete Forwarding CRM, Rate Management &amp; Container Control</h2>
            <p>
              Modeled on industry-standard freight forwarding CRM and supply chain automation suites—built for high-speed
              pricing desks and operations teams.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <GlobeIcon size={20} color="#0284c7" />
              </div>
              <h3>Freight Forwarding CRM</h3>
              <p>Track shipper accounts, annual TEU allocations, spot enquiries, and lane conversion rates in one pipeline.</p>
              <div className="feature-meta-code">CRM • Shipper &amp; Trade-Lane Pipeline</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <CalculatorIcon size={20} color="#0284c7" />
              </div>
              <h3>Multimodal Spot Quoting</h3>
              <p>Instant rate calculation across ASIA-USEC, ASIA-USWC, EUR-ASIA, and TRANSATLANTIC lanes with transit-day SLAs.</p>
              <div className="feature-meta-code">QUOTING • BAF + THC + PSS Breakdown</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <SparklesIcon size={20} color="#0284c7" />
              </div>
              <h3>AI Carrier Tariff Normalizer</h3>
              <p>Ingest carrier CSV files or raw email tariff sheets into normalized 20GP/40GP/40HC/Reefer rate cards.</p>
              <div className="feature-meta-code">AI • Carrier Rate Sheet Parser</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <ShieldCheckIcon size={20} color="#0284c7" />
              </div>
              <h3>Pricing Manager Approval Gate</h3>
              <p>Extracted carrier tariffs stage as pending_approval and never affect live customer quotes until broker sign-off.</p>
              <div className="feature-meta-code">GOVERNANCE • Rate Publication Lock</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <FileTextIcon size={20} color="#0284c7" />
              </div>
              <h3>House Bill of Lading (HBL)</h3>
              <p>Issue numbered NVOCC House Bills of Lading capturing shipper, consignee, vessel/voyage, container IDs, kg, and CBM.</p>
              <div className="feature-meta-code">DOCS • Digital HBL Issuance</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <ContainerIcon size={20} color="#0284c7" />
              </div>
              <h3>Container Milestone Timeline</h3>
              <p>Record and audit port-to-port container events from Empty Pick-Up and Gate-In to Customs Release and POD Delivery.</p>
              <div className="feature-meta-code">VISIBILITY • End-to-End Event Log</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <AlertTriangleIcon size={20} color="#0284c7" />
              </div>
              <h3>LFD Demurrage &amp; Detention Guard</h3>
              <p>Automatic red-alert badges when discharged containers drop to ≤ 2 Last Free Days remaining at terminal.</p>
              <div className="feature-meta-code">RISK • Port Free-Time Protection</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#f0f9ff' }}>
                <ShipIcon size={20} color="#0284c7" />
              </div>
              <h3>Carrier Tracking Contract Sync</h3>
              <p>Query live carrier tracking status contracts by Master Bill of Lading with vessel ETA and port telemetry.</p>
              <div className="feature-meta-code">EDI • Carrier Status Contract</div>
            </div>
          </div>
        </section>

        {/* Maritime Workspace Plans & Capability Matrix */}
        <section className="mkt-matrix-section">
          <div className="mkt-section-head">
            <h2>Maritime &amp; Forwarding Workspace Editions</h2>
            <p>Tailored deployments for independent freight brokers, NVOCC pricing desks, and global forwarding networks.</p>
          </div>

          <div className="mkt-plans-grid">
            <div className="mkt-plan-card">
              <span className="mkt-plan-tier">Brokerage Evaluation</span>
              <div className="mkt-plan-name">Trial Workspace</div>
              <p className="mkt-plan-desc">Full single-tenant Maritime CRM &amp; Freight Control workspace with live quoting and B/L tracking.</p>
              <ul className="mkt-plan-list">
                <li><CheckCircleIcon size={15} color="#0284c7" /> Freight Enquiry &amp; Opportunity Kanban</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Instant Ocean Surcharge Quote Generator</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Container Milestone &amp; LFD Alert Timeline</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Carrier Tariff AI Extraction</li>
              </ul>
              <button
                className="cta-btn"
                style={{ background: '#0284c7', justifyContent: 'center' }}
                onClick={() => navigate('/register?industry=maritime')}
              >
                Provision Maritime Trial →
              </button>
            </div>

            <div className="mkt-plan-card featured">
              <span className="mkt-plan-tier" style={{ color: '#0284c7' }}>Most Deployed • Forwarders &amp; NVOCCs</span>
              <div className="mkt-plan-name">Digital Forwarder Pro</div>
              <p className="mkt-plan-desc">Unified rate management, HBL documentation, and demurrage defense for active forwarding desks.</p>
              <ul className="mkt-plan-list">
                <li><CheckCircleIcon size={15} color="#0284c7" /> Unlimited CSV / Text Carrier Tariff Uploads</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Pricing Manager Rate Card Approval &amp; Publishing</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Digital House Bill of Lading (HBL) Desk</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Live Port Milestone Recording &amp; Carrier Status</li>
              </ul>
              <button
                className="cta-btn"
                style={{ background: '#0f172a', justifyContent: 'center' }}
                onClick={() => navigate('/register?industry=maritime')}
              >
                Start Forwarder Evaluation →
              </button>
            </div>

            <div className="mkt-plan-card">
              <span className="mkt-plan-tier">Global 3PL &amp; Multi-Origin</span>
              <div className="mkt-plan-name">Enterprise Supply Chain</div>
              <p className="mkt-plan-desc">Multi-branch governance, tenant-isolated charterparty/SOP RAG, and full audit retention.</p>
              <ul className="mkt-plan-list">
                <li><CheckCircleIcon size={15} color="#0284c7" /> Multi-Trade-Lane Contract &amp; Spot Governance</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Isolated Customs &amp; Charterparty Document AI</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Role-Scoped Sales / Pricing / Ops Access</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Full Audit Trail on Tariff &amp; B/L Mutations</li>
              </ul>
              <button
                className="cta-btn"
                style={{ background: '#334155', justifyContent: 'center' }}
                onClick={() => navigate('/register?industry=maritime')}
              >
                Provision Enterprise Sandbox →
              </button>
            </div>
          </div>

          <div className="mkt-matrix-table-wrap">
            <table className="mkt-matrix-table">
              <thead>
                <tr>
                  <th>Maritime &amp; Forwarding Capability</th>
                  <th>Trial Workspace</th>
                  <th>Digital Forwarder Pro</th>
                  <th>Enterprise 3PL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Multimodal Ocean Freight Quoting (BAF / THC / PSS)</strong></td>
                  <td>Included</td>
                  <td>Unlimited Quotes</td>
                  <td>Contract + Spot</td>
                </tr>
                <tr>
                  <td><strong>Carrier Tariff CSV/Text AI Staging &amp; Broker Approval</strong></td>
                  <td>Included</td>
                  <td>Included</td>
                  <td>Multi-Office</td>
                </tr>
                <tr>
                  <td><strong>House Bill of Lading (HBL) Issuance &amp; Registry</strong></td>
                  <td>Included</td>
                  <td>Unlimited HBLs</td>
                  <td>Unlimited + Audit</td>
                </tr>
                <tr>
                  <td><strong>Container Milestone Timeline &amp; LFD Detention Alerts</strong></td>
                  <td>Included</td>
                  <td>Live Event Logging</td>
                  <td>Global Control Tower</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BrandMark size={24} accent="#0284c7" />
            <strong style={{ color: '#ffffff' }}>SalesFortis Maritime Cloud</strong>
            <span>• Freight Forwarding CRM &amp; Supply Chain Suite</span>
          </div>
          <div>&copy; 2026 SalesFortis. Strict Single-Vertical Tenant Isolation.</div>
        </div>
      </footer>
    </div>
  )
}

export default MaritimeMarketing
