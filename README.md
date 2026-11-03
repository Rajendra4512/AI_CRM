# SalesFortis - AI-Native Multi-Vertical CRM SaaS

Single container monolithic application.

## Architecture
- Marketing Website: http://localhost:5000
- Application: http://app.localhost:5000
- API: http://localhost:5000/api/v1

## Tech Stack
- Frontend: React 19 + TypeScript + Vite
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Cache/Queue: Redis
- Vector DB: Qdrant
- AI Gateway: LiteLLM
- ML Tracking: MLflow

## Quick Start
```bash
docker-compose -f infra/docker-compose.salesfortis.yml build
docker-compose -f infra/docker-compose.salesfortis.yml up -d
```
