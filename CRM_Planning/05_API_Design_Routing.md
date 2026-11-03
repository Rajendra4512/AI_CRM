# Stage 5: API Design & Routing

## Base URLs
- Marketing Site: http://localhost:5000
- Application: http://app.localhost:5000 (or http://localhost:5000/app)
- API: http://localhost:5000/api/v1 or http://app.localhost:5000/api/v1

## Marketing Routes
```python
GET /                    # Welcome screen with vertical selection
GET /vertical/{vertical} # Vertical-specific marketing page (construction|clinical|maritime)
GET /pricing            # Pricing/marketing plans
GET /about              # About page
POST /lead              # Capture marketing lead
```

## Authentication
```python
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

## Core CRM
```python
# Accounts
GET    /api/v1/crm/accounts
POST   /api/v1/crm/accounts
GET    /api/v1/crm/accounts/{id}
PUT    /api/v1/crm/accounts/{id}
DELETE /api/v1/crm/accounts/{id}

# Leads, Opportunities similar pattern
```

## Vertical-Specific Routes

### Construction
```python
/api/v1/construction/rfqs
/api/v1/construction/estimates
/api/v1/construction/bids
/api/v1/construction/projects
/api/v1/construction/change-orders
```

### Clinical
```python
/api/v1/clinical/studies
/api/v1/clinical/sites
/api/v1/clinical/referrals
/api/v1/clinical/participants  # heavily restricted
/api/v1/clinical/consents
/api/v1/clinical/visits
```

### Maritime
```python
/api/v1/maritime/enquiries
/api/v1/maritime/rate-cards
/api/v1/maritime/quotations
/api/v1/maritime/bookings
/api/v1/maritime/shipments
/api/v1/maritime/milestones
```

## AI/RAG
```python
POST /api/v1/ai/query      # RAG query with citations
POST /api/v1/ai/extract    # Document extraction
GET  /api/v1/ai/queries    # Query history
```

## Documents
```python
POST   /api/v1/documents/upload
GET    /api/v1/documents
GET    /api/v1/documents/{id}
DELETE /api/v1/documents/{id}
POST   /api/v1/documents/{id}/process
```

## SuperAdmin Routes (Protected)
```python
# Application Management
GET/POST   /api/v1/admin/app/config
GET/PUT    /api/v1/admin/app/settings

# LLMOps Management
GET/POST   /api/v1/admin/llmops/providers
GET/PUT    /api/v1/admin/llmops/providers/{id}
GET        /api/v1/admin/llmops/usage
GET        /api/v1/admin/llmops/quotas
PUT        /api/v1/admin/llmops/quotas/{tenant_id}

# MLOps Management
GET/POST   /api/v1/admin/mlops/models
POST       /api/v1/admin/mlops/models/{id}/deploy
POST       /api/v1/admin/mlops/models/{id}/rollback
GET        /api/v1/admin/mlops/experiments
GET        /api/v1/admin/mlops/monitoring

# Marketing Plan Interface
GET/POST   /api/v1/admin/marketing/plans
GET/PUT    /api/v1/admin/marketing/plans/{id}
GET/POST   /api/v1/admin/marketing/combo-packs
GET/PUT    /api/v1/admin/marketing/combo-packs/{id}

# Tenant Management
GET        /api/v1/admin/tenants
GET        /api/v1/admin/tenants/{id}
PUT        /api/v1/admin/tenants/{id}
POST       /api/v1/admin/tenants/{id}/suspend
POST       /api/v1/admin/tenants/{id}/activate
GET        /api/v1/admin/tenants/{id}/usage
```

## API Conventions
- RESTful design
- JSON request/response
- Authentication required except public routes
- Tenant context from auth token/session
- All IDs are UUIDs
- Pagination for list endpoints
- Consistent error responses
- Audit logging on sensitive operations
