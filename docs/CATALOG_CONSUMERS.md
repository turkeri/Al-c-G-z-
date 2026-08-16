# Runtime katalog tüketicileri

`catalogAdapter`, normal kullanıcı runtime'ındaki marka/model/nesil/motor/varyant sorguları için tek uyumluluk girişidir. Published canonical API önceliklidir; unpublished, 404 veya ağ hatasında legacy veri sessiz fallback olur. Boş canonical liste hata sayılmaz. Revision değişince public bellek cache'i temizlenir (`publicCatalogService.clearPublicCatalogCache`).

## Ortak async kancalar

`src/hooks/useCatalogList.js` — bağımlılık değişince yeniden çeken, çekerken/hata olunca durumu tutan, eski (stale) bir cevabın yeni bir isteğin üzerine yazmasını bir sequence sayacıyla engelleyen tek kanca. Katalog listesi çeken her yer bunu kullanır.

`src/hooks/useVehiclePickerChain.js` — marka → model → motor zincirini `useCatalogList` üzerinden sağlar; canonical öncelik, legacy fallback, `{brands, models, engines}` isim dizileri (mevcut render sözleşmesiyle uyumlu) ve `brandRows`/`modelRows`/`engineRows` (canonical id gerektiren çağıranlar için ham kayıtlar) döner. Altı ekran (AnalysisForm, ChronicIssues, Diagnosis, Inspection, Compare'in her iki tarafı, VehiclePicker) aynı deseni tekrar etmek yerine bu kancayı paylaşır.

## VehiclePicker

`VehiclePicker` published zinciri `useVehiclePickerChain` üzerinden kullanır; marka/model canonical ise nesil listesi (`listGenerations`) de çekilir ve yıl seçenekleri o neslin GERÇEK üretim aralığından hesaplanır — legacy referans kaydının genel aralığı yerine. Motor canonical ve bir nesil seçiliyse, aynı neslin araç varyantları (`listVehicleVariants`) içinde `engine_id` eşleşen bir kayıt aranır; bulunursa `value.variantId` set edilir (parent state'e yalnızca fark varsa yazılır, sonsuz döngü riski yoktur). Üst seçim (marka/model/nesil/motor) değişince altındaki tüm seçimler (`model`, `generationId`, `engine`, `variantId`) temizlenir.

`catalogAdapter.listEnginesForModel`/`yearRangeForModel`, nesil kavramı olmayan düz legacy veri setiyle (`vehicleService`) canonical nesil yapısı arasında köprü kurar: bir marka/model'in TÜM nesillerindeki motorları id'ye göre tekilleştirip birleştirir, canonical veri yoksa/boşsa/hata verirse legacy `getEngineNames`/`getVehicleEntry`'ye sessizce düşer.

Test: gerçek Playwright taramasıyla hem dolu canonical katalog (route mock ile marka→model→nesil→motor→varyant zinciri) hem tam ağ hatası (legacy fallback) senaryoları doğrulandı — 401/403 gibi auth durumları değil, veri katmanı davranışı. Canonical taramada `/catalog/variants` isteğinin motor seçiminden sonra doğru tetiklendiği, marka değişince model/motor/varyant'ın sıfırlandığı ve konsol hatası/sonsuz istek döngüsü oluşmadığı doğrulandı.

## Diğer tüketiciler

Analysis, diagnosis, inspection, compare ekranlarının marka/model/motor seçicileri `useVehiclePickerChain`'e taşındı; her biri yükleniyor/hata/tekrar-dene ipucu gösterir (sessiz fallback başarılıysa — yani legacy veri döndüyse — hata gösterilmez, yalnız GERÇEKTEN başarısız/beklenmeyen durumda gösterilir). `getEngineData`/`getVehicleEntry` (motor detayı, fiyat/özellik referansı) hâlâ legacy'dir — bu alanların canonical karşılığı yok, uydurulmadı.

`chronicProblemService.assessChronicRiskWithCatalog(formData, {variantId|generationId})` canonical `catalog_problem_applicability` sorgusunu dener (maliyet/km penceresi bu tabloda yok — uydurulmaz, boş kalır), boş/hata/scope yoksa `assessChronicRisk` (legacy, motor/şanzıman/araç kaydı/sistem arketipi tabanlı) sonucuna `source:'legacy'` etiketiyle düşer. Şu an hiçbir sayfa chronic-risk ekranını `variantId` üreten bir seçiciye (VehiclePicker) bağlamıyor; fonksiyon test edilmiş ve hazırdır ama canonical yol henüz canlı bir ekrandan tetiklenmiyor.

`valuationService.valuateWithCatalog(vehicle)` aynı desende: `vehicle.variantId` varsa canonical `reference_values`'tan (para birimi/geçerlilik/km aralığı doğrulanmış) tek bir gözlemsel değer arar, yoksa/hata verirse deterministik faktör tabanlı `valuate()`'e düşer. `ListingAnalysisPage` hâlâ yalnız `valuate()` çağırır çünkü serbest metinden/ekran görüntüsünden okunan bir ilanın canonical varyantla eşleştirilmesi ayrı, henüz yapılmamış bir özelliktir (metin → canonical eşleştirme).

Reference value gözlemsel araç değeridir ve minor unit saklanır. Valuation factor genel katsayıdır, fiyat değildir. Canonical reference yoksa mevcut `referencePrice`/`valuate()` hesabı korunur. Kullanıcı arayüzü D1, revision veya SQL ayrıntısı göstermez.

## Hâlâ statik/legacy kalan tüketiciler

- **Paket/donanım** (`PackageExplorer`, `packages.js`/`equipment.js`): canonical `listPackages`/`listVehicleVariants` katalog adaptöründe hazır ama bu bileşen hâlâ tamamen yerel statik veriden okuyor. Async canonical bağlantısı henüz yapılmadı.
- **Compare'in donanım/kronik sorun kıyası** (`compareTwoVehicles`): marka/model/motor seçimi canonical-first oldu (yukarıda), ama karşılaştırma sonucundaki kronik sorun/özellik listesi hâlâ legacy `vehicleService`/`data/catalog` kaynaklı.
- **ListingAnalysisPage'in değerleme ve kronik risk hesabı**: yukarıda açıklandığı gibi, serbest metinden canonical varyant eşleştirmesi olmadığı için legacy kalıyor.
