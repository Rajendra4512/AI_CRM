import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrandMark,
  HardHatIcon,
  DnaIcon,
  ShipIcon,
  ShieldCheckIcon,
  LayersIcon,
  SparklesIcon,
  LockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../components/Icons'
import './Welcome.css'

type PreviewKey = 'construction' | 'clinical' | 'maritime'

const Welcome: React.FC = () => {
  const navigate = useNavigate()
  const [preview, setPreview] = useState<PreviewKey>('construction')

  return (
    <div className="welcome-container">
      {/* Sticky Enterprise Navigation */}
      <header className="sf-nav-sticky">
        <div className="sf-nav-inner">
          <div className="sf-brand-group" onClick={() => navigate('/')}>
            <BrandMark size={34} accent="#2563eb" />
            <h1>SalesFortis</h1>
            <span className="sf-brand-tag">Enterprise Industry Cloud</span>
          </div>

          <nav className="sf-nav-links">
            <button className="sf-nav-link" onClick={() => navigate('/vertical/construction')}>
              <HardHatIcon size={15} color="#fb923c" /> Construction &amp; Subcontractors
            </button>
            <button className="sf-nav-link" onClick={() => navigate('/vertical/clinical')}>
              <DnaIcon size={15} color="#34d399" /> Clinical Trials &amp; CTMS
            </button>
            <button className="sf-nav-link" onClick={() => navigate('/vertical/maritime')}>
              <ShipIcon size={15} color="#38bdf8" /> Maritime &amp; Freight Forwarding
            </button>
          </nav>

          <div className="sf-nav-actions">
            <button className="sf-btn-ghost-dark" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="sf-btn-solid-primary" onClick={() => navigate('/register')}>
              Start Free Trial <ArrowRightIcon size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Split Executive Hero */}
      <section className="sf-exec-hero">
        <div className="sf-exec-hero-grid">
          <div>
            <div className="sf-eyebrow-pill">
              <ShieldCheckIcon size={14} color="#60a5fa" />
              Single-Tenant Industry Isolation • Domain-Native Operational CRM + ERP
            </div>
            <h2 className="sf-exec-headline">
              Purpose-Built Systems of Record for Regulated &amp; Complex Industries
            </h2>
            <p className="sf-exec-subcopy">
              Generic horizontal CRMs stop at deal stages. SalesFortis unifies commercial pipeline execution with
              domain-grade operational workbenches: AIA G702/G703 subcontractor billing, 21 CFR Part 50/11 clinical
              eConsent &amp; CTMS, and ocean carrier tariff &amp; container demurrage control.
            </p>

            <div className="sf-hero-cta-row">
              <button className="sf-btn-solid-primary" style={{ padding: '0.78rem 1.45rem', fontSize: '0.95rem' }} onClick={() => navigate('/register')}>
                Provision Isolated Workspace <ArrowRightIcon size={16} />
              </button>
              <button className="sf-btn-ghost-dark" style={{ padding: '0.78rem 1.35rem', fontSize: '0.95rem' }} onClick={() => navigate('/login')}>
                Launch Interactive Demo
              </button>
            </div>

            <div className="sf-trust-metrics">
              <div>
                <div className="sf-trust-metric-val">32 Tables</div>
                <div className="sf-trust-metric-lbl">Tenant-Scoped PostgreSQL Schema</div>
              </div>
              <div>
                <div className="sf-trust-metric-val">Zero Cross-Leak</div>
                <div className="sf-trust-metric-lbl">Strict Single-Vertical Entitlement</div>
              </div>
              <div>
                <div className="sf-trust-metric-val">Human-Verified</div>
                <div className="sf-trust-metric-lbl">RAG Citations &amp; Audit Guardrails</div>
              </div>
            </div>
          </div>

          {/* Live Interactive Vertical Workbench Preview */}
          <div className="sf-preview-window">
            <div className="sf-preview-chrome">
              <div className="sf-preview-dots">
                <span style={{ background: '#ef4444' }} />
                <span style={{ background: '#f59e0b' }} />
                <span style={{ background: '#10b981' }} />
              </div>
              <div className="sf-preview-tabs">
                <button
                  type="button"
                  className={`sf-preview-tab ${preview === 'construction' ? 'active' : ''}`}
                  onClick={() => setPreview('construction')}
                >
                  Construction Ops
                </button>
                <button
                  type="button"
                  className={`sf-preview-tab ${preview === 'clinical' ? 'active' : ''}`}
                  onClick={() => setPreview('clinical')}
                >
                  Clinical CTMS
                </button>
                <button
                  type="button"
                  className={`sf-preview-tab ${preview === 'maritime' ? 'active' : ''}`}
                  onClick={() => setPreview('maritime')}
                >
                  Freight Tower
                </button>
              </div>
            </div>

            {preview === 'construction' && (
              <div className="sf-preview-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span className="sf-mono" style={{ fontSize: '0.74rem', color: '#fb923c', fontWeight: 700 }}>
                    AIA DOCUMENT G702 / G703 • PAY APP #04
                  </span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(234,88,12,0.2)', color: '#fdba74', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                    10.0% Retainage Held
                  </span>
                </div>
                <div className="sf-preview-kpis">
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">Contract Sum</div>
                    <div className="sf-preview-kpi-val">$1,450,000</div>
                  </div>
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">Completed &amp; Stored</div>
                    <div className="sf-preview-kpi-val">$942,500</div>
                  </div>
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">Net Current Due</div>
                    <div className="sf-preview-kpi-val" style={{ color: '#4ade80' }}>$848,250</div>
                  </div>
                </div>
                <table className="sf-preview-table">
                  <thead>
                    <tr>
                      <th>CSI Code</th>
                      <th>Trade Cost Line</th>
                      <th>Work %</th>
                      <th>PCO Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="sf-mono">03 30 00</td>
                      <td>Cast-in-Place Concrete</td>
                      <td className="sf-mono">88%</td>
                      <td style={{ color: '#4ade80' }}>Approved</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">05 12 00</td>
                      <td>Structural Steel Framing</td>
                      <td className="sf-mono">64%</td>
                      <td style={{ color: '#fbbf24' }}>PCO #014 Review</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">26 05 00</td>
                      <td>Primary Switchgear &amp; Conduit</td>
                      <td className="sf-mono">45%</td>
                      <td style={{ color: '#60a5fa' }}>CSI Spec Verified</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {preview === 'clinical' && (
              <div className="sf-preview-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span className="sf-mono" style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>
                    STUDY PROTO-NC-004 • 21 CFR PART 50 / 11
                  </span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                    Safe Harbor PHI Guard Active
                  </span>
                </div>
                <div className="sf-preview-kpis">
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">Prescreened</div>
                    <div className="sf-preview-kpi-val">240 Subj</div>
                  </div>
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">eICF Verified</div>
                    <div className="sf-preview-kpi-val">95 Signed</div>
                  </div>
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">Randomized</div>
                    <div className="sf-preview-kpi-val" style={{ color: '#34d399' }}>82 Cohort</div>
                  </div>
                </div>
                <table className="sf-preview-table">
                  <thead>
                    <tr>
                      <th>Subject ID</th>
                      <th>Site / Source</th>
                      <th>eICF Hash</th>
                      <th>Cohort State</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="sf-mono">PT-401-09</td>
                      <td>Site 04 • Boston Med</td>
                      <td className="sf-mono">SHA256:9f2c..e8</td>
                      <td style={{ color: '#34d399' }}>Randomized</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">PT-401-14</td>
                      <td>TrialX Digital Finder</td>
                      <td className="sf-mono">Pending eICF</td>
                      <td style={{ color: '#fbbf24' }}>Prescreen Call</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">SEC 4.1.4</td>
                      <td>ECOG Status 0–1 Rule</td>
                      <td className="sf-mono">AI Extracted</td>
                      <td style={{ color: '#60a5fa' }}>CRC Sign-Off</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {preview === 'maritime' && (
              <div className="sf-preview-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span className="sf-mono" style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                    MASTER B/L BL-MAEU-9821 • DIGITAL FREIGHT TOWER
                  </span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                    1 LFD Detention Alert
                  </span>
                </div>
                <div className="sf-preview-kpis">
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">ASIA-USEC 40HC</div>
                    <div className="sf-preview-kpi-val">$3,950 Base</div>
                  </div>
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">BAF + THC + PSS</div>
                    <div className="sf-preview-kpi-val">+$810 / Box</div>
                  </div>
                  <div className="sf-preview-kpi">
                    <div className="sf-preview-kpi-label">3x 40HC Quote</div>
                    <div className="sf-preview-kpi-val" style={{ color: '#38bdf8' }}>$14,280</div>
                  </div>
                </div>
                <table className="sf-preview-table">
                  <thead>
                    <tr>
                      <th>Container / Ref</th>
                      <th>Port Milestone</th>
                      <th>Free Time</th>
                      <th>Tariff State</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="sf-mono">MSKU9081421</td>
                      <td>US-SAV Vessel Discharged</td>
                      <td style={{ color: '#f87171', fontWeight: 600 }}>1 Day Left</td>
                      <td>HBL Issued</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">CMAU4412098</td>
                      <td>NL-RTM Gate-In Full</td>
                      <td className="sf-mono">7 Days Free</td>
                      <td style={{ color: '#4ade80' }}>Published Card</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">TARIFF-Q4</td>
                      <td>Transatlantic 40HC Sheet</td>
                      <td className="sf-mono">11d Transit</td>
                      <td style={{ color: '#fbbf24' }}>Staged Review</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Industry Vertical Selection */}
      <main className="welcome-main">
        <section className="hero">
          <h2>Choose Your Industry Vertical</h2>
          <p>
            Each workspace provisions an isolated domain environment—tailored navigation, compliance guardrails,
            financial calculators, and document AI with zero cross-industry clutter.
          </p>
        </section>

        <section className="verticals-grid">
          {/* Construction Card */}
          <div className="vertical-card" onClick={() => navigate('/vertical/construction')}>
            <div>
              <div className="vertical-card-header">
                <div className="vertical-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <HardHatIcon size={24} color="#ea580c" />
                </div>
                <span className="vertical-ref-tag" style={{ background: '#fff7ed', color: '#c2410c' }}>
                  Contractor &amp; Subcontractor Ops
                </span>
              </div>
              <h3>Commercial Subcontractor &amp; Trade Suite</h3>
              <p>
                End-to-end preconstruction bid board, AIA G702/G703 progress billing, retainage accounting, PCO
                change order workflows, and CSI MasterFormat specification AI.
              </p>
              <ul className="vertical-spec-list">
                <li><CheckCircleIcon size={15} color="#ea580c" /> Multi-line SOV Progress Billing &amp; Accounting CSV Export</li>
                <li><CheckCircleIcon size={15} color="#ea580c" /> Change Events (CE), RFQs &amp; PCO Approval State Machine</li>
                <li><CheckCircleIcon size={15} color="#ea580c" /> Field T&amp;M Crew Tickets &amp; CSI Spec Addendum Diff AI</li>
              </ul>
            </div>
            <button className="select-btn" style={{ background: '#ea580c' }}>
              Explore Construction CRM <ArrowRightIcon size={16} />
            </button>
          </div>

          {/* Clinical Card */}
          <div className="vertical-card" onClick={() => navigate('/vertical/clinical')}>
            <div>
              <div className="vertical-card-header">
                <div className="vertical-icon-box" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <DnaIcon size={24} color="#059669" />
                </div>
                <span className="vertical-ref-tag" style={{ background: '#ecfdf5', color: '#047857' }}>
                  eClinical, CTMS &amp; Recruitment
                </span>
              </div>
              <h3>Clinical Trials &amp; Patient Recruitment Suite</h3>
              <p>
                Unified patient recruitment prescreening, HIPAA Safe Harbor de-identification, site CTMS study
                operations, and 21 CFR Part 50/11 electronic informed consent guardrails.
              </p>
              <ul className="vertical-spec-list">
                <li><CheckCircleIcon size={15} color="#059669" /> Pseudonymous Referral Intake with Safe Harbor PHI Firewall</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Mandatory eICF Verification &amp; Consent Revocation Vault</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Protocol Inclusion/Exclusion AI + Coordinator Sign-Off</li>
              </ul>
            </div>
            <button className="select-btn" style={{ background: '#059669' }}>
              Explore Clinical CRM <ArrowRightIcon size={16} />
            </button>
          </div>

          {/* Maritime Card */}
          <div className="vertical-card" onClick={() => navigate('/vertical/maritime')}>
            <div>
              <div className="vertical-card-header">
                <div className="vertical-icon-box" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <ShipIcon size={24} color="#0284c7" />
                </div>
                <span className="vertical-ref-tag" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                  Freight Forwarding &amp; NVOCC
                </span>
              </div>
              <h3>Maritime Logistics &amp; Freight Brokerage Suite</h3>
              <p>
                Centralized ocean carrier tariff management, spot &amp; contract freight quoting, digital House Bills of
                Lading (HBL), and container Last Free Day (LFD) demurrage defense.
              </p>
              <ul className="vertical-spec-list">
                <li><CheckCircleIcon size={15} color="#0284c7" /> Carrier Rate Sheet CSV/Text AI Normalization &amp; Staging</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Instant 20GP / 40HC Quoting with BAF, THC &amp; PSS Surcharges</li>
                <li><CheckCircleIcon size={15} color="#0284c7" /> Container Milestone Tracking, LFD Alerts &amp; HBL Issuance</li>
              </ul>
            </div>
            <button className="select-btn" style={{ background: '#0284c7' }}>
              Explore Maritime CRM <ArrowRightIcon size={16} />
            </button>
          </div>
        </section>

        {/* Enterprise Platform Architecture Section */}
        <section className="sf-arch-section">
          <div style={{ maxWidth: '720px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#2563eb' }}>
              Platform Architecture &amp; Security
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.35rem 0 0.5rem', color: '#0f172a' }}>
              Triple-Boundary Isolation Engineered for Enterprise Governance
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
              Every tenant organization operates inside a cryptographically scoped workspace with strict database,
              industry-entitlement, and RAG document boundaries.
            </p>
          </div>

          <div className="sf-arch-grid">
            <div className="sf-arch-card">
              <LockIcon size={20} color="#2563eb" />
              <h4>Tenant Data Segregation</h4>
              <p>Every PostgreSQL entity, opportunity, and audit record enforces strict tenant_id foreign-key scoping and IDOR prevention.</p>
            </div>
            <div className="sf-arch-card">
              <LayersIcon size={20} color="#ea580c" />
              <h4>Single-Vertical Entitlement</h4>
              <p>Clinical tenants never see Construction or Maritime menus or APIs; cross-vertical endpoints fail-closed with HTTP 403.</p>
            </div>
            <div className="sf-arch-card">
              <SparklesIcon size={20} color="#059669" />
              <h4>Citation-Backed Domain RAG</h4>
              <p>CSI specs, clinical protocols, and ocean tariffs are sanitized against prompt injection and require human sign-off.</p>
            </div>
            <div className="sf-arch-card">
              <ShieldCheckIcon size={20} color="#0284c7" />
              <h4>Immutable Compliance Ledger</h4>
              <p>Every SOV approval, eICF randomization, consent withdrawal, and rate-card publication writes a tamper-evident audit event.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="welcome-footer">
        <div className="sf-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BrandMark size={26} accent="#2563eb" />
            <strong style={{ color: '#f8fafc' }}>SalesFortis Enterprise Cloud</strong>
            <span>• v2.4 Multi-Vertical CRM &amp; Operational ERP</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/vertical/construction')}>Construction</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/vertical/clinical')}>Clinical CTMS</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/vertical/maritime')}>Maritime Freight</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Portal Sign In</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Welcome
