# Kimlik Doğrulama ve Yetkilendirme

## Aşama 2A/2B kararı — Supabase Auth seçildi

Bu tur yalnız mimari değerlendirmedir: auth paketi, sağlayıcı hesabı/secret'ı,
auth ekranı, D1 migration, deploy ve uygulama kodu eklenmedi. Uygulama hâlâ
anonim cihaz UUID'si ile çalışır.

**Supabase Auth (yalnız Auth) + Cloudflare Worker/D1 uygulama verisi**
seçildi. Better Auth + Cloudflare Workers/D1, yalnız veri yerleşimi/operasyon
öncelikleri değişirse yedek seçenektir. Ayrıntı: [ADR-0001](adr/0001-auth-provider.md).

## Mevcut geçiş sınırı

- `accounts.id`, `arac-dedektifi:device-id` localStorage anahtarında üretilen
  UUID'dir; gerçek kullanıcı kimliği değildir.
- `X-Device-Id`, `/account`, `/history` ve AI kota akışında kullanılır.
  `ip_quota` IP tabanlı ikinci sınır, `analysis_history` cihaz sahipli özet
  geçmiş tutar. Favoriler, ekspertiz notları, boya kontrolleri ve geçici
  oturumlar cihazdadır.
- Yeni modelde cihaz UUID'si yalnız anonim cihaz anahtarı olur. Yetkili
  kullanıcı anahtarı Worker'ın doğruladığı token içindeki `sub` olur. İstemci
  `user_id`, plan, premium veya kredi bildiriminde yetki kazanamaz.

## Resmî belgelere dayalı karşılaştırma

Değerlendirme tarihi: 16 Ağustos 2026. Fiyat, DPA ve alt işleyen listeleri
sözleşme öncesi yeniden kontrol edilmelidir. “D1 ile” auth kayıtlarının
mutlaka D1'de olmasını değil, doğrulanmış kullanıcının D1 verisine güvenli
bağlanmasını ifade eder.

| Sağlayıcı | Workers / React-Vite / Capacitor | Google + OTP/magic link | JWT/JWKS ve session | D1 / ücretsiz başlangıç / operasyon | KVKK, konum, lock-in | Silme-dışa aktarma, test, taşınabilirlik |
| --- | --- | --- | --- | --- | --- |
| **Supabase Auth** | Worker'da standart OIDC/JWKS doğrulaması; `supabase-js` SPA için uygundur. Android deep-link/PKCE belgeli. | Google, e-posta OTP ve magic link var. | Access JWT + refresh; issuer/audience/JWKS Worker'da doğrulanır. | Auth Supabase Postgres'te, D1 `auth_subject` ile uygulama verisinde. Free 50k MAU; yerleşik e-posta limitleri üretimde SMTP gerektirebilir. Düşük-orta operasyon. | AB bölgesi seçilebilir; DPA/alt işleyenler ve Türkiye aktarımı ayrıca incelenir. Orta lock-in. | Sağlayıcı silmesi + D1 silmesi birlikte yapılır. Yerel stack iyi; kullanıcı kimliği taşınabilir, parolalar/oturumlar taşınmaz. |
| **Better Auth + D1** | Kysely ile D1 örneği var; React mümkündür. Capacitor redirect/deep-link köprüsü bizim sorumluluğumuzdadır. | Google ve magic-link eklentisi var; e-posta gönderimi/SMTP ayrıca kurulur. | Kendi session/cookie modeli; Worker API token/JWKS sözleşmesi ayrıca tasarlanır. | Auth ve ürün verisi aynı D1'de olabilir. Paket açık kaynak; OAuth, e-posta, key rotation, cleanup, abuse yükü bizdedir. | Cloudflare/D1 bölgesine bağlı; OAuth/e-posta ayrı alt işleyendir. En düşük lock-in. | Tamamen kendi şemamızla silme/export. Yerel D1 test edilir; en taşınabilir, güvenlik operasyonu en yüksek seçenek. |
| **Firebase Authentication** | React/Android SDK güçlü; Worker doğrulaması JWT/JWKS özel entegrasyonu ister. | Google ve e-posta linki var. | Firebase ID token + refresh; Worker için özel doğrulama. | D1 Firebase UID ile bağlanır; iki platform. Başlangıç ücretsiz katmanı var, plan/kota teyidi gerekir. | Firebase Auth verisinin ABD'de işlendiği açıklanır; KVKK için birinci tercih değil. Lock-in yüksek. | Silme SDK/Admin ile; export uygulama düzeyinde. Emulator iyi, taşıma sınırlı. |
| **Clerk** | Edge/Worker ve React SDK güçlü; Android/Capacitor sistem tarayıcısı/native redirect tasarımı ister. | Google, e-posta kodu/linki var; linkte aynı cihaz/tarayıcı kısıtı olabilir. | Managed session, token/JWKS doğrulaması. | D1 `clerk_user_id` ile bağlanır. Hobby 50k MRU, operasyon düşük. | Bölge/DPA/alt işleyen plan bazında teyitsiz KVKK varsayılamaz. Orta-yüksek lock-in. | API ile silme; D1 ayrı silinir. Yerel geliştirme çok kolay, metadata taşınması API'ye bağlı. |
| **Auth0** | OIDC/JWKS Worker'a, React ve native Android SDK'lara uygundur. | Google ve passwordless magic link var. | OIDC access token/JWKS; web SDK session, mobil PKCE/sistem tarayıcısı. | D1 Auth0 `sub` ile bağlanır. Free/prod sınırları teyit edilmelidir; operasyon düşük, maliyet büyüyebilir. | Bölgesel tenant/DPA/alt işleyen teyidi gerekir. Orta-yüksek lock-in. | Yönetim API'siyle silme; export birleştirilir. Yerel test iyi, OIDC taşınabilirlik sağlar. |

## Öneri

**Birinci: Supabase Auth + D1.** Google, OTP/magic link, web+Android için
PKCE/deep-link ve Worker'da standart JWT/JWKS doğrulaması hazırdır. Gemini
anahtarı Cloudflare secret olarak kalır; istemci D1'e doğrudan erişmez.
Ticaret: auth kayıtları Supabase Postgres'tedir; AB bölgesi, DPA, alt işleyen,
SMTP ve Türkiye aktarım hukuk incelemesi production kapısıdır.

**Yedek: Better Auth + D1.** Veri kontrolü ve taşınabilirlik önceliği kesin
üstünse seçilir. Buna karşılık e-posta teslimi, OAuth secret'ları, session,
Android dönüşleri, token sözleşmesi, key rotation ve abuse kontrolleri ekibin
operasyon yüküdür.

## Zorunlu yetkilendirme kuralları

- Worker tokenı sağlayıcı JWKS'iyle doğrular; yalnız doğrulanmış `sub` ile D1
  owner bulunur. Decode edilmiş ama doğrulanmamış JWT kabul edilmez.
- `X-Device-Id` sadece anonim kota ve bir kerelik veri devri içindir.
- Plan/kredi yalnız D1 `accounts`/`subscriptions` kaydından hesaplanır.
- Refresh/access token, OTP, OAuth callback code ve Gemini key log/D1/
  localStorage'a kendi kodumuzla yazılmaz.
- Silme/dışa aktarma owner doğrulaması, kısa ömürlü export ve idempotent istek
  kaydı ile yapılır.

## Hedef akışlar

| Akış | Tasarım |
| --- | --- |
| Anonim cihazın ilk kullanımı | `crypto.randomUUID()` cihazda üretilir; Worker bunun hash'iyle anonim kota/özet oluşturur. Kullanıcı hesabı ve premium yetkisi doğmaz. |
| Google ile giriş | Yetkili sistem tarayıcısı/OAuth+PKCE dönüşü sonrası sağlayıcı token verir; Worker tokenı doğrular, `identities` üzerinden dahili kullanıcıyı bulur/oluşturur. |
| E-posta OTP ile giriş | E-posta sağlayıcının rate-limitli OTP/magic-link akışıyla doğrulanır; link Android'de izinli deep-link, webde izinli origin'e döner. |
| Anonim veriyi hesaba bağlama | Doğrulanmış oturum `X-Device-Id` sunar; Worker device hash'i atomik claim eder, izin verilen yerel özetleri bir kez owner'a taşır. Benzersiz hash ikinci hesabı reddeder. |
| İkinci cihazdan giriş | Aynı token subject aynı D1 `users.id`ye gider; bulut geçmişi/favori/garaj/notlar owner filtresiyle okunur. |
| Oturum yenileme | Sağlayıcı SDK'sı refresh akışını yönetir; Worker her çağrıda geçerli access token ister. Yenileme tokenı Worker/D1 loguna yazılmaz. |
| Oturum kapatma | İstemci sağlayıcı oturumunu kapatır, Worker varsa session ref'ini revoke eder; cihazdaki yalnız auth cache temizlenir, anonim içerik kullanıcı tercihine göre kalır. |
| Hesap silme | Re-auth sonrası idempotent `deletion_requests` açılır; export bekliyorsa tamamlanır, D1 kullanıcı verisi silinir/pseudonymize edilir, session/provider hesabı iptal edilir. |
| Veri dışa aktarma | Worker owner verisini JSON/CSV paketi yapar; token/secret/IP hariç tutulur, kısa ömürlü tek kullanıcı indirmesi verilir. |
| Çalınmış/iptal edilmiş session | Provider revoke/logout ve kısa token ömrü; Worker expiry/issuer/JWKS kontrolü yapar. `revoked_at` kayıtları riskli actionları reddeder. |
| Aynı anonim verinin iki hesaba bağlanması | `UNIQUE(device_id_hash)` ve transaction: ilk doğrulanmış claim kazanır, ikincisi 409/denetim olayı alır; sahiplik elle müşteri desteği kanıtı olmadan taşınmaz. |
| Ücretsiz AI kotasının hesapla birleşmesi | Anonim cihaz kullanımı ayrı tutulur. Claim anında aynı dönem için server-side, denetlenebilir bir politika uygulanır: en fazla kalan hak veya en sıkı limit; istemci sayacı/planı kabul edilmez ve çift kredi verilmez. |

## Resmî kaynaklar

- [Supabase Auth](https://supabase.com/docs/guides/auth), [passwordless e-posta](https://supabase.com/docs/guides/auth/auth-email-passwordless), [Google/Android](https://supabase.com/docs/guides/auth/social-login/auth-google?platform=android), [native deep-link](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [fiyat](https://supabase.com/pricing)
- [Better Auth D1](https://better-auth.com/docs/concepts/database), [Google](https://better-auth.com/docs/authentication/google), [magic link](https://better-auth.com/docs/plugins/magic-link)
- [Firebase Auth](https://firebase.google.com/docs/auth), [email link](https://firebase.google.com/docs/auth/web/email-link-auth), [gizlilik](https://firebase.google.com/support/privacy)
- [Clerk giriş seçenekleri](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options), [edge doğrulama](https://clerk.com/docs/reference/backend/authenticate-request), [fiyat](https://clerk.com/pricing)
- [Auth0 passwordless](https://auth0.com/docs/authenticate/passwordless), [token doğrulama](https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens), [JWKS](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets)

## Bekleyen production kurulum kararları

Supabase AB projesi, DPA/alt işleyen değerlendirmesi, transactional e-posta
sağlayıcısı ve Google OAuth callback alanları henüz kullanıcı/işletme onayı
bekler. Sonraki adım provider config/secret, migration uygulama, anonim veri
devri, web/Android session, silme/export ve testlerdir.

## Aşama 2B-1 uygulama durumu

Supabase Auth temel düzeyde uygulandı: frontend yalnız `VITE_SUPABASE_URL` ve
`VITE_SUPABASE_ANON_KEY` ile istemci oluşturur; eksikse anonim kullanım devam
eder. Google ve e-posta magic-link başlatma, PKCE callback ve logout arayüzü
vardır. Supabase auth/session verisi Supabase'de, uygulama verisi D1'de kalır.
Service-role key kullanılmaz.

Worker `jose` ile güncel asimetrik signing key/JWKS yaklaşımını kullanır;
legacy JWT secret yoktur. Supabase projesi, gerçek Google callback URL'leri ve
Android deep-link henüz yapılandırılmadı. Veri claim'i ile favori/garaj/not/
geçmiş senkronizasyonu Aşama 2B-2 kapsamındadır.
