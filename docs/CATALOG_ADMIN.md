# Katalog yönetimi

Admin API kökü `/admin/catalog`'dur. Revision list/create/detail/summary/review/validate/publish/archive ve rollback işlemleri yanında `/revisions/:revisionId/:entity` altında draft-only CRUD bulunur.

Entity registry: brands, models, generations, engines, transmissions, packages, equipment, vehicleVariants, problemArchetypes, problemApplicability, maintenanceItems, maintenanceApplicability, referenceValues ve valuationFactors. İlişki registry'si generationEngines, generationTransmissions, generationPackages ve packageEquipment'tır. Tablo ve writable kolonlar sabit allowlist'ten gelir; istemci `revision_id`, status veya actor seçemez.

| Rol | Okuma | CRUD | Validate | Publish/Rollback |
|---|---:|---:|---:|---:|
| support | Evet | Hayır | Hayır | Hayır |
| editor | Evet | Evet | Evet | Hayır |
| admin | Evet | Evet | Evet | Evet |

Yetki JWT metadata'sından değil D1 internal user/role zincirinden gelir. Admin yanıtları `no-store`'dur. Güncelleme `expectedUpdatedAt` ile optimistic concurrency uygular; fiziksel silme yerine `active=0` arşivi kullanılır. Her write audit üretir.
