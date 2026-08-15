import HeadlightLoader from './HeadlightLoader'
import QuotaNote, { useAccount } from './QuotaNote'

/**
 * Sunucu tabanlı detaylı değerlendirme için ortak kabuk.
 * Butona basılmadan istek atılmaz (kota korunur), yükleme ve hata durumlarını
 * tek yerde yönetir. İçerik her ekranda farklı olduğu için children ile verilir.
 *
 * Kalan analiz hakkı burada gösterilir: kullanıcı butona basmadan ÖNCE kaç
 * hakkı kaldığını bilmeli, "bittiğinde" öğrenmemeli.
 */
export default function AiPanel({
  title = 'Detaylı Değerlendirme',
  buttonLabel = 'Detaylı Değerlendirme Al',
  status,
  message,
  onRequest,
  children,
  hint
}) {
  const account = useAccount()
  const exhausted = account && account.remaining <= 0

  if (status === 'idle') {
    return (
      <section className="result-card ai-card">
        <div className="ai-head">
          <h3>{title}</h3>
          <span className="ai-tag">Otomatik değerlendirme</span>
        </div>
        {hint && <p className="market-disclaimer" style={{ marginTop: 0 }}>{hint}</p>}
        <QuotaNote account={account} style={{ marginTop: 0 }} />
        <button
          type="button"
          className="primary-button"
          style={{ width: '100%' }}
          onClick={onRequest}
          disabled={exhausted}
        >
          {exhausted ? 'Analiz hakkın doldu' : buttonLabel}
        </button>
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <section className="result-card ai-card">
        <HeadlightLoader label="Değerlendirme hazırlanıyor..." />
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="result-card ai-card">
        <div className="ai-head">
          <h3>{title}</h3>
        </div>
        <p className="market-disclaimer" style={{ marginTop: 0 }}>{message}</p>
        <QuotaNote account={account} style={{ marginTop: 0 }} />
        {!exhausted && (
          <button type="button" className="favorite-button" onClick={onRequest}>
            Tekrar Dene
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="result-card ai-card">
      <div className="ai-head">
        <h3>{title}</h3>
        <span className="ai-tag">Otomatik değerlendirme</span>
      </div>
      {children}
      <p className="market-disclaimer">
        Bu değerlendirme otomatik olarak üretilmiştir ve kesin bilgi yerine geçmez; kararını
        vermeden önce aracı bir ustaya/ekspertize gösterip doğrulat.
      </p>
      <QuotaNote account={account} style={{ marginTop: 0 }} />
    </section>
  )
}
