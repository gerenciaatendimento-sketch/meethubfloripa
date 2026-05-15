// Headlines, Rocks, Scorecard, Issues, Todos, L10, Archived
// Each connects to Supabase with full CRUD — same patterns as Dashboard

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function PageShell({ title, actions, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h1>
        <div style={{ display: 'flex', gap: 10 }}>{actions}</div>
      </div>
      <div style={{ padding: 28, flex: 1 }}>{children}</div>
    </div>
  )
}

// ─── HEADLINES ──────────────────────────────────────────────────────────────
export function Headlines() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [panel, setPanel] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchItems() }, [profile])

  async function fetchItems() {
    const { data } = await supabase.from('headlines').select('*, owner:profiles(name,id)').eq('archived', false).order('created_at', { ascending: false })
    setItems(data || [])
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function saveItem(form) {
    if (form.id) await supabase.from('headlines').update(form).eq('id', form.id)
    else await supabase.from('headlines').insert({ ...form, team_id: profile?.team_id })
    setPanel(null); fetchItems(); showToast('Headline salva')
  }

  async function archiveItem(id) {
    await supabase.from('headlines').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id)
    fetchItems(); showToast('Headline arquivada')
  }

  const catLabel = c => c === 'bom' ? '👍 Bom' : c === 'atencao' ? '⚠️ Atenção' : 'ℹ️ Info'
  const catClass = c => c === 'bom' ? 'hc-bom' : c === 'atencao' ? 'hc-atencao' : 'hc-info'

  // Group by owner
  const byOwner = {}
  items.forEach(h => { const k = h.owner?.name || 'Sem dono'; if (!byOwner[k]) byOwner[k] = []; byOwner[k].push(h) })

  return (
    <PageShell title="Headlines" actions={<button className="btn btn-primary" onClick={() => setPanel({ data: {} })}>+ Nova Headline</button>}>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Duplo clique → editar</p>
      {Object.keys(byOwner).map(owner => (
        <div key={owner}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, padding: '14px 0 8px', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>{owner}</div>
          {byOwner[owner].map(h => (
            <div key={h.id} className="list-item" onDoubleClick={() => setPanel({ data: h })}>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, padding: '3px 8px', borderRadius: 4, fontWeight: 500, flexShrink: 0, background: h.category === 'bom' ? 'rgba(22,163,74,.12)' : h.category === 'atencao' ? 'rgba(217,119,6,.12)' : 'rgba(59,110,240,.12)', color: h.category === 'bom' ? 'var(--green)' : h.category === 'atencao' ? 'var(--amber)' : 'var(--accent)' }}>{catLabel(h.category)}</span>
              <div style={{ flex: 1, marginLeft: 10 }}>
                <div style={{ fontWeight: 500 }}>{h.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{h.description?.substring(0, 80)}{h.description?.length > 80 ? '…' : ''}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--muted2)' }}>2× editar</span>
            </div>
          ))}
        </div>
      ))}
      {!items.length && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Nenhuma headline.</div>}

      {panel && (
        <div className="panel-overlay open">
          <div className="panel-backdrop" onClick={() => setPanel(null)} />
          <div className="panel-drawer">
            <HeadlinePanel data={panel.data} onSave={saveItem} onArchive={archiveItem} onClose={() => setPanel(null)} />
          </div>
        </div>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </PageShell>
  )
}

function HeadlinePanel({ data, onSave, onArchive, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'info', notes: '', ...data })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <>
      <div className="panel-header"><div className="panel-title">{data.id ? 'Editar Headline' : 'Nova Headline'}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body">
        <div className="form-field"><label>Título</label><input value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div className="form-field"><label>Descrição</label><textarea value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div className="form-field"><label>Categoria</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="bom">👍 Bom</option><option value="atencao">⚠️ Atenção</option><option value="info">ℹ️ Info</option>
          </select>
        </div>
        <div className="form-field"><label>Notas</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Discussão, contexto..." /></div>
        {data.id && <button className="btn btn-danger btn-sm" onClick={() => onArchive(data.id)}>Arquivar</button>}
      </div>
      <div className="panel-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Salvar</button>
      </div>
    </>
  )
}

// ─── ROCKS ──────────────────────────────────────────────────────────────────
export function Rocks() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('')
  const [panel, setPanel] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchItems() }, [profile])

  async function fetchItems() {
    const { data } = await supabase.from('rocks').select('*, owner:profiles(name,id)').eq('archived', false).order('level').order('created_at')
    setItems(data || [])
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function saveItem(form) {
    if (form.id) await supabase.from('rocks').update(form).eq('id', form.id)
    else await supabase.from('rocks').insert({ ...form, team_id: profile?.team_id, org_id: profile?.org_id })
    setPanel(null); fetchItems(); showToast('Rock salvo')
  }

  async function archiveItem(id) {
    await supabase.from('rocks').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id)
    setPanel(null); fetchItems(); showToast('Rock arquivado')
  }

  const statusBadge = s => {
    const map = { 'on-track': 'badge-green', 'off-track': 'badge-amber', 'done': 'badge-blue', 'lost': 'badge-red' }
    const labels = { 'on-track': 'On Track', 'off-track': 'Off Track', 'done': 'Done', 'lost': 'Lost' }
    return <span className={`badge ${map[s]}`}>{labels[s]}</span>
  }
  const progressColor = s => s === 'done' ? 'var(--accent)' : s === 'on-track' ? 'var(--green)' : s === 'off-track' ? 'var(--amber)' : 'var(--red)'

  const filtered = items.filter(r => !filter || r.title?.toLowerCase().includes(filter.toLowerCase()) || r.owner?.name?.toLowerCase().includes(filter.toLowerCase()))
  const levels = [{ key: 'company', label: 'Empresa' }, { key: 'sector', label: 'Setor/Time' }, { key: 'personal', label: 'Pessoal' }]

  return (
    <PageShell title="Rocks" actions={<button className="btn btn-primary" onClick={() => setPanel({ data: {} })}>+ Novo Rock</button>}>
      <input className="filter-input" placeholder="Filtrar por pessoa ou título..." value={filter} onChange={e => setFilter(e.target.value)} style={{ marginBottom: 18, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, padding: '8px 14px', borderRadius: 'var(--radius)', outline: 'none', width: 260 }} />
      {levels.map(({ key, label }) => {
        const group = filtered.filter(r => r.level === key)
        if (!group.length) return null
        return (
          <div key={key} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, padding: '0 0 8px', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>{label}</div>
            {group.map(r => (
              <div key={r.id} className="list-item" onDoubleClick={() => setPanel({ data: r })}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{r.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r.owner?.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r.progress}%</span>
                    <div style={{ flex: 1, maxWidth: 140 }}><div className="progress-bar"><div className="progress-fill" style={{ width: r.progress + '%', background: progressColor(r.status) }} /></div></div>
                  </div>
                </div>
                {statusBadge(r.status)}
                <span style={{ fontSize: 10, color: 'var(--muted2)', marginLeft: 8 }}>2× editar</span>
              </div>
            ))}
          </div>
        )
      })}

      {panel && (
        <div className="panel-overlay open">
          <div className="panel-backdrop" onClick={() => setPanel(null)} />
          <div className="panel-drawer">
            <RockPanel data={panel.data} onSave={saveItem} onArchive={archiveItem} onClose={() => setPanel(null)} />
          </div>
        </div>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </PageShell>
  )
}

function RockPanel({ data, onSave, onArchive, onClose }) {
  const [form, setForm] = useState({ title: '', level: 'personal', status: 'on-track', progress: 0, notes: '', ...data })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <>
      <div className="panel-header"><div className="panel-title">{data.id ? 'Editar Rock' : 'Novo Rock'}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body">
        <div className="form-field"><label>Título</label><input value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div className="form-2col">
          <div className="form-field"><label>Nível</label>
            <select value={form.level} onChange={e => set('level', e.target.value)}>
              <option value="company">Empresa</option><option value="sector">Setor</option><option value="personal">Pessoal</option>
            </select>
          </div>
          <div className="form-field"><label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="on-track">On Track</option><option value="off-track">Off Track</option><option value="done">Done</option><option value="lost">Lost</option>
            </select>
          </div>
        </div>
        <div className="form-field"><label>Progresso (%)</label><input type="number" min={0} max={100} value={form.progress} onChange={e => set('progress', parseInt(e.target.value) || 0)} /></div>
        <div className="form-field"><label>Notas</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
        {data.id && <button className="btn btn-danger btn-sm" onClick={() => onArchive(data.id)}>Arquivar</button>}
      </div>
      <div className="panel-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Salvar</button>
      </div>
    </>
  )
}

// ─── SCORECARD ──────────────────────────────────────────────────────────────
export function Scorecard() {
  const { profile } = useAuth()
  const [metrics, setMetrics] = useState([])
  const [panel, setPanel] = useState(null)
  const [toast, setToast] = useState('')
  const weeks = ['S-7', 'S-6', 'S-5', 'S-4', 'S-3', 'S-2', 'S-1', 'Esta']

  useEffect(() => { fetchMetrics() }, [profile])

  async function fetchMetrics() {
    const { data } = await supabase.from('scorecard_metrics').select('*, owner:profiles(name), values:scorecard_values(*)').order('created_at')
    setMetrics(data || [])
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function saveValue(metricId, weekIdx, value) {
    const metric = metrics.find(m => m.id === metricId)
    if (!metric) return
    const weekDate = new Date()
    weekDate.setDate(weekDate.getDate() - (7 - weekIdx))
    await supabase.from('scorecard_values').upsert({ metric_id: metricId, week_label: weeks[weekIdx], week_date: weekDate.toISOString().split('T')[0], value: parseFloat(value) }, { onConflict: 'metric_id,week_date' })
    fetchMetrics(); showToast('Valor salvo')
  }

  return (
    <PageShell title="Scorecard" actions={<button className="btn btn-primary" onClick={() => setPanel({ data: {} })}>+ Nova Métrica</button>}>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Duplo clique na linha → notas · Clique no valor → editar</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              {['Métrica', 'Dono', 'Meta', ...weeks].map(h => (
                <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: .8, color: 'var(--muted)', fontWeight: 500, padding: '10px 12px', textAlign: h.startsWith('S') || h === 'Esta' ? 'center' : 'left', borderBottom: '2px solid var(--border)', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => {
              const vals = m.values || []
              return (
                <tr key={m.id} onDoubleClick={() => setPanel({ data: m, type: 'notes' })} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{m.metric_name}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{m.owner?.name}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 13 }}>{Number(m.goal).toLocaleString('pt-BR')}</td>
                  {weeks.map((w, wi) => {
                    const v = vals.find(v => v.week_label === w)
                    const val = v?.value
                    const ok = val !== undefined && val !== null ? (m.inverted ? val <= m.goal : val >= m.goal) : null
                    const label = val !== undefined && val !== null ? (val >= 1000 ? Math.round(val / 1000) + 'k' : val) : '—'
                    return (
                      <td key={w} style={{ padding: '10px 8px', borderBottom: '1px solid var(--border)', textAlign: 'center' }} onClick={() => setPanel({ data: m, type: 'value', weekIdx: wi, weekLabel: w, currentVal: val })}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, cursor: 'pointer', background: ok === true ? 'rgba(22,163,74,.15)' : ok === false ? 'rgba(220,38,38,.15)' : 'var(--surface2)', color: ok === true ? 'var(--green)' : ok === false ? 'var(--red)' : 'var(--muted)' }}>{label}</div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!metrics.length && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Nenhuma métrica cadastrada.</div>}

      {panel && (
        <div className="panel-overlay open">
          <div className="panel-backdrop" onClick={() => setPanel(null)} />
          <div className="panel-drawer">
            {(!panel.type || panel.type === 'notes') && <ScorecardNotesPanel data={panel.data} onClose={() => setPanel(null)} onSave={() => { fetchMetrics(); setPanel(null); showToast('Notas salvas') }} />}
            {panel.type === 'value' && <ScorecardValuePanel data={panel} onSave={saveValue} onClose={() => setPanel(null)} />}
          </div>
        </div>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </PageShell>
  )
}

function ScorecardNotesPanel({ data, onSave, onClose }) {
  const [notes, setNotes] = useState(data.notes || '')
  async function save() {
    await supabase.from('scorecard_metrics').update({ notes }).eq('id', data.id)
    onSave()
  }
  return (
    <>
      <div className="panel-header"><div className="panel-title">{data.metric_name}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body">
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 4 }}>Dono</div><div>{data.owner?.name}</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 4 }}>Meta</div><div style={{ fontFamily: 'var(--mono)' }}>{Number(data.goal).toLocaleString('pt-BR')}</div></div>
        </div>
        <div className="form-field"><label>Notas / Contexto</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tendências, plano de ação..." /></div>
      </div>
      <div className="panel-footer"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save}>Salvar</button></div>
    </>
  )
}

function ScorecardValuePanel({ data, onSave, onClose }) {
  const [val, setVal] = useState(data.currentVal ?? '')
  return (
    <>
      <div className="panel-header"><div className="panel-title">Editar valor — {data.weekLabel}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body"><div className="form-field"><label>Valor</label><input type="number" step="any" value={val} onChange={e => setVal(e.target.value)} /></div></div>
      <div className="panel-footer"><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={() => { onSave(data.data.id, data.weekIdx, val); onClose() }}>Salvar</button></div>
    </>
  )
}

// ─── ISSUES ─────────────────────────────────────────────────────────────────
export function Issues() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [panel, setPanel] = useState(null)
  const [toast, setToast] = useState('')
  const [dragSrc, setDragSrc] = useState(null)

  useEffect(() => { fetchItems() }, [profile])

  async function fetchItems() {
    const { data } = await supabase.from('issues').select('*, owner:profiles(name,id)').eq('archived', false).order('sort_order').order('created_at')
    setItems(data || [])
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function saveItem(form) {
    if (form.id) await supabase.from('issues').update(form).eq('id', form.id)
    else await supabase.from('issues').insert({ ...form, team_id: profile?.team_id })
    setPanel(null); fetchItems(); showToast('Issue salva')
  }

  async function resolveItem(id, form) {
    await saveItem(form)
    await supabase.from('issues').update({ archived: true, archived_at: new Date().toISOString(), resolved_at: new Date().toISOString() }).eq('id', id)
    setPanel(null); fetchItems(); showToast('Issue resolvida')
  }

  async function convertToTodo(issueId, form, assignees) {
    await saveItem(form)
    for (const a of assignees) {
      await supabase.from('todos').insert({ title: form.text || form.title, team_id: profile?.team_id, owner_id: a.userId, due_date: a.due, original_due_date: a.due })
    }
    await supabase.from('issues').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', issueId)
    setPanel(null); fetchItems(); showToast(`${assignees.length} To-Do(s) criados`)
  }

  function dragStart(e, idx) { setDragSrc(idx); e.currentTarget.style.opacity = '.4' }
  function dragOver(e, idx) { e.preventDefault(); }
  async function dragDrop(e, idx) {
    e.preventDefault()
    if (dragSrc === null || dragSrc === idx) return
    const newItems = [...items]
    const [moved] = newItems.splice(dragSrc, 1)
    newItems.splice(idx, 0, moved)
    setItems(newItems)
    setDragSrc(null)
    for (let i = 0; i < newItems.length; i++) {
      await supabase.from('issues').update({ sort_order: i }).eq('id', newItems[i].id)
    }
  }
  function dragEnd(e) { e.currentTarget.style.opacity = '1'; setDragSrc(null) }

  const pClass = p => p <= 1 ? 'p1' : p === 2 ? 'p2' : p === 3 ? 'p3' : 'p4'

  return (
    <PageShell title="Issues" actions={<button className="btn btn-primary" onClick={() => setPanel({ data: {} })}>+ Nova Issue</button>}>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Arraste para reordenar · Duplo clique → editar</p>
      {items.map((iss, idx) => (
        <div key={iss.id} draggable onDragStart={e => dragStart(e, idx)} onDragOver={e => dragOver(e, idx)} onDrop={e => dragDrop(e, idx)} onDragEnd={dragEnd}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'grab', boxShadow: 'var(--shadow)' }}
          onDoubleClick={() => setPanel({ data: iss })}>
          <div style={{ color: 'var(--muted2)', cursor: 'grab' }}>⠿</div>
          <div style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)', flexShrink: 0, background: iss.priority <= 1 ? 'rgba(220,38,38,.15)' : iss.priority === 2 ? 'rgba(217,119,6,.15)' : iss.priority === 3 ? 'rgba(59,110,240,.15)' : 'var(--surface2)', color: iss.priority <= 1 ? 'var(--red)' : iss.priority === 2 ? 'var(--amber)' : iss.priority === 3 ? 'var(--accent)' : 'var(--muted)' }}>{iss.priority}</div>
          <div style={{ flex: 1, minWidth: 0, margin: '0 12px' }}>
            <div style={{ fontWeight: 500 }}>{iss.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{iss.detail}</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{iss.owner?.name}</span>
          <span style={{ fontSize: 10, color: 'var(--muted2)' }}>2× editar</span>
        </div>
      ))}
      {!items.length && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Nenhuma issue aberta.</div>}

      {panel && (
        <div className="panel-overlay open">
          <div className="panel-backdrop" onClick={() => setPanel(null)} />
          <div className="panel-drawer">
            <IssuePanel data={panel.data} onSave={saveItem} onResolve={resolveItem} onConvert={convertToTodo} onClose={() => setPanel(null)} />
          </div>
        </div>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </PageShell>
  )
}

function IssuePanel({ data, onSave, onResolve, onConvert, onClose }) {
  const [form, setForm] = useState({ title: '', detail: '', priority: 3, identify: '', discuss: '', solve: '', notes: '', ...data })
  const [converting, setConverting] = useState(false)
  const [assignees, setAssignees] = useState([])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  function toggleAssignee(user) {
    setAssignees(prev => {
      const exists = prev.find(a => a.userId === user.id)
      if (exists) return prev.filter(a => a.userId !== user.id)
      return [...prev, { userId: user.id, name: user.name, due: defaultDue }]
    })
  }
  function setAssigneeDue(userId, due) {
    setAssignees(prev => prev.map(a => a.userId === userId ? { ...a, due } : a))
  }

  const MOCK_USERS = [
    { id: '1', name: 'Ana Lima' }, { id: '2', name: 'Bruno Souza' },
    { id: '3', name: 'Carla Rocha' }, { id: '4', name: 'Daniel Melo' }
  ]

  return (
    <>
      <div className="panel-header">
        <input style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 600, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none', flex: 1, borderBottom: '1px solid transparent' }}
          value={form.title} onChange={e => set('title', e.target.value)} placeholder="Título da issue..." />
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      <div className="panel-body">
        {!converting ? (
          <>
            <div className="form-2col">
              <div className="form-field"><label>Prioridade</label>
                <select value={form.priority} onChange={e => set('priority', parseInt(e.target.value))}>
                  {[1,2,3,4,5].map(p => <option key={p} value={p}>{p} — {['Crítica','Alta','Média','Baixa','Mínima'][p-1]}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Detalhe</label><input value={form.detail} onChange={e => set('detail', e.target.value)} placeholder="Contexto breve..." /></div>
            </div>
            {[['identify', 'Identify', 'Qual é o problema real?'], ['discuss', 'Discuss', 'Discussão do time...'], ['solve', 'Solve', 'Solução acordada...']].map(([key, label, ph]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', fontWeight: 500, marginBottom: 7 }}>{label}</div>
                <textarea style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, padding: 10, borderRadius: 'var(--radius)', outline: 'none', resize: 'vertical', minHeight: 80, display: 'block' }} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
              </div>
            ))}
            <div className="form-field"><label>Notas adicionais</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>Selecione os responsáveis. Um To-Do será criado para cada pessoa.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_USERS.map(u => {
                const sel = assignees.find(a => a.userId === u.id)
                return (
                  <div key={u.id} onClick={() => toggleAssignee(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: sel ? 'rgba(59,110,240,.08)' : 'var(--surface2)', border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!sel} onChange={() => {}} onClick={e => e.stopPropagation()} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
                    <div style={{ flex: 1, fontSize: 13 }}>{u.name}</div>
                    {sel && <input type="date" value={sel.due} onChange={e => { e.stopPropagation(); setAssigneeDue(u.id, e.target.value) }} onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12, padding: '4px 8px', borderRadius: 7, outline: 'none', width: 130 }} />}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      <div className="panel-footer" style={{ flexWrap: 'wrap', gap: 8 }}>
        {data.id && !converting && (
          <>
            <button className="btn btn-danger btn-sm" onClick={() => onResolve(data.id, form)}>Resolver</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConverting(true)}>→ To-Do</button>
          </>
        )}
        {converting && <button className="btn btn-ghost btn-sm" onClick={() => setConverting(false)}>← Voltar</button>}
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => converting ? onConvert(data.id, form, assignees) : onSave(form)}>
          {converting ? `Criar ${assignees.length} To-Do(s)` : (data.id ? 'Salvar' : 'Criar')}
        </button>
      </div>
    </>
  )
}

// ─── TODOS ──────────────────────────────────────────────────────────────────
export function Todos() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [panel, setPanel] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchItems() }, [profile])

  async function fetchItems() {
    const { data } = await supabase.from('todos').select('*, owner:profiles(name,id), postpone_log:todo_postpone_log(*)').order('due_date')
    setItems(data || [])
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function toggleDone(id, done) {
    await supabase.from('todos').update({ done: !done, done_at: !done ? new Date().toISOString() : null }).eq('id', id)
    fetchItems()
  }

  async function saveItem(form) {
    if (form.id) await supabase.from('todos').update(form).eq('id', form.id)
    else await supabase.from('todos').insert({ ...form, team_id: profile?.team_id, original_due_date: form.due_date })
    setPanel(null); fetchItems(); showToast('To-Do salvo')
  }

  async function postpone(id, newDate, reason) {
    const item = items.find(t => t.id === id)
    if (!item) return
    await supabase.from('todo_postpone_log').insert({ todo_id: id, from_date: item.due_date, to_date: newDate, reason })
    await supabase.from('todos').update({ due_date: newDate }).eq('id', id)
    setPanel(null); fetchItems(); showToast('Data prorrogada')
  }

  async function removeItem(id) {
    await supabase.from('todos').delete().eq('id', id)
    setPanel(null); fetchItems(); showToast('To-Do removido')
  }

  const done = items.filter(t => t.done).length
  const rate = items.length ? Math.round(done / items.length * 100) : 0

  return (
    <PageShell title="To-Dos" actions={
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Taxa: <strong style={{ color: rate >= 90 ? 'var(--green)' : rate >= 60 ? 'var(--amber)' : 'var(--red)' }}>{rate}%</strong></span>
        <button className="btn btn-primary" onClick={() => setPanel({ data: {} })}>+ Novo To-Do</button>
      </div>
    }>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Duplo clique → editar</p>
      {items.map(t => (
        <div key={t.id} className="list-item" onDoubleClick={() => setPanel({ data: t })}>
          <div style={{ width: 18, height: 18, border: `1.5px solid ${t.done ? 'var(--green)' : 'var(--border2)'}`, borderRadius: 4, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.done ? 'var(--green)' : 'transparent', transition: 'all .15s' }}
            onClick={e => { e.stopPropagation(); toggleDone(t.id, t.done) }}>
            {t.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <div style={{ flex: 1, marginLeft: 12 }}>
            <div style={{ fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--muted)' : 'var(--text)' }}>{t.title}</div>
            {t.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.description}</div>}
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.owner?.name}</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: !t.done && t.due_date < today ? 'var(--red)' : 'var(--muted)', marginLeft: 10 }}>
            {t.due_date ? `${t.due_date.split('-')[2]}/${t.due_date.split('-')[1]}` : '—'}
            {t.postpone_log?.length > 0 && <span style={{ color: 'var(--amber)', fontSize: 10 }}> (+{t.postpone_log.length})</span>}
          </span>
          <span style={{ fontSize: 10, color: 'var(--muted2)', marginLeft: 8 }}>2× editar</span>
        </div>
      ))}
      {!items.length && <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Nenhum To-Do.</div>}

      {panel && (
        <div className="panel-overlay open">
          <div className="panel-backdrop" onClick={() => setPanel(null)} />
          <div className="panel-drawer">
            <TodoPanel data={panel.data} onSave={saveItem} onPostpone={postpone} onRemove={removeItem} onClose={() => setPanel(null)} />
          </div>
        </div>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </PageShell>
  )
}

function TodoPanel({ data, onSave, onPostpone, onRemove, onClose }) {
  const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const [form, setForm] = useState({ title: '', description: '', due_date: defaultDue, notes: '', ...data })
  const [postponing, setPostponing] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [reason, setReason] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="panel-header"><div className="panel-title">{data.id ? 'Editar To-Do' : 'Novo To-Do'}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body">
        <div className="form-field"><label>Título</label><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="O que precisa ser feito?" /></div>
        <div className="form-field"><label>Descrição</label><textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Contexto adicional..." /></div>
        <div className="form-2col">
          <div className="form-field"><label>Data de entrega</label><input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} /></div>
        </div>
        <div className="form-field"><label>Notas</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} /></div>

        {data.id && data.postpone_log?.length > 0 && (
          <div className="form-field">
            <label>Histórico de prorrogações</label>
            {data.postpone_log.map((p, i) => (
              <div key={i} style={{ background: 'var(--surface2)', borderLeft: '3px solid var(--amber)', borderRadius: '0 var(--radius) var(--radius) 0', padding: '8px 12px', marginBottom: 8, fontSize: 12, color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--text)' }}>{new Date(p.postponed_at).toLocaleDateString('pt-BR')}</strong> · {p.from_date} → <strong style={{ color: 'var(--text)' }}>{p.to_date}</strong>
                {p.reason && ` · "${p.reason}"`}
              </div>
            ))}
          </div>
        )}

        {postponing && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Data atual: <strong>{form.due_date}</strong></div>
            <div className="form-field"><label>Nova data</label><input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
            <div className="form-field"><label>Motivo (opcional)</label><textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} /></div>
          </div>
        )}
      </div>
      <div className="panel-footer" style={{ flexWrap: 'wrap', gap: 8 }}>
        {data.id && (
          <>
            {!postponing
              ? <button className="btn btn-ghost btn-sm" onClick={() => setPostponing(true)}>📅 Prorrogar</button>
              : <button className="btn btn-primary btn-sm" onClick={() => { if (newDate) onPostpone(data.id, newDate, reason) }}>Confirmar prorrogação</button>
            }
            <button className="btn btn-danger btn-sm" onClick={() => onRemove(data.id)}>Remover</button>
          </>
        )}
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        {!postponing && <button className="btn btn-primary" onClick={() => onSave(form)}>{data.id ? 'Salvar' : 'Criar'}</button>}
      </div>
    </>
  )
}

const today = new Date().toISOString().split('T')[0]
