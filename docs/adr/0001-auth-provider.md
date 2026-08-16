# ADR-0001 — Kimlik doğrulama sağlayıcısı seçimi

- Durum: **Karar bekliyor**
- Tarih: 2026-08-16
- Kapsam: React/Vite PWA, gelecek Capacitor Android, Cloudflare Worker ve D1

## Bağlam

Bugünkü `X-Device-Id` anonim cihaz UUID'si; hesap kurtarma, çoklu cihaz,
premium sahipliği ve güvenilir geçmiş erişimi için uygun değildir. Ürün;
oturumsuz sınırlı analiz, Google, e-posta OTP/magic link, anonim verinin
hesaba aktarılması, silme/dışa aktarma ve Worker tarafında token doğrulaması
ister. Kendi parola saklama sistemi yazılmayacaktır.

## Önerilen karar (henüz kabul edilmedi)

**Supabase Auth seçilsin; D1 ürün verisinin sahibi Cloudflare Worker kalsın.**
İstemci sağlayıcıyla oturum açar; Worker JWT'yi JWKS, issuer, audience ve
zaman iddialarıyla doğrular; `sub` → D1 `identities` → `users.id` zinciriyle
yetkilendirir. İstemci D1'e doğrudan erişmez ve gönderdiği user/plan/krediye
güvenilmez.

Bu kararın production kapıları: AB bölgesi, Supabase DPA/alt işleyenler,
transactional e-posta yolu ve Türkiye'den aktarım hukuk incelemesinin ürün
sahibince kabul edilmesidir. Supabase Auth'un kayıtları Supabase Postgres'te,
uygulama verileri D1'de olur.

Bu kapılar kabul edilmezse **Better Auth + D1** yedektir. Bunun karşılığında
OAuth/e-posta, session, token sözleşmesi, anahtar rotasyonu, cleanup ve abuse
kontrollerinin operasyonunu ekip üstlenir.

## Değerlendirilen alternatifler

Tam matris [AUTH.md](../AUTH.md) içindedir. Firebase, Clerk ve Auth0; hazır
managed deneyim sağlar ancak veri konumu/sözleşme ve sağlayıcı bağımlılığı
nedeniyle birinci öneri değildir. Firebase Auth'un resmî gizlilik açıklaması
Auth verisinin ABD'de işlendiğini belirtir.

## Sonuç

Olumlu: parola saklamayız; web/Android aynı subject ile çalışır; Worker kota
ve premium yetkisini server-side uygular; standart OIDC/JWT gelecekte taşıma
seçeneği verir. Olumsuz: iki veri platformu ve ek veri işleyen vardır; AB
bölgesi seçmek tek başına KVKK uyumu kanıtı değildir.

## Karar sonrası Aşama 2B

Sağlayıcı config/secret, SDK, D1 migration, Worker doğrulama middleware'i,
auth UI, anonim cihaz claim'i, user-scoped API'ler, logout/revoke,
silme/dışa aktarma, Capacitor PKCE/deep-link, abuse kontrolleri ve testler.
Bu ADR onaylanana kadar hiçbiri uygulanmayacaktır.
