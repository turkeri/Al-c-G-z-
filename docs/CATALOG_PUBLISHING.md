# Katalog yayınlama

Yeni revision boş draft veya active published snapshot'ın transaction-safe klonu olarak oluşturulur. Canonical entity ID'leri korunur; global-PK ilişki satırlarına yeni güvenli ilişki kimliği verilir. Published snapshot doğrudan düzenlenmez.

Validate; kritik tablo varlığı, orphan ilişkiler, yıl aralıkları, reference value ve problem scope kontrollerini çalıştırır; count ve coverage üretir. Blocking hata varken publish reddedilir.

Publish tek D1 batch/transaction içinde hedefi published yapar, eski snapshot'ı archived olarak korur, active/previous pointer'ları değiştirir ve publication history ile audit yazar. Tekrar publish idempotenttir. Rollback yalnız daha önce publication history'de yayınlanmış snapshot'a, zorunlu gerekçeyle yapılır; veri silmez.

Production sırası: D1 yedeği al, 0001–0008 migration'larını sırayla doğrula/uygula, local plan sonucunu karşılaştır, draft import et, validate et ve yalnız yetkili admin ile publish et. Bu geliştirme görevinde remote migration, import, publish, deploy veya push yapılmamıştır.
