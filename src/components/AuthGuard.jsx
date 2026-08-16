import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthGuard({ children }) {
  const { configured, loading, user } = useAuth()
  const location = useLocation()

  if (!configured || loading) return children
  if (!user) return <Navigate to="/giris" replace state={{ from: location.pathname }} />
  return children
}
