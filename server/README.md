# Gelişmiş Analiz Sunucusu (Kurulum)

Uygulamadaki **"Aracımın Nesi Var?"** ekranı, internet varsa şikayeti bir sunucuya gönderip
daha detaylı bir değerlendirme alır. Bu sunucu, Google Gemini API'sini kullanır.

**Neden aracı (proxy) sunucu gerekiyor?**
API anahtarı doğrudan uygulamanın içine konulamaz. Android APK'sı kolayca açılıp içindeki
anahtar çıkarılabilir; başkaları senin hesabına istek atar ve kotanı/faturanı tüketir.
Bu yüzden anahtar yalnızca burada, Cloudflare'ın gizli değişkeninde durur.

Kurulum ücretsizdir: Cloudflare Workers ücretsiz katmanı günde 100.000 istek verir,
Gemini API'nin de kredi kartı istemeyen bir ücretsiz katmanı vardır.

---

## 1. Gemini API anahtarı al

1. https://aistudio.google.com/apikey adresine Google hesabınla gir.
2. **Create API key** de, çıkan anahtarı kopyala.
3. Bu anahtarı kimseyle paylaşma, GitHub'a koyma.

## 2. Cloudflare hesabı aç

https://dash.cloudflare.com/sign-up — ücretsiz, kredi kartı istemez.

## 3. Worker'ı yayına al

Bilgisayarında (veya Node kurulu herhangi bir ortamda) bu klasöre gel:

```bash
cd server/cloudflare-worker

# Cloudflare hesabına giriş yap (tarayıcı açılır)
npx wrangler login

# API anahtarını gizli olarak ekle (ekranda anahtarı yapıştırıp Enter'a bas)
npx wrangler secret put GEMINI_API_KEY

# Yayına al
npx wrangler deploy
```

Komut bittiğinde şuna benzer bir adres verir:

```
https://arac-dedektifi-ai.<kullanici-adin>.workers.dev
```

Bu adresi kopyala.

## 4. Uygulamaya adresi tanıt

Projenin kök dizininde `.env` dosyası oluştur (`.env.example` dosyasını kopyalayabilirsin):

```
VITE_AI_PROXY_URL=https://arac-dedektifi-ai.kullanici-adin.workers.dev
```

Sonra yeniden derle:

```bash
npm run build
```

Bu kadar. Uygulamayı açıp bir şikayet yazdığında "Detaylı Analiz" bölümü gelecek.

---

## Test etmek için

```bash
curl -X POST https://arac-dedektifi-ai.kullanici-adin.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"complaint":"Sogukta zor calisiyor ve rolantide sarsiyor","vehicle":{"brand":"Renault","model":"Megane","engine":"1.5 dCi"}}'
```

JSON içinde `result.causes` dizisi dönüyorsa her şey çalışıyor demektir.

---

## Güvenlik ve maliyet notları

- **Anahtar sızmaz:** `GEMINI_API_KEY` yalnızca Cloudflare'da tutulur, uygulamanın
  derlenmiş dosyalarına hiç girmez.
- **Kimler çağırabilir:** Varsayılan olarak herkes çağırabilir. Yayına aldıktan sonra
  `wrangler.toml` içindeki `ALLOWED_ORIGINS` satırını açıp kendi alan adını yazarsan
  başka sitelerden çağrılamaz. (Capacitor ile paketlenmiş Android uygulaması genelde
  `capacitor://localhost` veya `https://localhost` kaynağıyla istek atar; ikisini de eklemen gerekebilir.)
- **Kota koruması:** Worker'da dakikada 12 istek sınırı vardır ama bu sınır ancak bir KV
  namespace bağlarsan devreye girer. Bağlamak için:
  ```bash
  npx wrangler kv namespace create RATE_LIMIT_KV
  ```
  Çıkan `id` değerini `wrangler.toml` içindeki yorumlu `[[kv_namespaces]]` bloğuna yazıp
  yorumu kaldır, sonra tekrar `npx wrangler deploy` yap.
- **Ücretsiz katman biterse:** Gemini günlük ücretsiz kota dolduğunda worker hata döner;
  uygulama bunu sessizce yutar ve cihaz içi analizle çalışmaya devam eder, çökmez.

## Uygulama proxy olmadan da çalışır

`VITE_AI_PROXY_URL` boş bırakılırsa "Detaylı Analiz" bölümü hiç görünmez ve uygulama
tamamen cihaz içi kural motoruyla (50 belirti, 740 kronik sorun kaydı) çalışır.
İnternet kesildiğinde de aynı şey olur. Yani sunucu kurmadan da uygulama eksiksiz kullanılabilir.
