# Android Yol Haritası

## Mevcut

PWA manifestinde Web Share Target vardır; Android native proje veya Capacitor bağımlılığı yoktur. Bu aşamada Android dosyası ya da bağımlılığı eklenmedi.

## Hedef

Capacitor ile mevcut Vite çıktısını Android kabuğuna almak; paylaş intent'inden URL/metni almak; kullanıcıya görünür in-app browser açmak; kullanıcı "Bu alanları analiz et" dedikten sonra yalnızca seçilen görünür alanları yerel analiz formuna aktarmaktır.

Güvenlik sınırı: Sahibinden veya başka platform için gizli scraping, anti-bot atlatma, otomatik ekran görüntüsü alma, hesap/çerez/şifre aktarma yoktur. WebView verisi Worker'a ham olarak gönderilmez.

## Kabul ölçütleri

- Paylaş akışı PWA ve Android'de işlevsel ve eşdeğer.
- WebView yalnızca kullanıcı isteğiyle açılır; gizli arka plan gezinmesi yapmaz.
- İzinler, ağ güvenliği, dosya seçimi ve hata fallback'leri test edilir.

## Kalan iş

Capacitor v8 kurulumu, Android Studio/SDK CI, native share plugin seçimi, izin manifesti, cihaz testleri ve Play Store gizlilik beyanı Phase 3'te yapılacaktır.
