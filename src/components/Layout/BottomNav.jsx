import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Ana Ekran', end: true },
  { to: '/analiz', label: 'Analiz' },
  { to: '/kronik-sorunlar', label: 'Kronik' },
  { to: '/kontrol-listesi', label: 'Kontrol' },
  { to: '/favoriler', label: 'Favoriler' }
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
          <span className="bottom-nav-dot" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
