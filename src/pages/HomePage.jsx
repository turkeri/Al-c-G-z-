import PageContainer from '../components/Layout/PageContainer'
import VehicleCard from '../components/VehicleCard'
import ActiveAnnouncements from '../components/ActiveAnnouncements'
import Icon from '../components/icons/Icon'

/**
 * Ana ekran kareleri.
 *
 * Her özellik burada listelenmez; kullanıcının en sık başlattığı sekiz iş
 * gösterilir. Geri kalanı ait olduğu bölümün (Yerinde Kontrol, Rehber, Garaj)
 * içinde durur, böylece ana ekran uzayıp gitmez.
 */
const CARDS = [
  {
    to: '/ilan-analizi',
    title: 'İlanı İncele',
    description: 'İlan bilgilerini değerlendir, riskleri gör.',
    icon: 'search',
    accent: '#0f8b9d',
    art: 'panels'
  },
  { to: '/boya-degisen', title: 'Araç İşlemli mi?', description: 'Fotoğraflardaki olası izleri görsel olarak incele.', icon: 'camera', accent: '#d97706', art: 'panels' },
  { to: '/analiz', title: 'Araç Analizi', description: 'Araç bilgileriyle genel risk değerlendirmesi yap.', icon: 'car', accent: '#3454d1', art: 'gauge' },
  {
    to: '/yerinde-kontrol',
    title: 'Ekspertiz Kontrolü',
    description: 'Araç başında kontrol adımlarını takip et.',
    icon: 'clipboard',
    accent: '#1fa971',
    art: 'checklist'
  },
  {
    to: '/aracimin-nesi-var',
    title: 'Arıza Belirtisi',
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
  return (
    <>
      <header className="home-titlebar">
        <Icon name="search" size={18} aria-hidden="true" />
        <h1>Araç Dedektifi</h1>
      </header>

      <PageContainer>
        <ActiveAnnouncements />
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

      </PageContainer>
    </>
  )
}
