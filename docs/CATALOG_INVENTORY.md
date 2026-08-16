# Katalog envanteri

## Yönetici özeti

Araç kataloğu bugün tek bir canonical kaynaktan gelmez. Uygulamanın gömülü araç çekirdeği `vehicles.json`, bunun isteğe bağlı güncellemeleri Worker/D1, motor-şanzıman-paket-donanım bilgileri ise statik `src/data/catalog/*` dosyalarındadır. Bu durum çevrimdışı kullanım için faydalıdır; ancak aynı kavramın farklı kaynaklarda yaşaması senkron ve eşleşme riski doğurur.

`213`, model, motor veya arıza sayısı değildir: `vehicles.json` içindeki üst seviye birleşik araç nesnesi sayısıdır. Bu kayıtlarda 335 motor varyantı, bu varyantlarda 740 problem girdisi ve başlık normalizasyonuyla 137 benzersiz problem başlığı vardır. Statik katalogdaki 20 problem arketipi ise araç kaydı değildir; yakıt/şanzıman gibi genel koşullara göre kullanılabilen ortak kontrol kalıplarıdır.

Merkezi D1 modeli; stabil kimlik, kaynak/provenance, revizyon ve yayın durumunu ortaklaştırmak için gereklidir. Mevcut kaynaklar migration tamamlanana kadar korunmalıdır.

## Entity tanımları

- **Marka:** üretici kaydı ve servis/ikinci el bilgileri.
- **Marka-model:** markaya ait model tanımı.
- **Nesil/kasa:** modelin yıl aralığı ve motor/şanzıman ID ilişkileri.
- **Motor tanımı:** bağımsız motor ailesi/kodu, teknik veri ve bilinen sorunları.
- **Motor varyantı:** `vehicles.json` içindeki araç kaydına bağlı motor seçeneği.
- **Şanzıman:** bağımsız şanzıman tanımı ve sorunları.
- **Paket:** marka-model-yıl kapsamındaki donanım paketi.
- **Donanım:** paketlerin ID ile işaret ettiği ekipman sözlüğü kaydı.
- **Problem arketipi:** araçtan bağımsız, sistem/yakıt/şanzıman türüyle eşleşen genel risk kalıbı.
- **Vehicle problem girdisi:** belirli araç motor varyantına yazılmış kronik sorun.
- **Bakım tanımı:** araçtan bağımsız aralık ve maliyet tanımı.
- **Referans fiyat:** `vehicles.json` kaydındaki gömülü fiyat çıpası; canlı emsal değildir.
- **Üst seviye vehicles kaydı:** marka-model-yıl kapsamı ile motor varyantlarını birleştiren JSON nesnesi.

## Gerçek sayılar

| Ölçüm | Değer |
| --- | ---: |
| Marka | 31 |
| Marka-model | 76 |
| Nesil/kasa | 62 |
| Motor tanımı | 107 |
| Şanzıman tanımı | 28 |
| Paket | 134 |
| Donanım | 53 |
| Problem arketipi | 20 |
| Bakım tanımı | 14 |
| Vehicles üst kayıt | 213 |
| Vehicles motor varyantı | 335 |
| Vehicles problem girdisi | 740 |
| Benzersiz normalize problem başlığı | 137 |

## Integrity özeti

Envanterde 0 blocking error, 8 warning, 0 orphan referans, 0 duplicate ID/canonical key, 0 geçersiz aralık ve 0 zorunlu alan eksiği vardır. `vehicles.json` üst kayıtları stabil canonical ID taşımadığı için bu kaynağın duplicate ID denetimi yapılamaz.

Yedi paket, yalnız isim bazlı marka/model ilişkisiyle eşleşememektedir: Skoda Superb/Fabia, Seat Ibiza, Hyundai i10, Kia Ceed ve Kia Rio kapsamları. Bunlar blocking değildir; paket/model kaynakları ortak canonical ID taşımadığından uyarıdır. Problem applicability, bakım applicability, marketData araç ilişkisi ve paket-generation ilişkisi de mevcut şemadan canonical olarak denetlenemez.

## Split source of truth

| Alan | Kaynaklar | Tüketiciler | Risk | Canonical geçiş önerisi |
| --- | --- | --- | --- | --- |
| Araç verisi | `vehicles.json`, D1 `vehicles` overlay | `vehicleDataStore`, `vehicleService`, Worker | Revizyonlar ayrışabilir | Stabil vehicle ID ve revision/publish kaydı |
| Piyasa/değerleme | vehicle `referencePrice`, `marketData`, `marketService` | `valuationService`, `marketService` | İki hesap yolu aynı çıpayı farklı yorumlar | Tek market snapshot ve metodoloji alanı |
| Kronik sorunlar | vehicle problemleri, engine/transmission catalog, genel arketipler | `chronicProblemService`, `vehicleService` | Aynı sorun farklı maliyet/açıklamayla gelebilir | Problem definition ve applicability kayıtlarını ayırmak |
| Paket/araç seçimi | models, packages, equipment, vehicles | `VehiclePicker`, `catalogService`, `PackageExplorer` | Kapsama farkı paket eşleşmesini boş bırakabilir | package-generation ID ilişkisi ve ayrı variant tanımı |

HomePage katalog sayacı kullanmaz: `usesCatalogStats: false`.

## Audi A3 kanıt zinciri

Marka Audi ve model A3 statik katalogda yüksek güvenle bulunur. 8P, 8V ve 8Y nesilleri model canonical anahtarıyla bulunur; motor ve şanzıman bağlantıları açık ID ile yüksek güvenlidir.

- **8P (2003–2012):** 1.9 TDI, 2.0 TDI, 1.6/2.0 FSI, 1.8 T; DQ250 ve manuel. Bu nesille kesişen paket veya `vehicles.json` kaydı yoktur.
- **8V (2012–2020):** 1.6 TDI, 2.0 TDI, 1.4/1.5 TSI, 2.0 TSI; DQ200, DQ381 ve manuel. Attraction, Ambition/Sport, Dynamic/S line paketleri yıl aralığıyla orta güvenle eşleşir; donanımları equipment ID ile yüksek güvenle açılır. `vehicles.json` 2013–2020 kaydı 4 motor varyantı, 9 problem girdisi, 2018/100.000 km bağlamında 1.550.000 TL referans fiyat içerir.
- **8Y (2020–2024):** 2.0 TDI, 1.4/1.5 TSI ve DQ381. Advanced paketi aynı başlangıç/yıl kapsamıyla orta güvenle bağlıdır. Güvenilir nesil ID olmadığı için `vehicles.json` kaydı eşleşmez.

Problem arketipleri yalnız yakıt türü gibi genel koşullarla düşük güvenle eşleşir; araca özgü sorun değildir. `marketData.js` gerçek A3 fiyatı veya araç kimliği taşımaz; yalnız genel katsayılar içerir. ID eşleşmesi motor/şanzıman/donanımda, isim-yıl eşleşmesi paket ve vehicles bağlantısında kullanılır.

## Sonraki şema için karar girdileri

- Her entity için stabil ID ve kaynak kayıtlarını ayırmak.
- Revision/publish modeliyle gömülü çekirdek ve D1 overlay’i izlemek.
- Marka, model ve nesli ayrı entity olarak tutmak.
- Engine definition ile vehicle engine variant ilişkisini ayırmak.
- Problem arketipi ile araca uygulanabilir problem kaydını ayırmak.
- Paket ile generation arasında canonical ilişki eklemek.
- Her kayda provenance/source, güven seviyesi ve doğrulama tarihi eklemek.
- Migration bitene kadar mevcut statik dosyaları ve `vehicles.json` çekirdeğini korumak.
