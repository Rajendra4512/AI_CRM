# 02 — Clinical Trials UX Benchmark: TrialX & RealTime eClinical Solutions

## 1. Evidence References
- **RealTime eClinical (`https://realtime-eclinical.com/`)**:
  - Desktop (`1440x900`): `ev_c0627f262c2d5f57ac69e690518eea2a878a9fcfe386672633e672745c75cc46` (`1,051,128` DOM bytes, `189` network events, `18,098` a11y bytes)
  - Mobile (`390x844`): `ev_41224e2f1fdc3eecd5471ea5a1a480e513fc067d95e4bf439c6b162abebb5281` (`1,051,194` DOM bytes, `192` network events, `17,374` a11y bytes)
- **TrialX (`https://www.trialx.com/`)**:
  - Desktop (`1440x900`): `ev_92d0775b7532700a718c207603e8a6608288966323fc5ff8f3659d71c452d20c` (`117` DOM bytes, `3` network events — HTTP `403 Forbidden`)
  - Mobile (`390x844`): `ev_859878a54848e48c2e727faf491a9e7eb16d7d657de1fd7090bc7d99b4467af5` (`117` DOM bytes, `3` network events — HTTP `403 Forbidden`)

---

## 2. RealTime eClinical Solutions (`/`) — Observed Structure & UX Patterns

### 2.1 Information Architecture & Product Ecosystem (Observed)
- **Core Positioning (`H1`)**:
  - *"The Operating System for Modern Clinical Research"*
  - *"Manage the research and business of clinical trials, together."*
- **Unified Multi-Module Product Taxonomy (`H2`: *"One platform. Seven essential solutions."*)**:
  - Observed navigation and interactive solution pills: **`CTMS`**, **`eSource`**, **`eReg / eISF`**, **`Engage!`** (eConsent & patient engagement), **`Devana`** (pipeline & feasibility intelligence from sponsor award to site activation), **`GlobalPay` / `SitePay`**, and **`SOMS`** (Site Operations Management System).
- **Organization-Type Segmentation (`H3` persona architecture)**:
  - **Sponsors & CROs**
  - **Phase I Clinical Units**
  - **Sites, Networks, AMCs & Health Systems**
- **Quantitative Clinical Trust Metrics (`H3` proof points observed)**:
  - `3000+ Clinical Research Sites`, `3 of Top 5 CROs`, `9 of the 10 top site networks`, `600,000+ patient visits supported per year`.

### 2.2 Interactive Component Patterns & Accessibility (Observed)
- **Interactive Tabbed Solution Showcase (`8` `role="tab"` elements observed)**: Rather than forcing endless vertical scrolling, RealTime uses an accessible `tablist` (`8` tabs) allowing clinical operations leaders to switch between `CTMS`, `eSource`, `eReg/eISF`, `Devana`, and `Engage!` in place.
- **Skip Links & Form Density**: Provides top-of-document `Skip to content` accessibility anchor, `2` lead/newsletter forms, `1` structured comparison table, and `1` modal dialog.

---

## 3. TrialX (`/`) — Access Limitation & Public Domain Context

### 3.1 Observed Access Limitation (REA Evidence)
- Both desktop (`ev_92d0775b7532700a718c207603e8a6608288966323fc5ff8f3659d71c452d20c`) and mobile (`ev_859878a54848e48c2e727faf491a9e7eb16d7d657de1fd7090bc7d99b4467af5`) headless Chromium captures returned `<h1>403 Forbidden</h1>` (`117` bytes) from TrialX's edge firewall.
- **Compliance Action**: Per Requirement #5 (*"Do not bypass authentication, paywalls or technical access restrictions"*), no header spoofing, proxy rotation, or bot-evasion was attempted.

### 3.2 Publicly Indexed Domain Context (Clearly Separated from REA DOM Observation)
- From public search index summaries (`search_web` on `trialx.com`), TrialX focuses on the **patient recruitment front-end** of clinical trials: AI-assisted clinical trial finders, digital patient prescreening questionnaires, volunteer referral tracking, and multi-channel recruitment analytics bridging sponsors and clinical sites.

---

## 4. Actionable Design & Engineering Lessons Applied to SalesFortis Clinical Suite

1. **Bridging Business Pipeline + Site Clinical Operations**: Inspired by the separation between Sponsor/Site feasibility (`CRM Pipeline`) and active study execution (`CTMS + Recruitment + eConsent`), SalesFortis Clinical connects Sponsor/CRO opportunities in `LeadsPipeline.tsx` with active protocol execution in `ClinicalWorkbench.tsx`.
2. **Accessible `role="tablist"` Sub-Module Switching**: Modeled on RealTime's multi-tab clinical module switcher, `ClinicalWorkbench.tsx` uses ARIA-compliant `SubModuleNav` (`role="tablist"` / `role="tab"`) across:
   - *CTMS Cohort & 21 CFR Part 50 eConsent Guardrail* (`POST /verify-consent` + `POST /revoke-consent`)
   - *Pseudonymous Patient Referral Registry* (`GET/POST /referrals` with live HIPAA Safe Harbor PII/PHI rejection!)
   - *Coordinator Visit & Prescreen Call Queue* (`GET/POST /follow-ups`)
   - *Protocol Inclusion/Exclusion AI + Mandatory CRC Sign-Off* (`POST /ai/analyze-protocol` + `PATCH /criteria/{id}/verify`)
3. **Compliance-First Visual Signaling**: Clinical emerald (`#059669`) + slate precision palette with explicit regulatory state badges (`21 CFR Part 50`, `Safe Harbor Guard`, `Pending CRC Verification`, `Consent Revoked`)—never permitting autonomous AI eligibility decisions.

