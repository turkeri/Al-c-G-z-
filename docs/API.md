# API Sözleşmesi

## Mevcut

Worker; `GET /data/version`, `GET /data/vehicles?since=`, `POST /data/import`, `GET /account`, `GET|POST|DELETE /history`, `GET /listing/platforms`, `POST /listing/fetch` ve AI görev uçlarını sağlar. D1 veya secret yoksa bazı uçlar kontrollü hata verir; istemci gömülü veri/fallback ile devam eder. `DELETE /history`, yalnızca `X-Device-Id` ile eşleşen özet kayıtları siler.

`POST /listing/fetch` yalnızca izin listeli HTTPS alan adlarını kabul eder. Şu an tüm adapterler `fetchable: false` olduğundan hedef siteye ağ isteği yapılmaz ve `engelli` sonucu ile ekran görüntüsü/metin fallback'i döner. Bu bir scraping API değildir.

## Hedef

Tüm uçlar için sürümlü JSON şeması, istek/yanıt boyut limitleri, hata kodları, kimlik doğrulama ve idempotency kuralları belgelenecek. Android in-app browser'dan gelen onaylı alanlar, ham HTML/çerez yerine açık alan listesi olarak gönderilecek.

## `GET /auth/me`

Supabase access JWT'siyle korunan temel doğrulama endpointidir.
`Authorization: Bearer <access-token>` gerektirir. Worker tokenı Supabase
JWKS'iyle imza, issuer, audience, expiration ve `sub` açısından doğrular;
tokenın kendisi veya tüm claim'ler dönülmez. Başarılı yanıtta yalnız `user.id`,
`email` ve `provider` özeti vardır; yanıt `Cache-Control: no-store` taşır.
İstemci gövdesindeki `user_id`, `plan`, `role` veya premium alanları yok sayılır.

Supabase projesi henüz oluşturulmadı. `SUPABASE_URL`,
`SUPABASE_JWT_ISSUER` ve `SUPABASE_JWT_AUDIENCE` Worker ortamında tanımlanana
kadar endpoint 401 döner. Service-role key kullanılmaz.

## Kabul ölçütleri

- Her endpoint için olumlu, doğrulama, yetki, kota ve bağımlılık-hatası test edilir.
- Hata yanıtı kullanıcıya iç altyapı veya secret bilgisi vermez.
- URL uçları SSRF'ye karşı HTTPS + allowlist + yönlendirme reddi uygular.

## Kalan iş

OpenAPI belgesi, şema doğrulama kütüphanesi, API sürüm öneki, kimlik tabanlı yetkilendirme ve gerçek Worker entegrasyon testleri gerekir.
