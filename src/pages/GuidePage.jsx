import { useMemo } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import VehicleCard from '../components/VehicleCard'
import { getDatabaseStats } from '../services/catalogAdapter'
import { getAllCodes } from '../services/obdService'

const CARDS = [
  {
    to: '/kronik-sorunlar',
    title: 'Kronik Sorunlar',
    description: 'Marka, model ve motora göre bilinen arıza kayıtları.',
    icon: 'wrench',
    accent: '#e0724d',
    art: 'gear'
  },
  {
    to: '/aracimin-nesi-var',
    title: 'Aracımın Nesi Var?',
    description: 'Şikayetini yaz, olası arızaları ve çözümlerini sırala.',
    icon: 'stethoscope',
    accent: '#b91c1c',
    art: 'pulse'
  },
  {
    to: '/arac-karsilastir',
    title: 'Araç Karşılaştır',
    description: 'İki modeli fiyat, donanım ve artı/eksi yönleriyle kıyasla.',
    icon: 'gauge',
    accent: '#0891b2',
    art: 'compare'
  },
  {
    to: '/obd',
    title: 'Arıza Kodu Sözlüğü',
    description: 'Cihazdan okuduğun kodun anlamı, çözümü ve maliyeti.',
    icon: 'plug',
    accent: '#7c5cf0',
    art: 'plug'
  },
  {
    to: '/maliyet',
    title: 'Sahip Olma Maliyeti',
    description: 'Yakıt, vergi, sigorta, bakım ve arıza riski dahil yıllık gider.',
    icon: 'wallet',
    accent: '#15803d',
    art: 'bars'
  },
  {
    to: '/guvenli-alim',
    title: 'Güvenli Alım',
    description: 'Evrak, kapora, kilometre ve dolandırıcılık kontrol listesi.',
    icon: 'shield',
    accent: '#b45309',
    art: 'shield'
  }
]

/**
 * Araç Rehberi.
 *
 * Belirli bir araca bakmadan önce bilgi toplama amaçlı ekranlar burada
 * toplanır; "aracın başındayken" kullanılanlar Yerinde Kontrol tarafındadır.
 */
export default function GuidePage() {
  const stats = useMemo(() => getDatabaseStats(), [])
  const codeCount = useMemo(() => getAllCodes().length, [])

  return (
    <>
      <Header title="Araç Rehberi" subtitle="Araştırma, karşılaştırma ve arıza bilgisi." />
      <PageContainer>
        <div className="card-grid">
          {CARDS.map((card, index) => (
            <div className="card-grid-item" key={card.to} style={{ animationDelay: index * 55 + 'ms' }}>
              <VehicleCard {...card} />
            </div>
          ))}
        </div>

        <section className="info-strip">
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.modelCount}</span>
            <span className="info-strip-label">Model / nesil</span>
          </div>
          <div className="info-strip-item">
            <span className="info-strip-value">{stats.problemCount}</span>
            <span className="info-strip-label">Arıza kaydı</span>
          </div>
          <div className="info-strip-item">
            <span className="info-strip-value">{codeCount}</span>
            <span className="info-strip-label">Arıza kodu</span>
          </div>
        </section>
      </PageContainer>
    </>
  )
}
