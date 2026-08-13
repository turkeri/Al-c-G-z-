export const FUEL_TYPES = ['Benzin', 'Dizel', 'LPG', 'Hibrit', 'Elektrik']

export const RISK_LEVELS = {
  DUSUK: 'Düşük',
  ORTA: 'Orta',
  YUKSEK: 'Yüksek'
}

export const SCORE_BANDS = [
  { min: 90, max: 100, label: 'Çok iyi', tone: 'excellent' },
  { min: 70, max: 89, label: 'Kontrol ederek değerlendir', tone: 'good' },
  { min: 50, max: 69, label: 'Dikkatli incele', tone: 'warning' },
  { min: 0, max: 49, label: 'Yüksek risk', tone: 'danger' }
]

export const GENERAL_INSPECTION_CATEGORIES = [
  {
    id: 'motor',
    title: 'Motor',
    items: ['Soğuk çalıştırma', 'Yağ kaçağı', 'Turbo kontrolü', 'Motor titreşimi (rölanti)']
  },
  {
    id: 'sanziman',
    title: 'Şanzıman',
    items: ['Vites geçişleri', 'Kalkış', 'Şanzıman sesi', 'Debriyaj performansı']
  },
  {
    id: 'kaporta',
    title: 'Kaporta',
    items: ['Şasi kontrolü', 'Direk (B/C sütunu) kontrolü', 'Boya kalınlık ölçümü', 'Panel aralıkları']
  },
  {
    id: 'elektronik',
    title: 'Elektronik',
    items: ['Klima performansı', 'Multimedya sistemi', 'Sensörler (park/geri vites)', 'Gösterge paneli ikazları']
  }
]

export const FAVORITES_STORAGE_KEY = 'arac-dedektifi:favorites'
