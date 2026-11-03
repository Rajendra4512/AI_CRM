# Stage 7: Implementation Roadmap

## Phase 0: Planning & Setup (Current)
- [x] Read all PRD, UX/UI, and Architecture documents
- [x] Create CRM_Planning folder with stage-wise MD files
- [x] Check port availability (5000 free)
- [x] Check Docker Desktop status
- [ ] Create project structure
- [ ] Design logo for SalesFortis

## Phase 1: Core Infrastructure (Week 1)
- [ ] Set up monorepo structure
- [ ] Create Dockerfile and docker-compose for salesfortis container
- [ ] Setup PostgreSQL, Redis, Qdrant in container
- [ ] Configure nginx for routing (marketing vs app)
- [ ] Setup supervisord for process management
- [ ] Create base FastAPI app structure
- [ ] Setup database migrations (Alembic)

## Phase 2: Marketing Site & Welcome Screen (Week 1-2)
- [ ] Design and create SalesFortis logo
- [ ] Build welcome screen with vertical selection
- [ ] Create vertical-specific marketing pages for Construction, Clinical, Maritime
- [ ] Style professionally with industry-appropriate content
- [ ] Implement routing
- [ ] Add lead capture

## Phase 3: Authentication & Multi-Tenancy (Week 2)
- [ ] User registration/login
- [ ] Tenant creation and management
- [ ] Role-based access control (RBAC)
- [ ] Row Level Security (RLS) setup
- [ ] Session management
- [ ] SuperAdmin role and access

## Phase 4: Shared CRM Core (Week 2-3)
- [ ] Accounts, Contacts, Leads, Opportunities
- [ ] Activities and tasks
- [ ] Notes and attachments
- [ ] Search and filters
- [ ] Dashboards

## Phase 5: Vertical Suites (Week 3-4)
- [ ] **Construction Suite**: RFQ, Estimates, Bids, Projects, Change Orders
- [ ] **Clinical Suite**: Studies, Sites, Referrals, Consents, Visits (with PHI controls)
- [ ] **Maritime Suite**: Enquiries, Rate Cards, Quotations, Bookings, Shipments

## Phase 6: Document Management & RAG (Week 4-5)
- [ ] Document upload with virus scanning
- [ ] Document parsing (Unstructured)
- [ ] Chunking and indexing
- [ ] Qdrant vector store setup
- [ ] Hybrid search (dense + lexical)
- [ ] RAG with citations
- [ ] Human review workflows

## Phase 7: AI/ML & LLMOps/MLOps (Week 5-6)
- [ ] LiteLLM gateway setup
- [ ] Model routing and policies
- [ ] LLMOps dashboard in SuperAdmin
- [ ] MLflow setup
- [ ] MLOps dashboard in SuperAdmin
- [ ] Model training pipeline
- [ ] Model deployment and monitoring
- [ ] Cost tracking and quotas

## Phase 8: SuperAdmin Portal (Week 6)
- [ ] Application management interface
- [ ] LLMOps management
- [ ] MLOps management
- [ ] Marketing plan interface (combo packs, offerings)
- [ ] Tenant management
- [ ] System configuration
- [ ] Audit logs
- [ ] Resource monitoring

## Phase 9: Testing & Refinement (Week 7)
- [ ] Tenant isolation testing
- [ ] Security testing
- [ ] AI safety testing (human-in-the-loop)
- [ ] Performance testing
- [ ] UI/UX polish
- [ ] Documentation

## Phase 10: Deployment (Week 7-8)
- [ ] Build container
- [ ] Test locally
- [ ] Verify ports and routing
- [ ] Resource allocation tuning
- [ ] Final checks

## Key Considerations
- Adapt architecture from Kubernetes/microservices docs to monolith
- Maintain enterprise-grade quality
- Strict tenant isolation
- Clinical data requires extra care (PHI)
- AI features require human approval
- All changes must be proportional to container resources
- Don't modify existing containers
