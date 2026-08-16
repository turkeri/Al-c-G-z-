import { useState } from 'react'
import { describePackage } from '../services/catalogService'

/**
 * DONANIM PAKETİ GEZGİNİ
 *
 * "2017 Audi A3 Dynamic pakette ne var?" sorusunun ekrandaki karşılığı.
 *
 * Katalogda o marka/model/yıl için kayıtlı paketleri seviye sırasına göre
 * listeler; bir pakete dokununca içindeki donanımı kategori kategori açar.
 *
 * ============================================================================
 * NEDEN "STANDART / OPSİYONEL / YOK" DİYE ÜÇE AYRILIYOR
 * ============================================================================
 * Alıcıyı yakan şey, ilanda yazan donanımın araçta çıkmamasıdır. Paket verisi
 * tek bir düz liste olarak gösterilirse kullanıcı hepsini "var" sanar. Oysa:
 *
 *   Standart  → o pakette fabrikadan gelir
 *   Opsiyonel → aynı pakette olabilir de olmayabilir de; ARAÇTA doğrulanmalı
 *   Yok       → alıcının sıkça beklediği ama bu pakette bulunmayan donanım
 *
 * Üçüncü liste özellikle önemlidir: "bu pakette geri görüş kamerası yoktur"
 * bilgisi, satıcının "var" demesine karşı kullanıcının elindeki tek dayanaktır.
 */
export default function PackageExplorer({ packages, activeName, title = 'Donanım Paketleri' }) {
  const [openKey, setOpenKey] = useState(null)

  if (!packages?.length) return null

  const keyFor = (pkg, index) => `${pkg.brand}-${pkg.model}-${pkg.years}-${pkg.name}-${index}`

  return (
    <section className="result-card">
      <h3>{title}</h3>

      <div className="package-list">
        {packages.map((pkg, index) => {
          const key = keyFor(pkg, index)
          const open = openKey === key
          const detail = open ? describePackage(pkg) : null
          const isActive =
            activeName && pkg.name.toLocaleLowerCase('tr') === String(activeName).toLocaleLowerCase('tr')

          return (
            <div className={`package-row${isActive ? ' is-active' : ''}`} key={key}>
              <button
                type="button"
                className="package-head"
                aria-expanded={open}
                onClick={() => setOpenKey(open ? null : key)}
              >
                <span className="package-name">
                  {pkg.name}
                  {isActive && <span className="package-active-tag">bu araç</span>}
                </span>
                <span className="package-meta">
                  {pkg.tier}
                  {pkg.bodyTypes?.length ? ` · ${pkg.bodyTypes.join(', ')}` : ''}
                  {pkg.years ? ` · ${pkg.years}` : ''}
                </span>
                <span className="package-caret" aria-hidden="true">
                  {open ? '−' : '+'}
                </span>
              </button>

              {open && detail && (
                <div className="package-body">
                  {detail.includesDetail.map((group) => (
                    <div className="package-group" key={group.id}>
                      <h4>{group.label}</h4>
                      <ul className="package-equipment">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <strong>{item.label}</strong>
                            <span>{item.checkHow}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {detail.optionalDetail.length > 0 && (
                    <div className="package-group">
                      <h4>Opsiyonel olabilir — araçta doğrula</h4>
                      <p className="package-inline">
                        {detail.optionalDetail.map((i) => i.label).join(', ')}
                      </p>
                    </div>
                  )}

                  {detail.excludesDetail.length > 0 && (
                    <div className="package-group">
                      <h4>Bu pakette yok</h4>
                      <p className="package-inline">
                        {detail.excludesDetail.map((i) => i.label).join(', ')}
                      </p>
                    </div>
                  )}

                  {detail.extras?.length > 0 && (
                    <div className="package-group">
                      <h4>Pakete özel</h4>
                      <p className="package-inline">{detail.extras.join(' · ')}</p>
                    </div>
                  )}

                  <p className="market-disclaimer">
                    {detail.confidence === 'dogrulanmis'
                      ? 'Bu paket Türkiye’de büyük ölçüde tek bir donanım listesiyle satıldı; yine de araç başında doğrula.'
                      : 'Bu markada aynı paket araçtan araca değişebilir — satışta tek tek opsiyon işaretlenmiştir. Listeyi kesin kabul etme, araçta doğrula.'}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
