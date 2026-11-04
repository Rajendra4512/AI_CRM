# SalesFortis - AI-Native Multi-Vertical CRM SaaS

Commercial-grade, AI-native CRM tailored for specialized industry verticals:
1. **Construction & Trade Subcontractors** (RFQs, Change Orders, Submittals, Estimates)
2. **Clinical Trials & CTMS** (Protocols, Site Feasibility, Patient Consent & Prescreening)
3. **Maritime Logistics & Freight Brokerage** (Rate Sheets, Bookings, Milestones, Bills of Lading)

---

## Architecture & Tech Stack

- **Frontend**: React 19 + TypeScript + Vite (Marketing Pages & `/app/*` CRM Portal)
- **Backend API**: FastAPI (Python 3.11) with Pydantic v2 validation & CORS
- **Database**: PostgreSQL (with SQLAlchemy ORM & Multi-tenant schema)
- **Cache & Async Queue**: Redis & Celery
- **Automated Testing**: 
  - Playwright E2E browser test suite (`apps/web/e2e/crm_flow.spec.ts`)
  - Pytest API & background worker test suite (`tests/`)

---

## Quick Start (Local Development)

### 1. Backend API
```bash
# Install core dependencies
pip install -r requirements-core.txt

# Run FastAPI with live reload
uvicorn apps.api.main:app --reload --port 8001
```
- API Docs: `http://localhost:8001/docs`
- Health check: `http://localhost:8001/api/health`

### 2. Frontend Application
```bash
cd apps/web
npm install
npm run dev
```
- Web Application: `http://localhost:5173`
- CRM Portal: `http://localhost:5173/app/dashboard`

### 3. Run E2E & Backend Tests
```bash
# Run backend pytest suite
pytest tests/ -v

# Run Playwright E2E browser tests
cd apps/web
npx playwright test
```

---

## License
MIT License
