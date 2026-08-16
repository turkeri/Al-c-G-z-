# Mimari

## Mevcut

```text
React/Vite PWA
  ├─ gömülü JSON + katalog modülleri
  ├─ localStorage / IndexedDB cihaz verisi
  └─ Cloudflare Worker (opsiyonel)
       ├─ Gemini proxy
       ├─ D1 katalog delta senkronizasyonu
       ├─ cihaz kimliği temelli kota ve özet geçmiş
       └─ ilan adapter/fallback uçları
```

İstemci, katalog ve deterministik analiz için internete bağımlı değildir. Worker'da `GEMINI_API_KEY` secret olmalıdır; istemciye gönderilmez. D1, `vehicles.payload` JSON satırları ve `revision` ile delta senkronize edilir.

Kökteki [`wrangler.jsonc`](../wrangler.jsonc) aktif D1 kimliği içerir. [`server/cloudflare-worker/wrangler.toml`](../server/cloudflare-worker/wrangler.toml) ise örnek kimlikli eski bir ikinci yapılandırmadır. Aynı Worker için iki yapılandırma yanlış ortama deploy riskidir.

## Hedef

Tek üretim Worker yapılandırması kökte `wrangler.jsonc` olacak; Worker klasöründeki örnek yalnızca açıkça `wrangler.example.toml` olarak tutulacak veya kaldırılması için onay alınacaktır. Ortak API sözleşmesi sürümlenecek; istemci, Worker ve Android aynı endpointleri kullanacaktır.

Android, Capacitor kabuğu üzerinden web derlemesini çalıştıracak. İlan paylaşımı native intent ile alınır; uygulama URL'yi yalnızca görünür WebView'de kullanıcı etkileşimiyle açar. İzinli alanların yerel, kullanıcı onaylı kopyası analiz edilir; oturum/çerez/parola Worker'a aktarılmaz.

## Kabul ölçütleri

- Tek, açık üretim config; preview/prod ayrımı ve bağlamaları belgeli.
- Worker endpointleri origin, boyut, şema ve hız limitleriyle korunur.
- D1 şema değişiklikleri yalnızca sürümlü migration üzerinden gider.
- İstemci ağ hatasında güvenli biçimde gömülü veriyle devam eder.

## Kalan iş

Config birleştirme onayı, Worker test ortamı, gözlemlenebilirlik, Android Capacitor kurulumu, kimlik sağlayıcısı ve kalıcı medya depolama seçimi bekliyor.
