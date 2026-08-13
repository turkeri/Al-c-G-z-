import { Link } from 'react-router-dom'
import Icon from './icons/Icon'

export default function VehicleCard({ to, title, description, badge, icon, accent }) {
  return (
    <Link to={to} className="vehicle-card" style={{ '--card-accent': accent }}>
      <div className="vehicle-card-icon">
        <Icon name={icon} size={26} strokeWidth={1.8} />
      </div>
      <div className="vehicle-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {badge && <span className="vehicle-card-badge">{badge}</span>}
      <span className="vehicle-card-arrow">&#8250;</span>
    </Link>
  )
}
