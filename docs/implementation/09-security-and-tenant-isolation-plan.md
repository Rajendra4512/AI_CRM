# 09 - Security & Tenant Isolation Plan (Defense-in-Depth Amendment)

## 1. Principles
Security is enforced strictly at the server API and database layers. Frontend route protection and hidden navigation buttons serve only as visual affordances and are never treated as security controls.

---

## 2. Three Mandatory Authorization Boundaries

```
+---------------------------------------------------------------------------------------------------------+
|                                    TRIPLE AUTHORIZATION ENFORCEMENT                                     |
+---------------------------------------------------------------------------------------------------------+
| 1. TENANT ISOLATION                                                                                     |
| - Server-Side Resolution: Derived exclusively from validated JWT claims (`sub`, `tenant_id`).           |
| - Record-Level Isolation: Every query includes `.filter(Model.tenant_id == current_tenant.id)`.         |
| - Negative Authorization: Cross-tenant reads, writes, and deletes yield HTTP 404/403.                   |
| - Multi-Tenant Users: When a user switches tenants, backend re-validates membership and issues a fresh  |
|   JWT scoped to the new tenant; frontend completely flushes state.                                     |
+---------------------------------------------------------------------------------------------------------+
| 2. INDUSTRY ENTITLEMENT ISOLATION                                                                       |
| - Entitlement Scoping: Each tenant is assigned an authorized industry (`construction`, `clinical`,      |
|   `maritime`, or `all`).                                                                                |
| - API Guarding: Routers apply `Depends(require_industry_entitlement("industry_name"))`.                |
| - Cross-Industry Denial: A tenant with `industry="construction"` calling a clinical or maritime         |
|   endpoint is immediately rejected with HTTP 403 Forbidden.                                             |
+---------------------------------------------------------------------------------------------------------+
| 3. USER RBAC & SUPERADMIN SEPARATION                                                                    |
| - Role Permissions: Regular users cannot approve Potential Change Orders, release HBLs, or             |
|   modify approved Schedule of Values applications.                                                      |
| - Superadmin Boundaries: Platform-level administration (tenant provisioning overrides, system config,   |
|   cross-tenant reporting) is strictly separated behind `require_superadmin` dependencies.               |
| - Tenant Admins CANNOT perform platform Superadmin functions. Platform Admins cannot browse             |
|   tenant PHI or financial records without an explicit audit-logged reason.                              |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Files, AI and Document Security (Untrusted Input)

Section 6 of `Strong_Isolation.md` mandates treating uploaded documents as untrusted inputs:
1. **Document Upload & Storage Isolation**:
   - File uploads are validated for MIME type, file extension, and maximum size limits.
   - Storage paths incorporate `tenant_id` to prevent path traversal or cross-tenant storage access.
2. **AI / RAG Retrieval Scoping**:
   - Every Qdrant vector retrieval query strictly injects `tenant_id` payload filter:
     `Filter(must=[FieldCondition(key="tenant_id", match=MatchValue(value=str(tenant.id)))])`.
   - AI prompts are sanitized to defend against prompt injection (e.g. document text attempting to instruct the model to bypass authorization rules).
3. **Clinical PHI & 21 CFR Part 50 Guardrail**:
   - Pseudonymous identifiers (e.g., `PT-401-09`) used throughout clinical records.
   - Electronic Informed Consent Form (eICF) audit hash (SHA-256) stored in `consent_evidences`.
   - Autonomous eligibility determinations by AI are strictly prohibited.
