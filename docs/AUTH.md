# Kimlik Doğrulama ve Yetkilendirme

## Mevcut

Gerçek kullanıcı hesabı yoktur. `accounts.id` cihazda üretilen UUID'dir; kota ve özet geçmiş bu değere bağlanır. Uygulama verisi temizlenince değişebilir ve kullanıcılar arası güvenilir kimlik, premium sahipliği veya hesap kurtarma sağlamaz.

## Hedef

E-posta/OTP veya sosyal giriş ile doğrulanmış `user_id`; cihaz eşleme, plan/credit, oturum yenileme, hesap silme ve geçmiş erişimini desteklemelidir. Worker yalnızca doğrulanmış token'ın subject bilgisini kullanmalı; plan istemciden kabul edilmemelidir.

## Karar kaydı — ADR-0001 (karar bekliyor)

Seçenekler: (1) Cloudflare Access uygun değildir; son kullanıcı B2C kimliği yerine ekip erişimi içindir. (2) Managed B2C sağlayıcı (örn. Clerk/Auth0/Firebase) hızlıdır ama veri işleme ve maliyet bağımlılığı getirir. (3) Kendi OTP/OIDC katmanı en fazla kontrolü sağlar ama güvenlik ve operasyon yükü büyüktür.

Öneri: Phase 2'de Türkiye'de e-posta OTP ile başlayabilen, JWT/JWKS doğrulamasını Worker'da destekleyen managed B2C sağlayıcıyı veri işleme sözleşmesi ve maliyet sonrası seçmek. Henüz sağlayıcı seçilmedi, hesap/oturum kodu eklenmedi.

## Kabul ölçütleri

- Sunucu tarafında token doğrulaması, plan/credit yetkisi ve audit log.
- Hesap silme/dışa aktarma ile açık saklama süresi.
- Cihaz UUID'sinden kullanıcı hesabına kontrollü geçiş.

## Kalan iş

Kullanıcının auth sağlayıcısı, giriş yöntemi, yaş/aydınlatma gereksinimleri ve premium ödeme modeli için karar vermesi gerekiyor.
