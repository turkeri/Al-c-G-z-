/**
 * Modern LED far görseli.
 *
 * Tek bir SVG'den hem açılış ekranındaki selektör animasyonu hem de uygulama
 * genelindeki yükleniyor göstergesi üretilir. Parlaklık tamamen CSS ile
 * sürülür (opacity + filter), böylece animasyonlar GPU üzerinde akıcı çalışır.
 */
export default function Headlight({ side = 'left', width = 132, className = '' }) {
  const classes = ['headlight', 'headlight-' + side, className].filter(Boolean).join(' ')

  return (
    <span className={classes} style={{ width }} aria-hidden="true">
      <span className="headlight-beam" />
      <svg viewBox="0 0 72 32" className="headlight-svg" role="presentation">
        <defs>
          <linearGradient id={'hl-lens-' + side} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1b2434" />
            <stop offset="55%" stopColor="#0d1420" />
            <stop offset="100%" stopColor="#05080e" />
          </linearGradient>
          <radialGradient id={'hl-core-' + side} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#7aa8ff" />
          </radialGradient>
        </defs>

        {/* Far gövdesi */}
        <path
          className="headlight-shell"
          d="M5 21 C5 10 11 5 23 4 L55 2 C64 2 69 7 69 15 C69 24 64 29 55 29 L19 29 C10 29 5 26 5 21 Z"
          fill={'url(#hl-lens-' + side + ')'}
          stroke="rgba(148, 175, 220, 0.35)"
          strokeWidth="1"
        />

        {/* Gündüz farı çizgisi (DRL) */}
        <path
          className="headlight-drl"
          d="M12 22 C12 13 17 9 27 8 L57 6.5"
          fill="none"
          strokeLinecap="round"
          strokeWidth="3.4"
        />

        {/* Projektör mercek */}
        <circle className="headlight-core" cx="52" cy="17" r="7.4" fill={'url(#hl-core-' + side + ')'} />
        <circle className="headlight-core-ring" cx="52" cy="17" r="7.4" fill="none" strokeWidth="1.2" />

        {/* Yardımcı mercek */}
        <circle className="headlight-core headlight-core-small" cx="33" cy="19.5" r="4.2" fill={'url(#hl-core-' + side + ')'} />
      </svg>
    </span>
  )
}
