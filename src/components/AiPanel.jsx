/**
 * Sunucu tabanlı detaylı değerlendirme için ortak kabuk.
 * Butona basılmadan istek atılmaz (kota korunur), yükleme ve hata durumlarını
 * tek yerde yönetir. İçerik her ekranda farklı olduğu için children ile verilir.
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
  if (status === 'idle') {
    return (
      <section className="result-card ai-card">
        <div className="ai-head">
          <h3>{title}</h3>
          <span className="ai-tag">Otomatik değerlendirme</span>
        </div>
        {hint && <p className="market-disclaimer" style={{ marginTop: 0 }}>{hint}</p>}
        <button type="button" className="primary-button" style={{ width: '100%' }} onClick={onRequest}>
          {buttonLabel}
        </button>
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <section className="result-card ai-card">
        <div className="ai-loading">
          <span className="ai-spinner" aria-hidden="true" />
          <span>Değerlendirme hazırlanıyor...</span>
        </div>
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
        <button type="button" className="favorite-button" onClick={onRequest}>
          Tekrar Dene
        </button>
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
    </section>
  )
}
