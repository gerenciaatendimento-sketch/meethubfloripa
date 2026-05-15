import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('Email ou senha incorretos.')
    else navigate('/')
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Meet <span style={{ color: 'var(--accent)' }}>Hub</span></div>
        <h1 style={styles.title}>Entrar na plataforma</h1>
        <p style={styles.sub}>Bem-vindo de volta</p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div className="form-field">
            <label>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div style={styles.links}>
          <Link to="/forgot-password" style={styles.link}>Esqueci minha senha</Link>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-md)' },
  logo: { fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 6 },
  sub: { fontSize: 14, color: 'var(--muted)', marginBottom: 28 },
  links: { marginTop: 20, textAlign: 'center' },
  link: { fontSize: 13, color: 'var(--accent)', textDecoration: 'none' },
}
