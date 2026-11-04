# 00 — REA Methodology, Readiness Verification & Evidence Ledger

## 1. REA Tool Registration & Readiness Verification

Per `SALESFORTIS_REA_improve.md` and `C:\Users\raj45\.agents\skills\reverse-engineer-anything\SKILL.md`, we verified REA (`rea-agents@6.7.0`, Skill Version `42`, Catalog `207` MCP tools / `153` CLI commands, `tools_sha256: af39310c9591bb981893ec0d2188b1bcf6e9cc8ba3ac513d5bbefc8ddcb85639`) before running any target analysis:

1. **Skill Presence**: Confirmed installed at `C:\Users\raj45\.agents\skills\reverse-engineer-anything\SKILL.md` with reference manuals (`connection-and-recovery.md`, `runtime-observation.md`, `evidence-workflows.md`, `javascript-applications.md`, `native-and-artifacts.md`).
2. **`rea doctor` Diagnostic (`--client antigravity --json`)**:
   - Host runtime: `win32 x64`, `Node.js v24.21.0` (`healthy`).
   - Client MCP registration check: `vscode` (`C:\Users\raj45\AppData\Roaming\Code\User\mcp.json`) was `aligned` (`rea-agents@6.7.0`), whereas `antigravity` (`C:\Users\raj45\.gemini\config\mcp_config.json`) reported `state: "missing"`.
   - Per `connection-and-recovery.md`:
     - Generated read-only repair plan via `rea setup --client antigravity --dry-run --json` (preserved global `~/.gemini` configuration without unauthorized mutation, since an active agent session also requires client restart/reconnection to attach new stdio MCP tools).
     - Executed REA's official CLI Evidence workflow (`rea capture-browser-scenario <scenario.json> --format json --full-output`) via Node `24.21.0` + headless Chromium `157.0.8103.38`, which produces the exact canonical `rea.browser-scenario-capture` `Evidence` envelope (`evidence_id`, SHA-256 artifact digests, accessibility trees, sanitized URLs, network transaction counts, and explicit provider limitations).

---

## 2. Cryptographic REA Evidence Ledger (12 Controlled Captures)

All captures observed **publicly accessible marketing pages only**—no authentication walls, paywalls, cookie walls, or WAF protections were bypassed.

| Target | Vertical | Viewport | REA `evidence_id` | DOM Bytes | DOM `sha256` (Prefix) | A11y Bytes | Net Events | Access Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Procore** (`/en-sg`) | Construction | `1440x900` | `ev_18509c052e496448a7a2983e201200c7268bfe178a864fe5da365dd6b89e40d6` | `630,658` | `91cf56db6f574334...` | `13,081` | `491` | Observed (`200`) |
| **Procore** (`/en-sg`) | Construction | `390x844` | `ev_9c893c690c449c324d3f47586f279d5b5aa31b714c255f81419c0bdfac05163b` | `629,876` | `260bbcdfb9c198aa...` | `11,347` | `476` | Observed (`200`) |
| **Contractor Foreman** (`/plans/`) | Construction | `1440x900` | `ev_030301e4e4fed1b0f862f08fa32b7422a59f5dfadaa450e52caa00c8dce86f40` | `1,494,978` | `9c3a35a4e6610cc7...` | `54,188` | `798` | Observed (`200`) |
| **Contractor Foreman** (`/plans/`) | Construction | `390x844` | `ev_cec46ab87d1d56c64360847b79bff86ef8bb12178f6c6600c5d184dafc6bb465` | `1,507,868` | `8deb0c718560c04f...` | `35,904` | `735` | Observed (`200`) |
| **TrialX** (`/`) | Clinical | `1440x900` | `ev_92d0775b7532700a718c207603e8a6608288966323fc5ff8f3659d71c452d20c` | `117` | `82d3edd2b884067e...` | `49` | `3` | WAF `403 Forbidden` |
| **TrialX** (`/`) | Clinical | `390x844` | `ev_859878a54848e48c2e727faf491a9e7eb16d7d657de1fd7090bc7d99b4467af5` | `117` | `82d3edd2b884067e...` | `49` | `3` | WAF `403 Forbidden` |
| **RealTime eClinical** (`/`) | Clinical | `1440x900` | `ev_c0627f262c2d5f57ac69e690518eea2a878a9fcfe386672633e672745c75cc46` | `1,051,128` | `c94070a217dc4c0e...` | `18,098` | `189` | Observed (`200`) |
| **RealTime eClinical** (`/`) | Clinical | `390x844` | `ev_41224e2f1fdc3eecd5471ea5a1a480e513fc067d95e4bf439c6b162abebb5281` | `1,051,194` | `320467ab63de23ab...` | `17,374` | `192` | Observed (`200`) |
| **Logitude World** (`/freight-forwarding-crm/`) | Maritime | `1440x900` | `ev_bd435445206d6e619ecd37959268a54d1447cf80185dea2f2472d495c7d93e81` | `174,663` | `36e7fa0e0754ff5a...` | `11,266` | `141` | Observed (`200`) |
| **Logitude World** (`/freight-forwarding-crm/`) | Maritime | `390x844` | `ev_4543fcfff093a812981ba609a482edba6ed7e6ba907c2b8a5ef766d1b6706b1c` | `174,705` | `f5514d17b4a25a2d...` | `7,282` | `141` | Observed (`200`) |
| **Magaya** (`/`) | Maritime | `1440x900` | `ev_248bede5eaafc95890f22f76251ed6aa87949cba4dc4dd00528cd8f2b35507e8` | `384,989` | `53f9c44df85201ae...` | `14,618` | `469` | Observed (`200`) |
| **Magaya** (`/`) | Maritime | `390x844` | `ev_8c008823d88635fbbcd2fe689b433d368052e88ac1704fe0dd2e26cc4b37124d` | `380,469` | `478f4df7ac15b496...` | `13,247` | `461` | Observed (`200`) |

---

## 3. Epistemic Boundaries: Observed vs. Inferred / Unknown

1. **Observed Public DOM & Accessibility**: Headings, navigation menus, ARIA tabs/dialogs, HTML comparison tables, form counts, theme metadata, and responsive mobile toggles documented in files `01`–`03` come directly from REA `normalized_result.steps[1].artifacts.{dom,accessibility}` payloads.
2. **Authenticated Competitor SaaS Internals (Unknown / Out-of-Scope)**: Per Requirement #5 ("Do not bypass authentication, paywalls or technical access restrictions"), authenticated post-login dashboards of Procore, Contractor Foreman, TrialX, RealTime-eClinical, Logitude, and Magaya were **not** accessed. Any workflow comparisons beyond public marketing previews and documented product capability matrices are explicitly marked as **Domain Workflow Synthesis** rather than observed competitor source code.
3. **WAF Restriction (`trialx.com`)**: Headless Chromium received HTTP `403 Forbidden` (`117` bytes) on `https://www.trialx.com/`. Per compliance rules, no user-agent spoofing or WAF evasion was attempted; public search index metadata is documented separately and labeled as secondary public context.
4. **Originality Guarantee**: SalesFortis implements its own original multi-tenant React 19 + FastAPI + PostgreSQL design system (`Icons.tsx`, `EnterpriseWorkbench.tsx`, `AppPortal.css`, `Marketing.css`, `Welcome.css`) with zero copied competitor source code, logos, trademarks, or verbatim marketing copy.

