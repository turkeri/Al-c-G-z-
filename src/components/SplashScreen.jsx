import { useEffect, useState } from 'react'
import Headlight from './Headlight'

/**
 * Açılış ekranı.
 *
 * Sağ ve sol ön far sırayla selektör yapar, ardından ikisi birden güçlü yanar
 * ve ekran açılır. Toplam süre yaklaşık 3.6 saniyedir; kullanıcı ekrana
 * dokunarak atlayabilir (her açılışta beklemek istemeyenler için).
 */
const TOTAL_MS = 3600
const FADE_MS = 520

export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const closeTimer = setTimeout(() => setLeaving(true), TOTAL_MS - FADE_MS)
    const doneTimer = setTimeout(onDone, TOTAL_MS)
    return () => {
      clearTimeout(closeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  function skip() {
    setLeaving(true)
    setTimeout(onDone, 240)
  }

  return (
    <div
      className={'splash' + (leaving ? ' splash-leaving' : '')}
      onClick={skip}
      role="presentation"
    >
      <div className="splash-road" />
      <div className="splash-lights">
        <Headlight side="left" width={128} className="splash-headlight splash-headlight-left" />
        <Headlight side="right" width={128} className="splash-headlight splash-headlight-right" />
      </div>
      <div className="splash-brand">
        <span className="splash-brand-name">ARAÇ DEDEKTİFİ</span>
        <span className="splash-brand-tagline">Almadan önce gör.</span>
      </div>
    </div>
  )
}
