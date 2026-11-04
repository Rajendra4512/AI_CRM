import React, { useEffect, useState } from 'react'
import { AppLayout } from './AppLayout'

interface TenantRow {
  id: string
  name: string
  slug: string
  industry: string | null
  subscription_tier: string
  status: string
}

interface AuditLogRow {
  id: string
  tenant_id: string | null
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown>
  created_at: string | null
}

export const AdminConsole: React.FC = () => {
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([])
  const [adminEmail, setAdminEmail] = useState<string>('')
  const [deniedMessage, setDeniedMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token') || ''
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    Promise.all([
      fetch('/api/v1/admin/dashboard', { headers }),
      fetch('/api/v1/admin/tenants', { headers }),
      fetch('/api/v1/admin/audit-logs', { headers })
    ])
      .then(async ([dashRes, tenRes, audRes]) => {
        if (dashRes.status === 403 || dashRes.status === 401) {
          const err = await dashRes.json().catch(() => ({}))
          setDeniedMessage(err.detail || 'Superadmin privileges required to view platform governance.')
          setLoading(false)
          return
        }
        if (dashRes.ok) {
          const d = await dashRes.json()
          setAdminEmail(d.admin_email || '')
        }
        if (tenRes.ok) {
          const t = await tenRes.json()
          setTenants(t.tenants || [])
        }
        if (audRes.ok) {
          const a = await audRes.json()
          setAuditLogs(a.audit_logs || [])
        }
        setLoading(false)
      })
      .catch(() => {
        setDeniedMessage('Unable to connect to platform administration API.')
        setLoading(false)
      })
  }, [])

  return (
    <AppLayout title="Platform Superadmin Console">
      {deniedMessage ? (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '1.5rem',
            borderRadius: '10px'
          }}
        >
          <h3 style={{ marginTop: 0 }}>🔒 Access Restricted (HTTP 403)</h3>
          <p style={{ marginBottom: 0 }}>{deniedMessage}</p>
        </div>
      ) : loading ? (
        <div style={{ padding: '2rem', color: '#64748b' }}>Loading platform governance telemetry...</div>
      ) : (
        <div>
          <section className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Provisioned Tenants</div>
              <div className="metric-value">{tenants.length}</div>
              <div className="metric-trend">Isolated multi-tenant workspaces</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Recorded Audit Events</div>
              <div className="metric-value">{auditLogs.length}</div>
              <div className="metric-trend">Immutable security & workflow trail</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Active Industry Suites</div>
              <div className="metric-value">3 Verticals</div>
              <div className="metric-trend" style={{ color: '#0284c7' }}>Construction • Clinical • Maritime</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Authenticated Superadmin</div>
              <div className="metric-value" style={{ fontSize: '1.05rem', wordBreak: 'break-all' }}>{adminEmail}</div>
              <div className="metric-trend">RBAC: Platform Root</div>
            </div>
          </section>

          <section style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🏢 Provisioned Tenant Registry</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.65rem 0' }}>Organization</th>
                  <th>Slug</th>
                  <th>Industry Entitlement</th>
                  <th>Tier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0', fontWeight: 600 }}>{t.name}</td>
                    <td style={{ color: '#64748b' }}>{t.slug}</td>
                    <td>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                        {t.industry || 'unassigned (fail-closed)'}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{t.subscription_tier}</td>
                    <td>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🛡️ Immutable Security & Operational Audit Log</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.65rem 0' }}>Timestamp (UTC)</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 25).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0', color: '#64748b' }}>{log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : '—'}</td>
                    <td><strong>{log.action}</strong></td>
                    <td>{log.resource_type || '—'}</td>
                    <td style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </AppLayout>
  )
}

