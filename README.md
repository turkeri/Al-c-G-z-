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
3. **Araç Veritabanı** (`src/data/vehicles.json`) — **36 marka, 213 model/nesil kaydı, 335 motor varyantı, 740 kronik sorun kaydı.** Türkiye'de en çok ikinci el ilanı bulunan segmentlere odaklanır. Aynı nameplate'in farklı nesilleri ayrı kayıtlar olarak tutulur (örn. **Golf (Mk5/Mk6/Mk7)**, **BMW 3 Serisi (E46/E90/F30/G20)**, **Mercedes C Serisi (W203/W204/W205/W206)**, **Audi A3 (8P/8V/8Y)**, **Clio (2/3/4/5)**, **Corolla (E120/E140/E170/E210)**; **Fiat Albea**, **Tofaş Şahin** gibi 2000 öncesi/bütçe segmenti dahil), çünkü kronik sorunlar ve güvenilirlik nesilden nesile tamamen değişir.

   **Sekiz markada derinlemesine kapsam:** Renault (21 model / 48 motor), BMW (24 / 44), Mercedes (18 / 29), Audi (17 / 31), Toyota (15 / 24), Hyundai (14 / 22), Kia (14 / 19), Honda (10 / 14). Bu markalarda nesil bazlı ayrım ve motor koduna özgü gerçek kronik sorunlar işlenmiştir — örneğin BMW **N47 motor arkası triger zinciri**, Audi **EA888 zincir gerdirici ve yağ tüketimi**, Mercedes **M271 zincir / W211 SBC fren ünitesi**, Renault **TCe yağ banyolu triger ve EDC sarsıntısı**, Hyundai/Kia **Theta II GDI yatak arızası ve 7DCT sarsıntısı**, Honda **1.5 VTEC Turbo yakıt-yağ karışması**, Toyota **D-4D enjektör/EGR ve hibrit batarya**.

   Her motor kaydında: güvenilirlik puanı, ortalama yakıt tüketimi (L/100km), şanzıman risk seviyesi, araca özel kontrol listesi ve kronik sorunlar. **Her kronik sorun kaydında ayrıca çözüm önerisi ve tahmini onarım maliyeti (TL aralığı) bulunur.** Her model kaydında ayrıca **donanım/özellik verisi** (segment, kasa tipi, çekiş, koltuk, bagaj hacmi, tipik güvenlik/konfor/teknoloji donanımı) yer alır.

   **Veri kaynağı ve sınırları (önemli):** Bu veri seti genel otomotiv bilgisi ile web araştırmasının (şikayetvar, kullanıcı forumları, ikinci el alım rehberleri) birleşimidir. Üreticilerin resmi sitelerinden otomatik çekilmemiştir; sahibinden.com'dan canlı ilan verisi almaz. Yakıt tüketimi rakamları resmi WLTP sertifika değerleri değil, o motor sınıfı için beklenen ortalamalardır. Donanım bilgileri segment ortalamasıdır — donanım paketi ve model yılına göre değişir. Maliyet aralıkları kaba tahmindir, şehir/servis/parça tercihine göre ciddi biçimde değişir. Türkiye pazarındaki *her* marka-model-motor-paket kombinasyonunu kapsamaz.
4. **Analiz Motoru** (`src/services/analysisService.js`) — yaş, kilometre, motor puanı, şanzıman riski ve kronik sorun sayısına göre 0-100 arası risk skoru hesaplar; AI kullanmaz, kural tabanlıdır.
5. **İlan Metninden Otomatik Doldur** (`src/services/listingParserService.js`) — kopyalanan ilan metnini yapıştırınca marka, model, motor, yıl, km ve fiyatı otomatik algılayıp formu doldurur.
6. **Piyasa Fiyat Karşılaştırması** (`src/services/marketService.js`) — girilen ilan fiyatını, marka/model/yaş/km'ye dayalı kaba bir amortisman modeliyle tahmini piyasa değeriyle karşılaştırıp "piyasanın altında / normal / üzerinde" etiketi verir. Bu **gerçek zamanlı piyasa verisi değildir**, yönlendirici bir tahmindir.
7. **Pazarlık Önerisi** (`src/services/negotiationService.js`) — fiyat farkı ve kronik sorun riskine göre önerilen indirim tutarı ve gerekçesi.
8. **Karar Özeti** (`src/services/decisionService.js`) — skor ve piyasa karşılaştırmasını tek bir "Al / Dikkatli değerlendir / Alma" kartına indirger.
9. **Sonuç Ekranı** — genel skor, karar özeti, piyasa karşılaştırması, pazarlık önerisi, avantajlar, riskler, kontrol edilmesi gerekenler ve kronik sorun detayları.
10. **Ekspertiz Kontrol Listesi** — Motor, Şanzıman, Kaporta, Elektronik kategorilerinde genel kontrol maddeleri; araç seçildiğinde motora özel ek kontrol noktaları eklenir. Her kalemi **Sağlam / Sorunlu** olarak işaretlersin; sayfa canlı ilerleme çubuğu, kategori bazlı sayaçlar, bulgu sayısına göre otomatik bir değerlendirme kartı ("Sorun işaretlenmedi" → "Çok sayıda bulgu") ve sorunlu kalemlerin toplu listesini üretir. Sonucu tek tuşla Ekspertiz Notları'na kaydedebilirsin.
11. **Ekspertiz Notları** (`/ekspertiz-notlari`) — ekspertizde bulunan sorunlu kalemleri işaretleyip serbest not eklemeni sağlar; işaretlenen kalem sayısına göre otomatik bir önem özeti (Az/Orta/Çok bulgu) üretir. `localStorage`'da saklanır.
12. **Yakında Ekspertiz Bul** — tarayıcı konumunu kullanarak yakındaki oto ekspertiz/servis noktalarını Google Haritalar'da açar.
13. **Deneyim Notları (Topluluk)** (`src/services/communityNotesService.js`) — her marka/model/motor için kendi gözlemlerini ekleyebildiğin, Kronik Sorunlar sayfasında görünen notlar. **Not:** backend olmadığı için bu notlar yalnızca kullanıldığı cihazda saklanır, cihazlar arası paylaşılmaz — gerçek bir topluluk özelliği için Firebase gibi bir arka uç gerekir (bkz. İleriye Hazırlık).
14. **Fotoğraf Ekleme ve Kod Tabanlı Analiz** (`src/services/photoAnalysisService.js`) — Ekspertiz Notları'na fotoğraf ekleyebilirsin; her fotoğraf üzerinde canvas piksel analiziyle bulanıklık (Laplacian varyansı), pozlama (ortalama parlaklık) ve bölgesel doku düzensizliği kontrolü yapılır. **Bu bir yapay zeka/hasar tespiti değildir** — klasik, deterministik görüntü işleme fonksiyonlarıdır; sadece "bu fotoğraf net değil" veya "bu bölgeye yakından bak" gibi kaba ipuçları üretir.
15. **Boya / Değişen Kontrolü** (`/boya-degisen`, `src/services/paintDetectionService.js`) — aracın 13 kaporta panelinin (kaput, tavan, kapılar, çamurluklar, tamponlar, bagaj) her birinden ayrı fotoğraf ister; panellerin ortalama renk tonunu (HSL) ve yüzey doku pürüzlülüğünü (yüksek geçirgen filtre varyansı) birbiriyle karşılaştırıp medyandan belirgin sapan panelleri "yakından incele" olarak işaretler. **Bu bir boya kalınlık ölçüm cihazının yerini tutmaz** ve öğrenilmiş bir yapay zeka modeli değildir — ışık farkına duyarlı, kısmi bir istatistiksel karşılaştırmadır; fiziksel ekspertizde hangi panellere öncelik vermen gerektiği konusunda yönlendirici bir ön sinyaldir.
16. **Kredi / Taksit Hesaplayıcı** (`/kredi-hesapla`, `src/services/loanService.js`) — peşinat yüzdesi, vade ve örnek bir aylık faiz oranına göre tahmini aylık ödeme simülasyonu.
17. **Favori Sistemi** — analiz edilen araçlar `localStorage` üzerinde saklanır; favorilerden en fazla 3 araç seçip yan yana karşılaştırabilirsin.
18. **Araç Karşılaştır** (`/arac-karsilastir`, `src/services/vehicleCompareService.js`) — favorilerden bağımsız, herhangi iki marka/model/motoru serbestçe seçip (yıl/km/fiyat otomatik referans değerlerle dolar, istersen değiştirebilirsin) yan yana karşılaştırır. Karşılaştırma tablosunda risk skoru, model yılı, kilometre, ilan fiyatı, piyasa konumu, ortalama yakıt tüketimi, kronik sorun sayısı, kasa tipi, segment, çekiş ve bagaj hacmi satır satır kıyaslanır; **her satırda avantajlı olan araç yeşil vurgulanır.** Altında her araç için güvenlik/konfor/teknoloji donanımı, avantajlar ve kronik sorunlar listelenir.

19. **Aracımın Nesi Var? — Arıza Teşhis** (`/aracimin-nesi-var`, `src/services/diagnosisService.js`, `src/data/symptoms.json`) — şikayetini serbest metin olarak yazarsın (örn. *"sabahları zor çalışıyor, rölantide sarsıyor ve egzozdan mavi duman geliyor"*), sistem bunu **50 belirtiden** oluşan bilgi bankasıyla eşleştirip olası arızaları en olasıdan başlayarak sıralar. Her arıza için olası nedenler (olasılık seviyesiyle), **her nedene ait çözüm önerisi, tahmini maliyet ve aciliyet seviyesi**, ve "ustaya söyle şunlara baksın" kontrol listesi gösterilir.

    **Gelişmiş analiz (opsiyonel, internet gerektirir):** `server/` klasöründeki Cloudflare Worker kurulursa, şikayet ayrıca bir sunucu üzerinden değerlendirilip daha detaylı bir "Detaylı Analiz" bölümü gösterilir. Sunucuya aracın bilgisi ve uygulamanın kendi veritabanından çıkan kronik sorunlar da gönderilir, böylece cevap bu veriye dayanır. Kurulum ücretsizdir ve **API anahtarı uygulamanın içine hiç girmez** — yalnızca sunucuda tutulur, derlenmiş dosyalarda anahtar veya sağlayıcı adı bulunmaz (bu doğrulanmıştır). Sunucu kurulmazsa, internet yoksa veya sunucu cevap veremezse bölüm hiç görünmez ve uygulama tamamen cihaz içi motorla çalışmaya devam eder. Kurulum: [`server/README.md`](server/README.md).

    Motoru: Türkçe metni normalize eder (büyük/küçük harf, ı/ş/ğ/ü/ö/ç aksanları, noktalama), Türkçe durak kelimelerini ayıklar, çok kelimeli ifade eşleşmesine yüksek ağırlık verir ve ek almış kelimeleri yakalamak için kök-önek eşleştirmesi yapar. Araç seçilirse, o motorun bilinen kronik sorunlarıyla örtüşen arızalar öne çıkarılır ve ayrıca işaretlenir. **Bu bir yapay zeka modeli değil, deterministik bir kural/eşleştirme motorudur** ve kesin teşhis yerine geçmez — arıza kodlarının okutulması ve ustaya gösterilmesi şarttır.

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
