import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Icon from '../icons/Icon'
import { useAuth } from '../../contexts/AuthContext'
import { getAdminMe, canShowAdminLink } from '../../services/adminService'

/**
 * Alt menü, özellik listesi değil satın alma yolculuğunun aşamalarıdır:
 * ilanı görüyorum (Analiz), aracın başındayım (Yerinde), araştırıyorum
 * (Rehber), biriktirdiklerime bakıyorum (Garaj).
 */
const NAV_ITEMS = [
  { to: '/', label: 'Ana Ekran', icon: 'home', end: true },
  { to: '/analiz', label: 'Analiz', icon: 'search' },
  { to: '/yerinde-kontrol', label: 'Yerinde', icon: 'clipboard' },
  { to: '/rehber', label: 'Rehber', icon: 'compass' },
  { to: '/garaj', label: 'Garajım', icon: 'garage' }
]

export default function BottomNav() {
  const { user } = useAuth(); const [admin, setAdmin] = useState(false)
  useEffect(() => { let live = true; setAdmin(false); if (user) getAdminMe().then((me) => live && setAdmin(canShowAdminLink(me.permissions))).catch(() => live && setAdmin(false)); return () => { live = false } }, [user])
  const items = admin ? [...NAV_ITEMS, { to: '/admin', label: 'Yönetim', icon: 'settings' }] : NAV_ITEMS
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}
        >
          <Icon name={item.icon} size={22} strokeWidth={1.9} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
