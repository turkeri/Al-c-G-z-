# D1 Veri Modeli ve Migration Politikası

## Mevcut

Şema [`server/d1/schema.sql`](../server/d1/schema.sql) içindedir: `meta`, `vehicles`, `submissions`, `accounts`, `ip_quota` ve `analysis_history`. `vehicles` doğrulanmış katalog için JSON payload + artan `revision` kullanır. `submissions`, doğrulanmamış topluluk/araştırma verisini ana katalogdan ayırır. Geçmiş yalnızca özet alanları saklamak üzere tasarlanmıştır.

Sürümlü başlangıç şeması [`server/d1/migrations/0001_initial_schema.sql`](../server/d1/migrations/0001_initial_schema.sql) olarak eklendi ve kök `wrangler.jsonc` bu dizine yönlendirildi. Dosya yalnızca `CREATE ... IF NOT EXISTS` ifadeleri içerir; bu turda local veya remote D1'e migration uygulanmadı.

## Hedef

Her şema değişikliği `server/d1/migrations/NNNN_açıklama.sql` olarak sürümlenecek, geri alma SQL'i ve uygulama notu ile birlikte gözden geçirilecektir. Katalog kayıtlarında kaynak, doğrulama durumu ve güncelleme zamanı ayrı alan/sözleşme ile izlenecektir.

## Uygulamadan önce zorunlu güvenlik kapısı

Üretim D1 üzerinde migration uygulamadan önce aşağıdaki komut sadece operatör tarafından, doğru veritabanı adı doğrulanarak çalıştırılmalıdır:

```bash
pnpm wrangler d1 export arac-dedektifi --remote --output=backups/arac-dedektifi-YYYYMMDD.sql
```

Ardından şema, tablo sayıları ve kritik örnek sorgular doğrulanır. Yeni D1 production backend kullanılıyorsa `wrangler d1 info arac-dedektifi` ile Time Travel durumu kontrol edilir. Geri alma; önce yazma trafiğini durdurma, yedek SQL'i gözden geçirme, sonra yalnızca onaylı geri alma migration'ını veya operatör onaylı Time Travel restore işlemini kullanma adımlarından oluşur. Restore mevcut DB'yi yerinde ezer; otomatik yapılmaz.

## Kabul ölçütleri

- Uygulanmış migration listesi kaynak kontrolünde izlenir.
- Remote migration öncesi export ve rollback planı kayda geçer.
- Üretim, preview ve yerel D1 kimlikleri birbirine karışmaz.

## Kalan iş

Erişim yetkileri, veri saklama/silme süreleri, katalog kaynak doğrulama alanları ve gerçek kullanıcı kimliği sonrası `accounts` geçişi tasarlanmalıdır.

## Aşama 2A taslak kullanıcı veri modeli — uygulanmadı

`users.id` uygulamanın dahili UUID'sidir. Sağlayıcı subject'i yalnız
`identities.provider_subject` olarak tutulur; böylece auth sağlayıcısı
değişse de ürün verisi yeniden anahtarlanmaz. Zamanlar UTC epoch milisaniye
olur. Düz e-posta, parola, OAuth tokenı, refresh token, Gemini key, ekran
görüntüsü ve tam ilan metni bu modelde saklanmaz.

| Tablo | Amaç ve temel kolonlar | PK / FK | İndeks, izolasyon | Silme, saklama, hassas sınıf |
| --- | --- | --- | --- | --- |
| `users` | Dahili kullanıcı: `id`, `status`, `created_at`, `updated_at`, `deleted_at` | PK `id` | `status, deleted_at`; token `sub` → identity → user ile owner bulunur | Soft-delete/pseudonymize, retention sonunda hard-delete; kimlik bağlantısı |
| `identities` | `id`, `user_id`, `provider`, `provider_subject`, `email_hash?`, `email_verified_at` | PK `id`; FK `user_id`; `UNIQUE(provider, provider_subject)` | `user_id`; aynı subject yalnız bir kullanıcıya bağlanır | Kullanıcıyla silinir/anonimleşir; yüksek hassas kimlik verisi |
| `sessions` | `id`, `user_id`, `provider_session_ref_hash`, `issued_at`, `expires_at`, `revoked_at`, `device_link_id?`; ham token yok | PK `id`; FK user/device | `user_id, expires_at`; ref hash unique | Logout/revoke; provider refresh süresi + 30 gün denetim özeti; güvenlik verisi |
| `device_links` | Bir kerelik anonim cihaz claim'i: `id`, `device_id_hash`, `user_id`, `linked_at`, `claimed_at`, `revoked_at` | PK `id`; FK user; `UNIQUE(device_id_hash)` | `user_id`; sadece doğrulanmış owner | Revoke sonrası fraud denetimi için en çok 90 gün hash; takma adlı cihaz verisi |
| `accounts` / `subscriptions` | `user_id`, `plan_code`, `analysis_credit_balance`, `period_key`, `period_used`, `status`, `provider_subscription_ref?` | accounts PK/FK user; subscriptions PK id/FK user | `user_id,period_key`, `plan_code,status`; plan sadece D1'den | Hesap silmeyle silinir; ödeme referansı hukuk/muhasebe gereğine göre minimize edilir |
| `analysis_history` | Özet: `id`, `user_id?`, `device_link_id?`, araç/puan/fiyat/sonuç, `created_at`, `source`, `schema_version` | PK id; FK user/device | `user_id,created_at`; anonim için device index; tam olarak bir owner | Kullanıcı silme ile hard-delete; varsayılan 24 ay; araç tercihi kişisel veri |
| `favorites` | `id`, `user_id`, `listing_fingerprint?`, `vehicle_snapshot_json`, `created_at` | PK id; FK user | `user_id,created_at`; `UNIQUE(user_id,listing_fingerprint)` | Tekil/hesap silme; aktif hesap + 24 ay pasif hesap; tercih verisi |
| `garage_vehicles` | `id`, `user_id`, `vehicle_profile_json`, `nickname?`, tarihler; plaka/VIN varsayılan yok | PK id; FK user | `user_id,updated_at` | Hesap silmeyle hard-delete; araç sahipliği çıkarımı kişisel veri |
| `expertise_notes` | `id`, `user_id`, `vehicle_ref?`, `note_text`, tarihler | PK id; FK user | `user_id,updated_at` | Tekil/hesap silme, 24 ay pasif hesap; serbest metin yüksek dikkat |
| `paint_checks` | `id`, `user_id`, `vehicle_ref?`, `panels_json`, tarihler; görsel varsayılan yok | PK id; FK user | `user_id,updated_at` | Tekil/hesap silme; araç kondisyonu kişisel veri olabilir |
| `user_preferences` | `user_id`, `preferences_json`, `updated_at` | PK/FK user | Owner-only; ek indeks yok | Hesap silmeyle hard-delete; düşük hassas tercih |
| `usage_events` | `id`, `user_id?`, `device_link_id?`, `event_type`, `period_key`, `occurred_at`, `request_hash?` | PK id; opsiyonel FK | user/device/event-time indeksleri | Ham IP/token yok; 90 gün, abuse olayı 180 gün; güvenlik verisi |
| `consent_records` | `id`, `user_id?`, `device_link_id?`, `consent_type`, `policy_version`, `granted`, `recorded_at`, `evidence_hash` | PK id; opsiyonel FK | owner + consent/time; append-only | Hukuki değerlendirmeyle 3 yıl; minimal kanıt |
| `deletion_requests` | `id`, `user_id`, `request_type`, `status`, `requested_at`, `completed_at`, `export_expires_at?` | PK id; FK user | `user_id,requested_at`, `status,requested_at` | İşlem kanıtı 3 yıl; export dosyası en çok 7 gün |

### Geçiş ve izolasyon ilkeleri

1. Eski `accounts.id` kullanıcı id'sine çevrilmez; yalnız
   `device_links.device_id_hash` kaynağı olabilir.
2. Worker, user-scoped sorgularda gövdedeki `user_id`yi hiç kullanmaz;
   doğrulanmış token subject'inden owner elde eder.
3. Cihaz hash'i unique olduğundan aynı anonim veri iki hesaba atomik olarak
   bağlanamaz. İkinci claim reddedilir/audit edilir.
4. `ip_quota` kimlikten bağımsız abuse sınırı olarak kalabilir; ham IP yerine
   rotasyonlu sunucu-side hash Aşama 2B'de kararlaştırılır.

## Aşama 2B-1 migration notu

[`0002_auth_identity_foundation.sql`](../server/d1/migrations/0002_auth_identity_foundation.sql)
oluşturuldu ancak local veya remote D1'e uygulanmadı. `users`,
`user_identities`, `device_links` ve `consent_records` ekler; mevcut cihaz
temelli `accounts` ve `analysis_history` tablolarını değiştirmez. Supabase
JWT/session/refresh tokenları D1'e kopyalanmaz. Aktif cihaz linki için partial
unique index vardır; veri claim'i sonraki aşamadadır.

## Aşama 2B-2 migration notu

[`0003_user_data_ownership.sql`](../server/d1/migrations/0003_user_data_ownership.sql)
mevcut anonim tabloları değiştirmeden `history_owners`, kullanıcıya bağlı
favori/garaj/ekspertiz kayıtları ve idempotent `device_link_transfers` ekler.
Dosya mevcut `migrations_dir` altında yer alır; **remote D1'e uygulanmadı**.

## Aşama 4 — sürekli kullanıcı senkronizasyonu

[`0004_continuous_user_sync.sql`](../server/d1/migrations/0004_continuous_user_sync.sql),
mevcut kayıtları değiştirmeden `user_sync_records` ve idempotent
`user_sync_operations` tablolarını ekler. Her kayıt, dahili `user_id`, cihaz
UUID'si, tip, JSON payload, sunucu zamanlı sürüm ve `deleted_at` tombstone'u
ile tutulur. Cursor için `(user_id, updated_at, id)` indeksi kullanılır.
Migration henüz local veya remote D1'e uygulanmamıştır.
