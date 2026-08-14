import { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'
import { searchCodes, describeUnknownCode, getAllCodes, getSystems } from '../services/obdService'

const POPULAR = ['P0401', 'P0299', 'P2002', 'P0300', 'P0420', 'P0700']

/**
 * OBD arıza kodu sözlüğü.
 *
 * Cihazdan okunan kod tek başına anlamsız bir dizedir. Burada ne olduğu,
 * neden olduğu, çözümü ve yaklaşık maliyeti gösterilir; araçla yola devam
 * edilip edilemeyeceği ayrıca belirtilir.
 */
export default function ObdCodePage() {
  const [query, setQuery] = useState('')
  const systems = useMemo(() => getSystems(), [])
  const total = useMemo(() => getAllCodes().length, [])

  const results = useMemo(() => searchCodes(query), [query])
  const unknown = useMemo(
    () => (query.trim().length >= 5 && results.length === 0 ? describeUnknownCode(query) : null),
    [query, results]
  )

  return (
    <>
      <Header
        title="Arıza Kodu Sözlüğü"
        subtitle="Cihazdan okuduğun kodu yaz, ne anlama geldiğini gör."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <label>
            Arıza kodu veya kelime
            <input
              type="text"
              placeholder="Örn. P0401 veya egr"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="chip-select" style={{ marginTop: 12 }}>
            {POPULAR.map((code) => (
              <button key={code} type="button" className="chip" onClick={() => setQuery(code)}>
                {code}
              </button>
            ))}
          </div>
          <p className="market-disclaimer">
            Sözlükte {total} kod var.{' '}
            {systems.map((s) => s.system + ' (' + s.count + ')').join(', ')}
          </p>
        </section>

        {query.trim().length < 2 && (
          <EmptyState
            icon="plug"
            title="Kodu yaz, açıklaması gelsin"
            description="P ile başlayanlar motor, C fren/ABS, B gövde, U ise modüller arası haberleşme kodlarıdır."
          />
        )}

        {unknown && (
          <section className="result-card">
            <h3>{unknown.code}</h3>
            <p className="ai-text">{unknown.system}</p>
            {unknown.subsystem && <p className="counter-hint">{unknown.subsystem}</p>}
            <p className="market-disclaimer">{unknown.note}</p>
          </section>
        )}

        {results.map((entry) => (
          <section className="result-card" key={entry.code}>
            <div className="market-row">
              <h3 style={{ margin: 0 }}>
                {entry.code} &middot; {entry.title}
              </h3>
              <RiskBadge risk={entry.severity} />
            </div>
            <p className="counter-hint">{entry.system}</p>

            <p className="ai-text" style={{ marginTop: 10 }}>{entry.meaning}</p>

            <div className="ai-block">
              <p className="expertise-category-title">Olası sebepler</p>
              <div className="check-tags">
                {entry.causes.map((cause) => (
                  <span className="check-tag" key={cause}>
                    {cause}
                  </span>
                ))}
              </div>
            </div>

            <div className="problem-solution">
              <span className="problem-solution-label">Çözüm</span>
              <p>{entry.solution}</p>
            </div>

            <div className="problem-item-meta">
              <span className="problem-item-cost">{entry.estimatedCost}</span>
              <span className="problem-item-km">Yola devam: {entry.driveable}</span>
            </div>
          </section>
        ))}

        {query.trim().length >= 2 && results.length === 0 && !unknown && (
          <EmptyState
            icon="search"
            title="Bu kod sözlükte bulunamadı"
            description="Üretici tanımlı kodların (P1xxx, P3xxx) anlamı markaya göre değişir; marka cihazıyla okutmak gerekir."
          />
        )}
      </PageContainer>
    </>
  )
}
