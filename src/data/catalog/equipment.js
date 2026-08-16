/**
 * DONANIM SÖZLÜĞÜ
 *
 * ============================================================================
 * NEDEN AYRI BİR SÖZLÜK
 * ============================================================================
 * Paketler (Comfortline, Dynamic, Icon...) donanım listesi taşır ama aynı
 * donanım onlarca pakette tekrar eder. Her pakete "geri görüş kamerası" diye
 * yazmak yerine burada BİR KEZ tanımlanır; paketler kimliğe (id) bağlanır.
 *
 * Asıl kazanç şu: burada donanımın sadece adı değil, ALICIYI İLGİLENDİREN
 * tarafı da durur —
 *
 *   whyItMatters : bu donanım ikinci elde neden önemli
 *   checkHow     : araç başındayken çalıştığı nasıl doğrulanır
 *   riskIfBroken : bozuksa onarımı ne kadar tutar / ne kadar can sıkar
 *
 * "Panoramik cam tavan var" bilgisi tek başına bir şey ifade etmez; "panoramik
 * tavanların drenaj kanalları tıkanınca tavan döşemesine su verir, kontrol et"
 * bilgisi alıcının parasını korur.
 */

export const EQUIPMENT_CATEGORIES = [
  { id: 'guvenlik', label: 'Güvenlik' },
  { id: 'konfor', label: 'Konfor' },
  { id: 'aydinlatma', label: 'Aydınlatma' },
  { id: 'multimedya', label: 'Multimedya' },
  { id: 'surus', label: 'Sürüş destek' },
  { id: 'dis', label: 'Dış donanım' }
]

export const EQUIPMENT = [
  // ------------------------------------------------------------- AYDINLATMA
  {
    id: 'led-far',
    label: 'LED far',
    category: 'aydinlatma',
    whyItMatters: 'Gece görüşünü belirgin biçimde artırır ve ikinci elde aranan bir donanımdır.',
    checkHow: 'Farları yak, iki tarafın renk sıcaklığının aynı olduğunu kontrol et. Bir taraf sarıya çalıyorsa o far değişmiş olabilir.',
    riskIfBroken: 'Tek far ünitesi markaya göre 15.000 - 60.000 TL arasında değişir; halojene göre çok pahalıdır.'
  },
  {
    id: 'matris-far',
    label: 'LED matris / adaptif far',
    category: 'aydinlatma',
    whyItMatters: 'Karşıdan araç geldiğinde uzun huzmeyi kısmen söndürerek gece sürüşünü kolaylaştırır.',
    checkHow: 'Gösterge panelinde adaptif far uyarısı olup olmadığına bak; arıza lambası yanıyorsa ünite ya da kamera arızalıdır.',
    riskIfBroken: 'Ünite ve kontrol modülü birlikte 40.000 - 120.000 TL bulabilir.'
  },
  {
    id: 'xenon',
    label: 'Xenon far',
    category: 'aydinlatma',
    whyItMatters: 'LED öncesi üst donanım göstergesi.',
    checkHow: 'Yanma anında hafif gecikme normaldir; farklı renk tonu ampul ömrünün bittiğini gösterir.',
    riskIfBroken: 'Ampul ve balast birlikte 4.000 - 15.000 TL.'
  },
  {
    id: 'sis-far',
    label: 'Sis farı',
    category: 'aydinlatma',
    whyItMatters: 'Alt donanımlarda çıkarılan ilk kalemlerdendir; varlığı donanım seviyesi hakkında ipucu verir.',
    checkHow: 'Ayrı düğmesinden yakıp her ikisinin de çalıştığını gör.',
    riskIfBroken: 'Düşük maliyetli kalemdir.'
  },

  // ---------------------------------------------------------------- KONFOR
  {
    id: 'otomatik-klima',
    label: 'Otomatik (dijital) klima',
    category: 'konfor',
    whyItMatters: 'Manuel klimaya göre kullanım konforu belirgindir ve ikinci elde beklenen bir donanımdır.',
    checkHow: 'Sıcaklığı en düşüğe al, 5 dakika bekle. Hava gerçekten soğumuyorsa gaz kaçağı ya da kompresör sorunu vardır.',
    riskIfBroken: 'Kompresör değişimi 12.000 - 35.000 TL.'
  },
  {
    id: 'cift-bolge-klima',
    label: 'Çift bölgeli klima',
    category: 'konfor',
    whyItMatters: 'Sürücü ve yolcu ayrı sıcaklık seçebilir; üst donanım göstergesidir.',
    checkHow: 'İki tarafa farklı sıcaklık ver, üfleme sıcaklığının gerçekten ayrıştığını elinle kontrol et.',
    riskIfBroken: 'Karıştırma klapesi motoru arızası 6.000 - 18.000 TL.'
  },
  {
    id: 'koltuk-isitma',
    label: 'Koltuk ısıtma',
    category: 'konfor',
    whyItMatters: 'Kış konforu; çalışmadığı çok geç fark edilen donanımlardan biridir.',
    checkHow: 'Aracı gördüğün gün mevsim ne olursa olsun ısıtmayı aç ve koltuğun ısındığını elinle doğrula.',
    riskIfBroken: 'Koltuk teli kopması döşeme sökümü gerektirir: 5.000 - 15.000 TL.'
  },
  {
    id: 'elektrikli-koltuk',
    label: 'Elektrikli koltuk',
    category: 'konfor',
    whyItMatters: 'Üst donanım göstergesi; hafızalı olanı sürücü profili tutar.',
    checkHow: 'Tüm yönlerde hareket ettir. Takılma ya da ses varsa motor/ray sorunu vardır.',
    riskIfBroken: 'Koltuk motoru 6.000 - 20.000 TL.'
  },
  {
    id: 'deri-doseme',
    label: 'Deri döşeme',
    category: 'konfor',
    whyItMatters: 'İkinci elde fiyata doğrudan yansır; ama yıpranmışsa yenilemesi pahalıdır.',
    checkHow: 'Sürücü koltuğunun yan desteğine bak — çatlama ve incelmenin en çok görüldüğü yer orasıdır.',
    riskIfBroken: 'Tek koltuk kaplama yenileme 8.000 - 25.000 TL.'
  },
  {
    id: 'panoramik-tavan',
    label: 'Panoramik cam tavan',
    category: 'konfor',
    whyItMatters: 'İç mekân algısını büyütür ve ilanlarda öne çıkarılır.',
    checkHow:
      'Tam aç-kapa yaptır ve tavan döşemesinin köşelerini elle yokla. Nem ya da leke varsa drenaj kanalları tıkanmıştır — bu, tavan döşemesi ve elektronik için ciddi risktir.',
    riskIfBroken: 'Mekanizma onarımı 15.000 - 50.000 TL; su kaçağının yaptığı elektrik hasarı ayrıca.'
  },
  {
    id: 'anahtarsiz-giris',
    label: 'Anahtarsız giriş / çalıştırma',
    category: 'konfor',
    whyItMatters: 'Konfor kalemidir; ikinci el anahtarların maliyeti yüksektir.',
    checkHow: 'Her iki anahtarı da dene. İkinci anahtar yoksa fiyatını sor ve pazarlığa yaz.',
    riskIfBroken: 'Yeni anahtar + kodlama markaya göre 5.000 - 30.000 TL.'
  },

  // ------------------------------------------------------------ SÜRÜŞ DESTEK
  {
    id: 'park-sensoru',
    label: 'Park sensörü',
    category: 'surus',
    whyItMatters: 'Şehir içi kullanımda en çok kullanılan yardımcıdır.',
    checkHow: 'Geri vitese al, arkana bir engel koy. Sürekli öten ya da hiç ötmeyen sensör arızalıdır.',
    riskIfBroken: 'Tek sensör 1.500 - 5.000 TL.'
  },
  {
    id: 'geri-kamera',
    label: 'Geri görüş kamerası',
    category: 'surus',
    whyItMatters: 'İlanlarda en çok "var" denip aslında olmayan donanımlardan biridir.',
    checkHow: 'Geri vitese al, ekranda görüntünün açıldığını gör. Görüntü bulanıksa lens nem almıştır.',
    riskIfBroken: 'Kamera 3.000 - 12.000 TL.'
  },
  {
    id: '360-kamera',
    label: '360° kamera',
    category: 'surus',
    whyItMatters: 'Üst donanım göstergesi; dar alanda büyük kolaylık.',
    checkHow: 'Kuşbakışı görüntüde dört kameranın da görüntü verdiğini kontrol et; bir kadran siyahsa o kamera arızalıdır.',
    riskIfBroken: 'Kamera + kalibrasyon 10.000 - 35.000 TL.'
  },
  {
    id: 'kor-nokta',
    label: 'Kör nokta uyarısı',
    category: 'surus',
    whyItMatters: 'Şerit değiştirmede güvenlik katkısı yüksektir.',
    checkHow: 'Test sürüşünde yandan araç geçerken ayna içindeki ikazın yandığını gör.',
    riskIfBroken: 'Radar sensörü 12.000 - 35.000 TL; tampon boyandıysa kalibrasyon gerekir.'
  },
  {
    id: 'adaptif-hiz',
    label: 'Adaptif hız sabitleyici',
    category: 'surus',
    whyItMatters: 'Uzun yol konforunu belirgin biçimde artırır.',
    checkHow: 'Test sürüşünde önde araç varken devreye al; mesafeye göre yavaşladığını doğrula.',
    riskIfBroken: 'Ön radar arızası 20.000 - 60.000 TL; ön tampon onarımı sonrası kalibrasyon şarttır.'
  },
  {
    id: 'serit-takip',
    label: 'Şerit takip / koruma',
    category: 'surus',
    whyItMatters: 'Yeni araçlarda standart, eski araçlarda üst donanım göstergesidir.',
    checkHow: 'Ön cam kamerasının önündeki alanın çatlaksız olduğunu kontrol et; çatlak varsa sistem devre dışı kalır.',
    riskIfBroken: 'Kamera + kalibrasyon 15.000 - 40.000 TL.'
  },
  {
    id: 'hud',
    label: 'Head-up gösterge',
    category: 'surus',
    whyItMatters: 'Üst donanım; hızı ön camda gösterir.',
    checkHow: 'Gündüz parlaklığını en yükseğe al; soluk görüntü ünitenin yaşlandığını gösterir.',
    riskIfBroken: 'Ünite 25.000 - 70.000 TL.'
  },

  // --------------------------------------------------------------- GÜVENLİK
  {
    id: 'esp',
    label: 'ESP (savrulma önleyici)',
    category: 'guvenlik',
    whyItMatters: 'Islak ve karlı yolda en belirleyici güvenlik donanımıdır. Eski/alt donanımlarda olmayabilir.',
    checkHow: 'Kontak açıldığında ESP ikaz lambasının yanıp sönmesi gerekir. Hiç yanmıyorsa lamba iptal edilmiş olabilir.',
    riskIfBroken: 'Sensör 4.000 - 15.000 TL; hidrolik ünite çok daha pahalıdır.'
  },
  {
    id: 'isofix',
    label: 'Isofix çocuk koltuğu bağlantısı',
    category: 'guvenlik',
    whyItMatters: 'Çocuklu aile için pazarlık dışı bir gerekliliktir.',
    checkHow: 'Arka koltuk sırt-oturak birleşimindeki metal halkaları elle bul.',
    riskIfBroken: 'Sonradan eklenemez.'
  },
  {
    id: 'yan-perde-airbag',
    label: 'Yan / perde hava yastığı',
    category: 'guvenlik',
    whyItMatters: 'Yan çarpmada koruma seviyesini belirler.',
    checkHow:
      'Ön direk ve tavan kenarındaki "AIRBAG" yazısına bak. Araç kazalıysa yastıkların gerçekten yenilendiğini sor — açılmış yastığın yerine sadece kapak takılan araçlar vardır.',
    riskIfBroken: 'Perde yastığı seti 20.000 - 60.000 TL.'
  },

  // ------------------------------------------------------------- MULTİMEDYA
  {
    id: 'dokunmatik-ekran',
    label: 'Dokunmatik ekran',
    category: 'multimedya',
    whyItMatters: 'Navigasyon ve telefon yansıtma için gerekli temel donanımdır.',
    checkHow: 'Ekranın dört köşesine ayrı ayrı dokun; ölü bölge varsa dokunmatik katman bozulmuştur.',
    riskIfBroken: 'Ünite 10.000 - 40.000 TL.'
  },
  {
    id: 'apple-android',
    label: 'Apple CarPlay / Android Auto',
    category: 'multimedya',
    whyItMatters: 'Fabrika navigasyonunun eskimesini önemsiz kılar; ikinci elde aranır.',
    checkHow: 'Kendi telefonunu kabloyla bağla ve gerçekten açıldığını gör; "yazılımla eklenir" sözüne güvenme.',
    riskIfBroken: 'Bazı araçlarda yazılım güncellemesiyle eklenir, bazılarında ünite değişimi gerekir.'
  },
  {
    id: 'navigasyon',
    label: 'Fabrika navigasyonu',
    category: 'multimedya',
    whyItMatters: 'Eski araçlarda harita güncellemesi ücretli ve zahmetlidir; CarPlay varsa önemi azalır.',
    checkHow: 'Harita sürümüne bak; çok eskiyse güncelleme maliyetini sor.',
    riskIfBroken: 'Harita güncelleme 2.000 - 8.000 TL.'
  },

  // ---------------------------------------------------------------- DIŞ
  {
    id: 'alasim-jant',
    label: 'Alaşım jant',
    category: 'dis',
    whyItMatters: 'Görünümün yanında ikinci el fiyatına da yansır.',
    checkHow: 'Jant kenarlarındaki bordür izlerine bak; ağır darbe almış jant balans tutmaz.',
    riskIfBroken: 'Tek jant 4.000 - 20.000 TL.'
  },
  {
    id: 'elektrikli-bagaj',
    label: 'Elektrikli bagaj kapağı',
    category: 'dis',
    whyItMatters: 'Üst donanım göstergesi.',
    checkHow: 'Tam aç-kapa yaptır; yarı yolda duruyorsa amortisör ya da motor zayıflamıştır.',
    riskIfBroken: 'Mekanizma 10.000 - 30.000 TL.'
  },
  {
    id: 'cekme-demiri',
    label: 'Çeki demiri',
    category: 'dis',
    whyItMatters:
      'Varlığı aracın römork/karavan çektiğini gösterebilir; bu, şanzıman ve debriyajın normalden fazla yorulduğu anlamına gelir.',
    checkHow: 'Çeki demiri varsa ne amaçla kullanıldığını sor ve şanzıman geçmişini ayrıca sorgula.',
    riskIfBroken: 'Kendisi ucuzdur; asıl konu aktarma organlarının yorgunluğudur.'
  }
]

const EQUIPMENT_BY_ID = new Map(EQUIPMENT.map((e) => [e.id, e]))

export function getEquipment(id) {
  return EQUIPMENT_BY_ID.get(id) || null
}

/** Kimlik listesini tam kayıtlara çevirir; bilinmeyen kimlikler atlanır. */
export function expandEquipment(ids) {
  return (ids || []).map((id) => EQUIPMENT_BY_ID.get(id)).filter(Boolean)
}

/** Kategorilere göre gruplar — ekranda başlıklı liste için. */
export function groupEquipment(items) {
  const groups = new Map()
  items.forEach((item) => {
    if (!groups.has(item.category)) groups.set(item.category, [])
    groups.get(item.category).push(item)
  })
  return EQUIPMENT_CATEGORIES.filter((c) => groups.has(c.id)).map((c) => ({
    ...c,
    items: groups.get(c.id)
  }))
}

export function getEquipmentCount() {
  return EQUIPMENT.length
}
