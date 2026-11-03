# Stage 1: Project Overview - SalesFortis

## Project Name
**SalesFortis** - AI-Native Multi-Vertical CRM SaaS Platform

## Objective
Build an enterprise-grade, AI-native, multi-tenant CRM SaaS platform with a shared core and three industry-specific vertical suites, delivered as a single monolithic containerized application. 

## Target Verticals
1. **Commercial Subcontractor & Trade Suite** (Construction)
   - Reference: Procore, Contractor Foreman
   - Focus: Lead-to-Bid-to-Project, Estimates, Change Orders, Project Management
   
2. **Clinical Trials & Patient Recruitment Suite**
   - Reference: TrialX, RealTime CTMS
   - Focus: Study Management, Recruitment, Prescreening, Consent (with strict PHI controls)
   
3. **Maritime Logistics & Freight Brokerage Suite**
   - Reference: Logitude World, Magaya Supply Chain
   - Focus: Enquiry-to-Quote-to-Booking-to-Shipment, Rate Management, Customs

## Architecture
- **Type**: Single Container Monolithic Architecture (NO Kubernetes, NO Microservices)
- **App Name**: SalesFortis
- **App Host**: app.localhost:5000
- **Marketing Website Host**: localhost:5000 (or separate virtual host on same container/port routing)
- **Deployment**: Docker Desktop container with proportionate resource allocation based on initial requirements

## Core Features
- Welcome screen with vertical selection
- Vertical-specific marketing pages (separate from app after selection)
- Multi-tenant architecture with strict tenant isolation
- SuperAdmin portal for application management
- LLMOps & MLOps management interface
- Marketing plan interface (manage combo packs, offerings)
- Tenant management from backend
- AI-native features with RAG, document intelligence, predictive scoring
- Human-in-the-loop approvals for critical actions

## Technology Stack (Based on Architecture Docs)
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI (Python) - monolithic modular structure
- **Database**: PostgreSQL (system of record)
- **Object Storage**: Local/S3-compatible for documents
- **Vector DB**: Qdrant (or pgvector) for RAG
- **Cache/Queue**: Redis
- **AI Gateway**: LiteLLM
- **Orchestration**: LangGraph (where needed)
- **ML Tracking**: MLflow
- **Workers**: Background workers in same container/process model
