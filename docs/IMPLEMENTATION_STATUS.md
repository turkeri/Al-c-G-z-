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
