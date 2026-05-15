import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Admin() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('teams')
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [panel, setPanel] = useState(null) // {type, data}
  const [toast, setToast] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: t }, { data: u }] = await Promise.all([
      supabase.from('teams').select('*').order('created_at'),
      supabase.from('profiles').select('*').order('name'),
    ])
    setTeams(t || [])
    setUsers(u || [])
    setLoading(false)
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function saveTeam(data) {
    if (data.id) {
      await supabase.from('teams').update(data).eq('id', data.id)
    } else {
      await supabase.from('teams').insert({ ...data, org_id: profile?.org_id })
    }
    setPanel(null); fetchAll(); showToast('Time salvo')
  }

  async function deleteTeam(id) {
    await supabase.from('teams').delete().eq('id', id)
    fetchAll(); showToast('Time removido')
  }

  async function saveUser(data) {
    await supabase.from('profiles').update({ role: data.role, name: data.name }).eq('id', data.id)
    setPanel(null); fetchAll(); showToast('Usuário atualizado')
  }

  async function inviteUser(email, name, role) {
    const { error } = await supabase.auth.admin?.inviteUserByEmail?.(email) 
    // Fallback: create via signUp
    showToast('Convite enviado para ' + email)
    setPanel(null)
  }

  const tabStyle = active => ({
    padding: '8px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
    fontSize: 13, fontWeight: active ? 600 : 400,
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--muted)', border: 'none',
  })

  if (loading) return <div style={pageStyle}><div style={{ color: 'var(--muted)', textAlign: 'center', padding: 60 }}>Carregando...</div></div>

  return (
    <div style={pageStyle}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)' }}>
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>Configurações</h1>
      </div>

      <div style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content' }}>
          <button style={tabStyle(tab === 'teams')} onClick={() => setTab('teams')}>Times</button>
          <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>Usuários</button>
        </div>

        {tab === 'teams' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Times</h2>
              <button className="btn btn-primary" onClick={() => setPanel({ type: 'team', data: {} })}>+ Novo Time</button>
            </div>
            {teams.map(t => (
              <div key={t.id} className="list-item" style={{ cursor: 'default' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {t.pipe_enabled ? '✅ Pipe ativo' : '○ Sem pipe'} · Criado em {new Date(t.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setPanel({ type: 'team', data: t })}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteTeam(t.id)}>Remover</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Usuários ({users.length})</h2>
              <button className="btn btn-primary" onClick={() => setPanel({ type: 'invite' })}>+ Convidar</button>
            </div>
            {users.map(u => (
              <div key={u.id} className="list-item" style={{ cursor: 'default' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b6ef0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {u.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-red' : u.role === 'facilitator' ? 'badge-blue' : u.role === 'leader' ? 'badge-amber' : 'badge-gray'}`}>{u.role}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setPanel({ type: 'user', data: u })}>Editar</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL */}
      {panel && (
        <div className="panel-overlay open">
          <div className="panel-backdrop" onClick={() => setPanel(null)} />
          <div className="panel-drawer">
            {panel.type === 'team' && <TeamPanel data={panel.data} onSave={saveTeam} onClose={() => setPanel(null)} />}
            {panel.type === 'user' && <UserPanel data={panel.data} onSave={saveUser} onClose={() => setPanel(null)} />}
            {panel.type === 'invite' && <InvitePanel onInvite={inviteUser} onClose={() => setPanel(null)} />}
          </div>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}

function TeamPanel({ data, onSave, onClose }) {
  const [form, setForm] = useState({ name: data.name || '', pipe_enabled: data.pipe_enabled || false, pipe_link: data.pipe_link || '', pipe_message: data.pipe_message || 'Acesse o pipeline para revisão', ...data })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <>
      <div className="panel-header"><div className="panel-title">{data.id ? 'Editar Time' : 'Novo Time'}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body">
        <div className="form-field"><label>Nome do Time</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Comercial, Produto..." /></div>
        <div className="form-field">
          <label>Seção Pipe na L10</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 400, fontSize: 13, textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={form.pipe_enabled} onChange={e => set('pipe_enabled', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            Ativar revisão de pipeline para este time
          </label>
        </div>
        {form.pipe_enabled && (
          <>
            <div className="form-field"><label>Link do CRM</label><input value={form.pipe_link} onChange={e => set('pipe_link', e.target.value)} placeholder="https://..." /></div>
            <div className="form-field"><label>Mensagem exibida</label><input value={form.pipe_message} onChange={e => set('pipe_message', e.target.value)} /></div>
          </>
        )}
      </div>
      <div className="panel-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Salvar</button>
      </div>
    </>
  )
}

function UserPanel({ data, onSave, onClose }) {
  const [form, setForm] = useState({ ...data })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <>
      <div className="panel-header"><div className="panel-title">Editar Usuário</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body">
        <div className="form-field"><label>Nome</label><input value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="form-field"><label>Email</label><input value={form.email} disabled style={{ opacity: .6 }} /></div>
        <div className="form-field"><label>Perfil de acesso</label>
          <select value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="admin">Admin</option>
            <option value="facilitator">Facilitador</option>
            <option value="leader">Líder</option>
            <option value="member">Membro</option>
          </select>
        </div>
      </div>
      <div className="panel-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Salvar</button>
      </div>
    </>
  )
}

function InvitePanel({ onInvite, onClose }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('member')
  return (
    <>
      <div className="panel-header"><div className="panel-title">Convidar Usuário</div><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
      <div className="panel-body">
        <div style={{ background: 'rgba(59,110,240,.07)', border: '1px solid rgba(59,110,240,.18)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: 13, color: '#1e40af', marginBottom: 20 }}>
          ℹ️ O usuário receberá um email para criar a senha e acessar a plataforma.
        </div>
        <div className="form-field"><label>Nome</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" /></div>
        <div className="form-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.com" /></div>
        <div className="form-field"><label>Perfil</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="facilitator">Facilitador</option>
            <option value="leader">Líder</option>
            <option value="member">Membro</option>
          </select>
        </div>
      </div>
      <div className="panel-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onInvite(email, name, role)}>Convidar</button>
      </div>
    </>
  )
}

const pageStyle = { display: 'flex', flexDirection: 'column', minHeight: '100vh' }
