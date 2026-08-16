# Gizlilik ve Veri Minimizationu

## Mevcut

Favoriler, notlar, analiz geçmişi ve bazı önbellekler cihazın `localStorage`/IndexedDB alanında tutulur. D1 geçmiş şeması ilan metni ve fotoğraf saklamamayı hedefler; yalnızca araç özeti ve skor alanları bulunur. AI etkinse seçilmiş araç/şikayet veya görsel, Worker üzerinden sağlayıcıya gönderilir.

## Hedef

Kullanıcıya her veri akışında neyin cihazda, Worker'da ve AI sağlayıcısında işlendiği açıklanır. Görseller varsayılan olarak cihazda kalır; sunucuya yalnızca kullanıcı açıkça AI görsel analizi istediğinde geçici olarak gönderilir. İlan hesabı, çerez ve oturum verisi asla toplanmaz veya aktarılmaz. Garajdaki geçmiş temizleme, cihazdaki kopyayı ve aynı cihaz kimliğine bağlı D1 özetlerini siler.

## Kabul ölçütleri

- Açık aydınlatma, AI onayı, silme ve dışa aktarma yolu.
- Geçmiş için saklama süresi ve kullanıcı silme politikası.
- Üçüncü taraf sağlayıcılar, amaç ve veri kategorileri kullanıcıya görünür.

## Kalan iş

KVKK/GDPR hukuk incelemesi, veri işleyen sözleşmeleri, çocuk verisi değerlendirmesi, onay kayıtları ve retention job tasarlanmalıdır.

## Aşama 2A auth veri akışları — taslak

1. Anonim ilk kullanımda cihazda UUID kalır; Worker yalnız hash'ini kota ve
   geçici geçmiş için kullanır. Bu gerçek kullanıcı hesabı değildir.
2. Google veya e-posta OTP/magic-link girişinde kimlik sağlayıcısı e-posta,
   provider subject, IP/cihaz ve oturum bilgisini kendi politikası altında
   işleyebilir. Worker yalnız imzalı tokenı doğrular ve `sub` ile D1 kullanıcısını eşler.
3. Kullanıcı isterse anonim cihaz verisi bir kez hesabına aktarılır: analiz
   özeti, favori, garaj, ekspertiz notu ve boya kontrolü. Fotoğraf/ekran
   görüntüsü, ilan hesabı çerezi ve tam ilan metni aktarılmaz.
4. İkinci cihaz aynı bulut verisini görür. Yerel verinin otomatik upload/merge
   edilmesi yerine kullanıcı onayı gerekir.
5. AI görseli ancak açık analiz isteğiyle Worker'a gider; varsayılan sunucu
   depolaması yoktur. Gemini anahtarı yalnız Cloudflare secret'tır.

## KVKK ve sınır ötesi aktarım kapısı

Sağlayıcı seçilmeden “KVKK uyumlu” iddiası yapılamaz. Production öncesi veri
sorumlusu; auth sağlayıcısı DPA'sını, alt işleyenlerini, veri bölgesini,
Cloudflare D1/Worker log koşullarını, Google OAuth/transactional e-posta
akışını ve Türkiye'den aktarım hukuki dayanağını değerlendirmelidir. Supabase
AB bölgesi seçimi mümkündür; tek başına uyum kanıtı değildir. Better Auth+D1
de Google OAuth ve e-posta hizmetlerini alt işleyen olmaktan çıkarmaz.

## Silme ve dışa aktarma hedefi

- Doğrulanmış kullanıcı idempotent silme/dışa aktarma isteği açar.
  `deletion_requests` durum tutar; D1 verisi silinir/pseudonymize edilir,
  sağlayıcı hesabı silinir ve oturumlar iptal edilir.
- Export yalnız kullanıcının verisini JSON/CSV olarak içerir; token, secret,
  IP veya diğer kullanıcı verisi içermez. Kısa ömürlü indirme en fazla 7 gün
  saklanır.
- Yerel silme cihaz anahtarlarını temizler; bağlantı yokken bulut silmesi
  garanti değildir. Gerçek hesap modelinde bekleyen istek tekrar denenir.
