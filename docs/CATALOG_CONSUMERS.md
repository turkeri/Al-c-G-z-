# Runtime katalog tüketicileri

`catalogAdapter`, normal kullanıcı runtime’ındaki marka/model/motor seçimi için tek uyumluluk girişidir. Published canonical API önceliklidir; unpublished, 404 veya ağ hatasında legacy veri sessiz fallback olur. Boş canonical liste hata sayılmaz. Revision değişince public bellek cache’i temizlenir.

VehiclePicker doğrudan published zinciri kullanır. Analysis, diagnosis, inspection, listing, compare, valuation, chronic-problem, seller-question, ownership-cost ve market servislerinin vehicle lookup importları adapter arkasındadır. `vehicleService` legacy fallback implementasyonudur; importer, inventory ve testler statik kaynakları doğrudan okuyabilir.

Reference value gözlemsel araç değeridir ve minor unit saklanır. Valuation factor genel katsayıdır, fiyat değildir. Canonical reference yoksa mevcut `referencePrice` hesabı korunur. Kullanıcı arayüzü D1, revision veya SQL ayrıntısı göstermez.
