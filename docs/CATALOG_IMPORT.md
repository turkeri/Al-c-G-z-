# Çekirdek katalog dry-run importu

`npm run catalog:import:core:dry-run` yalnız bellekte canonical revision planı üretir. Ağ, Wrangler, D1 bağlantısı, SQL üretimi ve dosya yazımı kullanmaz; `--remote` açıkça reddedilir.

ID’ler namespace + parent + source ID/code veya normalleştirilmiş teknik anahtardan deterministik üretilir. Kaynak manifesti SHA-256 hashleriyle raporlanır ve çalışma sonunda tekrar hesaplanarak değişmediği doğrulanır; createdAt canonical ID’ye girmez. Blocking error `canImport: false` ve non-zero exit code üretir; warning tek başına importu engellemez.

Dry-run D1 snapshot karşılaştırması yapmaz: adaylar `createCandidates`, update/unchanged `notCompared` olarak raporlanır. Bu aşama yalnız brands/models/generations/engines/transmissions ve ID kanıtlı generation ilişkilerini içerir. Paket, problem ve vehicle variant importu sonraki aşamadır.

Örnekler: `npm run catalog:import:core:dry-run`, `npm run catalog:import:core:dry-run -- --json`, ayrıntı için `--include-records`.

## Paket ve donanım dry-run

`npm run catalog:import:packages:dry-run` yalnız `packages.js`, `equipment.js` ve core dry-run planını okur. D1'e yazmaz, SQL üretmez ve `--remote` seçeneğini reddeder. Paket adı global unique değildir: canonical paket ID'si marka, model, jenerasyon/kasa-yıl kapsamı ve normalize paket adından üretilir. Kaynak paketin kapsamına bağlı olması bilinçli bir modelleme tercihidir; ayrı marka/model/yıl kapsamındaki aynı adlar ayrı pakettir.

Jenerasyon eşleştirme sırası açık ID (high), tekil marka+model+jenerasyon kodu+yıl (medium), ardından tekil marka+model+yıl kapsamıdır (medium). Düşük güvenli veya birden fazla adaylı eşleşme canonical relation oluşturmaz; `reviewCandidates` içinde kalır. Katalogda bulunmayan yedi marka/model paketi de bu şekilde korunur. `includes`, `optional` ve `excludes` yalnız açık equipment ID ile sırasıyla `standard`, `optional`, `unavailable` olur; çelişkili kaynak kaydı `unknown` ve warning olarak saklanır. Araç varyantı importu sonraki aşamadır.

## Araç varyantı dry-run

`catalog:import:variants:dry-run`, `vehicles.json` içindeki 213 üst kayıt ve 335 motor girdisini core/paket planlarına karşı salt-okunur değerlendirir. `legacy_vehicle_key`, marka-model-yıl-kasa fingerprintinden türetilir; fiyat ve problem listeleri anahtarı değiştirmez. Jenerasyon zorunludur; motor, şanzıman ve paket kanıt yoksa nullable kalır ve review kaydı oluşur. Genel `DSG` ifadeleri DQ koduna tahmin edilmez. Audi A3 için yalnız 2013-2020/8V kanıtı kullanılır; 8P ve 8Y için vehicles eşleşmesi üretilmez. Problem ve fiyat importu bu aşamanın dışındadır.

## Sorun, bakım ve değer dry-run

Bu plan 20 problem arketipini, `vehicles.json` içindeki 740 problem applicability girdisini ve 137 farklı normalize edilmiş başlığı ayrı kavramlar olarak tutar. Başlık benzerliği arketip eşleştirmesi için tek başına yeterli değildir: kanıt yoksa `archetype_id` nullable kalır, `legacy_vehicle_key` ve mevcut filtrelerle review kaydı korunur. `canImport: true`, tüm kaydın eşleştiği anlamına gelmez.

946 warning/review olayı; 739 eşleşmeyen arketip, 193 güvenli canonical scope bulamayan reference price ve 14 applicability kanıtı olmayan bakım itemından oluşur. Bakım için global kapsam uydurulmaz. Güvenli 20 reference value TRY minor unit ile saklanır (`1.550.000 TL = 155000000`); bu değerler 8 genel valuation factor ile karıştırılmaz. Henüz D1'e yazım yapılmamıştır. Sonraki aşama birleşik plan ve izole local D1 apply doğrulamasıdır.
