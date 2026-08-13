import { Link } from 'react-router-dom'

export default function VehicleCard({ to, title, description, badge }) {
  return (
    <Link to={to} className="vehicle-card">
      <div className="vehicle-card-icon" aria-hidden="true" />
      <div className="vehicle-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {badge && <span className="vehicle-card-badge">{badge}</span>}
      <span className="vehicle-card-arrow">&#8250;</span>
    </Link>
  )
}
