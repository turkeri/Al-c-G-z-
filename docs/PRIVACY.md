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
