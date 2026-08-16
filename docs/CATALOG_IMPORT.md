# Çekirdek katalog dry-run importu

`npm run catalog:import:core:dry-run` yalnız bellekte canonical revision planı üretir. Ağ, Wrangler, D1 bağlantısı, SQL üretimi ve dosya yazımı kullanmaz; `--remote` açıkça reddedilir.

ID’ler namespace + parent + source ID/code veya normalleştirilmiş teknik anahtardan deterministik üretilir. Kaynak manifesti SHA-256 hashleriyle raporlanır ve çalışma sonunda tekrar hesaplanarak değişmediği doğrulanır; createdAt canonical ID’ye girmez. Blocking error `canImport: false` ve non-zero exit code üretir; warning tek başına importu engellemez.

Dry-run D1 snapshot karşılaştırması yapmaz: adaylar `createCandidates`, update/unchanged `notCompared` olarak raporlanır. Bu aşama yalnız brands/models/generations/engines/transmissions ve ID kanıtlı generation ilişkilerini içerir. Paket, problem ve vehicle variant importu sonraki aşamadır.

Örnekler: `npm run catalog:import:core:dry-run`, `npm run catalog:import:core:dry-run -- --json`, ayrıntı için `--include-records`.

## Paket ve donanım dry-run

`npm run catalog:import:packages:dry-run` yalnız `packages.js`, `equipment.js` ve core dry-run planını okur. D1'e yazmaz, SQL üretmez ve `--remote` seçeneğini reddeder. Paket adı global unique değildir: canonical paket ID'si marka, model, jenerasyon/kasa-yıl kapsamı ve normalize paket adından üretilir. Kaynak paketin kapsamına bağlı olması bilinçli bir modelleme tercihidir; ayrı marka/model/yıl kapsamındaki aynı adlar ayrı pakettir.

Jenerasyon eşleştirme sırası açık ID (high), tekil marka+model+jenerasyon kodu+yıl (medium), ardından tekil marka+model+yıl kapsamıdır (medium). Düşük güvenli veya birden fazla adaylı eşleşme canonical relation oluşturmaz; `reviewCandidates` içinde kalır. Katalogda bulunmayan yedi marka/model paketi de bu şekilde korunur. `includes`, `optional` ve `excludes` yalnız açık equipment ID ile sırasıyla `standard`, `optional`, `unavailable` olur; çelişkili kaynak kaydı `unknown` ve warning olarak saklanır. Araç varyantı importu sonraki aşamadır.
