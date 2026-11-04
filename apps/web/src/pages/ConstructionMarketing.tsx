import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrandMark,
  HardHatIcon,
  CalculatorIcon,
  FileTextIcon,
  WrenchIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  DownloadIcon,
  LayersIcon,
  BuildingIcon,
  PipelineIcon,
  CalendarIcon,
  UsersIcon,
  LockIcon,
  ArrowRightIcon,
} from '../components/Icons'
import './Marketing.css'

const WORKFLOW_STAGES = [
  { step: '01', name: 'Lead / ITB Intake', desc: 'Capture plan-room invitations, GC bid invites, and inbound referrals in a dedicated Leads Inbox.' },
  { step: '02', name: 'Bid / No-Bid Qualification', desc: 'Score bidder density, GC payment history, margin target, and crew capacity before committing estimator hours.' },
  { step: '03', name: 'Opportunity Creation', desc: 'Convert qualified leads in one click into linked GC Organization, Estimator Contact, and Pipeline Deal.' },
  { step: '04', name: 'RFQ & Addendum Control', desc: 'Track bid due dates, CSI MasterFormat trade scopes, and specification addenda with countdown alerts.' },
  { step: '05', name: 'Multi-Version Estimating', desc: 'Log v1.0 base estimates, v2.0 value-engineering alternates, and scope exclusions per RFQ.' },
  { step: '06', name: 'Bid Submission', desc: 'Submit formal proposals and automatically schedule 48-hour GC de-scope follow-up calls.' },
  { step: '07', name: 'GC Scope Negotiation', desc: 'Manage alternates, stored-material terms, and retainage caps with complete activity timelines.' },
  { step: '08', name: 'Contract Award / Win-Loss', desc: 'Record awarded contract sums or structured loss reasons to calculate true GC bid-hit ratios.' },
  { step: '09', name: 'Project Handover & SOV', desc: 'Hand over awarded bids into active projects with AIA G702/G703 Schedule of Values and PCO control.' },
  { step: '10', name: 'Repeat GC Follow-Up', desc: 'Trigger post-handover relationship check-ins to secure preferred-bidder status on upcoming packages.' },
]

const FAQS = [
  {
    q: 'How is SalesFortis Construction CRM different from generic horizontal CRMs or heavy field ERPs?',
    a: 'Horizontal CRMs lack RFQ deadlines, Bid/No-Bid scoring, multi-revision estimates, and GC relationship tracking, while field ERPs ignore preconstruction sales velocity. SalesFortis centers on winning profitable construction work—from ITB intake through Bid Submission, Award, and clean SOV handover.',
  },
  {
    q: 'Can estimators and account executives customize pipeline stages and win probabilities?',
    a: 'Yes. Every construction workspace includes customizable pipeline stages, per-stage win probabilities for weighted backlog forecasting, drag-and-drop Kanban cards, saved views, and 7-day deal inactivity alerts.',
  },
  {
    q: 'How does SalesFortis track relationships across multiple General Contractors on the same project?',
    a: 'Organizations are categorized by construction role—General Contractor, Owner / Developer, Specialty Subcontractor, Material Supplier, or Architect / Engineer—so you can view your historical bid-hit ratio and active tenders with every GC.',
  },
  {
    q: 'How are AI bid recommendations and specification analyses governed?',
    a: 'Every AI output strictly separates Verified Workspace Facts (queried directly from your tenant PostgreSQL database) from AI Sales & Estimating Recommendations, requiring human estimator review before binding submission.',
  },
  {
    q: 'What happens when our team wins a bid?',
    a: 'One click on Award & Handover marks the RFQ and latest estimate revision as awarded, updates your won revenue and hit-rate metrics, provisions an active project for AIA G702/G703 progress billing and PCO tracking, and schedules the GC kickoff follow-up.',
  },
  {
    q: 'Is our bid pricing and customer list isolated from other contractors on the platform?',
    a: 'Yes. Every organization operates inside a strict tenant-scoped PostgreSQL boundary with role-based permissions, JWT session revocation, and zero cross-industry clutter.',
  },
]

const ConstructionMarketing: React.FC = () => {
  const navigate = useNavigate()
  const [heroTab, setHeroTab] = useState<'pipeline' | 'rfq' | 'forecast'>('pipeline')
  const [openFaq, setOpenFaq] = useState<number>(0)

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="marketing-container">
      {/* Sticky Construction Commercial Header */}
      <header className="marketing-header">
        <div className="nav-bar" style={{ flexWrap: 'wrap' }}>
          <div className="logo-small" onClick={() => navigate('/')}>
            <BrandMark size={32} accent="#ea580c" />
            <span>SalesFortis</span>
            <span className="nav-suite-pill" style={{ borderColor: 'rgba(251,146,60,0.45)', color: '#fdba74' }}>
              Construction CRM
            </span>
          </div>

          <nav style={{ display: 'flex', gap: '1.15rem', alignItems: 'center', flexWrap: 'wrap' }} aria-label="Construction Product Navigation">
            {[
              ['Workflow', 'workflow'],
              ['CRM Features', 'features'],
              ['AI Bid Coach', 'ai-sales'],
              ['Forecasting', 'forecasting'],
              ['Pricing', 'pricing'],
              ['FAQ', 'faq'],
            ].map(([label, target]) => (
              <button
                key={target}
                type="button"
                onClick={() => scrollToSection(target)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.25rem 0.15rem',
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button className="back-btn" onClick={() => navigate('/')}>← All Verticals</button>
            <button className="back-btn" onClick={() => navigate('/login?industry=construction')}>Sign In</button>
            <button
              className="cta-btn"
              style={{ background: '#ea580c', padding: '0.48rem 1rem', fontSize: '0.85rem' }}
              onClick={() => navigate('/register?industry=construction')}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      <main className="marketing-main">
        {/* Commercial Hero with Interactive 3-Mode CRM Preview */}
        <section
          className="marketing-hero"
          style={{
            background:
              'radial-gradient(circle at 80% 18%, rgba(234, 88, 12, 0.24), transparent 46%), linear-gradient(180deg, #0b1120 0%, #111827 100%)',
          }}
        >
          <div className="mkt-hero-inner">
            <div>
              <div
                className="mkt-eyebrow"
                style={{ background: 'rgba(234, 88, 12, 0.16)', border: '1px solid rgba(251, 146, 60, 0.35)', color: '#fdba74' }}
              >
                <HardHatIcon size={14} color="#fb923c" /> Purpose-Built Preconstruction &amp; Bid Pipeline CRM
              </div>
              <h1>Commercial Subcontractor &amp; Construction CRM</h1>
              <p className="hero-subtitle">
                Win higher-margin construction work without spreadsheet chaos. Manage inbound ITBs, General Contractor
                relationships, Bid/No-Bid scoring, multi-version estimates, automated follow-ups, and clean project
                handover in one fast, visual CRM built for estimators and commercial sales teams.
              </p>

              <div className="mkt-cta-group">
                <button
                  className="cta-btn"
                  style={{ background: '#ea580c' }}
                  onClick={() => navigate('/register?industry=construction')}
                >
                  Start Free Trial <ArrowRightIcon size={16} />
                </button>
                <button
                  className="mkt-demo-btn"
                  onClick={() => navigate('/login?industry=construction')}
                >
                  Explore Live Construction Workspace
                </button>
              </div>

              <div className="mkt-compliance-strip">
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#fb923c" /> Visual Drag-and-Drop Bid Board</span>
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#fb923c" /> Estimate v1.0 / v2.0 Revision History</span>
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#fb923c" /> GC Hit-Rate &amp; Weighted Backlog</span>
              </div>
            </div>

            {/* Interactive Construction CRM Product Preview */}
            <div className="mkt-console">
              <div className="mkt-console-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="mkt-console-title" style={{ color: '#fdba74' }}>
                  CONSTRUCTION BID &amp; PIPELINE WORKSPACE
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[
                    { id: 'pipeline', label: 'Bid Pipeline' },
                    { id: 'rfq', label: 'RFQ & Estimates' },
                    { id: 'forecast', label: 'Hit-Rate Analytics' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setHeroTab(t.id as 'pipeline' | 'rfq' | 'forecast')}
                      style={{
                        padding: '0.24rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '5px',
                        border: heroTab === t.id ? '1px solid #fb923c' : '1px solid rgba(148,163,184,0.25)',
                        background: heroTab === t.id ? 'rgba(234,88,12,0.25)' : 'rgba(15,23,42,0.6)',
                        color: heroTab === t.id ? '#fff' : '#cbd5e1',
                        cursor: 'pointer',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mkt-console-body">
                {heroTab === 'pipeline' && (
                  <>
                    <div className="mkt-console-kpis">
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">Active Bid Pipeline</div>
                        <div className="mkt-console-kpi-val">$4,820,000</div>
                      </div>
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">Weighted Forecast</div>
                        <div className="mkt-console-kpi-val" style={{ color: '#fdba74' }}>$2,945,000</div>
                      </div>
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">Due Within 7 Days</div>
                        <div className="mkt-console-kpi-val" style={{ color: '#4ade80' }}>5 Bids</div>
                      </div>
                    </div>
                    <table className="mkt-console-table">
                      <thead>
                        <tr>
                          <th>Trade Package</th>
                          <th>GC Organization</th>
                          <th>Stage</th>
                          <th>Bid Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Civic Hospital Chiller &amp; Ductwork</td>
                          <td>Turner Precon</td>
                          <td><span style={{ color: '#fdba74', fontWeight: 700 }}>Bid Submitted (65%)</span></td>
                          <td className="sf-mono">$640,000</td>
                        </tr>
                        <tr>
                          <td>Airport Concourse Curtain Wall</td>
                          <td>Skanska Commercial</td>
                          <td><span style={{ color: '#38bdf8', fontWeight: 700 }}>GC Negotiation (80%)</span></td>
                          <td className="sf-mono">$920,000</td>
                        </tr>
                        <tr>
                          <td>Data Center Substation Gear</td>
                          <td>DPR Industrial</td>
                          <td><span style={{ color: '#4ade80', fontWeight: 700 }}>Contract Awarded</span></td>
                          <td className="sf-mono">$510,000</td>
                        </tr>
                        <tr>
                          <td>Logistics Hub Tilt-Up Slab</td>
                          <td>Clayco Builders</td>
                          <td><span style={{ color: '#cbd5e1' }}>RFQ &amp; Takeoff (50%)</span></td>
                          <td className="sf-mono">$385,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {heroTab === 'rfq' && (
                  <>
                    <div className="mkt-console-kpis">
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">RFQ Bid Status</div>
                        <div className="mkt-console-kpi-val" style={{ color: '#4ade80' }}>BID — PURSUE</div>
                      </div>
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">Qualification Score</div>
                        <div className="mkt-console-kpi-val">85 / 100</div>
                      </div>
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">Latest Revision</div>
                        <div className="mkt-console-kpi-val" style={{ color: '#fdba74' }}>v2.0 ($515k)</div>
                      </div>
                    </div>
                    <table className="mkt-console-table">
                      <thead>
                        <tr>
                          <th>Estimate Rev</th>
                          <th>Scope / VE Notes</th>
                          <th>Submitted Amount</th>
                          <th>State</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="sf-mono">v1.0</td>
                          <td>Base Division 26 Switchgear</td>
                          <td className="sf-mono">$480,000</td>
                          <td>Superseded</td>
                        </tr>
                        <tr>
                          <td className="sf-mono">v2.0</td>
                          <td>Addendum #2 Backup Feeders</td>
                          <td className="sf-mono">$515,000</td>
                          <td style={{ color: '#4ade80', fontWeight: 700 }}>Submitted to GC</td>
                        </tr>
                        <tr>
                          <td className="sf-mono">Award</td>
                          <td>Negotiated Final Subcontract</td>
                          <td className="sf-mono">$510,000</td>
                          <td style={{ color: '#38bdf8', fontWeight: 700 }}>Handed to SOV</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {heroTab === 'forecast' && (
                  <>
                    <div className="mkt-console-kpis">
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">GC Bid-Hit Ratio</div>
                        <div className="mkt-console-kpi-val" style={{ color: '#4ade80' }}>34.8%</div>
                      </div>
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">Awarded Backlog</div>
                        <div className="mkt-console-kpi-val">$3,180,000</div>
                      </div>
                      <div className="mkt-console-kpi">
                        <div className="mkt-console-kpi-lbl">Stale Bids (&ge;7d)</div>
                        <div className="mkt-console-kpi-val" style={{ color: '#f87171' }}>2 Flagged</div>
                      </div>
                    </div>
                    <table className="mkt-console-table">
                      <thead>
                        <tr>
                          <th>General Contractor</th>
                          <th>Bids Submitted</th>
                          <th>Awards Won</th>
                          <th>Hit Ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Turner Preconstruction</td>
                          <td className="sf-mono">9</td>
                          <td className="sf-mono">4</td>
                          <td style={{ color: '#4ade80', fontWeight: 700 }}>44.4%</td>
                        </tr>
                        <tr>
                          <td>DPR Industrial</td>
                          <td className="sf-mono">7</td>
                          <td className="sf-mono">3</td>
                          <td style={{ color: '#4ade80', fontWeight: 700 }}>42.9%</td>
                        </tr>
                        <tr>
                          <td>Uninvited Plan-Room ITBs</td>
                          <td className="sf-mono">14</td>
                          <td className="sf-mono">1</td>
                          <td style={{ color: '#f87171', fontWeight: 700 }}>7.1% (No-Bid Alert)</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                <div className="mkt-console-footer">
                  <span>Next Automated Action: 48h Post-Bid Scope Call Scheduled</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>PostgreSQL Tenant Sync Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for Contractors, Specialty Subcontractors & Estimators */}
        <section className="mkt-section" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="mkt-section-inner">
            <div className="mkt-section-header">
              <div className="mkt-section-tag" style={{ color: '#ea580c' }}>Role-Specific Commercial Value</div>
              <h2>Built for How Construction Revenue Teams Actually Sell &amp; Bid</h2>
              <p>
                Whether you bid 40 specialty trade packages a month or negotiate negotiated GMP preconstruction contracts,
                SalesFortis aligns estimators, account executives, and project operations around one source of truth.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <HardHatIcon size={20} color="#ea580c" />
                </div>
                <h3>Specialty Trade Subcontractors</h3>
                <p>
                  Built for MEP, Electrical, HVAC, Concrete, Structural Steel, Glazing, and Drywall teams managing high
                  volumes of GC invitations, addenda, alternates, and tight bid-day deadlines.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <BuildingIcon size={20} color="#ea580c" />
                </div>
                <h3>Commercial General Contractors</h3>
                <p>
                  Track private developer pursuits, design-build RFP milestones, preconstruction service agreements,
                  architect relationships, and negotiated backlog forecasting.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <CalculatorIcon size={20} color="#ea580c" />
                </div>
                <h3>Chief Estimators &amp; Preconstruction</h3>
                <p>
                  Eliminate wasted takeoff hours on low-probability plan-room bids with structured Bid/No-Bid scoring,
                  estimate revision history, and historical win-rate analytics per GC.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10-Stage Lead-to-Contract Construction Workflow */}
        <section id="workflow" className="mkt-section">
          <div className="mkt-section-inner">
            <div className="mkt-section-header">
              <div className="mkt-section-tag" style={{ color: '#ea580c' }}>End-to-End Commercial Lifecycle</div>
              <h2>10-Stage Construction Lead-to-Contract Workflow</h2>
              <p>
                Every stage transitions cleanly without re-keying customer, estimate, or contract values between sales
                spreadsheets and project billing.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {WORKFLOW_STAGES.map((item) => (
                <div
                  key={item.step}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1.15rem',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <span
                      className="sf-mono"
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: '#ea580c',
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                      }}
                    >
                      STAGE {item.step}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core CRM Capabilities */}
        <section id="features" className="mkt-section" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div className="mkt-section-inner">
            <div className="mkt-section-header">
              <div className="mkt-section-tag" style={{ color: '#ea580c' }}>Action-Driven Sales Execution</div>
              <h2>High-Velocity Pipeline UX Meets Construction Bid Discipline</h2>
              <p>
                Designed around fast, uncluttered daily selling—every deal shows its GC relationship, bid deadline,
                idle days, and next scheduled follow-up at a glance.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <PipelineIcon size={20} color="#ea580c" />
                </div>
                <h3>Customizable Drag-and-Drop Bid Board</h3>
                <p>
                  Move bids across customizable stages via drag-and-drop Kanban or sortable register tables. Filter
                  instantly by High-Value packages, Stale Deals (&ge;7 days idle), or Awarded contracts.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <UsersIcon size={20} color="#ea580c" />
                </div>
                <h3>GC, Owner &amp; Trade Partner Directory</h3>
                <p>
                  Organize companies as General Contractors, Owners/Developers, Specialty Subcontractors, Material
                  Suppliers, or Architects—complete with linked estimators, RFQs, and relationship timelines.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <CalendarIcon size={20} color="#ea580c" />
                </div>
                <h3>Site Walks, Follow-Up Cadence &amp; Templates</h3>
                <p>
                  Schedule calls, jobsite walks, and pre-bid meetings on every opportunity. Advancing a deal to Bid
                  Submitted or Contract Awarded automatically creates next-step follow-up tasks.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <FileTextIcon size={20} color="#ea580c" />
                </div>
                <h3>RFQ Intake &amp; Estimate Revision Tracking</h3>
                <p>
                  Log RFQ due dates, Bid/No-Bid decisions, and sequential v1.0, v2.0, and v3.0 estimate revisions so
                  estimators never lose visibility into base bids vs. alternates.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <LayersIcon size={20} color="#ea580c" />
                </div>
                <h3>Seamless Project Handover, SOV &amp; PCOs</h3>
                <p>
                  Convert awarded bids directly into active projects with AIA Document G702/G703 Schedule of Values
                  progress billing, retainage calculation, Change Events, and Field T&amp;M tickets.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <DownloadIcon size={20} color="#ea580c" />
                </div>
                <h3>Saved Views &amp; Accounting CSV Exports</h3>
                <p>
                  Export filtered pipeline registers and certified AIA G702/G703 SOV billing schedules to clean CSV
                  files protected against spreadsheet formula injection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Sales & Construction Document Intelligence */}
        <section id="ai-sales" className="mkt-section">
          <div className="mkt-section-inner">
            <div className="mkt-section-header">
              <div className="mkt-section-tag" style={{ color: '#ea580c' }}>Grounded Construction AI</div>
              <h2>Practical AI for Estimators &amp; Account Executives—Never Hallucinated</h2>
              <p>
                Every AI workflow separates verified PostgreSQL workspace records from model-generated sales and
                estimating recommendations.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <SparklesIcon size={20} color="#ea580c" />
                </div>
                <h3>AI Bid Qualification &amp; Deal Coach</h3>
                <p>
                  Evaluates GC relationship history, invited competitor count, target gross margin, and bid deadline
                  window to produce an explainable 0–100 Bid/No-Bid score and next-best follow-up actions.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <WrenchIcon size={20} color="#ea580c" />
                </div>
                <h3>CSI MasterFormat Spec &amp; Addendum Diff</h3>
                <p>
                  Paste or upload RFQ specification sections to detect CSI Divisions (03 Concrete through 26 Electrical)
                  and highlight scope changes between base specifications and new addenda.
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <ShieldCheckIcon size={20} color="#ea580c" />
                </div>
                <h3>Tenant-Isolated Document RAG Copilot</h3>
                <p>
                  Index project specifications, subcontract terms, and safety manuals into your private tenant vector
                  index with prompt-injection sanitization and source snippet citations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reporting, Forecasting & Security */}
        <section id="forecasting" className="mkt-workflow-band">
          <div className="mkt-workflow-inner">
            <div>
              <div className="mkt-section-tag" style={{ color: '#fb923c' }}>Executive Visibility &amp; Governance</div>
              <h2>Forecast Backlog Accuracy &amp; Bid-Hit Ratio in Real Time</h2>
              <p>
                Stop guessing next quarter&apos;s crew utilization. SalesFortis calculates live pipeline metrics directly
                from your tenant database—distinguishing open bids, weighted probability revenue, and awarded contracts.
              </p>
              <div className="mkt-workflow-steps">
                <div className="mkt-step">
                  <span className="mkt-step-num" style={{ background: 'rgba(234,88,12,0.2)', color: '#fdba74' }}>01</span>
                  <div className="mkt-step-text">
                    <h4>Estimated vs. Awarded Contract Tracking</h4>
                    <p>Compare initial v1.0 estimates against final awarded subcontract budgets across all projects.</p>
                  </div>
                </div>
                <div className="mkt-step">
                  <span className="mkt-step-num" style={{ background: 'rgba(234,88,12,0.2)', color: '#fdba74' }}>02</span>
                  <div className="mkt-step-text">
                    <h4>Bid-Hit Ratio &amp; Win/Loss Analytics</h4>
                    <p>Measure exact win percentages across submitted tenders, No-Bid declines, and repeat GCs.</p>
                  </div>
                </div>
                <div className="mkt-step">
                  <span className="mkt-step-num" style={{ background: 'rgba(234,88,12,0.2)', color: '#fdba74' }}>03</span>
                  <div className="mkt-step-text">
                    <h4>Enterprise Tenant Security &amp; Audit Trail</h4>
                    <p>Row-level `tenant_id` isolation, JWT revocation, RBAC, and immutable audit logs on every transition.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mkt-guardrail-box">
              <h3>
                <LockIcon size={18} color="#fb923c" /> Commercial Security &amp; Data Integrity
              </h3>
              <ul>
                <li>
                  <CheckCircleIcon size={16} color="#4ade80" style={{ marginTop: '2px' }} />
                  <span><strong>Single-Vertical Workspace Purity:</strong> Construction tenants see only construction CRM pipelines, RFQs, estimates, and SOV tools.</span>
                </li>
                <li>
                  <CheckCircleIcon size={16} color="#4ade80" style={{ marginTop: '2px' }} />
                  <span><strong>Cross-Tenant IDOR Protection:</strong> Foreign tenant UUIDs return strict HTTP 404/403 across all CRM, RFQ, Estimate, and Project endpoints.</span>
                </li>
                <li>
                  <CheckCircleIcon size={16} color="#4ade80" style={{ marginTop: '2px' }} />
                  <span><strong>Locked Approved Pay Apps:</strong> Approved AIA G702/G703 SOV billing applications are cryptographically locked against silent edits.</span>
                </li>
                <li>
                  <CheckCircleIcon size={16} color="#4ade80" style={{ marginTop: '2px' }} />
                  <span><strong>CSV Formula Sanitization:</strong> Pipeline and accounting exports neutralize spreadsheet injection vectors automatically.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Commercial Editions & Trial / Demo Journey */}
        <section id="pricing" className="mkt-section" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="mkt-section-inner">
            <div className="mkt-section-header">
              <div className="mkt-section-tag" style={{ color: '#ea580c' }}>Transparent Commercial Editions</div>
              <h2>Start Provisioning Your Construction CRM Workspace in 60 Seconds</h2>
              <p>
                Every edition provisions a dedicated, tenant-isolated PostgreSQL workspace with zero setup fees.
              </p>
            </div>

            <div className="features-grid">
              {[
                {
                  tier: 'Trade Bid Desk',
                  price: '$49',
                  unit: '/ seat / month',
                  desc: 'For growing specialty subcontractors replacing bid spreadsheets.',
                  highlights: [
                    'Leads Inbox & 1-Click Qualification',
                    'Customizable Drag-and-Drop Bid Board',
                    'GC & Estimator Contact Directory',
                    'Activity Cadence & Stale-Deal Alerts',
                  ],
                  featured: false,
                },
                {
                  tier: 'Commercial Subcontractor',
                  price: '$89',
                  unit: '/ seat / month',
                  desc: 'Full preconstruction estimating, AI Bid Coach, and SOV handover.',
                  highlights: [
                    'Everything in Trade Bid Desk',
                    'RFQ Deadlines & Estimate Revisions (v1/v2)',
                    'AI Bid Qualification & CSI Spec Analysis',
                    'Award Handover + AIA G702/G703 SOV Billing',
                  ],
                  featured: true,
                },
                {
                  tier: 'Enterprise Multi-Division',
                  price: 'Custom',
                  unit: 'annual agreement',
                  desc: 'For multi-office contractors requiring custom governance and ERP exports.',
                  highlights: [
                    'Unlimited Trade Divisions & Custom Pipelines',
                    'Private Tenant Document RAG Knowledge Base',
                    'Role-Based Approval Gates & Audit Logs',
                    'Dedicated Onboarding & Accounting CSV Feeds',
                  ],
                  featured: false,
                },
              ].map((plan) => (
                <div
                  key={plan.tier}
                  className="feature-item"
                  style={{
                    border: plan.featured ? '2px solid #ea580c' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <div>
                    {plan.featured && (
                      <div
                        style={{
                          display: 'inline-block',
                          background: '#ea580c',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          marginBottom: '0.65rem',
                        }}
                      >
                        Most Popular for Trade Contractors
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{plan.tier}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{plan.price}</span>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{plan.unit}</span>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>{plan.desc}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'grid', gap: '0.5rem' }}>
                      {plan.highlights.map((h) => (
                        <li key={h} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', color: '#334155' }}>
                          <CheckCircleIcon size={15} color="#ea580c" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={plan.featured ? 'cta-btn' : 'back-btn'}
                    style={
                      plan.featured
                        ? { background: '#ea580c', width: '100%', justifyContent: 'center' }
                        : { background: '#0f172a', color: '#ffffff', width: '100%', padding: '0.72rem 1rem' }
                    }
                    onClick={() =>
                      navigate(plan.price === 'Custom' ? '/login?industry=construction' : '/register?industry=construction')
                    }
                  >
                    {plan.price === 'Custom' ? 'Launch Enterprise Demo' : 'Start 14-Day Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Construction Buyer FAQ */}
        <section id="faq" className="mkt-section">
          <div className="mkt-section-inner" style={{ maxWidth: '900px' }}>
            <div className="mkt-section-header">
              <div className="mkt-section-tag" style={{ color: '#ea580c' }}>Construction CRM FAQ</div>
              <h2>Common Questions from Estimators &amp; Commercial Leaders</h2>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={item.q}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: '#ffffff',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '1rem 1.2rem',
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{item.q}</span>
                      <span style={{ color: '#ea580c', fontWeight: 800, marginLeft: '1rem' }}>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 1.2rem 1.1rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Bottom Conversion Banner */}
        <section className="mkt-bottom-cta">
          <h2>Ready to Win More Profitable Construction Bids?</h2>
          <p>
            Provision an isolated Construction CRM workspace with live bid boards, GC relationship tracking, multi-version
            estimating, and AIA G702/G703 SOV handover.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="cta-btn"
              style={{ background: '#ea580c' }}
              onClick={() => navigate('/register?industry=construction')}
            >
              Provision Construction Workspace <ArrowRightIcon size={16} />
            </button>
            <button
              className="back-btn"
              style={{ padding: '0.78rem 1.3rem' }}
              onClick={() => navigate('/login?industry=construction')}
            >
              Sign In to Existing Tenant
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ConstructionMarketing
