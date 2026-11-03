# Stage 3: Application Architecture - Monolithic Single Container

## Design Decision
**MUST BE**: Single Container Monolithic Architecture  
**MUST NOT BE**: Kubernetes, Microservices Architecture

Based on "AI_Native_CRM_Detailed_Solution_Architecture_v1.docx" which mentions Docker Compose and scaling later, we need to adapt to single container monolith per requirements.

## Architecture Overview
All components run in ONE Docker container:
- Frontend (React app served via FastAPI static files or separate server in same container)
- Backend API (FastAPI monolithic modular app)
- Background Workers (ingestion, ML scoring, notifications) - can run as separate processes in same container (supervisor/process manager)
- Redis (embedded or separate process in container)
- PostgreSQL (embedded or separate process in container) - or use external but containerized internally
- Qdrant (separate process in container)
- LiteLLM gateway (integrated or separate process)
- MLflow (separate process or integrated)

## Container Resource Allocation
Need to allocate proportionate resources based on initial requirements:
- Consider available system resources
- Start with reasonable defaults (e.g., 4-8GB RAM, 2-4 CPUs) adjustable
- Monitor and adjust
- Docker Desktop already installed

## Port Configuration
- **Marketing Website**: localhost:5000 (root level, vertical selection + vertical pages)
- **Application**: app.localhost:5000 (authenticated app, after login/signup)
- Or use path-based: localhost:5000/app for app, localhost:5000/ for marketing
- Need to check if app.localhost resolves (may need hosts file entry or use different approach)
- Requirement says "app can be hosted on app.localhost:5000 port and marketing website can be hosted on localhost:5000"

## Module Structure (Monolithic Modular)
Following the architecture doc's bounded contexts:
```
salesfortis/
├── apps/
│   ├── web/           # React frontend
│   └── api/           # FastAPI backend (monolithic)
├── workers/           # Background workers
├── packages/          # Shared schemas, contracts
├── core/              # Core modules (auth, tenants, rbac)
├── modules/           # Vertical modules
│   ├── crm/           # Shared CRM core
│   ├── construction/  # Construction suite
│   ├── clinical/      # Clinical trials suite
│   └── maritime/      # Maritime logistics suite
├── ai/                # AI/ML/LLMOps/MLOps
├── admin/             # SuperAdmin portal
└── marketing/         # Marketing site pages
```

## SuperAdmin Features
- Application management
- LLMOps management (model routing, providers, quotas, budgets)
- MLOps management (models, experiments, deployments, monitoring)
- Marketing plan interface (manage combo packs, offerings)
- Tenant management from backend
- System configuration
- User management
- Audit logs
- Resource monitoring

## Data Layer
- PostgreSQL with schemas per module/bounded context
- Row Level Security (RLS) for tenant isolation
- All tenant-owned records have tenant_id
- Separate handling for clinical data (stricter controls)

## Service Communication
All internal - direct function calls within monolith (no HTTP between services)
Workers communicate via Redis queues (in same container)

## Deployment
Single Dockerfile that sets up everything, supervisor to manage processes:
- nginx or FastAPI serving static files
- uvicorn for FastAPI
- celery/rq workers
- postgres, redis, qdrant as processes or use embedded alternatives where possible
- Or all as services managed by supervisord
