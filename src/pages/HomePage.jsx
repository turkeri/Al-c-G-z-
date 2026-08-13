import { useMemo } from 'react'
import PageContainer from '../components/Layout/PageContainer'
import VehicleCard from '../components/VehicleCard'
import { getDatabaseStats } from '../services/vehicleService'

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
          <VehicleCard
            to="/analiz"
            title="Araç Analizi"
            description="Bilgileri gir, risk skorunu ve detaylı raporu gör."
            badge="Başla"
          />
          <VehicleCard
            to="/kronik-sorunlar"
            title="Kronik Sorunlar"
            description="Marka ve modele göre bilinen arıza kayıtlarını incele."
          />
          <VehicleCard
            to="/kontrol-listesi"
            title="Ekspertiz Kontrol Listesi"
            description="Motor, şanzıman, kaporta ve elektronik kontrol maddeleri."
          />
          <VehicleCard
            to="/favoriler"
            title="Favoriler"
            description="Analiz ettiğin araçları kaydet, sonra karşılaştır."
          />
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
