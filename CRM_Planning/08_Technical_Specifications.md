# Stage 8: Technical Specifications & Requirements

## Port Configuration
- **Marketing Website**: `localhost:5000` 
- **Application**: `app.localhost:5000` (requires hosts file entry or alternative routing)
- **Port Check**: Port 5000 is available (verified)

## Container Specifications
- **Name**: `salesfortis-app`
- **Type**: Single container monolithic
- **Base Image**: Ubuntu/Debian with Python, Node.js
- **Resource Limits**: CPU: 4 cores, Memory: 8GB (adjustable based on laptop)
- **Volumes**: Persistent data volumes
- **Network**: Bridge network

## Application Name
**SalesFortis** - All branding, URLs, container names should use this

## Logo Requirements
- Professional enterprise logo
- Wordmark: "SalesFortis"
- Clean, modern design
- Scalable SVG format
- Suitable for web and app
- Consider: shield/fortress element suggesting security/strength, or upward graph suggesting growth

## Vertical Terminology
Must use industry-specific terminology from references:

### Construction (Procore/Contractor Foreman style)
- RFQ, RFI, Submittal, Change Order, Pay Application, Schedule of Values, Lien Waiver
- Bid Board, Estimating, Project Management
- GC, Subcontractor, Trade

### Clinical (TrialX/RealTime CTMS style)
- Study, Protocol, Site, Sponsor, CRO, IRB, Principal Investigator
- Referral, Prescreening, Eligibility, Consent, Screening, Enrollment, Visit
- Adverse Event (with proper controls)

### Maritime (Logitude World/Magaya style)
- Enquiry, Freight Quote, Booking, Bill of Lading (B/L), House Airway Bill, Container
- NVOCC, Freight Forwarder, Customs Entry, Manifest
- ETA/ETD, POL/POD, Incoterms

## SuperAdmin Features Detailed
1. **Application Management**
   - Feature flags
   - System settings
   - Module enable/disable
   - Maintenance mode

2. **LLMOps Management**
   - Provider configuration (OpenAI, Anthropic, etc.)
   - Model routing rules
   - Rate limits and quotas
   - Cost tracking
   - Budget alerts
   - Fallback configuration

3. **MLOps Management**
   - Model registry
   - Experiments tracking
   - Model deployment
   - A/B testing
   - Performance monitoring
   - Drift detection
   - Retraining triggers

4. **Marketing Plan Interface**
   - Create/edit combo packs
   - Manage offerings
   - Pricing configuration
   - Feature lists per plan
   - Promotional campaigns

5. **Tenant Management**
   - View all tenants
   - Tenant details and usage
   - Suspend/activate
   - Change subscription
   - Billing overview
   - Impersonation (with audit)

## Security Requirements
- Tenant isolation enforced at DB and API level
- RLS on all tenant tables
- CSRF protection
- Secure cookies (httpOnly, secure, sameSite)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- Audit logging
- Encryption at rest and in transit
- Clinical data: additional restrictions, pseudonymization
- No PHI in logs or telemetry

## AI Safety Requirements
- Human-in-the-loop for all critical actions
- Citations required for RAG responses
- Confidence scores displayed
- Refusal/abstention when insufficient evidence
- No autonomous clinical decisions
- No autonomous financial commitments
- Approval gates for bids, change orders, contracts
- Audit trail for all AI actions

## Development Guidelines
- Follow AGENTS.md rules (token efficiency, minimal changes, etc.)
- Reuse existing components
- Don't duplicate implementations
- Preserve existing functionality
- Test affected functionality only
- Never expose secrets
- Don't modify DB schemas without approval (but we need to create them)
- Commit only when explicitly asked
