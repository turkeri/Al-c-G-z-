import { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import RiskBadge from '../components/RiskBadge'
import categories from '../data/safe-purchase.json'

const STORAGE_KEY = 'arac-dedektifi:safe-purchase'

function readChecked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeChecked(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // yoksayılır
  }
}

/**
 * Güvenli alım kontrol listesi.
 *
 * Aracın mekaniği sağlam olsa bile alım süreci baştan sona tuzaklıdır:
 * kapora dolandırıcılığı, rehinli araç, kilometre düşürme, vekaletle satış.
 * Bu ekran o adımları tek tek kapattırır.
 */
export default function SafePurchasePage() {
  const [checked, setChecked] = useState(readChecked)

  const totalItems = useMemo(
    () => categories.reduce((sum, c) => sum + c.items.length, 0),
    []
  )
  const doneCount = Object.values(checked).filter(Boolean).length
  const percent = Math.round((doneCount / totalItems) * 100)

  const openHighRisk = useMemo(
    () =>
      categories
        .flatMap((c) => c.items)
        .filter((item) => item.risk === 'Yüksek' && !checked[item.id]),
    [checked]
  )

  function toggle(id) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      if (!next[id]) delete next[id]
      writeChecked(next)
      return next
    })
  }

  function reset() {
    setChecked({})
    writeChecked({})
  }

  return (
    <>
      <Header
        title="Güvenli Alım Kontrolü"
        subtitle="Evrak, para, kilometre ve test adımlarını tek tek kapat."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <div className="market-row">
            <h3 style={{ margin: 0 }}>İlerleme</h3>
            <span className="market-label tone-normal">
              {doneCount}/{totalItems}
            </span>
          </div>
          <div className="progress-track">
            <span style={{ width: percent + '%' }} />
          </div>
          {openHighRisk.length > 0 ? (
            <p className="market-disclaimer">
              Kritik seviyede {openHighRisk.length} madde hâlâ açık. Para vermeden önce
              bunları kapatman gerekir.
            </p>
          ) : (
            <p className="market-disclaimer" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              Kritik maddelerin tamamı işaretli. Süreç açısından güvendesin.
            </p>
          )}
        </section>

        {categories.map((category) => (
          <section className="result-card" key={category.id}>
            <h3>{category.title}</h3>
            <p className="market-disclaimer" style={{ marginTop: 0 }}>
              {category.description}
            </p>
            <div className="safe-list">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={'safe-item' + (checked[item.id] ? ' is-done' : '')}
                  onClick={() => toggle(item.id)}
                >
                  <span className="safe-item-check" aria-hidden="true">
                    {checked[item.id] ? '✓' : ''}
                  </span>
                  <span className="safe-item-body">
                    <span className="safe-item-head">
                      <span className="safe-item-title">{item.title}</span>
                      <RiskBadge risk={item.risk} />
                    </span>
                    <span className="safe-item-why">{item.why}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <button type="button" className="favorite-button" onClick={reset}>
          Listeyi Sıfırla
        </button>
      </PageContainer>
    </>
  )
}
