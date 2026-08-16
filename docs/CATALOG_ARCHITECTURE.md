# Katalog mimarisi

Worker mantığı `server/cloudflare-worker/catalog` altında public, admin, repository, schemas, validation ve publishing modüllerine ayrılır. `worker.js` yalnız ortak auth/CORS ve route dispatch yapar.

Frontend `publicCatalogService` ile API-first çalışır. Published meta yoksa, 404 veya ağ hatasında mevcut statik/legacy kaynaklar korunur. Bellek cache'i revision değişince temizlenir ve auth verisinden bağımsızdır. `VehiclePicker` aynı marka → model → nesil → motor modeline normalize olur.

Admin ekranları `/admin/katalog` ve `/admin/katalog/revizyonlar/:revisionId/...` rotalarındadır. Review ekranı yalnız DB'den türetilebilen coverage'ı gösterir; persist edilmemiş import review ayrıntısı uydurulmaz.
