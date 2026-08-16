# Araç Dedektifi — Ürün Tanımı

## Mevcut

Araç Dedektifi, ikinci el araç için cihaz içi kural tabanlı risk analizi, kronik sorun, ekspertiz kontrolü, boya/mikron yardımcı analizi, hasar kaydı değerlendirmesi ve karşılaştırma sunan React/Vite PWA'dır. Gömülü katalog çevrimdışı çalışır; Worker etkinse Gemini tabanlı isteğe bağlı detaylı analiz ve D1 katalog eşitlemesi kullanılabilir.

İlan bağlantısı kabul edilir ancak sahibinden.com, arabam.com ve letgo için otomatik sunucu taraflı çekme bilerek kapalıdır. Kullanıcı metin veya ekran görüntüsüyle devam eder. Bu ürün kararı bot korumasını aşmama, kullanım koşullarına uyma ve kullanıcıyı yanıltmama amacındadır.

## Hedef

Çok kullanıcılı web ve Android ürününde kullanıcı; ilanı paylaşır, görünür in-app browser içinde kendisi açar, açıkça gördüğü alanları onaylayarak analize aktarır. Sunucu kullanıcının ilan hesabı, çerezi veya oturumunu almaz. Doğrulanmış katalog bilgisi ve AI tahmini her ekranda ayrı kaynak etiketiyle gösterilir.

## Kabul ölçütleri

- Katalog, ilan ayrıştırma ve skor kuralları otomatik test edilir.
- İlan verisi kaynağı, güven seviyesi ve eksik alanlar görünürdür.
- Gerçek emsal verisi yoksa piyasa sonucu düşük güvenli tahmin olarak sunulur.
- Kritik teknik/hasar yorumları kesin hüküm değil, ekspertiz kontrol önerisidir.
- PWA paylaşımı ile Android paylaşımı aynı güvenlik ve veri minimizasyonu sözleşmesini izler.

## Kalan iş

Kimlik doğrulama, gerçek premium abonelik, kalıcı kullanıcı profili, Android native kabuğu, onaylı in-app browser akışı, PDF rapor, canlı emsal fiyat sağlayıcısı ve katalog kaynak/doğrulama süreçleri ürünleştirilmelidir.
