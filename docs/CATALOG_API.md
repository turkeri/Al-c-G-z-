# Katalog API

Public katalog yalnız `catalog_state.active` ile işaretli ve durumu `published` olan snapshot'ı okur. Yayın yoksa `GET /catalog/meta`, `{ "available": false, "source": "legacy-fallback-required" }` döndürür; istemci gömülü kataloğa geçer.

Endpoint'ler: `/catalog/meta`, `/catalog/brands`, `/catalog/models?brand_id=`, `/catalog/generations?model_id=`, `/catalog/generations/:id`, `/catalog/engines?generation_id=`, `/catalog/transmissions?generation_id=`, `/catalog/packages?generation_id=`, `/catalog/variants?generation_id=`, `/catalog/variants/:id`, `/catalog/problems`, `/catalog/maintenance` ve `/catalog/search?q=`. Listeler cursor ve en fazla 100 satırla sınırlıdır. Arama 2–80 karakterdir ve LIKE karakterleri kaçırılarak parameter binding ile çalışır.

Yanıtlar revision tabanlı `ETag` taşır; `If-None-Match` eşleşmesi 304 verir. İç kaynak yolları, actor ve review alanları public yanıta girmez. Problemler olası kontrol noktaları, fiyatlar gözlemsel referans değerler olarak sunulur.
