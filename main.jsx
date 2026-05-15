import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, createContext, useContext } from 'react'

export const TeamContext = createContext({ teamId: null, setTeamId: () => {} })
export const useTeam = () => useContext(TeamContext)

const NAV = [
  { to: '/', label: 'Dashboard', exact: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: '/headlines', label: 'Headlines', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { to: '/rocks', label: 'Rocks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  { to: '/scorecard', label: 'Scorecard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { to: '/issues', label: 'Issues', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { to: '/todos', label: 'To-Dos', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { to: '/l10', label: 'L10 Meeting', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
]

const SYS = [
  { to: '/archived', label: 'Arquivados', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
  { to: '/admin', label: 'Configurações', admin: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

const COLORS = ['#3b6ef0','#7c3aed','#0891b2','#d97706','#16a34a','#dc2626']
function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '??' }
function avatarColor(name) { const i = (name?.charCodeAt(0) || 0) % COLORS.length; return COLORS[i] }

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [teamId, setTeamId] = useState(null)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13,
    color: isActive ? '#fff' : 'var(--muted)',
    background: isActive ? 'var(--accent)' : 'transparent',
    textDecoration: 'none', transition: 'all .15s', marginBottom: 1,
  })

  return (
    <TeamContext.Provider value={{ teamId, setTeamId }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 224, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20 }}>
          <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>Meet <span style={{ color: 'var(--accent)' }}>Hub</span></span>
          </div>

          <nav style={{ padding: '10px 10px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted2)', padding: '10px 12px 4px', fontWeight: 500 }}>Principal</div>
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} end={item.exact} style={navStyle}>
                <span style={{ width: 15, height: 15, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted2)', padding: '14px 12px 4px', fontWeight: 500 }}>Sistema</div>
            {SYS.filter(item => !item.admin || profile?.role === 'admin').map(item => (
              <NavLink key={item.to} to={item.to} style={navStyle}>
                <span style={{ width: 15, height: 15, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor(profile?.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initials(profile?.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{profile?.role}</div>
              </div>
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }} title="Sair">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ marginLeft: 224, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </TeamContext.Provider>
  )
}
