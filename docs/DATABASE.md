# D1 Veri Modeli ve Migration Politikası

## Mevcut

Şema [`server/d1/schema.sql`](../server/d1/schema.sql) içindedir: `meta`, `vehicles`, `submissions`, `accounts`, `ip_quota` ve `analysis_history`. `vehicles` doğrulanmış katalog için JSON payload + artan `revision` kullanır. `submissions`, doğrulanmamış topluluk/araştırma verisini ana katalogdan ayırır. Geçmiş yalnızca özet alanları saklamak üzere tasarlanmıştır.

Bu repoda sürümlü `migrations/` dizini henüz yoktur; şema doğrudan çalıştırılacak biçimdedir. Bu nedenle üretim şemasına dokunulmadı.

## Hedef

Her şema değişikliği `server/d1/migrations/NNNN_açıklama.sql` olarak sürümlenecek, geri alma SQL'i ve uygulama notu ile birlikte gözden geçirilecektir. Katalog kayıtlarında kaynak, doğrulama durumu ve güncelleme zamanı ayrı alan/sözleşme ile izlenecektir.

## Uygulamadan önce zorunlu güvenlik kapısı

Üretim D1 üzerinde migration uygulamadan önce aşağıdaki komut sadece operatör tarafından, doğru veritabanı adı doğrulanarak çalıştırılmalıdır:

```bash
pnpm wrangler d1 export arac-dedektifi --remote --output=backups/arac-dedektifi-YYYYMMDD.sql
```

Ardından şema, tablo sayıları ve kritik örnek sorgular doğrulanır. Yeni D1 production backend kullanılıyorsa `wrangler d1 info arac-dedektifi` ile Time Travel durumu kontrol edilir. Geri alma; önce yazma trafiğini durdurma, yedek SQL'i gözden geçirme, sonra yalnızca onaylı geri alma migration'ını veya operatör onaylı Time Travel restore işlemini kullanma adımlarından oluşur. Restore mevcut DB'yi yerinde ezer; otomatik yapılmaz.

## Kabul ölçütleri

- Uygulanmış migration listesi kaynak kontrolünde izlenir.
- Remote migration öncesi export ve rollback planı kayda geçer.
- Üretim, preview ve yerel D1 kimlikleri birbirine karışmaz.

## Kalan iş

İlk migration seti, erişim yetkileri, veri saklama/silme süreleri, katalog kaynak doğrulama alanları ve gerçek kullanıcı kimliği sonrası `accounts` geçişi tasarlanmalıdır.
