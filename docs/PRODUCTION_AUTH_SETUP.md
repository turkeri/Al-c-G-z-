# Production Auth ve Sync kurulumu

Bu belge değer içermez. Frontend için `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`, `VITE_APP_URL`; Worker için
`SUPABASE_URL`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE`,
`ALLOWED_ORIGINS`, `APP_ENV=production` gerekir. Service-role ve Gemini anahtarı
frontend'e veya Git'e yazılmaz.

1. Supabase'de AB bölgesinde proje oluşturun; Site URL ve redirect URL'lerine
   web alanını, localhost callback'ini ve `https://alan-adiniz/#/auth/callback`
   değerini ekleyin. Google provider ve e-posta OTP/magic link'i bu callback ile
   etkinleştirin. JWT için asimetrik signing key/JWKS kullanılmalıdır.
2. Cloudflare Worker secret/var değerlerini panel veya güvenli CI ile tanımlayın;
   `ALLOWED_ORIGINS` yalnız web alanlarını içermelidir. Capacitor originleri
   native uygulama kararı verildiğinde ayrıca, açıkça eklenir.
3. Önce yedek alın, ardından migration'ları ve deploy'u operatör yürütün:

```bash
npx wrangler d1 export arac-dedektifi --remote --output=backups/arac-dedektifi-before-auth.sql
npx wrangler d1 migrations list arac-dedektifi --remote
npx wrangler d1 migrations apply arac-dedektifi --remote
npx wrangler deploy
```

4. Frontend deployundan sonra `GET /health`, Google ve magic-link girişleri,
   iki cihazda favori/not senkronizasyonu ve logout kontrol edilir. Sorunda
   önce Worker sürümü geri alınır; D1 restore yalnız onaylı yedekle yapılır.

`npm run check:production-config` gerçek environment değerleri olmadan kasıtlı
olarak başarısız olur. CI örneği için `npm run check:production-config -- --example`
kullanılabilir.
