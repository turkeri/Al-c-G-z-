import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import ScoreGauge from '../components/ScoreGauge'
import RiskBadge from '../components/RiskBadge'
import ProblemCard from '../components/ProblemCard'
import HeadlightLoader from '../components/HeadlightLoader'
import QuotaNote, { useAccount } from '../components/QuotaNote'
import { analyzeListing } from '../services/listingAnalysisService'
import { analyzeVehicle } from '../services/analysisService'
import { estimateMarketPrice } from '../services/marketService'
import { evaluateDamage } from '../services/damageService'
import { buildDecisionSummary } from '../services/decisionService'
import { enrichVehicle } from '../services/catalogService'
import { assessChronicRisk } from '../services/chronicProblemService'
import { fetchListingByInput, visionToFormData, toFormData } from '../services/listingFetchService'
import { fetchListingFromScreenshot, isAiConfigured } from '../services/aiService'
import { loadImageFromFile, drawToCanvas, canvasToJpeg } from '../services/photoAnalysisService'
import { formatKm, formatPrice } from '../utils/formatters'

/**
 * İLAN ANALİZİ — ÜÇ GİRDİ YOLU, TEK RAPOR
 *
 * ============================================================================
 * NEDEN ÜÇ YOL VAR
 * ============================================================================
 * En kolay yol (ilan numarası yaz, gerisini sistem halletsin) ne yazık ki her
 * zaman çalışmıyor: sahibinden.com ve arabam.com sunucu taraflı isteklere bot
 * koruması uyguluyor (403) ve kullanım şartları otomatik veri çekmeyi
 * yasaklıyor. Bu bir kod hatası değil, karşı tarafın bilinçli tercihi.
 *
 * Bu yüzden üç yol birlikte sunuluyor:
 *
 *   1. İlan no / bağlantı  — mimari hazır; platform açılırsa kendiliğinden çalışır
 *   2. Ekran görüntüsü     — ASIL ÇALIŞAN YOL; görselden alanlar okunur
 *   3. Metin yapıştır      — internet/AI olmadan da çalışır
 *
 * Üçü de aynı analiz motoruna girer; rapor hangi yoldan gelindiğinden bağımsız
 * olarak aynıdır. Kullanıcıya hangi yolun kullanıldığı ve verinin ne kadarının
 * okunabildiği açıkça gösterilir.
 */

const LEVEL_META = {
  kritik: { label: 'Kritik', tone: 'danger' },
  uyari: { label: 'Uyarı', tone: 'warning' },
  bilgi: { label: 'Bilgi', tone: 'normal' }
}

const DECISION_ICON = { al: '✓', dikkatli: '!', alma: '×', belirsiz: '?' }

const MODES = [
  { id: 'link', label: 'İlan No / Link' },
  { id: 'gorsel', label: 'Ekran Görüntüsü' },
  { id: 'metin', label: 'Metin Yapıştır' }
]

const ORNEK_ILAN = `Volkswagen Golf 1.6 TDI Comfortline
2015 model, 142.000 km, Dizel, DSG
Fiyat: 985.000 TL
Sahibinden, İstanbul
Hatasız boyasız tramersiz, tamamı orjinal.
Tramer 18.500 TL. Sağ ön çamurluk boyalı.
Tüm bakımları yetkili serviste yapıldı, faturaları mevcut.
Acil ihtiyaçtan satılıktır, ilk gelen alır. Takasa uygundur.`

export default function ListingAnalysisPage() {
  const [mode, setMode] = useState('link')
  const [linkInput, setLinkInput] = useState('')
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [seed, setSeed] = useState(null) // dışarıdan gelen alanlar (link/görsel)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState(null)
  const [shots, setShots] = useState([])
  const account = useAccount()

  /**
   * Rapor üretimi.
   *
   * Girdi yolundan bağımsız olarak aynı motorlar çalışır. `seed` varsa
   * (link/görselden okunan alanlar) metinden çıkarılan alanların üzerine yazar;
   * çünkü yapılandırılmış veri, serbest metinden çıkarımdan daha güvenilirdir.
   */
  const report = useMemo(() => {
    const hasText = submitted.trim().length > 0
    if (!hasText && !seed) return null

    const source = hasText ? submitted : ''
    const first = analyzeListing(source || ' ')
    if (!first) return null

    const merged = { ...first.formData, ...(seed?.formData || {}) }
    Object.keys(merged).forEach((k) => {
      if (!merged[k]) merged[k] = first.formData[k] || ''
    })

    const market = estimateMarketPrice(merged)
    const listing = analyzeListing(source || ' ', {
      marketDiffPercent: market ? market.diffPercent : undefined
    })
    listing.formData = merged

    const analysis = merged.brand ? analyzeVehicle(merged) : null
    const damage = evaluateDamage({ ...listing.damageInput, price: merged.price })
    const decision = analysis ? buildDecisionSummary(analysis, market) : null
    const catalog = enrichVehicle(merged)
    const chronic = assessChronicRisk(merged, { analysis, catalog })

    return { listing, market, analysis, damage, decision, catalog, chronic }
  }, [submitted, seed])

  // ------------------------------------------------------------------ girdi

  async function handleFetchLink() {
    setBusy('link')
    setNotice(null)
    const outcome = await fetchListingByInput(linkInput)
    setBusy('')

    if (!outcome) {
      setNotice({ tone: 'warning', text: 'Sunucu yapılandırılmamış; ekran görüntüsü ya da metin yolunu kullan.' })
      return
    }

    if (outcome.status === 'ok') {
      setSeed({ formData: toFormData(outcome.listing), via: outcome.platformLabel })
      setSubmitted(outcome.listing.description || '')
      setNotice({ tone: 'ok', text: `${outcome.platformLabel} ilanı okundu.` })
      return
    }

    /*
     * 'engelli' bir arıza değil. Kullanıcıya nedenini söyleyip çalışan yola
     * yönlendiriyoruz — "olmadı" deyip bırakmak, kullanıcıyı çıkmazda bırakır.
     */
    if (outcome.status === 'engelli') {
      setMode('gorsel')
      setNotice({
        tone: 'warning',
        text:
          (outcome.platformLabel || 'Bu site') +
          ' sunucu taraflı okumaya kapalı (bot koruması ve kullanım şartları). ' +
          'İlan sayfasının ekran görüntüsünü yükle; alanları görselden okuyalım.'
      })
      return
    }

    setNotice({
      tone: 'warning',
      text: (outcome.error || 'İlan alınamadı.') + ' Ekran görüntüsü yolunu deneyebilirsin.'
    })
    setMode('gorsel')
  }

  async function handleShotFiles(fileList) {
    const files = Array.from(fileList || []).slice(0, 4)
    if (!files.length) return
    setBusy('gorsel-hazirlik')
    try {
      const next = []
      for (const file of files) {
        const img = await loadImageFromFile(file)
        // 1100 piksel: ilan sayfasındaki küçük punto yazıların okunabilmesi için
        // panel fotoğraflarından (800) daha yüksek tutulur.
        const canvas = drawToCanvas(img, 1100)
        next.push({ dataUrl: canvasToJpeg(canvas, 0.72), name: file.name })
      }
      setShots(next)
      setNotice(null)
    } catch {
      setNotice({ tone: 'warning', text: 'Görsel okunamadı, başka bir dosya dene.' })
    } finally {
      setBusy('')
    }
  }

  async function handleReadShots() {
    if (!shots.length) return
    setBusy('gorsel')
    setNotice(null)
    const response = await fetchListingFromScreenshot(shots)
    setBusy('')

    if (!response) {
      setNotice({ tone: 'warning', text: 'Görsel okuma şu an kullanılamıyor.' })
      return
    }
    if (response.error) {
      setNotice({ tone: 'warning', text: response.error })
      return
    }

    const parsed = visionToFormData(response.result)
    setSeed({ formData: parsed.formData, via: 'ekran görüntüsü', missing: parsed.missingFields })
    setSubmitted(parsed.text || ' ')
    setNotice({
      tone: 'ok',
      text:
        'Görselden okundu.' +
        (parsed.missingFields.length ? ' Okunamayan alanlar: ' + parsed.missingFields.join(', ') + '.' : '')
    })
  }

  function handleAnalyzeText() {
    setSeed(null)
    setSubmitted(text)
    setNotice(null)
  }

  function handleExample() {
    setMode('metin')
    setText(ORNEK_ILAN)
    setSeed(null)
    setSubmitted('')
  }

  // ----------------------------------------------------------------- ekran

  return (
    <>
      <Header title="İlan Analizi" subtitle="İlanı ver, tek ekranda tam rapor al." showBack />
      <PageContainer>
        <section className="result-card">
          <div className="mode-tabs">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={'mode-tab' + (mode === m.id ? ' is-active' : '')}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'link' && (
            <>
              <label htmlFor="listing-link">İlan numarası veya bağlantı</label>
              <input
                id="listing-link"
                type="text"
                inputMode="url"
                placeholder="1234567890 veya https://www.sahibinden.com/ilan/..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
              />
              <button
                className="primary-button"
                type="button"
                style={{ width: '100%', marginTop: 12 }}
                onClick={handleFetchLink}
                disabled={!linkInput.trim() || busy === 'link'}
              >
                {busy === 'link' ? 'Deneniyor...' : 'İlanı Getir'}
              </button>
              {/* Kullanıcı beklentisini baştan doğru kuruyoruz. */}
              <p className="market-disclaimer">
                sahibinden.com ve arabam.com sunucu taraflı okumaya kapalıdır (bot koruması ve
                kullanım şartları). Bu yüzden numara/bağlantı çoğu zaman getirilemez ve seni
                ekran görüntüsü yoluna yönlendiririz — o yol çalışıyor ve aynı raporu üretir.
              </p>
            </>
          )}

          {mode === 'gorsel' && (
            <>
              <label htmlFor="listing-shot">İlan sayfasının ekran görüntüsü</label>
              <input
                id="listing-shot"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleShotFiles(e.target.files)}
              />
              <p className="market-disclaimer" style={{ marginTop: 8 }}>
                İlan sayfasını telefonda açıp ekran görüntüsü al. Bilgi tablosunun (yıl,
                kilometre, yakıt, vites, fiyat) göründüğünden emin ol. En fazla 4 görsel
                yükleyebilirsin; uzun sayfayı parça parça çekebilirsin.
              </p>

              {shots.length > 0 && (
                <div className="shot-strip">
                  {shots.map((s) => (
                    <img key={s.name} src={s.dataUrl} alt={s.name} />
                  ))}
                </div>
              )}

              {busy === 'gorsel-hazirlik' && <HeadlightLoader label="Görseller hazırlanıyor..." />}
              {busy === 'gorsel' && <HeadlightLoader label="İlan görselden okunuyor..." />}

              {isAiConfigured() && shots.length > 0 && busy === '' && (
                <>
                  <QuotaNote account={account} style={{ marginTop: 8 }} />
                  <button
                    className="primary-button"
                    type="button"
                    style={{ width: '100%' }}
                    onClick={handleReadShots}
                    disabled={Boolean(account && account.remaining <= 0)}
                  >
                    {account && account.remaining <= 0 ? 'Analiz hakkın doldu' : 'Görselden Oku ve Analiz Et'}
                  </button>
                </>
              )}
            </>
          )}

          {mode === 'metin' && (
            <>
              <label htmlFor="listing-text">İlan metni</label>
              <textarea
                id="listing-text"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="İlan başlığı, açıklama ve özellikleri buraya yapıştır..."
              />
              <div className="action-links" style={{ marginTop: 12 }}>
                <button className="action-link" type="button" onClick={handleAnalyzeText} disabled={!text.trim()}>
                  İlanı Analiz Et
                </button>
                <button className="action-link" type="button" onClick={handleExample}>
                  Örnek İlan Doldur
                </button>
              </div>
            </>
          )}

          {notice && (
            <p className={'market-disclaimer tone-' + notice.tone} style={{ marginTop: 12 }}>
              {notice.text}
            </p>
          )}

          <p className="market-disclaimer">
            Metin ve görseller yalnızca analiz için işlenir; ilan metni cihazında ayrıştırılır.
            Görsel okuma için görüntü sunucumuza gider ve saklanmaz.
          </p>
        </section>

        {!report && (
          <EmptyState
            icon="checklist"
            title="Analiz için ilanı ver"
            description="İlanın kendi içinde çelişip çelişmediğini, riskli ifadeler içerip içermediğini, motorunun kronik sorunlarını ve fiyatın piyasaya göre nerede durduğunu birlikte değerlendireceğiz."
          />
        )}

        {report && (
          <>
            {seed && (
              <section className="result-card">
                <p className="market-disclaimer" style={{ margin: 0 }}>
                  Kaynak: <strong>{seed.via}</strong>
                  {seed.missing?.length ? ` · Okunamayan alanlar: ${seed.missing.join(', ')}` : ''}
                </p>
              </section>
            )}

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
                    {[report.listing.formData.brand, report.listing.formData.model]
                      .filter(Boolean)
                      .join(' ') || 'Okunamadı'}
                  </strong>
                </div>
                <div>
                  <span>Yıl</span>
                  <strong>{report.listing.formData.year || '—'}</strong>
                </div>
                <div>
                  <span>Kilometre</span>
                  <strong>
                    {report.listing.formData.km ? formatKm(report.listing.formData.km) : '—'}
                  </strong>
                </div>
                <div>
                  <span>Fiyat</span>
                  <strong>
                    {report.listing.formData.price ? formatPrice(report.listing.formData.price) : '—'}
                  </strong>
                </div>
              </div>
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

            {/* ---------------- 5. KRONİK RİSK MOTORU ---------------- */}
            {report.chronic && report.chronic.items.length > 0 && (
              <section className="result-card">
                <div className="market-row">
                  <h3 style={{ margin: 0 }}>Kronik Risk Değerlendirmesi</h3>
                  <span className={'market-label tone-' + report.chronic.band.tone}>
                    {report.chronic.band.label}
                  </span>
                </div>
                <div className="market-facts">
                  <div>
                    <span>Risk puanı</span>
                    <strong>{report.chronic.score}/100</strong>
                  </div>
                  <div>
                    <span>Beklenen masraf</span>
                    <strong>
                      {formatPrice(report.chronic.costRange.min)} – {formatPrice(report.chronic.costRange.max)}
                    </strong>
                  </div>
                  <div>
                    <span>Kilometreye göre yakın</span>
                    <strong>{report.chronic.dueCount} kalem</strong>
                  </div>
                </div>
                <div className="problem-list">
                  {report.chronic.items.slice(0, 8).map((item) => (
                    <div className="problem-item" key={item.title + item.source}>
                      <div className="problem-item-head">
                        <span className="problem-item-title">{item.title}</span>
                        <RiskBadge risk={item.risk} />
                      </div>
                      {item.note && <p>{item.note}</p>}
                      <div className="problem-item-meta">
                        <span className="problem-item-km">{item.source}</span>
                        {item.cost && <span className="problem-item-cost">{item.cost}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="market-disclaimer">
                  Bu değerlendirme yapay zekâ yorumu değildir; motor ve şanzıman kataloğundaki
                  kayıtlardan hesaplanır. Listedeki kalemler bu motor ailesinde yaygın olarak
                  bildirilen sorunlardır — bu araçta bulundukları anlamına gelmez. Masraf
                  rakamı kalemlerin toplamı DEĞİLDİR; hiçbir araçta arızaların hepsi birden
                  çıkmaz. Her kalem gerçekleşme olasılığıyla ağırlıklandırılıp toplanır.
                </p>
              </section>
            )}

            {/* ---------------- 6. PİYASA ---------------- */}
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

            {/* ---------------- 7. BEYAN EDİLEN HASAR ---------------- */}
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

            {/* ---------------- 8. MOTOR / ŞANZIMAN ---------------- */}
            {(report.catalog.engine || report.catalog.transmission) && (
              <section className="result-card">
                <h3>Motor ve Şanzıman Kaydı</h3>

                {report.catalog.engine && (
                  <div className="ai-block">
                    <p className="expertise-category-title">
                      {report.catalog.engine.name} · {report.catalog.engine.family}
                    </p>
                    <p className="ai-text">
                      Motor kodu: {report.catalog.engine.codes.join(', ')} ·{' '}
                      {report.catalog.engine.power} · {report.catalog.engine.years}
                      {report.catalog.engine.maintenance?.timing && (
                        <> · {report.catalog.engine.maintenance.timing}</>
                      )}
                    </p>
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
                  </div>
                )}
              </section>
            )}

            {/* ---------------- 9. VERİTABANI KRONİK SORUNLARI ---------------- */}
            {report.analysis && report.analysis.knownProblems.length > 0 && (
              <section className="result-card">
                <h3>Bu Aracın Kayıtlı Kronik Sorunları</h3>
                <div className="problem-list">
                  {report.analysis.knownProblems.map((problem) => (
                    <ProblemCard problem={problem} key={problem.title} />
                  ))}
                </div>
              </section>
            )}

            {/* ---------------- 10. DEVAM ---------------- */}
            <section className="result-card">
              <h3>Bu İlanla Devam Et</h3>
              <div className="action-links">
                <Link className="action-link" to="/rapor">
                  Ekspertiz Raporu Oluştur
                </Link>
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
