/**
 * Menü kartlarının arka plan çizimleri.
 *
 * Kartlar bembeyaz ve boş duruyordu. Her karta rastgele bir süs koymak yerine
 * kartın İŞİYLE İLGİLİ bir çizim konur: maliyet kartında sütun grafiği, hasar
 * kartında darbe almış panel, boya kartında panel dizisi. Böylece süsleme aynı
 * zamanda kartın ne yaptığını anlatır.
 *
 * Çizimler kartın vurgu rengini (currentColor) miras alır ve düşük opaklıkta,
 * sağ altta durur; başlık ve açıklamayı okumayı zorlaştırmaz.
 */

const ART = {
  /* Araç analizi: hız göstergesi kadranı */
  gauge: (
    <>
      <path d="M12 74 A44 44 0 0 1 100 74" fill="none" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 74 A32 32 0 0 1 88 74" fill="none" strokeWidth="2" strokeDasharray="3 7" opacity="0.6" />
      <path d="M56 74 L80 46" strokeWidth="4" strokeLinecap="round" />
      <circle cx="56" cy="74" r="6" />
    </>
  ),

  /* Yerinde kontrol: işaretlenmiş liste */
  checklist: (
    <>
      <rect x="16" y="12" width="72" height="80" rx="8" fill="none" strokeWidth="4" />
      <path d="m28 34 6 6 12-13" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m28 58 6 6 12-13" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 36h20M56 60h20M28 80h48" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
    </>
  ),

  /* Teşhis: motor titreşimi / sinyal dalgası */
  pulse: (
    <>
      <path
        d="M4 60 h18 l8-26 10 46 9-30 8 16 7-10 h30"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="34" r="3.5" opacity="0.7" />
      <circle cx="49" cy="50" r="3.5" opacity="0.7" />
    </>
  ),

  /* Hasar: darbe almış panel */
  impact: (
    <>
      <path d="M14 76 C14 44 34 22 62 18 L98 14" fill="none" strokeWidth="5" strokeLinecap="round" />
      <path d="M44 30 l-9 20 16 4-11 22" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 24 l6 12M78 22 l9 8M56 66 l4 14" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </>
  ),

  /* Maliyet: yıllık gider sütunları */
  bars: (
    <>
      <rect x="12" y="60" width="14" height="32" rx="3" />
      <rect x="34" y="44" width="14" height="48" rx="3" opacity="0.82" />
      <rect x="56" y="26" width="14" height="66" rx="3" opacity="0.64" />
      <rect x="78" y="52" width="14" height="40" rx="3" opacity="0.46" />
      <path d="M8 20 L30 34 L52 16 L96 30" fill="none" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
    </>
  ),

  /* Karşılaştırma: iki araç yan yana */
  compare: (
    <>
      <rect x="8" y="22" width="40" height="58" rx="8" fill="none" strokeWidth="4" />
      <rect x="60" y="22" width="40" height="58" rx="8" fill="none" strokeWidth="4" opacity="0.55" />
      <path d="M16 44h24M16 58h16" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M68 44h24M68 58h16" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
      <path d="M50 46l4 5-4 5" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </>
  ),

  /* Kronik sorunlar: dişli ve anahtar */
  gear: (
    <>
      <circle cx="46" cy="52" r="22" fill="none" strokeWidth="5" />
      <circle cx="46" cy="52" r="8" fill="none" strokeWidth="4" />
      <path
        d="M46 22v-9M46 91v-9M76 52h9M7 52h9M67 31l6-6M19 79l6-6M67 73l6 6M19 25l6 6"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d="M84 18a9 9 0 0 0-12 11l-14 14 6 6 14-14a9 9 0 0 0 11-12l-6 7-5-5 6-7Z" opacity="0.45" />
    </>
  ),

  /* Güvenli alım: kalkan ve onay */
  shield: (
    <>
      <path
        d="M54 8 22 19v29c0 22 13 37 32 44 19-7 32-22 32-44V19L54 8Z"
        fill="none"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="m40 50 10 11 22-24" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* Arıza kodu: fiş ve kod satırları */
  plug: (
    <>
      <path d="M34 12v18M62 12v18" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 30h52v14a26 26 0 0 1-52 0V30Z" fill="none" strokeWidth="5" strokeLinejoin="round" />
      <path d="M48 70v20" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 84h16M60 84h20M32 94h44" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
    </>
  ),

  /* Boya kontrolü: panel dizisi, biri işaretli */
  panels: (
    <>
      <rect x="8" y="26" width="26" height="34" rx="4" fill="none" strokeWidth="4" opacity="0.5" />
      <rect x="40" y="22" width="26" height="42" rx="4" fill="none" strokeWidth="4.5" />
      <rect x="72" y="26" width="26" height="34" rx="4" fill="none" strokeWidth="4" opacity="0.5" />
      <path d="M46 40h14M46 50h9" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="53" cy="78" r="7" fill="none" strokeWidth="4" />
      <path d="M53 71v-5" strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  /* Mikron: ölçüm cetveli */
  ruler: (
    <>
      <rect x="6" y="34" width="94" height="34" rx="5" fill="none" strokeWidth="4.5" />
      <path d="M22 34v13M38 34v20M54 34v13M70 34v20M86 34v13" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M6 82h94" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" opacity="0.5" />
    </>
  ),

  /* Garaj: kepenkli garaj */
  garage: (
    <>
      <path d="M10 46 54 16l44 30v48H10V46Z" fill="none" strokeWidth="5" strokeLinejoin="round" />
      <path d="M26 94V60h56v34" fill="none" strokeWidth="4" />
      <path d="M26 70h56M26 80h56" strokeWidth="3.5" opacity="0.6" />
    </>
  ),

  /* Satıcı soruları: konuşma balonları */
  chat: (
    <>
      <path d="M8 20h58a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H32L14 76V62H8a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Z" fill="none" strokeWidth="4.5" strokeLinejoin="round" transform="translate(6 0)" />
      <path d="M26 36h30M26 48h18" strokeWidth="3.5" strokeLinecap="round" />
    </>
  )
}

export default function CardArt({ name }) {
  const content = ART[name]
  if (!content) return null
  return (
    <svg
      className="card-art"
      viewBox="0 0 108 104"
      fill="currentColor"
      stroke="currentColor"
      aria-hidden="true"
    >
      {content}
    </svg>
  )
}
