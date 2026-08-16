# Sürekli senkronizasyon protokolü

`POST /sync`, en fazla 50 UUID operasyonu kabul eder. Operasyon kimliği tekrar
gönderildiğinde önceki sonuç döner; kayıt başka bir kullanıcıya aitse reddedilir.
İstemci kimliği JWT subject'inden Worker tarafından çözülür; gövdedeki
`user_id` kabul edilmez. `GET /sync?cursor=...` yalnız sahibin değişikliklerini
kararlı `(updated_at, id)` sırasıyla döndürür. Cursor opaktır.

Silmeler fiziksel silme değildir: `deleted_at` ile tombstone yazılır; diğer
cihazlar bu kaydı alarak yerel görünümü silebilir. Çakışmada sunucunun son
yazdığı kayıt kazanır. İstemci kuyruklarını hesap UUID'siyle ayrıştırır;
çıkış uzak veriyi silmez ve başka hesabın kuyruğunu göstermez. Çevrimdışında
kuyruk localStorage'da kalır; bağlantı dönüşünde bir kez yeniden deneme ve
elle eşitleme vardır. Ağır/kalıcı mobil kullanımda sonraki adım IndexedDB'dir.

Uygulama sırası (operatör): önce D1 export, sonra `wrangler d1 migrations apply
arac-dedektifi --remote`, ardından Worker deploy. Bu komutlar bu aşamada
çalıştırılmamıştır.
