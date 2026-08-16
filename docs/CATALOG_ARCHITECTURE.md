# Canonical katalog mimarisi

## Revision snapshot modeli

Canonical katalog, `catalog_revisions` altında değişmez snapshot’lar olarak tutulur. Her brand, model, generation, engine ve transmission satırı `revision_id` taşır; aynı canonical ID farklı revision’larda tekrar kullanılabilir. Bir revision içindeki composite primary key `(revision_id, id)` hem kimlik kararlılığını hem de aynı snapshot içindeki tekilliği sağlar.

`catalog_state` tek satırlı `active` pointer’ıdır. `published_revision_id`, yayınlanan snapshot’ı; `previous_revision_id` geri dönüş için önceki snapshot’ı gösterir. Bu migration pointer veya published revision seed etmez. Import/publish yapılana kadar uygulama gömülü `vehicles.json` ve statik katalog fallback’ini kullanır.

`catalog_publication_history`, publish, rollback ve archive kararlarının zaman damgalı geçmişidir. Token, secret veya kullanıcı oturumu verisi tutulmaz.

## Canonical ilişkiler

Marka → model → nesil/kasa ilişkisi aynı revision içinde composite foreign key ile korunur. Generation → engine ve generation → transmission bağları ayrı ilişki tablolarındadır; motor ile şanzıman arasında bu aşamada doğrudan uyumluluk kaydı yoktur.

Motor tanımı, bağımsız motor ailesi/teknik tanımdır. Vehicle motor varyantı ise belirli araç kaydındaki motor seçeneğidir; 335 mevcut vehicle motor varyantı `catalog_engines` ile karıştırılmayacaktır. Şanzıman tanımı da bağımsız katalog kaydıdır.

## Stabil kimlik ve provenance

Her entity için `id` canonical, revisionlar arasında stabil kalabilecek kimliktir. `slug`, `normalized_name` ve varsa `code`, insan girdisi/eşleştirme için yardımcı anahtarlardır; ID yerine geçmez. Kaynak izlenebilirliği için `source_file`, `source_key` ve `source_confidence` tutulur. Güven seviyesi yalnız `high`, `medium`, `low`, `unknown` olabilir.

Yıl aralıkları makul sınırlar ve sıralama CHECK’leri ile doğrulanır; sayısal motor ve şanzıman değerleri negatif olamaz. Relation satırları stabil relation ID kullanır; nullable yıl aralıklarında SQLite UNIQUE davranışını güvenli tutmak için expression unique index kullanılır.

## Yayın ve fallback davranışı

Published revision yoksa bu bir yapılandırma hatası değildir. 0006 yalnız şemayı hazırlar; import ve yayın sonraki aşamalardadır. Bu sürede Worker D1 araç overlay’i ve istemcideki mevcut statik/gömülü kaynaklar çalışmaya devam eder.

## Sonraki kapsam

0007’de paket, donanım, problem, bakım ve fiyat snapshot tabloları; package-generation canonical ilişkileri; applicability ve kaynak kanıtı eklenecektir. Mevcut `vehicles` tablosu, `vehicles.json` ve statik katalog dosyaları import/migration tamamlanana kadar korunur.
