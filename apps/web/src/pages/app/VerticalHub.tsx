import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { HardHatIcon, DnaIcon, ShipIcon, ShieldCheckIcon } from '../../components/Icons'
import { ConstructionWorkbench } from './workbenches/ConstructionWorkbench'
import { ClinicalWorkbench } from './workbenches/ClinicalWorkbench'
import { MaritimeWorkbench } from './workbenches/MaritimeWorkbench'

type VerticalKey = 'construction' | 'clinical' | 'maritime'

const VALID_VERTICALS: VerticalKey[] = ['construction', 'clinical', 'maritime']

function parseEntitledList(raw: string): VerticalKey[] {
  const normalized = (raw || 'all').toLowerCase().trim()
  if (normalized === 'all') return [...VALID_VERTICALS]
  const parts = normalized
    .split(',')
    .map((p) => p.trim() as VerticalKey)
    .filter((p): p is VerticalKey => VALID_VERTICALS.includes(p))
  return parts.length > 0 ? parts : ['construction']
}

export const VerticalHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [entitledIndustry, setEntitledIndustry] = useState<string>(() =>
    (localStorage.getItem('sf_industry') || 'all').toLowerCase()
  )

  const entitledList = useMemo(() => parseEntitledList(entitledIndustry), [entitledIndustry])

  const requestedVertical = (searchParams.get('vertical') || '').toLowerCase() as VerticalKey
  const subModule = (searchParams.get('sub') || 'all').toLowerCase()

  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>(() => {
    if (VALID_VERTICALS.includes(requestedVertical) && entitledList.includes(requestedVertical)) {
      return requestedVertical
    }
    return entitledList[0]
  })

  // Clamp active vertical strictly to tenant entitlement
  const activeVertical: VerticalKey = entitledList.includes(selectedVertical)
    ? selectedVertical
    : entitledList[0]

  useEffect(() => {
    if (VALID_VERTICALS.includes(requestedVertical) && entitledList.includes(requestedVertical)) {
      setSelectedVertical(requestedVertical)
    } else if (!entitledList.includes(selectedVertical)) {
      setSelectedVertical(entitledList[0])
    }
  }, [requestedVertical, entitledList])

  const token = localStorage.getItem('access_token') || ''
  const authHeaders: Record<string, string> = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  )

  useEffect(() => {
    const syncFromStorage = () => {
      const stored = (localStorage.getItem('sf_industry') || 'all').toLowerCase()
      setEntitledIndustry(stored)
    }
    window.addEventListener('sf-tenant-updated', syncFromStorage)

    if (token) {
      fetch('/api/v1/auth/me', { headers: authHeaders })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json()
            const ind = (data.tenant?.industry || 'construction').toLowerCase()
            setEntitledIndustry(ind)
            localStorage.setItem('sf_industry', ind)
          }
        })
        .catch(() => {
          // Offline preview tolerance
        })
    }

    return () => window.removeEventListener('sf-tenant-updated', syncFromStorage)
  }, [token, authHeaders])

  const handleSelectVertical = (next: VerticalKey) => {
    if (!entitledList.includes(next)) return
    setSelectedVertical(next)
    setSearchParams({ vertical: next, sub: 'all' })
  }

  const handleSubModuleChange = (sub: string) => {
    setSearchParams({ vertical: activeVertical, sub })
  }

  return (
    <AppLayout title="Vertical Workflow Engine">
      {/* Workspace Entitlement & Domain Switcher Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div className="vertical-tabs" style={{ marginBottom: 0 }}>
          {entitledList.includes('construction') && (
            <button
              type="button"
              className={`v-tab-btn ${activeVertical === 'construction' ? 'active' : ''}`}
              onClick={() => handleSelectVertical('construction')}
            >
              <HardHatIcon size={16} />
              <span>Construction &amp; Trades</span>
            </button>
          )}
          {entitledList.includes('clinical') && (
            <button
              type="button"
              className={`v-tab-btn ${activeVertical === 'clinical' ? 'active' : ''}`}
              onClick={() => handleSelectVertical('clinical')}
            >
              <DnaIcon size={16} />
              <span>Clinical Trials &amp; CTMS</span>
            </button>
          )}
          {entitledList.includes('maritime') && (
            <button
              type="button"
              className={`v-tab-btn ${activeVertical === 'maritime' ? 'active' : ''}`}
              onClick={() => handleSelectVertical('maritime')}
            >
              <ShipIcon size={16} />
              <span>Maritime &amp; Freight Brokerage</span>
            </button>
          )}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <ShieldCheckIcon size={14} color="#2563eb" />
          {entitledList.length === 1
            ? `Single-Vertical Tenant Isolation (${entitledList[0].toUpperCase()})`
            : 'Multi-Vertical Showcase Sandbox'}
        </div>
      </div>

      {/* Strictly Isolated Domain Workbench */}
      {activeVertical === 'construction' && entitledList.includes('construction') && (
        <ConstructionWorkbench
          subModule={subModule}
          onSubModuleChange={handleSubModuleChange}
          authHeaders={authHeaders}
        />
      )}

      {activeVertical === 'clinical' && entitledList.includes('clinical') && (
        <ClinicalWorkbench
          subModule={subModule}
          onSubModuleChange={handleSubModuleChange}
          authHeaders={authHeaders}
        />
      )}

      {activeVertical === 'maritime' && entitledList.includes('maritime') && (
        <MaritimeWorkbench
          subModule={subModule}
          onSubModuleChange={handleSubModuleChange}
          authHeaders={authHeaders}
        />
      )}
    </AppLayout>
  )
}
