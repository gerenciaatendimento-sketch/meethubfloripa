import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await resetPassword(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Meet <span style={{ color: 'var(--accent)' }}>Hub</span></div>
        <h1 style={styles.title}>Recuperar senha</h1>
        {sent ? (
          <div>
            <p style={{ fontSize: 14, color: 'var(--green)', marginBottom: 20, lineHeight: 1.6 }}>
              ✅ Email enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Link to="/login" className="btn btn-ghost" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
              Informe seu email e enviaremos um link para redefinir sua senha.
            </p>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>Voltar ao login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-md)' },
  logo: { fontSize: 22, fontWeight: 700, marginBottom: 28, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 20 },
}
