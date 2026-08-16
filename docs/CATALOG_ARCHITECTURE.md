# Canonical katalog mimarisi

## Revision snapshot modeli

Canonical katalog, `catalog_revisions` altında değişmez snapshot’lar olarak tutulur. Her katalog satırı `revision_id` taşır; aynı canonical ID farklı revision’larda tekrar kullanılabilir. `catalog_state` tek satırlı active pointer’dır ve önceki snapshot rollback için korunur. Publication history token veya oturum verisi tutmaz.

## Canonical ilişkiler

Marka → model → nesil ilişkisi aynı revision içinde composite foreign key ile korunur. Generation → engine/transmission/package ve package → equipment bağları ayrı ilişki tablolarındadır. Motor tanımı bağımsız teknik aile, vehicle variant ise seçilebilir araç kombinasyonudur.

## Stabil kimlik ve provenance

Entity `id` değerleri revisionlar arasında stabildir. `slug`, normalize isim ve code eşleştirme yardımcılarıdır. `source_file`, `source_key` ve `source_confidence` provenance sağlar; public API iç kaynak yolunu döndürmez. Yıl ve sayısal değerler schema/validation katmanında sınırlandırılır.

## Paket, donanım ve varyant

Paket adı global kimlik değildir. `catalog_generation_packages` nesil/yıl/gövde kapsamını, `catalog_package_equipment` availability bilgisini taşır. `catalog_vehicle_variants` generation/engine/transmission/package bileşimidir; belirsiz ilişkiler nullable kalır ve isim benzerliğiyle uydurulmaz.

## Problem, bakım ve değer

Problem archetype ile applicability ayrıdır; güven/evidence durumu kesin arıza iddiasını engeller. Bakım scope’u global/filtered/vehicle olarak explicit tutulur. Reference value minor unit gözlemsel değerdir; valuation factor fiyat değildir.

## Worker ve frontend

Worker mantığı `server/cloudflare-worker/catalog` altında public, admin, repository, schemas, validation ve publishing modüllerine ayrılır. `worker.js` ortak auth/CORS ve route dispatch yapar.

Frontend `publicCatalogService` ile API-first çalışır. Published meta yoksa, 404 veya ağ hatasında mevcut statik/legacy kaynaklar korunur. Bellek cache’i revision değişince temizlenir ve auth verisinden bağımsızdır. `VehiclePicker` marka → model → nesil → motor modeline normalize olur.

Admin ekranları `/admin/katalog` ve `/admin/katalog/revizyonlar/:revisionId/...` rotalarındadır. Review yalnız DB’den türetilebilen coverage’ı gösterir; persist edilmemiş import review ayrıntısı uydurulmaz.

Migration zinciri 0001–0009’dur. 0009 yalnız additive review workflow tablosu ve indeksini ekler; canonical veya legacy vehicle verisini değiştirmez.
