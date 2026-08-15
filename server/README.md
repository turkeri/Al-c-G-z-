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

---

# Araç Veritabanı (Cloudflare D1)

Bu adım **opsiyoneldir**. Kurmazsan uygulama, içine gömülü veriyle (36 marka, 213 model,
740 arıza kaydı) bugünkü gibi çalışmaya devam eder — hiçbir şey bozulmaz.

## Neden kuruluyor

Veri uygulamanın içinde gömülü olduğu sürece:

- Her veri güncellemesi için yeni bir uygulama sürümü yayınlaman gerekir.
- Veri büyüdükçe uygulama boyutu büyür (şu an veri tek başına 624 KB).

D1'e geçince veri sunucuda durur, uygulama açılışta yalnızca **değişenleri** indirir.
Fiyat güncellemesi ya da yeni model eklemek için artık uygulama yayınlamana gerek kalmaz.

Gömülü veri yine de silinmez: internet yokken (kapalı otoparkta araca bakarken)
uygulamanın çalışmaya devam etmesi için çekirdek kopya uygulamanın içinde kalır.
Sunucudan gelenler onun **üzerine** bindirilir.

## Kurulum

Aşağıdaki komutları `server/cloudflare-worker` klasöründe çalıştır.

**1. Veritabanını oluştur**

```bash
npx wrangler d1 create arac-dedektifi
```

Komut sana bir `database_id` verir. Bunu `wrangler.toml` içindeki
`BURAYA_D1_DATABASE_ID` yazan yere yapıştır.

**2. Tabloları kur**

```bash
npx wrangler d1 execute arac-dedektifi --remote --file=../d1/schema.sql
```

**3. Yönetici anahtarını belirle**

Veriyi yükleyebilmek için bir parola belirlersin (kendi uydurduğun bir metin):

```bash
npx wrangler secret put ADMIN_TOKEN
```

Bu anahtar tanımlı değilse yükleme ucu tamamen kapalıdır.

**4. Veriyi yükle**

İki yol var, birini seç.

*Yol A — tarayıcıdan (tablet için önerilen):*

`server/d1/import.html` dosyasını Spck önizlemesiyle aç. Worker adresini ve yönetici
anahtarını gir, **Veriyi Yükle** butonuna bas. Kayıtlar 40'arlı parçalar halinde
gönderilir, ilerleme çubuğundan takip edersin. Komut satırına gerek yoktur.

*Yol B — komut satırından:*

```bash
node server/d1/generate-seed.mjs
npx wrangler d1 execute arac-dedektifi --remote --file=../d1/seed.sql
```

(`seed.sql` üretilen bir dosyadır, depoya dahil edilmez.)

**5. Worker'ı yeniden yayınla**

```bash
npx wrangler deploy
```

**6. Doğrula**

Tarayıcıdan worker adresini aç. `"database": "bagli"` yazıyorsa tamam.
Ardından `ADRES/data/version` açıldığında `{"revision":1,"count":213}` görmelisin.

## Veriyi güncellemek

`src/data/vehicles.json` dosyasında bir kaydı değiştirdikten sonra:

1. Yükleyici sayfasındaki **Revizyon numarası** alanını bir artır (1 → 2).
2. Yüklemeyi tekrar çalıştır.
3. Uygulamalar bir sonraki açılışta yalnızca değişen kayıtları indirir.

Revizyon numarasını artırmayı unutursan istemciler güncellemeyi görmez.

## Uçlar

| Uç | Ne yapar |
| --- | --- |
| `GET /data/version` | Sunucudaki güncel revizyon ve kayıt sayısı |
| `GET /data/vehicles?since=N` | N'den yeni kayıtlar (sayfalı, 60'arlı) |
| `POST /data/import` | Veri yükleme (ADMIN_TOKEN ister, 40'arlı parçalar) |
| `GET /account` | Cihazın kalan analiz hakkı (hak DÜŞMEZ, sadece okur) |

Veri uçları API anahtarından bağımsızdır: yapay zekâ kapalı olsa da veritabanı çalışır.
D1 bağlı değilse uçlar 503 döner ve uygulama sessizce gömülü veriye düşer.

## `submissions` tablosu

Şemada ayrıca bir `submissions` tablosu var. Topluluk katkıları ve yapay zekâ
araştırmaları buraya düşer ve elle doğrulanmış `vehicles` tablosuyla **karıştırılmaz** —
kullanıcıya ayrı etiketle gösterilmesi ve ancak sen onayladıktan sonra asıl veriye
taşınması için. Bu akış henüz uygulamaya bağlanmadı, tablo ileriye hazırlık olarak duruyor.


# Analiz Kotası (kullanım hakkı)

Her yapay zekâ çağrısı gerçek para maliyetidir. Bu yüzden aylık bir analiz
hakkı vardır ve **kota sunucuda zorunlu tutulur**.

| Plan | Aylık analiz |
| --- | --- |
| Ücretsiz | 5 |
| Premium | 100 |

Ayrıca tek bir IP adresi için aylık 40 analiz tavanı vardır (ikinci savunma
hattı).

## Neden istemcide değil

İstemcide tutulan bir sayaç, uygulama verisini silmek kadar kolay sıfırlanır ve
hiçbir koruma sağlamaz. Sayaç D1'de tutulur ve kontrol, istek Gemini'ye
gitmeden **önce** yapılır. Kota dolduğunda çağrı hiç yapılmaz, dolayısıyla
maliyet de oluşmaz.

## Dürüst sınır — bu gerçek bir kimlik doğrulama değildir

Hesap, cihazda üretilen bir UUID'ye bağlıdır; e-posta/şifre istenmez. Bunun
bedeli açıktır: **kullanıcı uygulama verisini silerse yeni kimlik oluşur ve
ücretsiz hakkı sıfırlanır.**

Bu bilinçli bir tercih: kayıt zorunluluğu, uygulamayı ilk kez deneyen
kullanıcıların çoğunu kaybettirir. Amaç kararlı bir saldırganı durdurmak değil,
sıradan aşırı kullanımın faturayı patlatmasını önlemektir. IP tavanı bu açığı
kısmen kapatır.

Gerçekten ödeme alınacaksa bu kimliğin üzerine e-posta/telefon doğrulaması
eklenmelidir; `accounts` tablosundaki `plan` alanı zaten hesaba bağlı olduğu
için o adımda şema değişikliği gerekmez.

## Kurulum (mevcut kuruluma ekleme)

Kota tabloları şemaya sonradan eklendi. Zaten kurulu bir D1 veritabanın varsa
şemayı tekrar çalıştırman yeterli — tüm tablolar `IF NOT EXISTS` ile
tanımlıdır, mevcut araç verisine dokunmaz:

```bash
npx wrangler d1 execute arac-dedektifi --remote --file=../d1/schema.sql
npx wrangler deploy
```

Doğrulamak için worker adresini tarayıcıdan aç; `"kota": "zorunlu (ucretsiz 5/ay)"`
yazmalı.

## Bir kullanıcıyı premium yapmak

Ödeme altyapısı yok; plan elle değiştirilir:

```bash
npx wrangler d1 execute arac-dedektifi --remote \
  --command="UPDATE accounts SET plan='premium' WHERE id='CIHAZ-KIMLIGI'"
```

Cihaz kimliğini kullanıcı, tarayıcı konsolunda
`localStorage.getItem('arac-dedektifi:device-id')` ile görebilir.

## Veritabanı bağlı değilse

Kota uygulanmaz ve servis çalışmaya devam eder (IP hız limiti devrede kalır).
Bu, veritabanı bir sorun yaşadığında uygulamanın tamamen durmaması içindir.
