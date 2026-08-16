# Güvenlik Durumu

## Mevcut

Gemini anahtarı Worker secret olarak tasarlanmış; frontend'e yazılmamalıdır. İlan URL resolver'ı HTTPS ve tanımlı host allowlist'i kullanır; fetcher yönlendirmeleri izlemeyerek SSRF yüzeyini azaltır ve yanıt boyutu/zaman aşımı sınırı koyar. Worker origin kontrolü, 10 MiB bildirilen gövde sınırı, görev bazlı fotoğraf sınırları ve KV bağlıysa hız limiti içerir. Yönetici token karşılaştırması sabit süreli yapılır; iç hata ayrıntıları istemciye dönülmez.

Riskler: `wrangler.toml` yorumlarında boş origin izinli geliştirme varsayımı var; KV binding yoksa kalıcı rate limit yok. Cihaz UUID gerçek auth değildir. `POST /data/import` yönetici token'a dayanır; import sayfası token'ı tarayıcıda kullanır. AI girişleri ve katalog payload'ları tam şema doğrulamasından geçmiyor.

## Hedef

Üretimde dar origin listesi, per-user/IP kota, Turnstile veya eşdeğer abuse kontrolü, JWT doğrulama, istek şeması, güvenli log redaksiyonu, CSP ve bağımlılık taraması uygulanır. Secret'lar yalnızca Cloudflare secret store'da kalır.

## Kabul ölçütleri

- Secret taraması ve client bundle doğrulaması CI'da.
- URL, fotoğraf ve JSON girişleri boyut/tip/şema sınırlarıyla reddedilir.
- Yetkili import, ayrı admin kimliği ve denetlenebilir işlemler kullanır.

## Kalan iş

Threat model, penetration test, WAF/Turnstile kararı, log saklama politikası, CSP ve güvenlik otomasyonu eklenmelidir.

## Aşama 2A token ve session tehdit modeli — taslak

| Tehdit | Zorunlu kontrol |
| --- | --- |
| İstemcinin user/plan/premium/kredi taklidi | Worker gövdeyi yetki kaynağı kabul etmez; doğrulanmış `sub` ile D1 owner/planı kendi bulur. |
| Sahte veya başka issuer JWT | JWKS imzası, sabit issuer/audience, `exp`/`nbf`, `sub`, algoritma allowlist ve güvenli `kid` cache/rotasyonu. |
| Çalınmış token | Kısa access-token, provider revoke/logout, `sessions.revoked_at`, loglarda token yok; riskli işlemde re-auth. |
| CSRF/XSS/token sızıntısı | Cookie ise HttpOnly/Secure/SameSite+CSRF; kendi kodumuz tokenı localStorage'a yazmaz; CSP/escape/dependency denetimi gerekir. |
| Android OAuth yönlendirme saldırısı | Sistem tarayıcısı + PKCE, izinli redirect URI/deep-link, state/nonce; WebView çerezi Worker'a taşınmaz. |
| Anonim verinin iki hesaba bağlanması | `device_links.device_id_hash` unique; doğrulanmış session içinde atomik tek claim; ikinci istek reddedilir/audit edilir. |
| Yetkisiz silme/export | Güncel session/re-auth, idempotency, owner-only kısa ömürlü export, silme sonrası revoke. |
| AI maliyet kötüye kullanımı | User planı D1'den; anonim IP+cihaz limiti, rate limit/Turnstile/WAF; Gemini key yalnız Worker secret. |

Supabase seçilirse Worker her korunan istekte JWT'yi doğrular; sadece decode
etmek yasaktır. Better Auth seçilirse Worker API token/session sözleşmesi,
key rotation ve native redirect tasarımı Aşama 2B öncesi yazılı onay ister.
Ham token, OTP, OAuth callback code ve Gemini secret log/analytics/D1'e
yazılmaz.

## Aşama 2B-1 uygulama notu

Worker'ın `/auth/me` endpointi `Authorization: Bearer` tokenını `jose` ile
Supabase JWKS endpointine karşı doğrular. İmza, algoritma allowlist'i, issuer,
audience, expiry ve subject zorunludur; hata yanıtı kriptografik ayrıntı
içermez ve `no-store` olur. JWKS sonucu en fazla 10 dakika cache'lenir;
network/JWKS hatası kontrollü 503 olur. CORS helper header listesine
`Authorization` eklendi; CORS bir yetkilendirme sınırı değildir.

Service-role key, legacy JWT secret ve ham token D1/source/frontend'e
eklenmedi. Gerçek Worker vars'ları, Supabase project ve Google callback URL'leri
henüz yoktur.
