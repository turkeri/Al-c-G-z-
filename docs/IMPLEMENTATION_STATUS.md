# Uygulama Durumu

## Aşama 0 — Denetim ve dokümantasyon: tamamlandı

- Frontend: React/Vite PWA, geniş cihaz içi analiz seti ve route tabanlı ekranlar mevcut.
- Worker/D1: Gemini proxy, katalog delta sync, cihaz tabanlı kota/geçmiş ve ilan fallback akışı mevcut.
- PWA: Web Share Target mevcut; Android native kabuk yok.
- Güvenlik: secret tasarımı, URL allowlist, HTTPS, redirect reddi ve temel limitler var; üretim auth/rate-limit/şema doğrulaması eksik.
- Depolama: katalog IndexedDB; kullanıcı özellikleri ağırlıkla localStorage; D1 özet geçmiş.
- Deploy: iki Wrangler config riski belgelendi. Remote D1'de değişiklik yapılmadı.
- Sahibinden sınırı: otomatik erişim veya bot atlatma yok; ekran görüntüsü/metin ve gelecekte kullanıcı görünür browser onayı fallback'tir.

## Aşama 1 — Test ve CI temeli: tamamlandı

- Katalog çapraz referans, nesil/motor/şanzıman eşleştirme testleri eklendi.
- İlan metni ayrıştırma ve motor ipucu testleri eklendi.
- Worker endpoint test planı eklendi; gerçek Worker test havuzu Phase 2'ye bırakıldı.
- `npm run verify` (lint + test + build) ve deploy'suz GitHub Actions CI eklendi.

## Sonraki kararlar

1. Tek Worker config kaynağı için `wrangler.jsonc` kabul edilsin mi?
2. Auth sağlayıcısı ve kullanıcı giriş yöntemi hangisi olsun?
3. Android için Capacitor native paylaşım/in-app browser akışı onaylanıyor mu?

## Phase 2 — Güvenlik sertleştirmesi: devam ediyor

- Worker için erken gövde boyutu kontrolü, sabit süreli admin token karşılaştırması ve hata ayrıntılarının redaksiyonu eklendi.
- Analiz geçmişi için cihaz ve D1 özetlerini silen, kullanıcı onaylı `DELETE /history` akışı eklendi.
- Sürümlü, tahribatsız başlangıç D1 migration dosyası ve migration dizini yapılandırması eklendi; hiçbir D1 migration'ı uygulanmadı.
- CORS üretim allowlist'i, kalıcı rate-limit binding'i ve gerçek kullanıcı kimliği hâlâ karar/binding gerektiriyor.

## Aşama 2A — Auth kararı ve kullanıcı veri mimarisi: tamamlandı (uygulama yok)

- Cihaz UUID, `accounts`, `ip_quota`, `analysis_history` ve localStorage
  akışı incelendi.
- Supabase Auth, Better Auth+D1, Firebase, Clerk ve Auth0 yalnız resmî
  belgelerle karşılaştırıldı: [AUTH](AUTH.md), [ADR-0001](adr/0001-auth-provider.md).
- Birinci öneri Supabase Auth+Worker/D1; yedek Better Auth+D1 olarak
  belgelendi. **Sağlayıcı kararı kullanıcı onayı bekliyor.**
- Taslak kullanıcı veri modeli [DATABASE](DATABASE.md), gizlilik akışları
  [PRIVACY](PRIVACY.md), token/session tehdit modeli [SECURITY](SECURITY.md)
  içine eklendi.
- Auth paketi, provider hesabı/secret, UI, migration, deploy veya uygulama
  davranış değişikliği yapılmadı.

## Aşama 2B — seçim sonrasında

1. AB bölgesi, DPA/alt işleyen, transactional e-posta ve provider kararını
   kaydetmek.
2. Secret/public config ayrımı; Gemini secret'ını yalnız Worker'da bırakmak.
3. Worker JWT middleware'i, user-scoped yetki ve sürümlü D1 migration'ları.
4. Anonim veri devri/kota geçişi, web+Capacitor PKCE/deep-link, logout/revoke,
   silme/export.
5. Rate limit/Turnstile/CSP/log redaksiyonu/auth negatif testleri ve verify.

## Aşama 2B-1 — Supabase Auth temeli: tamamlandı (haricî kurulum yok)

- Supabase frontend istemcisi, auth context, giriş/hesap/callback rotaları ve
  yapılandırılmamış durum eklendi; anonim kullanım korunur.
- Worker JWKS doğrulama modülü ve korumalı `GET /auth/me` eklendi.
- Tahribatsız `0002_auth_identity_foundation.sql` migration'ı kaynakta durur;
  local/remote D1'e uygulanmadı.
- Supabase projesi, AB bölgesi, Google callback URL'leri, Android deep-link,
  service-role key ve deploy henüz yapılmadı.
- Favori/garaj/not/geçmiş bulut senkronizasyonu Aşama 2B-2 kapsamındadır.

## Aşama 2B-2 — cihaz sahipliği ve ilk aktarım: tamamlandı (migration uygulanmadı)

- Korumalı `POST /auth/link-device`, JWT subject'inden dahili kullanıcıyı
  bulur/oluşturur ve bir cihazı yalnız bir aktif hesaba bağlar.
- Mevcut D1 analiz geçmişi ile cihazdaki favori, devam eden garaj kontrolü ve
  ekspertiz notları bir kez, idempotent olarak sahipliğe bağlanır.
- Başka kullanıcıya bağlı cihaz 409 ile reddedilir; istemci `user_id`si kabul
  edilmez. Remote migration, deploy ve push yapılmadı.

## Aşama 4 — sürekli bulut senkronizasyonu: hazır (migration uygulanmadı)

- JWT korumalı `GET /sync` ve `POST /sync`, yalnız token subject'inden çözülen
  kullanıcı verisini işler. İstemci `user_id`si reddedilir.
- Favori, garaj ve ekspertiz notu işlemleri kalıcı kullanıcı-bazlı localStorage
  kuyruğuna eklenir; giriş sonrası, bağlantı geldiğinde ve elle yeniden dener.
- Sunucu-zamanlı son yazan kazanır; silmeler tombstone'dur. Cursor, aynı zaman
  damgasındaki kayıtları kaçırmamak için `updated_at + id` çiftini taşır.
- Kayıtların gerçek cihazlar arasında UI'ya uygulanması ve operasyonların
  ileride IndexedDB'ye taşınması sonraki ürünselleştirme turunda ele alınmalıdır.

## Aşama 5 — canonical katalog mimarisi: tamamlandı, remote D1'e uygulandı ve publish edildi

- Revision snapshot modeli, canonical şema (marka/model/nesil/motor/şanzıman/paket/donanım/varyant/sorun/bakım/değer), admin CRUD + review workflow, public read API — [CATALOG_ARCHITECTURE](CATALOG_ARCHITECTURE.md), [CATALOG_ADMIN](CATALOG_ADMIN.md), [CATALOG_REVIEW](CATALOG_REVIEW.md).
- Migration zinciri 0001–0009 remote D1'e (`arac-dedektifi`) uygulandı; `npm run catalog:plan`'ın ürettiği doğrulanmış plan (`planHash` eşleşti, `canApply:true`) draft bir revizyon olarak yazıldı, sunucu tarafı doğrulama (0 blocking error, 753 bilgilendirici uyarı — eşleşmemiş sorun arketipi/bakım kapsamı) geçti ve publish edildi.
- **Veri genişletme (2. revizyon, `catalog:9208836f437fc1d8a96f293a`)**: 15 markaya (Nissan, Volvo, Mini, Jeep, Citroën, Mazda, Suzuki, Mitsubishi, Alfa Romeo, Land Rover, Jaguar, Subaru, Chevrolet, SsangYong, Tofaş) sıfırdan model, 8 zayıf markaya (Skoda, Seat, Kia, Opel, Dacia, Honda, Hyundai, Peugeot) ek model eklendi. `id` sütunu D1 şemasında global `PRIMARY KEY` olduğu ve `build-catalog-plan.js`'in ürettiği kimlikler içerik-türevli (revizyondan bağımsız) olduğu için, aynı planı ikinci kez tam-katalog olarak içe aktarmak değişmeyen varlıklarda birincil anahtar çakışmasına yol açıyordu — içe aktarma betiği (yalnızca scratchpad, repodaki `apply-catalog-plan-local.js` ve onun hedef-yolu güvenlik denetimi `assertSafeLocalTarget` değiştirilmeden) her kimliği bu revizyona özgü hale getirecek şekilde güncellendi. Sunucu tarafı doğrulama yine 0 blocking error, 753 bilgilendirici uyarı ile geçti ve yayınlandı; önceki revizyon `catalog:7388d0be3fd75ca7f62ec5c6` arşivlendi (rollback ile geri alınabilir).
- **Veri genişletme (3. revizyon, `catalog:72b977f795214fc6334882f8`)**: kullanıcı geri bildirimi üzerine — seçici "temel kapsama" (nesil verisi boş) modelleri de gösteriyordu, seçilince ekran boş kalıyordu. 63 model (mevcut markaların Audi A1/A5/A6/Q2/Q3/Q5/Q7/TT, BMW 2/4/7 Serisi/X1/X3/X4/X5/X6, Mercedes B/CLA/GLA/GLC/GLE-ML/Vito, VW Arteon/T-Roc, Toyota Auris/Avensis/C-HR/Camry/RAV4, Renault Captur/Kadjar/Kangoo/Symbol/Talisman, Fiat Doblo/Linea/Panda/Tipo, Ford EcoSport/Kuga/Mondeo dahil, 2. revizyonda eklenen Skoda/Seat/Kia/Opel/Dacia/Honda/Hyundai/Peugeot modelleri de içinde) gerçek nesil/motor/şanzıman verisiyle dolduruldu; `coverage:'temel'`/`BASIC_COVERAGE_MODELS` mekanizması tamamen kaldırıldı. Dacia Spring (tam elektrikli) için motor/şanzıman kasıtlı olarak boş bırakıldı (katalog içten yanmalı şema üzerine kurulu). Nesil sayısı 97 → 204. Sunucu tarafı doğrulama yine 0 blocking error, 753 uyarı ile geçti ve yayınlandı; önceki revizyon arşivlendi.
- `GET /catalog/meta` artık: 31 marka, 130 model, 204 nesil, 111 motor, 28 şanzıman, 134 paket, 53 donanım, 93 araç varyantı, 20 sorun arketipi, 740 sorun-kapsam eşleşmesi, 14 bakım kalemi, 66 referans değer, 8 değerleme faktörü.
- Worker (`arac-dedektifi-ai`) ve frontend (`arac-dedektifi-web`, Cloudflare Workers static assets) canlıda; Supabase Auth (e-posta magic link + Resend SMTP) çalışıyor, ilk admin hesabı bootstrap edildi.

## Aşama 6 — katalog admin ekranı: tamamlandı

- `/admin/katalog/revizyonlar/...` altında revision listesi/özeti, 14 entity için CRUD form, review ekranında accept/reject/defer (hedef seçimi, optimistic concurrency, permission bazlı görünürlük), URL'ye bağlı debounce arama/filtre/cursor — tüm entity'lerde backend allowlist'iyle birebir.

## Aşama 7A — runtime tüketicilerin async canonical-first akışa taşınması: kısmen tamamlandı

- Canonical katalog artık publish edilmiş durumda (bkz. Aşama 5) — bu bölümdeki tüm canonical-first akışlar artık gerçek kullanıcı trafiğinde de tetikleniyor, yalnızca mock veriyle değil.
- `catalogAdapter` + `useCatalogList`/`useVehiclePickerChain` kancaları: VehiclePicker, AnalysisForm, ChronicIssues, Diagnosis, Inspection, Compare'in marka/model/motor seçicileri artık önce yayınlanmış katalog, yoksa/hata olursa legacy veri kümesi kullanır.
- `useVehiclePickerChain`, `resolveVariant: true` ile nesil-doğru yıl aralığı ve varyant kimliği (`variantId`) de çözer; VehiclePicker VE AnalysisFormPage bunu kullanır — iki ayrı implementasyon yerine tek kaynak.
- `AnalysisFormPage → AnalysisResultPage` zinciri canonical'a bağlandı: `variantId` çözülürse sonuç ekranı `describePackageWithCatalog`/`assessChronicRiskWithCatalog`'u ek (mevcut legacy görünümleri bozmadan) çağırır ve canonical paket/kronik risk kartlarını gösterir. Gerçek Playwright taramasıyla (dolu canonical katalog mock'u) uçtan uca doğrulandı — bkz. [CATALOG_CONSUMERS](CATALOG_CONSUMERS.md).
- `catalogAdapter.resolveVariantId({brand, model, year, engine})` eklendi: `useVehiclePickerChain`'in nesil/varyant eşleştirme kurallarının React'sız, tek seferlik async biçimi — serbest metinden/görselden ayrıştırılmış alanlardan canonical `variantId` çözer. `ListingAnalysisPage` bunu ek bir efektle çağırır; çözülürse `describePackageWithCatalog`/`assessChronicRiskWithCatalog` denenir ve canonical dönerse `CanonicalPackageCard` ile "Yayınlanmış Katalogdan Risk Kayıtları" bölümü legacy görünümlerin YANINDA (değiştirmeden) görünür. Gerçek Playwright taramasıyla hem dolu canonical mock hem tam ağ hatası (legacy fallback, bire bir eski davranış) doğrulandı.
- `valuationService.valuateWithCatalog` hazır ve test edilmiş ama HİÇBİR sayfaya bağlanmadı — bu kasıtlıdır: canonical referans bulunduğunda `listed`/`diffPercent`/`verdict` alanları boş kalır, bu da hem `AnalysisResultPage`'in kullandığı `marketService.estimateMarketPrice`'ın alan sözleşmesini (negotiationService/decisionService bağımlı) hem de `ListingAnalysisPage`'in "ilan fiyatı piyasanın neresinde" karşılaştırmasını bozar.
- Compare (`VehicleComparePage`) her iki taraf için de `useVehiclePickerChain`'i `resolveVariant: true` ile kullanır; `variantId`si olan taraf(lar) için `describePackageWithCatalog`/`assessChronicRiskWithCatalog` denenir. Legacy `compareTwoVehicles` sonucu değişmeden kalır — canonical donanım/kronik-risk blokları ve (yalnız İKİ taraf da canonical dönerse) bir karşılaştırma satırı EK olarak eklenir. Gerçek Playwright taramasıyla (aynı model, biri canonical varyantı olan biri olmayan iki motor) doğrulandı; bu sırada bulunan, değişiklikten bağımsız bir React key çakışması hatası da düzeltildi.
- **Hâlâ eksik**: `PackageExplorer` bileşeni canonical veri kabul etmiyor (ayrı `CanonicalPackageCard` kullanılıyor).
