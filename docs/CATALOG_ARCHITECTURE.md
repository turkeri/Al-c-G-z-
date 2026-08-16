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

## Paket ve donanım

Paket kimliği global paket adı değildir: farklı marka, model, nesil ve yıllarda `Comfort`, `Premium` veya `Sport` aynı adla bulunabilir. Bu nedenle `catalog_packages` yalnız revision içindeki stabil ID ile kimliklenir. `catalog_generation_packages`, paketin hangi nesilde/yıl aralığında/gövde tipinde geçerli olduğunu taşır. Nullable yıl aralıkları için SQLite NULL unique davranışı expression unique index ile güvenli tutulur.

`catalog_package_equipment`, paket ve donanımı aynı revision içinde bağlar. `availability` tek anlam kaynağıdır: `standard`, `optional`, `unavailable`, `unknown`. Kolay sorgu için tutulan `standard` alanı CHECK ile yalnız `availability = standard` durumunda `1` olabilir; böylece iki alan çelişmez.

134 paket ve 53 donanım import sırasında ayrı kayıtlara dönüştürülecektir. Paket kaynağı bazı kayıtlarda generation ID yerine marka/model/yıl/kasa metni taşır; bunlar otomatik tahminle bağlanmayacak, validator kanıtına göre ilişkilendirilecektir. Envanterdeki yedi eşleşmeyen paket de validation warning olarak kalacaktır.

## Canonical araç varyantı

`catalog_vehicle_variants`, kullanıcının seçebileceği marka/model/nesil/motor/şanzıman/paket/yıl bileşimini temsil eder. Bu tablo 213 üst seviye `vehicles.json` kaydının kopyası değildir; stabil ID’li canonical seçilebilir kombinasyondur. 335 vehicle motor varyantı ile 107 bağımsız engine definition arasındaki bağ ileride burada kurulur.

Motor, şanzıman veya paket kaynağı belirsizse sahte ID üretilmez; ilgili foreign key nullable kalır. `legacy_vehicle_key`, stabil ID taşımayan eski vehicles kaydıyla geçici izlenebilir eşleme içindir. İsim değişikliği canonical varyant ID’sini değiştirmez ve isim benzerliğine göre otomatik birleşme yapılmaz.

Varyantın paketi aynı revision içinde bulunmak zorundadır. Paketin o generation’a gerçekten uygulanabilir olması ise koşullu composite FK ile güvenli biçimde ifade edilemediğinden import/validation aşamasının sorumluluğudur; şema bu kural için sahte constraint üretmez.

## Sonraki kapsam

`catalog_problem_archetypes` 20 genel kontrol kalıbını, `catalog_problem_applicability` ise ilerideki 740 araç kapsamlı problem girdisini taşır. 137 normalize başlık otomatik arketip değildir; yalnız canonical ID ve validator kanıtı ilişki kurar. Confidence/evidence status belirsizliği açık tutar; alan dili kesin arıza iddiası oluşturmaz.

14 genel bakım tanımı `catalog_maintenance_items` içinde, araç kapsamı `catalog_maintenance_applicability` içinde durur. `scope_type` global/filtered/vehicle ayrımını explicit yapar; boş kapsam yanlışlıkla global kabul edilmez.

`catalog_reference_values` gerçek gözlenen referans değeri minor unit integer ile saklar; `catalog_valuation_factors` ise `marketData` benzeri genel katsayıdır ve fiyat değildir. Legacy ilişkiler nullable/düşük güvenli kalır; verified provenance import validator tarafından denetlenecektir. Mevcut `vehicles` ve statik kaynaklar import/publish tamamlanana kadar korunur.
