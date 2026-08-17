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

## Aşama 5 — canonical katalog mimarisi: tamamlandı (migration uygulanmadı, publish yapılmadı)

- Revision snapshot modeli, canonical şema (marka/model/nesil/motor/şanzıman/paket/donanım/varyant/sorun/bakım/değer), admin CRUD + review workflow, public read API — [CATALOG_ARCHITECTURE](CATALOG_ARCHITECTURE.md), [CATALOG_ADMIN](CATALOG_ADMIN.md), [CATALOG_REVIEW](CATALOG_REVIEW.md).
- Migration zinciri 0001–0009 kaynakta durur; hiçbiri remote D1'e uygulanmadı, hiçbir revision publish edilmedi.

## Aşama 6 — katalog admin ekranı: tamamlandı

- `/admin/katalog/revizyonlar/...` altında revision listesi/özeti, 14 entity için CRUD form, review ekranında accept/reject/defer (hedef seçimi, optimistic concurrency, permission bazlı görünürlük), URL'ye bağlı debounce arama/filtre/cursor — tüm entity'lerde backend allowlist'iyle birebir.

## Aşama 7A — runtime tüketicilerin async canonical-first akışa taşınması: kısmen tamamlandı

- `catalogAdapter` + `useCatalogList`/`useVehiclePickerChain` kancaları: VehiclePicker, AnalysisForm, ChronicIssues, Diagnosis, Inspection, Compare'in marka/model/motor seçicileri artık önce yayınlanmış katalog, yoksa/hata olursa legacy veri kümesi kullanır.
- `useVehiclePickerChain`, `resolveVariant: true` ile nesil-doğru yıl aralığı ve varyant kimliği (`variantId`) de çözer; VehiclePicker VE AnalysisFormPage bunu kullanır — iki ayrı implementasyon yerine tek kaynak.
- `AnalysisFormPage → AnalysisResultPage` zinciri canonical'a bağlandı: `variantId` çözülürse sonuç ekranı `describePackageWithCatalog`/`assessChronicRiskWithCatalog`'u ek (mevcut legacy görünümleri bozmadan) çağırır ve canonical paket/kronik risk kartlarını gösterir. Gerçek Playwright taramasıyla (dolu canonical katalog mock'u) uçtan uca doğrulandı — bkz. [CATALOG_CONSUMERS](CATALOG_CONSUMERS.md).
- `valuationService.valuateWithCatalog` hazır ve test edilmiş ama henüz bir sayfaya bağlanmadı — `AnalysisResultPage` hâlâ ayrı, daha basit `marketService.estimateMarketPrice`'ı kullanıyor (iki valuation sistemi kasıtlı olarak ayrı tutuldu, `negotiationService`/`decisionService` `estimateMarketPrice`'ın alan adlarına bağlı).
- **Hâlâ eksik**: `ListingAnalysisPage` (serbest metinden/ekran görüntüsünden gelen ilan) kendi `variantId` çözümlemesi yapmıyor — metin → canonical varyant eşleştirmesi ayrı, yapılmamış bir özellik. `PackageExplorer` bileşeni canonical veri kabul etmiyor (ayrı `CanonicalPackageCard` kullanılıyor). Compare'in donanım/kronik-sorun kıyası ve `valuateWithCatalog`'un herhangi bir sayfaya bağlanması hâlâ statik/yapılmamış.
