# Worker API Test Planı

Bu plan, gerçek Cloudflare hesabı, secret, remote D1 veya deploy gerektirmeden önce kabul koşullarını tanımlar.

| Uç | Yerel test | Beklenen durum |
| --- | --- | --- |
| `GET /data/version` | D1 mock | Bağlı değilse 503, bağlıysa revision/count |
| `GET /data/vehicles` | D1 mock | `since` doğrulama, sayfalama, yalnız delta |
| `POST /data/import` | D1 mock + admin token | Yetkisiz 401/403; batch şema/doz sınırı |
| `GET /account` | D1 mock | Cihaz kimliği olmadan 400; kota düşmemeli |
| `GET|POST /history` | D1 mock | Sadece izinli özet alanlar; başkasının kaydı yok |
| `GET /listing/platforms` | saf unit test | Platform ve `fetchable` doğru |
| `POST /listing/fetch` | adapter mock | HTTPS allowlist; SSRF/redirect/oversize reddi; fallback sözleşmesi |
| AI görevi | Gemini fetch mock | secret yoksa güvenli hata; kota önce; fotoğraf sınırları |

Uygulama notu: Worker şu an tek dosya ve D1 binding'ine doğrudan bağlıdır. Phase 2'de `wrangler` + Workers test pool veya Miniflare ile `fetch` entegrasyon testleri eklenmelidir. Bu, remote D1 veya deploy gerektirmez; test fixture'ları ayrı preview/yerel DB kullanmalıdır.
