# Katalog review workflow

`0009_catalog_review_workflow.sql`, import sırasında güvenilir biçimde bilinen belirsiz olayları revision-scoped ve idempotent olarak saklar. Persist edilmemiş review ayrıntısı üretilmez. Kayıtlar pending, accepted, rejected veya deferred olabilir; actor ve zaman internal user zincirinden yazılır.

Support review okuyabilir. Editor hedef önerebilir ve draft revision üzerinde kabul/reddet/ertele yapabilir. Admin aynı yetkilere ek olarak publish/rollback yapar. Accept hedefi aynı revision’da bulunmadan çalışmaz; tüm kararlar audit üretir ve validation sonucunu stale yapar. Published snapshot değiştirilemez.

740 legacy problem girdisi 20 arketiple otomatik eşleşmez; 137 normalize başlık kanıt değildir. Package-generation yıl/isim eşleşmeleri kanıt düzeyini korur. Audi A3 8V kanıtlı bağları korunur; 8P/8Y için veri uydurulmaz.

## Frontend

`/admin/katalog/revizyonlar/:revisionId/inceleme`, `AdminCatalogReviewPanel.jsx` tarafından render edilir; `listReview`/`getReview`/`reviewAction` uçlarını doğrudan kullanır (daha önce yalnız filtresiz bir özet dump'ı gösteren yer tutucu koddu). Durum (pending/accepted/rejected/deferred), confidence ve entity tipi filtresi, arama (400ms debounce), cursor ile "daha fazla yükle" vardır — hepsi tek istekte birleştirilip backend'e gönderilir.

Reason code backend'de sabit bir enum değildir (yalnız non-empty string doğrulanır); bilinen kodlar (`LOW_CONFIDENCE`, `UNMATCHED`, `AMBIGUOUS_MATCH`) Türkçeye çevrilir, bilinmeyenler alt çizgi→boşluk dönüşümüyle güvenli biçimde sadeleştirilir — uydurma bir çeviri sözlüğü yerine. `source_summary_json` güvenli biçimde satırlara ayrıştırılır; bozuk JSON kullanıcıya asla ham metin olarak gösterilmez.

Accept, aynı revision içinde bulunan bir canonical hedef seçilmeden etkin olmaz (`canAcceptReview`); hedef seçilmemişse mevcut `proposed_target_id` kullanılır. Reject/defer hedef göndermez — yalnız var olan öneriyi korur, yeni bir ilişki üretmez. Support salt okunur kalır (`catalog:write` yoksa aksiyon butonları hiç render edilmez); editor/admin `catalog:write` iznine sahiptir. Published revision'da (`readOnly`) aksiyonlar gizlenir.

Her aksiyon `busyId` ile çift gönderimi engeller ve onay ister. 409 (optimistic concurrency çakışması) sonrası ilgili kayıt tek başına tazelenir; 401'de giriş bağlantısı gösterilir; 403/422 mesajları paylaşılan `request()` katmanından gelir — hiçbir teknik SQL/stack ayrıntısı kullanıcıya sızmaz. Liste yüklemesi bir sequence sayacıyla korunur; eski (stale) bir response ekranı bozamaz.
