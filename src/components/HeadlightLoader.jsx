import Headlight from './Headlight'

/**
 * Uygulama geneli yükleniyor göstergesi.
 *
 * Far yavaştan yanıp söner; işlem bitince (done) tek seferlik güçlü bir
 * parlama yapar. Böylece "hazırlanıyor" ve "hazır" durumları birbirinden
 * bakışta ayrılır.
 */
export default function HeadlightLoader({ label = 'Hazırlanıyor...', done = false, width = 112 }) {
  return (
    <div className={'headlight-loader' + (done ? ' is-done' : '')}>
      <Headlight side="right" width={width} className="headlight-pulse" />
      {label && <span className="headlight-loader-label">{label}</span>}
    </div>
  )
}
