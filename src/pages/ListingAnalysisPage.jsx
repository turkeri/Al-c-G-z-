import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import ScoreGauge from '../components/ScoreGauge'
import RiskBadge from '../components/RiskBadge'
import ProblemCard from '../components/ProblemCard'
import { analyzeListing } from '../services/listingAnalysisService'
import { analyzeVehicle } from '../services/analysisService'
import { estimateMarketPrice } from '../services/marketService'
import { evaluateDamage } from '../services/damageService'
import { buildDecisionSummary } from '../services/decisionService'
import { enrichVehicle } from '../services/catalogService'
import { formatKm, formatPrice } from '../utils/formatters'

/**
 * İLAN ANALİZİ — TEK EKRAN, UÇTAN UCA RAPOR
 *
 * Kullanıcı ilan metnini yapıştırır; uygulama tek seferde şunları üretir:
 *
 *   · İlan güven puanı   (metindeki riskli kalıplar, çelişkiler)
 *   · Araç risk puanı    (yaş, km, kronik arıza — mevcut analiz motoru)
 *   · Piyasa karşılaştırması
 *   · Beyan edilen hasardan değer kaybı
 *   · Motor/şanzıman katalog bilgisi
 *   · Karar özeti
 *
 * Sıralama bilinçlidir: önce İLANA, sonra ARACA bakılır. Çünkü ilan yalan
 * söylüyorsa aracın teknik analizinin bir anlamı kalmaz.
 */

const LEVEL_META = {
  kritik: { label: 'Kritik', tone: 'danger' },
  uyari: { label: 'Uyarı', tone: 'warning' },
  bilgi: { label: 'Bilgi', tone: 'normal' }
}

const DECISION_ICON = { al: '✓', dikkatli: '!', alma: '×', belirsiz: '?' }

const ORNEK_ILAN = `Volkswagen Golf 1.6 TDI Comfortline
2015 model, 142.000 km, Dizel, DSG
Fiyat: 985.000 TL
Sahibinden, İstanbul
Hatasız boyasız tramersiz, tamamı orjinal.
Tramer 18.500 TL. Sağ ön çamurluk boyalı.
Tüm bakımları yetkili serviste yapıldı, faturaları mevcut.
Acil ihtiyaçtan satılıktır, ilk gelen alır. Takasa uygundur.`

export default function ListingAnalysisPage() {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState('')

  const report = useMemo(() => {
    if (!submitted.trim()) return null

    // Piyasa farkı, "fiyat çok ucuz" uyarısını tetiklediği için ilan
    // analizinden ÖNCE hesaplanır ve bağlam olarak içeri verilir.
    const first = analyzeListing(submitted)
    if (!first) return null

    const market = estimateMarketPrice(first.formData)
    const listing = analyzeListing(submitted, {
      marketDiffPercent: market ? market.diffPercent : undefined
    })

    const analysis = listing.formData.brand ? analyzeVehicle(listing.formData) : null
    const damage = evaluateDamage(listing.damageInput)
    const decision = analysis ? buildDecisionSummary(analysis, market) : null
    const catalog = enrichVehicle(listing.formData)

    return { listing, market, analysis, damage, decision, catalog }
  }, [submitted])

  function handleAnalyze() {
    setSubmitted(text)
  }

  function handleExample() {
    setText(ORNEK_ILAN)
    setSubmitted('')
  }

  return (
    <>
      <Header
        title="İlan Analizi"
        subtitle="İlan metnini yapıştır, tek ekranda tam rapor al."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>İlan Metni</h3>
          <p className="market-disclaimer" style={{ marginTop: 0 }}>
            İlan sayfasındaki başlığı, açıklamayı ve özellik tablosunu kopyalayıp buraya
            yapıştır. Ne kadar çok metin yapıştırırsan analiz o kadar isabetli olur.
          </p>
          <label htmlFor="listing-text">İlan metni</label>
          <textarea
            id="listing-text"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="İlan başlığı, açıklama ve özellikleri buraya yapıştır..."
          />
          <div className="action-links" style={{ marginTop: 12 }}>
            <button className="action-link" type="button" onClick={handleAnalyze} disabled={!text.trim()}>
              İlanı Analiz Et
            </button>
            <button className="action-link" type="button" onClick={handleExample}>
              Örnek İlan Doldur
            </button>
          </div>
          {/* Kullanıcının verisinin nereye gittiği açıkça yazılır. */}
          <p className="market-disclaimer">
            Yapıştırdığın metin hiçbir sunucuya gönderilmez; analiz tamamen kendi cihazında
            yapılır. Uygulama ilan sitelerine bağlanmaz, bu yüzden metni sen yapıştırırsın.
          </p>
        </section>

        {!report && (
          <EmptyState
            icon="checklist"
            title="Analiz için ilan metni yapıştır"
            description="İlanın kendi içinde çelişip çelişmediğini, riskli ifadeler içerip içermediğini ve fiyatın piyasaya göre nerede durduğunu birlikte değerlendireceğiz."
          />
        )}

        {report && (
          <>
            {/* ---------------- 1. İLAN GÜVENİ ---------------- */}
            <section className="result-summary">
              <ScoreGauge
                score={report.listing.trustScore}
                label={report.listing.trustBand.label}
                tone={report.listing.trustBand.tone}
              />
              <div className="result-summary-details">
                <h2>İlan Güven Puanı</h2>
                <p className="result-summary-engine">
                  {report.listing.criticalCount} kritik · {report.listing.warningCount} uyarı
                </p>
                <div className="result-summary-meta">
                  {report.listing.sellerType && <span>{report.listing.sellerType}</span>}
                  {report.listing.kmPerYear && <span>{formatKm(report.listing.kmPerYear)}/yıl</span>}
                </div>
              </div>
            </section>

            <section className="result-card">
              <p className="market-disclaimer" style={{ marginTop: 0 }}>
                Bu puan <strong>aracı değil ilanı</strong> değerlendirir: metnin kendi içinde
                tutarlı olup olmadığını, riskli ifadeler içerip içermediğini ölçer. Düşük puan
                aracın kötü olduğu anlamına gelmez, ilana olduğu gibi güvenilmemesi gerektiği
                anlamına gelir.
              </p>
            </section>

            {/* ---------------- 2. ÇIKARILAN VERİ ---------------- */}
            <section className="result-card">
              <h3>İlandan Okunanlar</h3>
              <div className="market-facts">
                <div>
                  <span>Araç</span>
                  <strong>
                    {[report.listing.extracted.brand, report.listing.extracted.model]
                      .filter(Boolean)
                      .join(' ') || 'Okunamadı'}
                  </strong>
                </div>
                <div>
                  <span>Yıl</span>
                  <strong>{report.listing.extracted.year || '—'}</strong>
                </div>
                <div>
                  <span>Kilometre</span>
                  <strong>
                    {report.listing.extracted.km ? formatKm(report.listing.extracted.km) : '—'}
                  </strong>
                </div>
                <div>
                  <span>Fiyat</span>
                  <strong>
                    {report.listing.extracted.price
                      ? formatPrice(report.listing.extracted.price)
                      : '—'}
                  </strong>
                </div>
              </div>
              {report.listing.missing.length > 0 && (
                <p className="market-disclaimer">
                  İlandan okunamayan alanlar: {report.listing.missing.join(', ')}. Bu alanlar
                  olmadan analiz eksik kalır; metnin tamamını yapıştırdığından emin ol.
                </p>
              )}
            </section>

            {/* ---------------- 3. UYARILAR ---------------- */}
            {report.listing.flags.length > 0 && (
              <section className="result-card">
                <h3>İlan Uyarıları</h3>
                <div className="problem-list">
                  {report.listing.flags.map((flag) => (
                    <div className="problem-item" key={flag.id}>
                      <div className="problem-item-head">
                        <span className="problem-item-title">{flag.title}</span>
                        <span className={'market-label tone-' + LEVEL_META[flag.level].tone}>
                          {LEVEL_META[flag.level].label}
                        </span>
                      </div>
                      <p>{flag.detail}</p>
                      <div className="problem-solution">
                        <span className="problem-solution-label">Ne yapmalı</span>
                        <p>{flag.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ---------------- 4. KARAR ---------------- */}
            {report.decision && (
              <section className={'decision-card verdict-' + report.decision.verdict}>
                <div className="decision-icon" aria-hidden="true">
                  {DECISION_ICON[report.decision.verdict]}
                </div>
                <div className="decision-text">
                  <h3>{report.decision.title}</h3>
                  <p>{report.decision.description}</p>
                </div>
              </section>
            )}

            {/* ---------------- 5. PİYASA ---------------- */}
            {report.market && (
              <section className="result-card">
                <div className="market-row">
                  <h3 style={{ margin: 0 }}>Piyasa Karşılaştırması</h3>
                  <span className={'market-label tone-' + report.market.verdict}>
                    {report.market.label}
                  </span>
                </div>
                <div className="market-facts">
                  <div>
                    <span>İlan fiyatı</span>
                    <strong>{formatPrice(report.market.listedPrice)}</strong>
                  </div>
                  <div>
                    <span>Tahmini piyasa değeri</span>
                    <strong>{formatPrice(report.market.estimatedPrice)}</strong>
                  </div>
                  <div>
                    <span>Fark</span>
                    <strong>
                      {report.market.diffAmount >= 0 ? '+' : ''}
                      {report.market.diffPercent}%
                    </strong>
                  </div>
                </div>
                <p className="market-disclaimer">
                  Bu tutar marka/model/yaş/kilometreye dayalı kaba bir amortisman hesabıdır;
                  gerçek zamanlı ilan verisi değildir. Referanslar {report.market.baseline}{' '}
                  piyasasına göredir.
                </p>
              </section>
            )}

            {/* ---------------- 6. BEYAN EDİLEN HASAR ---------------- */}
            {report.damage && (
              <section className="result-card">
                <div className="market-row">
                  <h3 style={{ margin: 0 }}>İlanda Beyan Edilen Hasar</h3>
                  <span className={'market-label tone-' + report.damage.severity.tone}>
                    {report.damage.severity.label}
                  </span>
                </div>
                <div className="market-facts">
                  <div>
                    <span>Tahmini değer kaybı</span>
                    <strong>{formatPrice(report.damage.lossAmount)}</strong>
                  </div>
                  <div>
                    <span>Kayıp oranı</span>
                    <strong>%{report.damage.lossPercent}</strong>
                  </div>
                  <div>
                    <span>Hasarsız karşılığı</span>
                    <strong>{formatPrice(report.damage.comparablePrice)}</strong>
                  </div>
                </div>
                <p className="market-disclaimer">
                  Yalnızca ilanda YAZAN beyana dayanır. Yazılmayan boya ve değişen parçalar bu
                  hesaba girmez; gerçek durum ancak boya ölçümüyle ortaya çıkar.
                </p>
              </section>
            )}

            {/* ---------------- 7. MOTOR / ŞANZIMAN KATALOĞU ---------------- */}
            {(report.catalog.engine || report.catalog.transmission) && (
              <section className="result-card">
                <h3>Motor ve Şanzıman Kaydı</h3>

                {report.catalog.engine && (
                  <div className="ai-block">
                    <p className="expertise-category-title">
                      {report.catalog.engine.name} · {report.catalog.engine.family}
                    </p>
                    <p className="ai-text">
                      Motor kodu: {report.catalog.engine.codes.join(', ')} · {report.catalog.engine.power}{' '}
                      · {report.catalog.engine.years}
                      {report.catalog.engine.maintenance?.timing && (
                        <> · {report.catalog.engine.maintenance.timing}</>
                      )}
                    </p>
                    <div className="problem-list">
                      {report.catalog.engine.problems.map((p) => (
                        <div className="problem-item" key={p.title}>
                          <div className="problem-item-head">
                            <span className="problem-item-title">{p.title}</span>
                            <RiskBadge risk={p.risk} />
                          </div>
                          {p.note && <p>{p.note}</p>}
                          <div className="problem-item-meta">
                            <span className="problem-item-cost">{p.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.catalog.transmission && (
                  <div className="ai-block">
                    <p className="expertise-category-title">
                      {report.catalog.transmissionConfidence === 'tahmin' ? 'Muhtemelen ' : ''}
                      {report.catalog.transmission.name}
                    </p>
                    {report.catalog.transmissionConfidence === 'tahmin' && (
                      <p className="market-disclaimer" style={{ marginTop: 0 }}>
                        İlanda sadece &quot;Otomatik&quot; yazdığı için şanzıman markanın o
                        yıllarda kullandığı üniteye göre tahmin edildi. Kesin bilgi için
                        satıcıya şanzıman tipini sor.
                      </p>
                    )}
                    <p className="ai-text">{report.catalog.transmission.buyingNote}</p>
                    <div className="problem-list">
                      {report.catalog.transmission.problems.map((p) => (
                        <div className="problem-item" key={p.title}>
                          <div className="problem-item-head">
                            <span className="problem-item-title">{p.title}</span>
                            <RiskBadge risk={p.risk} />
                          </div>
                          {p.note && <p>{p.note}</p>}
                          <div className="problem-item-meta">
                            <span className="problem-item-cost">{p.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ---------------- 8. ARACIN KRONİK SORUNLARI ---------------- */}
            {report.analysis && report.analysis.knownProblems.length > 0 && (
              <section className="result-card">
                <h3>Bu Aracın Kronik Sorunları</h3>
                <div className="problem-list">
                  {report.analysis.knownProblems.map((problem) => (
                    <ProblemCard problem={problem} key={problem.title} />
                  ))}
                </div>
              </section>
            )}

            {/* ---------------- 9. DEVAM ---------------- */}
            <section className="result-card">
              <h3>Bu İlanla Devam Et</h3>
              <div className="action-links">
                <Link className="action-link" to="/satici-sorulari" state={{ formData: report.listing.formData }}>
                  Satıcıya Sorulacaklar
                </Link>
                <Link className="action-link" to="/tramer" state={{ price: report.listing.formData.price }}>
                  Hasar ve Değer Kaybı
                </Link>
                <Link className="action-link" to="/maliyet" state={{ formData: report.listing.formData }}>
                  Yıllık Maliyeti Hesapla
                </Link>
                <Link className="action-link" to="/analiz" state={{ formData: report.listing.formData }}>
                  Detaylı Analize Aktar
                </Link>
                <Link className="action-link" to="/yerinde-kontrol">
                  Yerinde Kontrole Başla
                </Link>
              </div>
            </section>
          </>
        )}
      </PageContainer>
    </>
  )
}
