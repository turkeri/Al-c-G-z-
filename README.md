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

### Mobil kod editörlerinde (Spck vb.) önizleme

`dist/` klasörü, npm/Node çalıştıramayan mobil editörlerde de önizleme yapılabilsin diye derlenmiş haliyle repoya dahil edilmiştir (kaynak değiştikçe `npm run build` sonrası tekrar `git add -f dist` ile güncellenmelidir).

Önemli: `dist/index.html`'i **doğrudan dosya olarak** (`file://...`) açmak çalışmaz — tarayıcılar güvenlik gereği (CORS) `file://` üzerinden JS modüllerini ve CSS'i yüklemeyi engeller, ekran beyaz kalır. Bunun yerine:

- Editörün **yerel bir HTTP sunucusu** üzerinden önizleme yapan bir "Run/Live Server" özelliği varsa onu kullanın (adres çubuğunda `http://localhost:...` görünmeli, `file://` değil).
- Ya da tarayıcıdan doğrudan `https://stackblitz.com/github/turkeri/Al-c-G-z-/tree/claude/arac-dedektifi-app-0x84k0` adresini açın; bu, projeyi tarayıcı içinde gerçek bir sunucuyla çalıştırıp anında canlı önizleme gösterir, hiçbir kurulum gerekmez.

Uygulama, sunucu taraflı yönlendirme (URL rewrite) gerektirmeyen `HashRouter` kullanır (`/#/analiz` gibi), böylece statik/dosya tabanlı önizlemelerde ve ileride Capacitor paketlemesinde sayfa geçişleri kesintisiz çalışır.

## Uygulama Modülleri

1. **Ana Ekran** — Araç Analizi, Kronik Sorunlar, Ekspertiz Kontrol Listesi, Favoriler kartları.
2. **Araç Analiz Formu** — marka, model, model yılı, motor, yakıt tipi, şanzıman, kilometre, ilan fiyatı.
3. **Araç Veritabanı** (`src/data/vehicles.json`) — Audi, BMW, Mercedes, Volkswagen, Toyota, Renault, Fiat, Ford, Peugeot, Opel, Hyundai, Kia, Skoda, Citroën, Honda, Nissan, Seat, Dacia, Mazda, Mitsubishi, Volvo, Suzuki markalarından popüler modeller (22 marka, 52 model, 60+ motor varyantı); her motor için güvenilirlik puanı, kronik sorunlar, kontrol listesi ve referans fiyat verisi.
4. **Analiz Motoru** (`src/services/analysisService.js`) — yaş, kilometre, motor puanı, şanzıman riski ve kronik sorun sayısına göre 0-100 arası risk skoru hesaplar; AI kullanmaz, kural tabanlıdır.
5. **İlan Metninden Otomatik Doldur** (`src/services/listingParserService.js`) — kopyalanan ilan metnini yapıştırınca marka, model, motor, yıl, km ve fiyatı otomatik algılayıp formu doldurur.
6. **Piyasa Fiyat Karşılaştırması** (`src/services/marketService.js`) — girilen ilan fiyatını, marka/model/yaş/km'ye dayalı kaba bir amortisman modeliyle tahmini piyasa değeriyle karşılaştırıp "piyasanın altında / normal / üzerinde" etiketi verir. Bu **gerçek zamanlı piyasa verisi değildir**, yönlendirici bir tahmindir.
7. **Pazarlık Önerisi** (`src/services/negotiationService.js`) — fiyat farkı ve kronik sorun riskine göre önerilen indirim tutarı ve gerekçesi.
8. **Karar Özeti** (`src/services/decisionService.js`) — skor ve piyasa karşılaştırmasını tek bir "Al / Dikkatli değerlendir / Alma" kartına indirger.
9. **Sonuç Ekranı** — genel skor, karar özeti, piyasa karşılaştırması, pazarlık önerisi, avantajlar, riskler, kontrol edilmesi gerekenler ve kronik sorun detayları.
10. **Ekspertiz Kontrol Listesi** — Motor, Şanzıman, Kaporta, Elektronik kategorilerinde genel kontrol maddeleri; araç seçildiğinde motora özel ek kontrol noktaları.
11. **Ekspertiz Notları** (`/ekspertiz-notlari`) — ekspertizde bulunan sorunlu kalemleri işaretleyip serbest not eklemeni sağlar; işaretlenen kalem sayısına göre otomatik bir önem özeti (Az/Orta/Çok bulgu) üretir. `localStorage`'da saklanır.
12. **Yakında Ekspertiz Bul** — tarayıcı konumunu kullanarak yakındaki oto ekspertiz/servis noktalarını Google Haritalar'da açar.
13. **Deneyim Notları (Topluluk)** (`src/services/communityNotesService.js`) — her marka/model/motor için kendi gözlemlerini ekleyebildiğin, Kronik Sorunlar sayfasında görünen notlar. **Not:** backend olmadığı için bu notlar yalnızca kullanıldığı cihazda saklanır, cihazlar arası paylaşılmaz — gerçek bir topluluk özelliği için Firebase gibi bir arka uç gerekir (bkz. İleriye Hazırlık).
14. **Fotoğraf Ekleme ve Kod Tabanlı Analiz** (`src/services/photoAnalysisService.js`) — Ekspertiz Notları'na fotoğraf ekleyebilirsin; her fotoğraf üzerinde canvas piksel analiziyle bulanıklık (Laplacian varyansı), pozlama (ortalama parlaklık) ve bölgesel doku düzensizliği kontrolü yapılır. **Bu bir yapay zeka/hasar tespiti değildir** — klasik, deterministik görüntü işleme fonksiyonlarıdır; sadece "bu fotoğraf net değil" veya "bu bölgeye yakından bak" gibi kaba ipuçları üretir.
15. **Boya / Değişen Kontrolü** (`/boya-degisen`, `src/services/paintDetectionService.js`) — aracın 13 kaporta panelinin (kaput, tavan, kapılar, çamurluklar, tamponlar, bagaj) her birinden ayrı fotoğraf ister; panellerin ortalama renk tonunu (HSL) ve yüzey doku pürüzlülüğünü (yüksek geçirgen filtre varyansı) birbiriyle karşılaştırıp medyandan belirgin sapan panelleri "yakından incele" olarak işaretler. **Bu bir boya kalınlık ölçüm cihazının yerini tutmaz** ve öğrenilmiş bir yapay zeka modeli değildir — ışık farkına duyarlı, kısmi bir istatistiksel karşılaştırmadır; fiziksel ekspertizde hangi panellere öncelik vermen gerektiği konusunda yönlendirici bir ön sinyaldir.
14. **Kredi / Taksit Hesaplayıcı** (`/kredi-hesapla`, `src/services/loanService.js`) — peşinat yüzdesi, vade ve örnek bir aylık faiz oranına göre tahmini aylık ödeme simülasyonu.
15. **Favori Sistemi** — analiz edilen araçlar `localStorage` üzerinde saklanır; favorilerden en fazla 3 araç seçip yan yana karşılaştırabilirsin.

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
