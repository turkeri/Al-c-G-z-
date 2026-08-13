const RISK_CLASS = {
  Düşük: 'risk-badge risk-low',
  Orta: 'risk-badge risk-mid',
  Yüksek: 'risk-badge risk-high'
}

export default function RiskBadge({ risk }) {
  return <span className={RISK_CLASS[risk] || 'risk-badge'}>{risk}</span>
}
