import { useEffect, useRef, useState } from 'react'
import Headlight from './Headlight'

/**
 * Açılış ekranı — gece sahnesi.
 *
 * Gerçek bir arabanın gece farı, "parlayan bir şekil" değildir. Onu gerçek
 * yapan şey farın kendisi değil ÇEVRESİDİR:
 *
 *   - Ortam neredeyse tamamen karanlıktır; tek ışık kaynağı farlardır.
 *   - Işık havada saçılır, hüzme koni olarak görünür (volumetrik).
 *   - Hüzme yola vurur ve önde uzayan bir aydınlık havuz oluşturur.
 *   - Mercek küçük ama çok parlaktır; etrafına bloom ve yatay parlama çizgisi
 *     yayar (kameranın da gözün de yaptığı şey).
 *   - Aracın gövdesi görünmez, sadece ışığın kenarını yakalayan bir siluet kalır.
 *
 * Bu yüzden sahne katman katman kurulur: yol, hüzme konileri, yer havuzları,
 * far üniteleri, parlama ve pus. Selektör anında bunların HEPSİ birden yanar;
 * tek başına farın opaklığını değiştirmek yapay durur.
 *
 * `showAuthChoice` true ise (yapılandırılmış Supabase, oturum yok, kullanıcı
 * daha önce bu seçimi geçmemiş) far animasyonu bitince sahne KAPANMAZ — aynı
 * gece sahnesi üzerinde Google girişi / hesapsız devam seçimi belirir. Seçim
 * yapılana kadar `onDone` çağrılmaz.
 */
const TOTAL_MS = 3900
const FADE_MS = 560

export default function SplashScreen({ onDone, showAuthChoice = false, onGoogleSignIn, onContinueWithoutAccount }) {
  const [leaving, setLeaving] = useState(false)
  const [choiceVisible, setChoiceVisible] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  // Animasyon 3.9sn sürüyor; auth durumu (Supabase oturum kontrolü) bu süre
  // içinde herhangi bir anda çözülebilir. Zamanlayıcı geç tetiklendiğinde en
  // GÜNCEL değeri okusun diye prop yerine ref üzerinden okunur — aksi halde
  // mount anındaki (henüz `loading` durumundaki) bayat değer kullanılırdı.
  const showAuthChoiceRef = useRef(showAuthChoice)
  showAuthChoiceRef.current = showAuthChoice

  useEffect(() => {
    const settleTimer = setTimeout(() => {
      if (showAuthChoiceRef.current) setChoiceVisible(true)
      else {
        setLeaving(true)
        setTimeout(onDone, FADE_MS)
      }
    }, TOTAL_MS - FADE_MS)
    return () => clearTimeout(settleTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function skipAnimation() {
    if (choiceVisible || leaving) return
    if (showAuthChoiceRef.current) setChoiceVisible(true)
    else {
      setLeaving(true)
      setTimeout(onDone, 240)
    }
  }

  function finish(callback) {
    setLeaving(true)
    setTimeout(() => {
      callback?.()
      onDone()
    }, FADE_MS)
  }

  async function handleGoogle() {
    setGoogleBusy(true)
    try {
      await onGoogleSignIn()
      // Başarılıysa tarayıcı Google'a yönlenir; sayfa zaten terk ediliyor.
    } catch {
      setGoogleBusy(false)
    }
  }

  return (
    <div
      className={'splash' + (leaving ? ' splash-leaving' : '') + (choiceVisible ? ' splash-choice-active' : '')}
      onClick={skipAnimation}
      role="presentation"
    >
      <div className="splash-scene">
        {/* Zemin: perspektifle uzaklaşan asfalt */}
        <div className="splash-road" aria-hidden="true">
          <div className="splash-road-surface" />
        </div>

        {/* Havadaki pus — hüzmenin görünmesini sağlayan şey budur */}
        <div className="splash-haze" aria-hidden="true" />

        {/* Volumetrik hüzme konileri */}
        <div className="splash-beam splash-beam-left" aria-hidden="true" />
        <div className="splash-beam splash-beam-right" aria-hidden="true" />

        {/* Işığın yola vurduğu havuzlar (Avrupa kısa hüzmesi gibi asimetrik) */}
        <div className="splash-pool splash-pool-left" aria-hidden="true" />
        <div className="splash-pool splash-pool-right" aria-hidden="true" />

        {/* Islak asfaltta farın dikey yansıması */}
        <div className="splash-reflection splash-reflection-left" aria-hidden="true" />
        <div className="splash-reflection splash-reflection-right" aria-hidden="true" />

        {/* Aracın ön siluetı: ızgara ve kaput kenarı, sadece ima */}
        <div className="splash-body" aria-hidden="true" />

        <div className="splash-lights">
          <span className="splash-unit splash-unit-left">
            <Headlight side="left" width={150} className="splash-headlight splash-headlight-left" />
            <span className="splash-glare splash-glare-left" />
          </span>
          <span className="splash-unit splash-unit-right">
            <Headlight side="right" width={150} className="splash-headlight splash-headlight-right" />
            <span className="splash-glare splash-glare-right" />
          </span>
        </div>
      </div>

      <div className="splash-brand">
        <span className="splash-brand-name">ARAÇ DEDEKTİFİ</span>
        <span className="splash-brand-tagline">Almadan önce gör.</span>
      </div>

      {choiceVisible && (
        <div className="splash-auth-choice" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="splash-auth-google"
            onClick={handleGoogle}
            disabled={googleBusy}
          >
            {googleBusy ? 'Yönlendiriliyor…' : 'Google ile devam et'}
          </button>
          <button
            type="button"
            className="splash-auth-skip"
            onClick={() => finish(onContinueWithoutAccount)}
            disabled={googleBusy}
          >
            Hesap oluşturmadan devam et
          </button>
          <p className="splash-auth-hint">
            Hesabınla ileride analizlerini cihazlar arasında taşıyabilirsin.
          </p>
        </div>
      )}

      <div className="splash-vignette" aria-hidden="true" />
    </div>
  )
}
