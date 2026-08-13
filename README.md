# Araç Dedektifi

**Aracı almadan önce riskleri öğren.**

İkinci el araç satın almak isteyenlere; marka, model, motor ve kilometre bilgilerine göre risk skoru, kronik sorun analizi, ekspertiz kontrol listesi ve favori araç takibi sunan mobil öncelikli bir web uygulaması (PWA).

## Teknoloji Yığını

- **React 18 + Vite** — hızlı geliştirme ve derleme
- **React Router** — sayfa yönlendirme (SPA)
- **JavaScript (JSX)**
- **CSS** (özel tema, Tailwind'siz, tasarım değişkenleriyle)
- **vite-plugin-pwa** — PWA desteği (manifest + service worker)
- **localStorage** — favori araç kayıtları (ilk sürüm)

Proje, ileride [Capacitor](https://capacitorjs.com/) ile Android APK'ya dönüştürülebilecek şekilde yapılandırılmıştır (statik build çıktısı, göreli asset yolları, PWA manifest).

## Klasör Yapısı

```
src/
  components/       Paylaşılan UI bileşenleri (kart, gauge, rozet, layout)
  pages/            Uygulama ekranları (ana ekran, form, sonuç, favoriler...)
  data/             vehicles.json — araç/motor/kronik sorun veritabanı
  services/         analysisService, vehicleService, favoritesService
  utils/            Sabitler ve biçimlendirme yardımcıları
  assets/           Statik varlıklar
public/
  icons/            PWA ikonları ve favicon
```

## Kurulum ve Çalıştırma

```bash
npm install
npm run dev       # geliştirme sunucusu (http://localhost:5173)
npm run build     # üretim derlemesi (dist/)
npm run preview   # üretim derlemesini yerelde önizleme
npm run lint      # ESLint kontrolü
```

## Uygulama Modülleri

1. **Ana Ekran** — Araç Analizi, Kronik Sorunlar, Ekspertiz Kontrol Listesi, Favoriler kartları.
2. **Araç Analiz Formu** — marka, model, model yılı, motor, yakıt tipi, şanzıman, kilometre, ilan fiyatı.
3. **Araç Veritabanı** (`src/data/vehicles.json`) — Audi, BMW, Mercedes, Volkswagen, Toyota, Renault, Fiat, Ford, Peugeot, Opel markalarından popüler modeller; her motor için güvenilirlik puanı, kronik sorunlar ve kontrol listesi.
4. **Analiz Motoru** (`src/services/analysisService.js`) — yaş, kilometre, motor puanı, şanzıman riski ve kronik sorun sayısına göre 0-100 arası risk skoru hesaplar; AI kullanmaz, kural tabanlıdır.
5. **Sonuç Ekranı** — genel skor, avantajlar, riskler ve kontrol edilmesi gerekenler.
6. **Ekspertiz Kontrol Listesi** — Motor, Şanzıman, Kaporta, Elektronik kategorilerinde genel kontrol maddeleri; araç seçildiğinde motora özel ek kontrol noktaları.
7. **Favori Sistemi** — analiz edilen araçlar `localStorage` üzerinde saklanır.

### Skor Bantları

| Skor | Değerlendirme |
| --- | --- |
| 90-100 | Çok iyi |
| 70-89 | Kontrol ederek değerlendir |
| 50-69 | Dikkatli incele |
| 0-49 | Yüksek risk |

## İleriye Hazırlık

Kod yapısı, ileride aşağıdaki eklemeleri destekleyecek şekilde katmanlıdır (`services/` altında soyutlanmış veri erişimi sayesinde):

- Firebase kullanıcı sistemi ve bulut senkronizasyonu
- Araç fotoğrafı yükleme ve analiz
- Sahibinden ilan ekran görüntüsü analizi
- Yapay zekâ destekli analiz motoru
- PDF rapor çıktısı
- Capacitor ile Android APK paketleme

## Lisans

Bu proje şu an için özel kullanım amacıyla geliştirilmektedir.
