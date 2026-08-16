# Güvenlik Durumu

## Mevcut

Gemini anahtarı Worker secret olarak tasarlanmış; frontend'e yazılmamalıdır. İlan URL resolver'ı HTTPS ve tanımlı host allowlist'i kullanır; fetcher yönlendirmeleri izlemeyerek SSRF yüzeyini azaltır ve yanıt boyutu/zaman aşımı sınırı koyar. Worker origin kontrolü, gövde sınırları ve KV bağlıysa hız limiti içerir.

Riskler: `wrangler.toml` yorumlarında boş origin izinli geliştirme varsayımı var; KV binding yoksa kalıcı rate limit yok. Cihaz UUID gerçek auth değildir. `POST /data/import` yönetici token'a dayanır; import sayfası token'ı tarayıcıda kullanır. AI girişleri ve katalog payload'ları tam şema doğrulamasından geçmiyor.

## Hedef

Üretimde dar origin listesi, per-user/IP kota, Turnstile veya eşdeğer abuse kontrolü, JWT doğrulama, istek şeması, güvenli log redaksiyonu, CSP ve bağımlılık taraması uygulanır. Secret'lar yalnızca Cloudflare secret store'da kalır.

## Kabul ölçütleri

- Secret taraması ve client bundle doğrulaması CI'da.
- URL, fotoğraf ve JSON girişleri boyut/tip/şema sınırlarıyla reddedilir.
- Yetkili import, ayrı admin kimliği ve denetlenebilir işlemler kullanır.

## Kalan iş

Threat model, penetration test, WAF/Turnstile kararı, log saklama politikası, CSP ve güvenlik otomasyonu eklenmelidir.
