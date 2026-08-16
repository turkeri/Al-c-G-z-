# Katalog yönetimi

Admin API kökü `/admin/catalog`'dur. Revision list/create/detail/summary/review/validate/publish/archive ve rollback işlemleri yanında `/revisions/:revisionId/:entity` altında draft-only CRUD bulunur.

Entity registry: brands, models, generations, engines, transmissions, packages, equipment, vehicleVariants, problemArchetypes, problemApplicability, maintenanceItems, maintenanceApplicability, referenceValues ve valuationFactors. İlişki registry'si generationEngines, generationTransmissions, generationPackages ve packageEquipment'tır. Tablo ve writable kolonlar sabit allowlist'ten gelir; istemci `revision_id`, status veya actor seçemez.

| Rol | Okuma | CRUD | Validate | Publish/Rollback |
|---|---:|---:|---:|---:|
| support | Evet | Hayır | Hayır | Hayır |
| editor | Evet | Evet | Evet | Hayır |
| admin | Evet | Evet | Evet | Evet |

Yetki JWT metadata'sından değil D1 internal user/role zincirinden gelir. Admin yanıtları `no-store`'dur. Güncelleme `expectedUpdatedAt` ile optimistic concurrency uygular; fiziksel silme yerine `active=0` arşivi kullanılır. Her write audit üretir.

Entity listeleri `q`, allowlist filtreler, `sort`, `direction`, en fazla 100 limit ve opaque base64url cursor kabul eder. Sorgu değerleri bind edilir; sıralama kolonları entity registry allowlist’indedir ve `id` tie-breaker kullanılır. Relation attach/detach yalnız draft üzerinde idempotenttir, audit üretir ve validation’ı stale yapar.

## Frontend arama ve filtreler

`AdminCatalogEntityListPanel.jsx`, `src/services/catalogEntityListUi.js`'teki `ENTITY_LIST_CONFIG` üzerinden 14 entity'nin allowlist filtresini render eder — bu liste `entity-list.js`'in backend `config` nesnesinin istemci taraflı birebir aynasıdır (test bunu iki tanımı `eval` edip karşılaştırarak doğrular). Widget tipi (select/parent-picker/text) ayrıca tanımlanmaz, `adminCatalogForms.ENTITY_FORMS`'tan türetilir.

Arama VE tüm filtreler `useSearchParams` ile URL'de tutulur: sayfa yenilenince, tarayıcı geri/ileri ile ya da paylaşılan bir linkle aynı sonuç görünür. Tek debounce hattı (400ms) vardır — yerel durum her tuşta/seçimde anında güncellenir, URL'e (ve dolayısıyla ağ isteğine) yazım yalnız sessizlikten sonra olur; select filtreleri de aynı hatta yazılır, ayrı bir "hemen gönder" yolu yoktur. Filtre ya da entity/revision değişince eski liste ve cursor sıfırlanır; bir sequence sayacı eski (stale) bir response'un ekranı bozmasını engeller. Boş filtre değerleri URL'de tutulmaz, allowlist dışı hiçbir anahtar backend'e gönderilmez. Cursor sayfalaması id'ye göre tekilleştirilir, aynı kayıt iki kez eklenmez. "Filtreleri temizle" tek tıkla tüm state'i (URL dahil) sıfırlar.
