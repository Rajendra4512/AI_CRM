import React, { useState, useMemo } from 'react'

export interface KpiCardSpec {
  label: string
  value: string
  subtext?: string
  accentColor?: string
  progressPct?: number
}

export const KpiTelemetryStrip: React.FC<{ items: KpiCardSpec[] }> = ({ items }) => (
  <div className="metrics-grid">
    {items.map((item) => (
      <div key={item.label} className="metric-card">
        <div className="metric-label">{item.label}</div>
        <div
          className="metric-value sf-tabular"
          style={item.accentColor ? { color: item.accentColor } : undefined}
        >
          {item.value}
        </div>
        {typeof item.progressPct === 'number' && (
          <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', margin: '0.35rem 0' }}>
            <div
              style={{
                width: `${Math.max(0, Math.min(100, item.progressPct))}%`,
                height: '100%',
                background: item.accentColor || '#2563eb',
                borderRadius: '999px',
              }}
            />
          </div>
        )}
        {item.subtext && (
          <div className="metric-trend" style={{ color: '#475569', fontWeight: 500 }}>
            {item.subtext}
          </div>
        )}
      </div>
    ))}
  </div>
)

export interface SubTabSpec {
  key: string
  label: string
  badge?: string | number
  icon?: React.ReactNode
}

export const SubModuleNav: React.FC<{
  tabs: SubTabSpec[]
  activeKey: string
  onSelect: (key: string) => void
}> = ({ tabs, activeKey, onSelect }) => (
  <div className="wb-subtabs" role="tablist" aria-label="Operational Submodules">
    {tabs.map((tab) => {
      const active = tab.key === activeKey
      return (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active}
          className={`wb-subtab ${active ? 'active' : ''}`}
          onClick={() => onSelect(tab.key)}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge !== undefined && (
            <span
              className="sf-mono"
              style={{
                fontSize: '0.68rem',
                padding: '0.06rem 0.4rem',
                borderRadius: '999px',
                background: active ? '#eff6ff' : '#cbd5e1',
                color: active ? '#1d4ed8' : '#334155',
                fontWeight: 700,
              }}
            >
              {tab.badge}
            </span>
          )}
        </button>
      )
    })}
  </div>
)

export const LifecycleStepper: React.FC<{
  stages: Array<{ code: string; label: string; count?: number | string }>
  accent: string
}> = ({ stages, accent }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
      gap: '0.6rem',
      marginBottom: '1.25rem',
    }}
  >
    {stages.map((st, idx) => (
      <div
        key={st.code}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderTop: `3px solid ${accent}`,
          borderRadius: '8px',
          padding: '0.7rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div>
          <div className="sf-mono" style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700 }}>
            STAGE 0{idx + 1}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{st.label}</div>
        </div>
        {st.count !== undefined && (
          <span className="sf-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: accent }}>
            {st.count}
          </span>
        )}
      </div>
    ))}
  </div>
)

export interface DataColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
}

export function EnterpriseFilterableTable<T>({
  title,
  subtitle,
  rows,
  columns,
  getRowKey,
  searchPlaceholder = 'Filter records...',
  getSearchText,
  statusOptions,
  getStatusValue,
  headerActions,
  emptyMessage = 'No matching operational records found.',
}: {
  title: React.ReactNode
  subtitle?: string
  rows: T[]
  columns: DataColumn<T>[]
  getRowKey: (row: T, idx: number) => string
  searchPlaceholder?: string
  getSearchText?: (row: T) => string
  statusOptions?: Array<{ value: string; label: string }>
  getStatusValue?: (row: T) => string
  headerActions?: React.ReactNode
  emptyMessage?: string
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'ALL' && getStatusValue && getStatusValue(r) !== statusFilter) {
        return false
      }
      if (search.trim() && getSearchText) {
        return getSearchText(r).toLowerCase().includes(search.trim().toLowerCase())
      }
      return true
    })
  }, [rows, search, statusFilter, getSearchText, getStatusValue])

  return (
    <div className="sf-panel">
      <div className="sf-panel-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {getSearchText && (
            <input
              type="search"
              className="form-control"
              style={{ width: '200px', padding: '0.38rem 0.65rem', fontSize: '0.8rem' }}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {statusOptions && getStatusValue && (
            <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                style={{
                  border: 'none',
                  background: statusFilter === 'ALL' ? '#ffffff' : 'transparent',
                  color: statusFilter === 'ALL' ? '#0f172a' : '#64748b',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '4px',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                All ({rows.length})
              </button>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  style={{
                    border: 'none',
                    background: statusFilter === opt.value ? '#ffffff' : 'transparent',
                    color: statusFilter === opt.value ? '#0f172a' : '#64748b',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {headerActions}
        </div>
      </div>

      <table className="sf-data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            filtered.map((row, idx) => (
              <tr key={getRowKey(row, idx)}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

