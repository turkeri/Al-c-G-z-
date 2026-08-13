import { NavLink } from 'react-router-dom'
import Icon from '../icons/Icon'

const NAV_ITEMS = [
  { to: '/', label: 'Ana Ekran', icon: 'home', end: true },
  { to: '/analiz', label: 'Analiz', icon: 'search' },
  { to: '/kronik-sorunlar', label: 'Kronik', icon: 'alert' },
  { to: '/kontrol-listesi', label: 'Kontrol', icon: 'clipboard' },
  { to: '/favoriler', label: 'Favoriler', icon: 'heartOutline' }
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
