/**
 * Modern LED far ünitesi.
 *
 * Gece bir arabaya baktığında gövdeyi görmezsin — imza çizgisini (DRL) ve
 * projektörün küçük ama çok parlak çekirdeğini görürsün. Bu yüzden:
 *
 *   - Gövde neredeyse siyah ve çok düşük kontrastlıdır, karanlıkta kaybolur.
 *   - Parlama (glow) YALNIZCA ışıklı parçalara uygulanır. Tüm SVG'ye
 *     uygulanınca gövdenin dış hattı da parlıyor ve far "parlayan bir hap"
 *     gibi görünüyordu.
 *   - Baskın eleman iki yuvarlak mercek değil, keskin imza çizgisidir;
 *     iki eşit yuvarlak göz izlenimi veriyordu.
 */
export default function Headlight({ side = 'left', width = 132, className = '' }) {
  const classes = ['headlight', 'headlight-' + side, className].filter(Boolean).join(' ')
  const uid = 'hl-' + side

  return (
    <span className={classes} style={{ width }} aria-hidden="true">
      <svg viewBox="0 0 120 42" className="headlight-svg" role="presentation">
        <defs>
          <linearGradient id={uid + '-body'} x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0%" stopColor="#131b28" />
            <stop offset="55%" stopColor="#080d16" />
            <stop offset="100%" stopColor="#03050a" />
          </linearGradient>

          <radialGradient id={uid + '-lens'} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e8f2ff" />
            <stop offset="75%" stopColor="#a8ccff" />
            <stop offset="100%" stopColor="#4a76c0" />
          </radialGradient>

          <clipPath id={uid + '-clip'}>
            <path d="M2 27 C2 12 11 5 26 3.5 L102 0.8 C113 0.8 118 7 118 17 C118 30 110 39.5 97 40.5 L18 41.4 C8 41.4 2 36 2 27 Z" />
          </clipPath>
        </defs>

        {/* --- Gövde: karanlıkta kaybolur --- */}
        <path
          className="headlight-shell"
          d="M2 27 C2 12 11 5 26 3.5 L102 0.8 C113 0.8 118 7 118 17 C118 30 110 39.5 97 40.5 L18 41.4 C8 41.4 2 36 2 27 Z"
          fill={`url(#${uid}-body)`}
          stroke="rgba(110,140,185,0.16)"
          strokeWidth="0.7"
        />

        <g clipPath={`url(#${uid}-clip)`}>
          {/* Reflektör dokusu — ışık yokken bile hafif seçilir */}
          <path
            className="headlight-reflector"
            d="M9 36 C9 18 18 10 34 8.5 L106 5"
            fill="none"
            stroke="rgba(130,165,215,0.1)"
            strokeWidth="9"
          />

          {/*
            IŞIKLI PARÇALAR
            Parlama bu gruba uygulanır; gövde grubun dışında kalır.
          */}
          <g className="headlight-lit">
            {/* İmza çizgisi: farın gece görünen asıl karakteri */}
            <path
              className="headlight-drl"
              d="M8.5 30 C8.5 16 16 9.5 30 8 L108 4.2"
              fill="none"
              strokeLinecap="round"
              strokeWidth="3.4"
            />

            {/* Alt kenarda ikinci, ince imza */}
            <path
              className="headlight-drl headlight-drl-lower"
              d="M20 38.5 L96 36.2"
              fill="none"
              strokeLinecap="round"
              strokeWidth="1.4"
            />

            {/* Matris LED sırası — modern farların alt bandı */}
            <g className="headlight-matrix">
              <rect x="34" y="24" width="5" height="3.4" rx="1.2" />
              <rect x="42" y="23.6" width="5" height="3.4" rx="1.2" />
              <rect x="50" y="23.2" width="5" height="3.4" rx="1.2" />
              <rect x="58" y="22.8" width="5" height="3.4" rx="1.2" />
            </g>

            {/* Projektör: küçük ama en parlak nokta */}
            <circle className="headlight-core" cx="92" cy="20" r="7.6" fill={`url(#${uid}-lens)`} />
            <circle className="headlight-hotspot" cx="90.5" cy="18.5" r="2.6" fill="#ffffff" />
          </g>

          <circle
            className="headlight-core-ring"
            cx="92"
            cy="20"
            r="7.6"
            fill="none"
            strokeWidth="0.8"
          />

          {/* Cam yansıması */}
          <path
            d="M2 27 C2 12 11 5 26 3.5 L102 0.8 C113 0.8 118 7 118 17 L2 27 Z"
            fill="rgba(255,255,255,0.05)"
          />
        </g>
      </svg>
    </span>
  )
}
