import { useMemo } from 'react'
import PageContainer from '../components/Layout/PageContainer'
import VehicleCard from '../components/VehicleCard'
import { getDatabaseStats } from '../services/vehicleService'

const CARDS = [
  {
    to: '/analiz',
    title: 'Araç Analizi',
    description: 'Bilgileri gir, risk skorunu ve detaylı raporu gör.',
    badge: 'Başla',
    icon: 'car',
    accent: '#3454d1'
  },
  {
    to: '/aracimin-nesi-var',
    title: 'Aracımın Nesi Var?',
    description: 'Şikayetini yaz, olası arızaları ve çözümlerini sırala.',
    icon: 'stethoscope',
    accent: '#b91c1c'
  },
  {
    to: '/arac-karsilastir',
    title: 'Araç Karşılaştır',
    description: 'İki marka/modeli fiyat ve artı/eksi yönleriyle yan yana kıyasla.',
    icon: 'gauge',
    accent: '#0891b2'
  },
  {
    to: '/kronik-sorunlar',
    title: 'Kronik Sorunlar',
    description: 'Marka ve modele göre bilinen arıza kayıtlarını incele.',
    icon: 'wrench',
    accent: '#e0724d'
  },
  {
    to: '/kontrol-listesi',
    title: 'Ekspertiz Kontrol Listesi',
    description: 'Motor, şanzıman, kaporta ve elektronik kontrol maddeleri.',
    icon: 'clipboard',
    accent: '#1fa971'
  },
  {
    to: '/favoriler',
    title: 'Favoriler',
    description: 'Analiz ettiğin araçları kaydet, sonra karşılaştır.',
    icon: 'heart',
    accent: '#d9447a'
  },
  {
    to: '/kredi-hesapla',
    title: 'Kredi Hesaplayıcı',
    description: 'Peşinat ve vadeye göre tahmini aylık ödemeyi hesapla.',
    icon: 'calculator',
    accent: '#7c5cf0'
  },
  {
    to: '/ekspertiz-notlari',
    title: 'Ekspertiz Notları',
    description: 'Kontrol ettiğin kalemleri işaretle, bulguları kaydet.',
    icon: 'note',
    accent: '#17a2b8'
  },
  {
    to: '/boya-degisen',
    title: 'Boya / Değişen Kontrolü',
    description: 'Panel panel fotoğraf çek, sistem birbiriyle kıyaslasın.',
    icon: 'paint',
    accent: '#c2410c'
  }
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
            <span className="info-strip-label">Motor varyantı</span>
          </div>
        </section>
      </PageContainer>
    </>
  )
}
