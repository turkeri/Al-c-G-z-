const TONE_COLORS = {
  excellent: '#2fb872',
  good: '#4f8ff0',
  warning: '#e0a83e',
  danger: '#e0524d'
}

export default function ScoreGauge({ score, label, tone }) {
  const size = 148
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score)) / 100
  const dashOffset = circumference * (1 - progress)
  const color = TONE_COLORS[tone] || TONE_COLORS.good

  return (
    <div className="score-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="score-gauge-center">
        <span className="score-gauge-value">{score}</span>
        <span className="score-gauge-max">/100</span>
      </div>
      {label && (
        <div className="score-gauge-label" style={{ color }}>
          {label}
        </div>
      )}
    </div>
  )
}
