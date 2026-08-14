import { NavLink } from 'react-router-dom'
import Icon from '../icons/Icon'

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
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
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
