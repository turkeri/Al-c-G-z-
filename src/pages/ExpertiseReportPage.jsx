import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import { getProgress, vehicleLabel } from '../services/inspectionSessionService'
import { getPaintChecks } from '../services/paintCheckStorageService'
import { getExpertiseNotes } from '../services/expertiseNotesService'
import { analyzeVehicle } from '../services/analysisService'
import { estimateMarketPrice } from '../services/marketService'
import { buildDecisionSummary } from '../services/decisionService'
import { buildVehicleProfile } from '../services/catalogService'
import { formatKm, formatPrice } from '../utils/formatters'

/**
 * YAZDIRILABİLİR EKSPERTİZ RAPORU
 *
 * ============================================================================
 * NEDEN PDF KÜTÜPHANESİ YOK
 * ============================================================================
 * Tarayıcının kendi yazdırma penceresi zaten "PDF olarak kaydet" seçeneği
 * sunar — Android, iOS ve masaüstünde. Bir PDF kütüphanesi eklemek uygulamaya
 * yüzlerce kilobayt bindirir, Türkçe karakterler için ayrıca font gömmeyi
 * gerektirir ve sayfa düzenini elle hesaplamayı zorunlu kılar. Aynı sonucu
 * `window.print()` ve bir yazdırma stil sayfasıyla, sıfır bağımlılıkla
 * alıyoruz.
 *
 * ============================================================================
 * RAPOR NE DEĞİLDİR
 * ============================================================================
 * Bu belge resmî bir ekspertiz raporu DEĞİLDİR ve hukuki bir hüküm ifade
 * etmez. İçindeki bulguların bir kısmı kullanıcının kendi girdiği verilerdir.
 * Bu, raporun hem ekranında hem çıktısında açıkça yazar — aksi halde belge,
 * yetkili bir kuruluşun raporuymuş gibi kullanılabilir.
 */

function Row({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="report-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default function ExpertiseReportPage() {
  const progress = useMemo(() => getProgress(), [])
  const session = progress.session
  const vehicle = progress.vehicle

  const analysis = useMemo(() => (vehicle?.brand ? analyzeVehicle(vehicle) : null), [vehicle])
  const market = useMemo(() => (vehicle ? estimateMarketPrice(vehicle) : null), [vehicle])
  const decision = useMemo(
    () => (analysis ? buildDecisionSummary(analysis, market) : null),
    [analysis, market]
  )
  const catalog = useMemo(() => buildVehicleProfile(vehicle || {}) || {}, [vehicle])

  // Bu araca ait en son boya ölçümü ve notlar
  const label = vehicleLabel(vehicle)
  const paintCheck = useMemo(() => {
    const all = getPaintChecks()
    return all.find((r) => r.vehicleLabel && label && r.vehicleLabel.includes(vehicle?.brand)) || all[0] || null
  }, [label, vehicle])
  const notes = useMemo(() => {
    const all = getExpertiseNotes()
    return all.find((n) => n.vehicleLabel && vehicle?.brand && n.vehicleLabel.includes(vehicle.brand)) || null
  }, [vehicle])

  const printedAt = new Date().toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  if (!vehicle?.brand) {
    return (
      <>
        <Header title="Ekspertiz Raporu" subtitle="Bulgularını tek belgede topla." showBack />
        <PageContainer>
          <EmptyState
            icon="clipboard"
            title="Rapor için önce araç seç"
            description="Analiz ekranında bir araç girip yerinde kontrol adımlarını doldurduğunda, bulgular burada tek bir yazdırılabilir belgede toplanır."
          />
          <div className="action-links">
            <Link className="action-link" to="/analiz">Araç Analizine Git</Link>
            <Link className="action-link" to="/yerinde-kontrol">Yerinde Kontrole Başla</Link>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Header title="Ekspertiz Raporu" subtitle="Yazdır veya PDF olarak kaydet." showBack />
      <PageContainer>
        {/* Ekranda görünen, yazdırmada gizlenen kontroller */}
        <section className="result-card no-print">
          <h3>Rapor Hazır</h3>
          <p className="market-disclaimer" style={{ marginTop: 0 }}>
            Aşağıdaki belge yazdırılabilir. Telefonda ve bilgisayarda yazdırma penceresinde
            &quot;PDF olarak kaydet&quot; seçeneği çıkar; ek bir uygulamaya gerek yoktur.
          </p>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={() => window.print()}>
              Yazdır / PDF Kaydet
            </button>
            <Link className="favorite-button" to="/yerinde-kontrol">
              Eksik Adımları Tamamla
            </Link>
          </div>
          <p className="market-disclaimer">
            Tamamlanan adım: {progress.doneCount}/{progress.totalCount}. Eksik adımlar raporda
            &quot;yapılmadı&quot; olarak görünür; bu bilinçlidir — yapılmamış bir kontrolün
            raporda hiç görünmemesi, yapılmış gibi algılanmasına yol açar.
          </p>
        </section>

        {/* ==================== YAZDIRILAN BELGE ==================== */}
        <article className="print-report">
          <header className="report-head">
            <div>
              <h1>Araç İnceleme Raporu</h1>
              <p className="report-vehicle">{label}</p>
            </div>
            <div className="report-meta">
              <span>{printedAt}</span>
              <span>Araç Dedektifi</span>
            </div>
          </header>

          <section className="report-section">
            <h2>1. Araç Künyesi</h2>
            <Row label="Marka / Model" value={[vehicle.brand, vehicle.model].filter(Boolean).join(' ')} />
            <Row label="Model yılı" value={vehicle.year} />
            <Row label="Kilometre" value={vehicle.km ? formatKm(vehicle.km) : null} />
            <Row label="Motor" value={vehicle.engine} />
            <Row label="Yakıt" value={vehicle.fuelType} />
            <Row label="Şanzıman" value={vehicle.transmission} />
            <Row label="İlan fiyatı" value={vehicle.price ? formatPrice(vehicle.price) : null} />
          </section>

          {analysis && (
            <section className="report-section">
              <h2>2. Genel Değerlendirme</h2>
              <Row label="Risk skoru" value={`${analysis.score}/100 — ${analysis.band.label}`} />
              {decision && <Row label="Karar" value={decision.title} />}
              {decision && <p className="report-note">{decision.description}</p>}
              {analysis.dataQuality && (
                <Row label="Veri tamlığı" value={`%${analysis.dataQuality.completeness}`} />
              )}
            </section>
          )}

          {market && (
            <section className="report-section">
              <h2>3. Fiyat Karşılaştırması</h2>
              <Row label="İlan fiyatı" value={formatPrice(market.listedPrice)} />
              <Row
                label={market.confidence === 'Düşük' ? 'Referans fiyat göstergesi' : 'Tahmini piyasa değeri'}
                value={formatPrice(market.estimatedPrice)}
              />
              <Row label="Veri güveni" value={market.confidence || 'Bilinmiyor'} />
              <Row label="Fark" value={`${market.diffAmount >= 0 ? '+' : ''}${market.diffPercent}% — ${market.label}`} />
              <p className="report-note">
                {market.limitations ||
                  `Bu tutar gerçek zamanlı ilan verisi değildir; referanslar ${market.baseline} piyasasına göredir.`}
              </p>
            </section>
          )}

          {(catalog.engine || catalog.transmission) && (
            <section className="report-section">
              <h2>4. Motor ve Şanzıman</h2>
              {catalog.engine && (
                <>
                  <Row label="Motor ailesi" value={`${catalog.engine.name} (${catalog.engine.family})`} />
                  <Row label="Motor kodu" value={catalog.engine.codes.join(', ')} />
                  <Row label="Güç" value={catalog.engine.power} />
                  <Row label="Triger" value={catalog.engine.maintenance?.timing} />
                  <ul className="report-list">
                    {catalog.engine.problems.map((p) => (
                      <li key={p.title}>
                        <strong>{p.title}</strong> — {p.risk} risk, {p.cost}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {catalog.transmission && (
                <>
                  <Row
                    label="Şanzıman"
                    value={
                      (catalog.transmissionConfidence === 'tahmin' ? 'Muhtemelen ' : '') +
                      catalog.transmission.name
                    }
                  />
                  <ul className="report-list">
                    {catalog.transmission.problems.map((p) => (
                      <li key={p.title}>
                        <strong>{p.title}</strong> — {p.risk} risk, {p.cost}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {catalog.generation && (
            <section className="report-section">
              <h2>4b. Nesil</h2>
              <Row label="Nesil" value={catalog.generation.code} />
              <Row label="Üretim yılları" value={catalog.generation.years} />
              <Row label="Makyaj durumu" value={catalog.facelift?.label} />
              {catalog.generation.note && <p className="report-note">{catalog.generation.note}</p>}
            </section>
          )}

          {catalog.package && (
            <section className="report-section">
              <h2>4c. Donanım Paketi — {catalog.package.name}</h2>
              <ul className="report-list">
                {catalog.package.includesDetail.flatMap((g) => g.items).map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
              {catalog.package.optionalDetail.length > 0 && (
                <p className="report-note">
                  Opsiyonel olabilir:{' '}
                  {catalog.package.optionalDetail.map((i) => i.label).join(', ')}. Araçta
                  gerçekten olduğu görülmeden fiyata dahil edilmemeli.
                </p>
              )}
              <p className="report-note">
                Paket içerikleri yıla ve pazara göre değişebilir; kesin donanım beyanı değildir.
              </p>
            </section>
          )}

          {catalog.maintenance?.items.length > 0 && (
            <section className="report-section">
              <h2>4d. Yaklaşan Bakım Kalemleri</h2>
              <ul className="report-list">
                {catalog.maintenance.items.map((item) => (
                  <li key={item.id}>
                    <strong>{item.label}</strong> — {formatPrice(item.min)} – {formatPrice(item.max)} ({item.reason})
                  </li>
                ))}
              </ul>
              <Row
                label="Toplam (yapılmadıysa)"
                value={`${formatPrice(catalog.maintenance.total.min)} – ${formatPrice(catalog.maintenance.total.max)}`}
              />
              <p className="report-note">
                Bu toplam kesin ödenecek para değildir; satıcı bir kısmını yaptırmış olabilir.
                Listenin işlevi, hangi kalemler için fatura isteneceğini göstermektir.
              </p>
            </section>
          )}

          {analysis && analysis.knownProblems.length > 0 && (
            <section className="report-section">
              <h2>5. Bu Araçta Bilinen Kronik Sorunlar</h2>
              <ul className="report-list">
                {analysis.knownProblems.map((p) => (
                  <li key={p.title}>
                    <strong>{p.title}</strong> — {p.risk} risk
                    {p.checkKm ? `, kontrol ${p.checkKm} km` : ''}
                    {p.estimatedCost ? `, ${p.estimatedCost}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="report-section">
            <h2>6. Yerinde Kontrol Bulguları</h2>
            {/* Yapılmayan adım gizlenmez, "yapılmadı" yazar. */}
            <div className="report-steps">
              {progress.steps.map((step) => (
                <div className="report-row" key={step.id}>
                  <span>{step.label}</span>
                  <strong>{step.summary || 'Yapılmadı'}</strong>
                </div>
              ))}
            </div>
          </section>

          {paintCheck && (
            <section className="report-section">
              <h2>7. Boya / Değişen Fotoğraf Karşılaştırması</h2>
              <ul className="report-list">
                {paintCheck.results.map((r) => (
                  <li key={r.name}>
                    <strong>{r.name}</strong> — {r.verdict === 'orijinal' ? 'Belirgin fark yok' : r.verdict === 'yetersiz' ? 'Ölçülemedi' : r.verdict === 'supheli' ? 'Şüpheli' : 'Güçlü şüphe'}
                  </li>
                ))}
              </ul>
              <p className="report-note">
                Bu karşılaştırma boya kalınlığı ölçmez; panellerin renk ve doku olarak
                birbirinden ayrışıp ayrışmadığını gösterir. &quot;Fark bulunamadı&quot; sonucu
                boyasızlık garantisi değildir.
              </p>
            </section>
          )}

          {session.damage && (
            <section className="report-section">
              <h2>8. Hasar ve Değer Kaybı</h2>
              <Row label="Tahmini değer kaybı" value={`%${session.damage.lossPercent}`} />
            </section>
          )}

          {notes && (
            <section className="report-section">
              <h2>9. Notlar</h2>
              {notes.flaggedItems?.length > 0 && (
                <ul className="report-list">
                  {notes.flaggedItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {notes.notes && <p className="report-note">{notes.notes}</p>}
            </section>
          )}

          <section className="report-section report-disclaimer">
            <h2>Bu Rapor Hakkında</h2>
            <p>
              Bu belge <strong>resmî bir ekspertiz raporu değildir</strong> ve hukuki bir hüküm
              ifade etmez. İçindeki bulguların bir bölümü kullanıcının kendi girdiği verilere,
              bir bölümü ise genel araç bilgisine dayanır. Kronik sorun listesi, o motor
              ailesinde yaygın olarak bildirilen sorunları gösterir; bu araçta o sorunun
              bulunduğu anlamına gelmez.
            </p>
            <p>
              Satın alma kararından önce aracı yetkili bir ekspertiz kuruluşuna götürmek ve
              e-Devlet üzerinden hasar, rehin ve muayene kayıtlarını sorgulamak gerekir.
            </p>
          </section>
        </article>
      </PageContainer>
    </>
  )
}
