import RiskBadge from './RiskBadge'

export default function ProblemCard({ problem }) {
  return (
    <div className="problem-item">
      <div className="problem-item-head">
        <span className="problem-item-title">{problem.title}</span>
        <RiskBadge risk={problem.risk} />
      </div>
      <p>{problem.description}</p>
      {problem.solution && (
        <div className="problem-solution">
          <span className="problem-solution-label">Çözüm</span>
          <p>{problem.solution}</p>
        </div>
      )}
      <div className="problem-item-meta">
        <span className="problem-item-km">Kontrol aralığı: {problem.checkKm} km</span>
        {problem.estimatedCost && (
          <span className="problem-item-cost">Tahmini maliyet: {problem.estimatedCost}</span>
        )}
      </div>
    </div>
  )
}
