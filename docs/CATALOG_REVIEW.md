# Katalog review workflow

`0009_catalog_review_workflow.sql`, import sırasında güvenilir biçimde bilinen belirsiz olayları revision-scoped ve idempotent olarak saklar. Persist edilmemiş review ayrıntısı üretilmez. Kayıtlar pending, accepted, rejected veya deferred olabilir; actor ve zaman internal user zincirinden yazılır.

Support review okuyabilir. Editor hedef önerebilir ve draft revision üzerinde kabul/reddet/ertele yapabilir. Admin aynı yetkilere ek olarak publish/rollback yapar. Accept hedefi aynı revision’da bulunmadan çalışmaz; tüm kararlar audit üretir ve validation sonucunu stale yapar. Published snapshot değiştirilemez.

740 legacy problem girdisi 20 arketiple otomatik eşleşmez; 137 normalize başlık kanıt değildir. Package-generation yıl/isim eşleşmeleri kanıt düzeyini korur. Audi A3 8V kanıtlı bağları korunur; 8P/8Y için veri uydurulmaz.
