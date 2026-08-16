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
