# Çekirdek katalog dry-run importu

`npm run catalog:import:core:dry-run` yalnız bellekte canonical revision planı üretir. Ağ, Wrangler, D1 bağlantısı, SQL üretimi ve dosya yazımı kullanmaz; `--remote` açıkça reddedilir.

ID’ler namespace + parent + source ID/code veya normalleştirilmiş teknik anahtardan deterministik üretilir. Kaynak manifesti SHA-256 hashleriyle raporlanır ve çalışma sonunda tekrar hesaplanarak değişmediği doğrulanır; createdAt canonical ID’ye girmez. Blocking error `canImport: false` ve non-zero exit code üretir; warning tek başına importu engellemez.

Dry-run D1 snapshot karşılaştırması yapmaz: adaylar `createCandidates`, update/unchanged `notCompared` olarak raporlanır. Bu aşama yalnız brands/models/generations/engines/transmissions ve ID kanıtlı generation ilişkilerini içerir. Paket, problem ve vehicle variant importu sonraki aşamadır.

Örnekler: `npm run catalog:import:core:dry-run`, `npm run catalog:import:core:dry-run -- --json`, ayrıntı için `--include-records`.
