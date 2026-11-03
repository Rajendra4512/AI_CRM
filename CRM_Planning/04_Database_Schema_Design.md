# Stage 4: Database Schema Design

## Core Principles
- Multi-tenant with tenant_id on all tenant-owned tables
- Row Level Security (RLS) in PostgreSQL
- UUID primary keys
- Audit fields (created_at, updated_at, created_by, updated_by)
- Soft deletes where appropriate
- Strict tenant isolation

## Core Schema Modules

### 1. Tenants & Organizations
```sql
tenants (id, name, slug, subscription_tier, status, settings, created_at, updated_at)
organizations (id, tenant_id, name, type, ...)
users (id, tenant_id, email, role_id, status, ...)
roles (id, tenant_id, name, permissions, ...)
```

### 2. Shared CRM Core
```sql
accounts (id, tenant_id, name, type, industry, owner_id, ...)
contacts (id, tenant_id, account_id, first_name, last_name, email, ...)
leads (id, tenant_id, first_name, last_name, company, source, status, owner_id, ...)
opportunities (id, tenant_id, account_id, name, amount, stage, probability, close_date, owner_id, ...)
activities (id, tenant_id, related_type, related_id, type, subject, due_date, ...)
```

### 3. Construction Suite
```sql
rfqs (id, tenant_id, account_id, project_name, due_date, status, ...)
estimates (id, tenant_id, rfq_id, version, total_amount, status, ...)
bids (id, tenant_id, estimate_id, bid_amount, status, submitted_at, ...)
projects (id, tenant_id, bid_id, project_name, start_date, status, ...)
change_orders (id, tenant_id, project_id, change_order_number, amount, status, ...)
```

### 4. Clinical Trials Suite
```sql
studies (id, tenant_id, sponsor_id, protocol_number, phase, status, jurisdiction, ...)
sites (id, tenant_id, study_id, site_name, pi_name, status, ...)
referrals (id, tenant_id, study_id, site_id, pseudonymous_id, status, consent_status, ...)
participants (id, tenant_id, referral_id, pseudonymized_data, ...) -- heavily restricted
consents (id, tenant_id, participant_id, consent_version, signed_at, ...)
visits (id, tenant_id, participant_id, visit_type, scheduled_at, status, ...)
```
**Note**: Participant PII separated with strict access controls, encryption

### 5. Maritime Logistics Suite
```sql
enquiries (id, tenant_id, customer_id, origin, destination, commodity, status, ...)
rate_cards (id, tenant_id, carrier_id, origin, destination, rate, valid_from, valid_to, ...)
quotations (id, tenant_id, enquiry_id, quote_number, total_amount, validity_date, status, ...)
bookings (id, tenant_id, quotation_id, booking_number, vessel, voyage, status, ...)
shipments (id, tenant_id, booking_id, container_numbers, status, eta, ...)
milestones (id, tenant_id, shipment_id, milestone_type, location, event_time, source, ...)
```

### 6. Documents & AI
```sql
documents (id, tenant_id, related_type, related_id, filename, mime_type, storage_path, status, classification, acl, ...)
document_chunks (id, document_id, tenant_id, chunk_text, page_number, section_path, embedding_id, ...)
ai_queries (id, tenant_id, user_id, query, response, citations, model_used, tokens_used, ...)
ai_extractions (id, tenant_id, document_id, extracted_data, confidence, status, reviewed_by, ...)
```

### 7. ML/LLMOps
```sql
ml_models (id, name, version, status, model_type, metrics, artifact_path, ...)
ml_experiments (id, model_id, experiment_name, params, metrics, run_id, ...)
llm_providers (id, name, base_url, api_key_encrypted, config, status, ...)
llm_usage (id, tenant_id, user_id, provider_id, model, prompt_tokens, completion_tokens, cost, ...)
```

### 8. SuperAdmin
```sql
system_config (id, key, value, category, encrypted)
audit_logs (id, tenant_id, user_id, action, resource_type, resource_id, ip_address, ...)
marketing_plans (id, name, type, features, pricing, active, ...)
combo_packs (id, marketing_plan_id, name, items, discount, price, ...)
```

## Row Level Security (RLS)
- Enable RLS on all tenant-scoped tables
- Policy: `tenant_id = current_setting('app.current_tenant_id')::uuid`
- SuperAdmin can bypass for management
- Clinical tables have additional policies based on study/site access
