import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Archived() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('headlines')
  const [data, setData] = useState({ headlines: [], rocks: [], issues: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [profile])

  async function fetchAll() {
    if (!profile) return
    setLoading(true)
    const [{ data: h }, { data: r }, { data: i }] = await Promise.all([
      supabase.from('headlines').select('*, owner:profiles(name)').eq('archived', true).order('archived_at', { ascending: false }),
      supabase.from('rocks').select('*, owner:profiles(name)').eq('archived', true).order('archived_at', { ascending: false }),
      supabase.from('issues').select('*, owner:profiles(name)').eq('archived', true).order('archived_at', { ascending: false }),
    ])
    setData({ headlines: h || [], rocks: r || [], issues: i || [] })
    setLoading(false)
  }

  const tabStyle = active => ({
    padding: '8px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
    fontSize: 13, fontWeight: active ? 600 : 400,
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--muted)', border: 'none',
  })

  const catLabel = c => c === 'bom' ? '👍 Bom' : c === 'atencao' ? '⚠️ Atenção' : 'ℹ️ Info'
  const statusLabel = s => ({ 'on-track': 'On Track', 'off-track': 'Off Track', 'done': 'Done', 'lost': 'Lost' }[s] || s)
  const fmtDate = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>Arquivados</h1>
      </div>
      <div style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content' }}>
          {[['headlines', `Headlines (${data.headlines.length})`], ['rocks', `Rocks (${data.rocks.length})`], ['issues', `Issues (${data.issues.length})`]].map(([key, label]) => (
            <button key={key} style={tabStyle(tab === key)} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {loading && <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Carregando...</div>}

        {!loading && tab === 'headlines' && (
          data.headlines.length ? data.headlines.map(h => (
            <div key={h.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 8, opacity: .8 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{h.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{catLabel(h.category)} · {h.owner?.name} · Arquivado em {fmtDate(h.archived_at)}</div>
            </div>
          )) : <Empty />
        )}

        {!loading && tab === 'rocks' && (
          data.rocks.length ? data.rocks.map(r => (
            <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 8, opacity: .8 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{statusLabel(r.status)} · {r.owner?.name} · {r.progress}% · Arquivado em {fmtDate(r.archived_at)}</div>
            </div>
          )) : <Empty />
        )}

        {!loading && tab === 'issues' && (
          data.issues.length ? data.issues.map(i => (
            <div key={i.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 8, opacity: .8 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{i.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>P{i.priority} · {i.owner?.name} · Resolvida em {fmtDate(i.resolved_at)}</div>
            </div>
          )) : <Empty />
        )}
      </div>
    </div>
  )
}

function Empty() {
  return <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Nenhum item arquivado.</div>
}
