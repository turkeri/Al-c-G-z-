import { useMemo } from 'react'
import PageContainer from '../components/Layout/PageContainer'
import VehicleCard from '../components/VehicleCard'
import { getDatabaseStats } from '../services/vehicleService'

/**
 * Ana ekran kareleri.
 *
 * Her özellik burada listelenmez; kullanıcının en sık başlattığı sekiz iş
 * gösterilir. Geri kalanı ait olduğu bölümün (Yerinde Kontrol, Rehber, Garaj)
 * içinde durur, böylece ana ekran uzayıp gitmez.
 */
const CARDS = [
  {
    to: '/analiz',
    title: 'Araç Analizi',
    description: 'Bilgileri gir, risk skorunu ve raporu gör.',
    badge: 'BAŞLA',
    icon: 'car',
    accent: '#3454d1',
    art: 'gauge'
  },
  {
    to: '/ilan-analizi',
    title: 'İlan Analizi',
    description: 'İlan metnini yapıştır, tuzakları gör.',
    badge: 'YENİ',
    icon: 'search',
    accent: '#7c3aed',
    art: 'panels'
  },
  {
    to: '/yerinde-kontrol',
    title: 'Yerinde Kontrol',
    description: 'Aracın başındayken adım adım ilerle.',
    icon: 'clipboard',
    accent: '#1fa971',
    art: 'checklist'
  },
  {
    to: '/aracimin-nesi-var',
    title: 'Aracımın Nesi Var?',
    description: 'Şikayetini yaz, olası arızaları gör.',
    icon: 'stethoscope',
    accent: '#b91c1c',
    art: 'pulse'
  },
  {
    to: '/tramer',
    title: 'Hasar ve Değer Kaybı',
    description: 'Tramer tutarını gir, pazarlık payını hesapla.',
    icon: 'crash',
    accent: '#c2410c',
    art: 'impact'
  },
  {
    to: '/maliyet',
    title: 'Sahip Olma Maliyeti',
    description: 'Bu araç bana yılda ne yakar?',
    icon: 'wallet',
    accent: '#15803d',
    art: 'bars'
  },
  {
    to: '/arac-karsilastir',
    title: 'Araç Karşılaştır',
    description: 'İki modeli yan yana kıyasla.',
    icon: 'gauge',
    accent: '#0891b2',
    art: 'compare'
  },
  {
    to: '/kronik-sorunlar',
    title: 'Kronik Sorunlar',
    description: 'Modele göre bilinen arıza kayıtları.',
    icon: 'wrench',
    accent: '#e0724d',
    art: 'gear'
  },
]

export default function HomePage() {
  const stats = useMemo(() => getDatabaseStats(), [])

  return (
    <>
      <header className="hero">
        <div className="hero-badge">ARAÇ DEDEKTİFİ</div>
        <h1 className="hero-title">Aracı almadan önce riskleri öğren.</h1>
        <p className="hero-subtitle">
          Marka, model, motor ve kilometre bilgilerine göre ikinci el aracın risk skorunu,
          kronik sorunlarını ve ekspertiz kontrol noktalarını saniyeler içinde öğren.
        </p>
      </header>

      <PageContainer>
        <div className="card-grid">
          {CARDS.map((card, index) => (
            <div
              className="card-grid-item"
              key={card.to}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <VehicleCard {...card} />
            </div>
          ))}
        </div>

        <section className="info-strip">
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.brandCount}</span>
            <span className="info-strip-label">Marka</span>
          </div>
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.modelCount}</span>
            <span className="info-strip-label">Model</span>
          </div>
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.engineCount}</span>
            <span className="info-strip-label">Motor kaydı</span>
          </div>
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.problemCount}</span>
            <span className="info-strip-label">Arıza kaydı</span>
          </div>
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.generationCount}</span>
            <span className="info-strip-label">Nesil tanımı</span>
          </div>
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.transmissionCount}</span>
            <span className="info-strip-label">Şanzıman tanımı</span>
          </div>
        </section>
      </PageContainer>
    </>
  )
}
