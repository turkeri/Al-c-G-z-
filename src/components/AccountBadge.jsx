import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Ana ekranın sağ üstünde, yalnızca giriş yapılmışsa görünen küçük rozet.
 * Hesap sayfasına götürür — çıkış yapma zaten orada var, burada tekrar
 * edilmez.
 */
export default function AccountBadge() {
  const { user } = useAuth()
  if (!user) return null

  const email = user.email || ''
  const initial = email.trim().charAt(0).toUpperCase() || '?'

  return (
    <Link className="account-badge" to="/hesap" aria-label="Hesabım">
      <span className="account-badge-avatar" aria-hidden="true">{initial}</span>
      <span className="account-badge-email">{email}</span>
    </Link>
  )
}
