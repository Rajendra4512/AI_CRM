import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrandMark,
  DnaIcon,
  ShieldCheckIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  SparklesIcon,
  LockIcon,
  ActivityIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../components/Icons'
import './Marketing.css'

const ClinicalMarketing: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="marketing-container">
      {/* Sticky Clinical Commercial Header */}
      <header className="marketing-header">
        <div className="nav-bar">
          <div className="logo-small" onClick={() => navigate('/')}>
            <BrandMark size={32} accent="#059669" />
            <span>SalesFortis</span>
            <span className="nav-suite-pill" style={{ borderColor: 'rgba(52,211,153,0.4)', color: '#6ee7b7' }}>
              eClinical, CTMS &amp; Patient Recruitment
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button className="back-btn" onClick={() => navigate('/')}>← All Verticals</button>
            <button className="back-btn" onClick={() => navigate('/login?industry=clinical')}>Sign In</button>
            <button
              className="cta-btn"
              style={{ background: '#059669', padding: '0.48rem 1rem', fontSize: '0.85rem' }}
              onClick={() => navigate('/register?industry=clinical')}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      <main className="marketing-main">
        {/* Split TrialX + RealTime-eClinical Inspired Hero */}
        <section
          className="marketing-hero"
          style={{
            background:
              'radial-gradient(circle at 80% 18%, rgba(5, 150, 105, 0.28), transparent 46%), linear-gradient(180deg, #061214 0%, #0f172a 100%)',
          }}
        >
          <div className="mkt-hero-inner">
            <div>
              <div
                className="mkt-eyebrow"
                style={{ background: 'rgba(5, 150, 105, 0.18)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#6ee7b7' }}
              >
                <DnaIcon size={14} color="#34d399" /> Patient Recruitment Hub + Site CTMS &amp; 21 CFR Part 50/11 eConsent
              </div>
              <h1>Clinical Trials &amp; Patient Recruitment Suite</h1>
              <p className="hero-subtitle">
                Accelerate clinical trial enrollment from sponsor feasibility to cohort randomization. Combine digital
                patient prescreening and HIPAA Safe Harbor de-identification with RealTime-grade site CTMS operations,
                eICF signature verification, and coordinator-governed protocol eligibility AI.
              </p>

              <div className="mkt-cta-group">
                <button
                  className="cta-btn"
                  style={{ background: '#059669' }}
                  onClick={() => navigate('/register?industry=clinical')}
                >
                  Start Free Trial <ArrowRightIcon size={16} />
                </button>
                <button
                  className="mkt-demo-btn"
                  onClick={() => navigate('/login?industry=clinical')}
                >
                  Launch Live Clinical CTMS Demo
                </button>
              </div>

              <div className="mkt-compliance-strip">
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#34d399" /> 21 CFR Part 50 / Part 11 eICF Guard</span>
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#34d399" /> HIPAA Safe Harbor PHI Firewall</span>
                <span className="mkt-compliance-item"><CheckCircleIcon size={14} color="#34d399" /> ICH-GCP Audit Trail</span>
              </div>
            </div>

            {/* Live Clinical CTMS & Recruitment Preview */}
            <div className="mkt-workbench-card">
              <div className="mkt-wb-header">
                <span>PROTOCOL PROTO-NC-004 • PHASE III NEUROLOGY</span>
                <span style={{ color: '#6ee7b7' }}>IRB Cleared • 8 Active Sites</span>
              </div>
              <div className="mkt-wb-body">
                <div className="mkt-wb-metrics">
                  <div className="mkt-wb-metric">
                    <span>Identified Funnel</span>
                    <strong>240 Referrals</strong>
                  </div>
                  <div className="mkt-wb-metric">
                    <span>eICF Verified</span>
                    <strong style={{ color: '#38bdf8' }}>95 Subjects</strong>
                  </div>
                  <div className="mkt-wb-metric">
                    <span>Randomized Cohort</span>
                    <strong style={{ color: '#34d399' }}>82 / 100</strong>
                  </div>
                </div>

                <table className="mkt-wb-table">
                  <thead>
                    <tr>
                      <th>Pseudonym / Sec</th>
                      <th>Clinical Event / Criterion</th>
                      <th>Guardrail</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="sf-mono">PT-401-09</td>
                      <td>Electronic Informed Consent (eICF v3.2)</td>
                      <td className="sf-mono">21 CFR 50</td>
                      <td style={{ color: '#34d399' }}>Randomized</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">SUBJ-2026-19</td>
                      <td>Digital Trial Finder Referral Intake</td>
                      <td className="sf-mono">Safe Harbor</td>
                      <td style={{ color: '#fbbf24' }}>CRC Prescreen Call</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">SEC 4.1.1</td>
                      <td>Inclusion: Age 18–75 &amp; ECOG 0–1</td>
                      <td className="sf-mono">HITL Required</td>
                      <td style={{ color: '#60a5fa' }}>Coordinator Verified</td>
                    </tr>
                    <tr>
                      <td className="sf-mono">PT-401-03</td>
                      <td>Subject Withdrawal Request</td>
                      <td className="sf-mono">Audit Locked</td>
                      <td style={{ color: '#f87171' }}>Consent Revoked</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Stage Clinical Trial Lifecycle Strip */}
        <section className="mkt-lifecycle-band">
          <div className="mkt-lifecycle-inner">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#059669' }}>
              Sponsor, CRO &amp; Research Site Recruitment-to-Randomization Pipeline
            </div>
            <div className="mkt-lifecycle-steps">
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#059669' }}>01 • Sponsor &amp; Site CRM</div>
                <div className="mkt-step-title">Study Feasibility</div>
                <div className="mkt-step-desc">Manage pharmaceutical sponsor awards, CRO site selection, and IRB activation pipelines.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#059669' }}>02 • Protocol AI</div>
                <div className="mkt-step-title">I/E Criteria Extraction</div>
                <div className="mkt-step-desc">Parse Inclusion/Exclusion thresholds from study protocols for mandatory CRC verification.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#059669' }}>03 • Digital Outreach</div>
                <div className="mkt-step-title">Safe Harbor Referrals</div>
                <div className="mkt-step-desc">Ingest pseudonymous volunteer referrals while blocking raw PII/PHI at the API boundary.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#059669' }}>04 • eConsent Vault</div>
                <div className="mkt-step-title">21 CFR Part 50 eICF</div>
                <div className="mkt-step-desc">Hard-block subject randomization until verified electronic informed consent is recorded.</div>
              </div>
              <div className="mkt-step-card">
                <div className="mkt-step-num" style={{ color: '#059669' }}>05 • Site Operations</div>
                <div className="mkt-step-title">Visits &amp; Retention</div>
                <div className="mkt-step-desc">Schedule coordinator prescreen calls, cohort follow-up windows, and withdrawal audits.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 8 Core Clinical Modules */}
        <section className="features-section">
          <div className="mkt-section-head">
            <h2>Unified Patient Recruitment &amp; Site eClinical Operations</h2>
            <p>
              Engineered around modern recruitment intelligence and site CTMS standards—with deterministic regulatory
              safeguards built into every transaction.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <UsersIcon size={20} color="#059669" />
              </div>
              <h3>Patient Referral &amp; Funnel Hub</h3>
              <p>Track volunteer progression across Identified, Prescreened, eICF Consented, and Randomized stages in real time.</p>
              <div className="feature-meta-code">RECRUITMENT • Multi-Channel Intake</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <LockIcon size={20} color="#059669" />
              </div>
              <h3>HIPAA Safe Harbor Firewall</h3>
              <p>Rejects raw patient names, SSNs, emails, and phone numbers in referral IDs—enforcing pseudonymous coding.</p>
              <div className="feature-meta-code">PRIVACY • Deterministic PII/PHI Guard</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <ShieldCheckIcon size={20} color="#059669" />
              </div>
              <h3>21 CFR Part 50 eConsent</h3>
              <p>Cryptographic consent verification gate that prevents unconsented subjects from entering randomized cohorts.</p>
              <div className="feature-meta-code">COMPLIANCE • Hard Randomization Gate</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <SparklesIcon size={20} color="#059669" />
              </div>
              <h3>Protocol Eligibility AI</h3>
              <p>Extracts inclusion/exclusion lab thresholds and washout periods with mandatory Clinical Research Coordinator sign-off.</p>
              <div className="feature-meta-code">AI • Autonomous Decisions Prohibited</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <CalendarIcon size={20} color="#059669" />
              </div>
              <h3>Coordinator Visit Queue</h3>
              <p>Schedule prescreen phone interviews, baseline screening visits, and cohort follow-up tasks per referral.</p>
              <div className="feature-meta-code">CTMS • CRC Task &amp; Visit Scheduler</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <FileTextIcon size={20} color="#059669" />
              </div>
              <h3>Consent Withdrawal Vault</h3>
              <p>Process subject consent revocations immediately, halting downstream study workflows and recording audit reasons.</p>
              <div className="feature-meta-code">ICH-GCP • Immediate Revocation Lock</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <ActivityIcon size={20} color="#059669" />
              </div>
              <h3>Site &amp; Sponsor CTMS Pipeline</h3>
              <p>Manage sponsor/CRO relationships, therapeutic area budgets, IRB clearance states, and site enrollment velocity.</p>
              <div className="feature-meta-code">CRM • Sponsor &amp; Site Lifecycle</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: '#ecfdf5' }}>
                <DnaIcon size={20} color="#059669" />
              </div>
              <h3>Isolated Study RAG Vault</h3>
              <p>Query investigator brochures and study amendments within a strictly isolated single-tenant vector index.</p>
              <div className="feature-meta-code">RAG • Citation-Grounded Q&amp;A</div>
            </div>
          </div>
        </section>

        {/* Clinical Workspace Plans & Regulatory Matrix */}
        <section className="mkt-matrix-section">
          <div className="mkt-section-head">
            <h2>Clinical Research Workspace Editions &amp; Regulatory Matrix</h2>
            <p>Purpose-built workspaces for single research sites, academic medical centers, and global CRO networks.</p>
          </div>

          <div className="mkt-plans-grid">
            <div className="mkt-plan-card">
              <span className="mkt-plan-tier">Research Site Evaluation</span>
              <div className="mkt-plan-name">Trial Workspace</div>
              <p className="mkt-plan-desc">Isolated Clinical CTMS &amp; Recruitment workspace with live Safe Harbor and eICF guardrails.</p>
              <ul className="mkt-plan-list">
                <li><CheckCircleIcon size={15} color="#059669" /> Study &amp; Sponsor Pipeline CRM</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Safe Harbor Pseudonymous Referral Intake</li>
                <li><CheckCircleIcon size={15} color="#059669" /> 21 CFR Part 50 eICF Randomization Gate</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Protocol I/E Criteria AI Parser</li>
              </ul>
              <button
                className="cta-btn"
                style={{ background: '#059669', justifyContent: 'center' }}
                onClick={() => navigate('/register?industry=clinical')}
              >
                Provision Clinical Trial →
              </button>
            </div>

            <div className="mkt-plan-card featured">
              <span className="mkt-plan-tier" style={{ color: '#059669' }}>Most Deployed • Multi-Site Networks</span>
              <div className="mkt-plan-name">Site Network eClinical</div>
              <p className="mkt-plan-desc">Full CTMS + Recruitment workbench for dedicated clinical research sites and SMOs.</p>
              <ul className="mkt-plan-list">
                <li><CheckCircleIcon size={15} color="#059669" /> Unlimited Active Protocols &amp; Subject Referrals</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Coordinator Prescreen &amp; Visit Scheduling Queue</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Human-in-the-Loop Criterion Sign-Off Ledger</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Subject Consent Withdrawal &amp; Audit Export</li>
              </ul>
              <button
                className="cta-btn"
                style={{ background: '#0f172a', justifyContent: 'center' }}
                onClick={() => navigate('/register?industry=clinical')}
              >
                Start Site Network Evaluation →
              </button>
            </div>

            <div className="mkt-plan-card">
              <span className="mkt-plan-tier">Global Sponsors &amp; CROs</span>
              <div className="mkt-plan-name">Enterprise CRO Suite</div>
              <p className="mkt-plan-desc">Enterprise multi-study governance, strict tenant isolation, and complete ICH-GCP audit trails.</p>
              <ul className="mkt-plan-list">
                <li><CheckCircleIcon size={15} color="#059669" /> Cross-Site Enrollment &amp; Cohort Telemetry</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Isolated Investigator Brochure RAG Vault</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Role-Based PI / CRC / Monitor Access Controls</li>
                <li><CheckCircleIcon size={15} color="#059669" /> Immutable Regulatory Inspection Logs</li>
              </ul>
              <button
                className="cta-btn"
                style={{ background: '#334155', justifyContent: 'center' }}
                onClick={() => navigate('/register?industry=clinical')}
              >
                Provision Enterprise Sandbox →
              </button>
            </div>
          </div>

          <div className="mkt-matrix-table-wrap">
            <table className="mkt-matrix-table">
              <thead>
                <tr>
                  <th>Clinical &amp; Regulatory Capability</th>
                  <th>Trial Workspace</th>
                  <th>Site Network eClinical</th>
                  <th>Enterprise CRO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pseudonymous Referral Registry (HIPAA Safe Harbor Guard)</strong></td>
                  <td>Included</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td><strong>21 CFR Part 50 Electronic Informed Consent (eICF) Gate</strong></td>
                  <td>Enforced</td>
                  <td>Enforced + Revocation</td>
                  <td>Enforced + Audit Vault</td>
                </tr>
                <tr>
                  <td><strong>Protocol Eligibility AI + Mandatory CRC Verification</strong></td>
                  <td>Included</td>
                  <td>Persisted + Verified</td>
                  <td>Multi-Protocol</td>
                </tr>
                <tr>
                  <td><strong>Coordinator Prescreen Call &amp; Visit Follow-Up Queue</strong></td>
                  <td>Included</td>
                  <td>Included</td>
                  <td>Multi-Site</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BrandMark size={24} accent="#059669" />
            <strong style={{ color: '#ffffff' }}>SalesFortis Clinical Cloud</strong>
            <span>• Patient Recruitment &amp; eClinical CTMS Suite</span>
          </div>
          <div>&copy; 2026 SalesFortis. Strict Single-Vertical Tenant Isolation.</div>
        </div>
      </footer>
    </div>
  )
}

export default ClinicalMarketing
