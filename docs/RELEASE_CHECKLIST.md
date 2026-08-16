# Yayın Kontrol Listesi

## Mevcut

Yerel Vite build, ESLint ve Node testleri vardır. CI ve sürümlü migration uygulanmış değildir. İki Wrangler config bulunur.

## Yayın öncesi kabul listesi

- [ ] `npm run verify` temiz çalışır.
- [ ] Worker, D1 ve istemci sözleşme testleri temizdir.
- [ ] Üretim config tek kaynaktır; `database_id`, origin ve secret bağlamaları doğrulanır.
- [ ] D1 export/Time Travel kontrolü ve rollback planı kaydedilir.
- [ ] Secret'lar Git geçmişi, bundle ve loglarda yoktur.
- [ ] Gerçek emsal fiyat yoksa düşük güven etiketi görünür.
- [ ] PWA/offline, paylaşım ve mobil hata akışları gerçek cihazda denenir.
- [ ] KVKK/gizlilik metni, destek iletişimi ve hata izleme hazırdır.
- [ ] Android için signed release, izinler ve Play Store veri beyanı gözden geçirilir.

## Kalan iş

Staging ortamı, release tagging, changelog, hata izleme, uptime/alerting ve mağaza dağıtım prosedürü gereklidir.
