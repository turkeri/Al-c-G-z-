import { Link } from 'react-router-dom'
import Icon from './icons/Icon'

/**
 * Ana menü karesi.
 *
 * Kartlar alt alta ince şeritler yerine yan yana ikişerli kareler halinde
 * dizilir: başparmakla erişilebilir hedef alanı büyür ve ekranda daha fazla
 * bölüm aynı anda görünür.
 */
export default function VehicleCard({ to, title, description, badge, icon, accent }) {
  return (
    <Link to={to} className="tile-card" style={{ '--card-accent': accent }}>
      <span className="tile-card-icon">
        <Icon name={icon} size={26} strokeWidth={1.8} />
      </span>
      <span className="tile-card-title">{title}</span>
      <span className="tile-card-desc">{description}</span>
      {badge && <span className="tile-card-badge">{badge}</span>}
    </Link>
  )
}
