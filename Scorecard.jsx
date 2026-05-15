import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import Headlines from './pages/Headlines'
import Rocks from './pages/Rocks'
import Scorecard from './pages/Scorecard'
import Issues from './pages/Issues'
import Todos from './pages/Todos'
import L10 from './pages/L10'
import Archived from './pages/Archived'
import Admin from './pages/Admin'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)', fontFamily:'var(--font)' }}>Carregando...</div>
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { profile, loading } = useAuth()
  if (loading) return null
  return profile?.role === 'admin' ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="headlines" element={<Headlines />} />
        <Route path="rocks" element={<Rocks />} />
        <Route path="scorecard" element={<Scorecard />} />
        <Route path="issues" element={<Issues />} />
        <Route path="todos" element={<Todos />} />
        <Route path="l10" element={<L10 />} />
        <Route path="archived" element={<Archived />} />
        <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>
    </Routes>
  )
}
