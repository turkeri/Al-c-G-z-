/**
 * `describePackageWithCatalog`'un çözdüğü TEK, kesin paketi gösterir.
 *
 * `PackageExplorer`'dan farkı: PackageExplorer bir modelin OLASI paketlerini
 * gezip seçmeye yarar (hangi pakette ne var, henüz bilinmiyorsa). Bu bileşen
 * ise aracın canonical varyantından zaten ÇÖZÜLMÜŞ tek paketi gösterir —
 * seçilecek bir liste değil, doğrulanmış tek sonuçtur.
 */
export default function CanonicalPackageCard({ detail }) {
  if (!detail || detail.source !== 'canonical') return null

  return (
    <section className="result-card">
      <div className="market-row">
        <h3 style={{ margin: 0 }}>{detail.name || 'Donanım Paketi'}</h3>
        <span className="market-label tone-normal">Yayınlanmış katalog</span>
      </div>

      {detail.includesDetail.map((group) => (
        <div className="package-group" key={group.id}>
          <h4>{group.label}</h4>
          <p className="package-inline">{group.items.map((i) => i.label).join(', ')}</p>
        </div>
      ))}

      {detail.optionalDetail.length > 0 && (
        <div className="package-group">
          <h4>Opsiyonel olabilir — araçta doğrula</h4>
          <p className="package-inline">{detail.optionalDetail.map((i) => i.label).join(', ')}</p>
        </div>
      )}

      {detail.unknownDetail?.length > 0 && (
        <div className="package-group">
          <h4>Belirsiz — kayıtta ne var ne yok bilgisi yok</h4>
          <p className="package-inline">{detail.unknownDetail.map((i) => i.label).join(', ')}</p>
        </div>
      )}

      {detail.excludesDetail.length > 0 && (
        <div className="package-group">
          <h4>Bu pakette yok</h4>
          <p className="package-inline">{detail.excludesDetail.map((i) => i.label).join(', ')}</p>
        </div>
      )}

      <p className="market-disclaimer">
        Aracın canonical katalog kaydına bağlı, doğrulanmış paket bilgisi. Yine de araç başında kontrol et.
      </p>
    </section>
  )
}
