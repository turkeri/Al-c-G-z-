import { Link } from 'react-router-dom'
import Icon from './icons/Icon'
import CardArt from './CardArt'

/**
 * Ana menü karesi.
 *
 * Kart üç katmandan oluşur:
 *   1. Vurgu rengiyle boyanmış yumuşak zemin (kartlar birbirinden ayrışsın diye)
 *   2. İşiyle ilgili arka plan çizimi (bkz. CardArt) — kart boş durmasın ve
 *      süsleme aynı zamanda ne yaptığını anlatsın
 *   3. İkon, başlık ve açıklama
 *
 * Dokununca kart hafifçe bastırılır ve çizim biraz büyüyüp aydınlanır;
 * dokunmatik ekranda "bastım" geri bildirimi böyle verilir.
 */
export default function VehicleCard({ to, title, description, badge, icon, accent, art }) {
  return (
    <Link to={to} className="tile-card" style={{ '--card-accent': accent }}>
      <span className="tile-card-wash" aria-hidden="true" />
      {art && (
        <span className="tile-card-art" aria-hidden="true">
          <CardArt name={art} />
        </span>
      )}
      <span className="tile-card-sheen" aria-hidden="true" />

      <span className="tile-card-icon">
        <Icon name={icon} size={26} strokeWidth={1.8} />
      </span>
      <span className="tile-card-title">{title}</span>
      <span className="tile-card-desc">{description}</span>
      {badge && <span className="tile-card-badge">{badge}</span>}
    </Link>
  )
}
