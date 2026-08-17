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
  {
    id: 'halojen-far',
    label: 'Halojen far',
    category: 'aydinlatma',
    whyItMatters:
      'Giriş donanımının işaretidir. Kötü değil ama gece görüşü LED/xenon\'a göre zayıftır ve ikinci elde fiyat farkı yaratır.',
    checkHow:
      'Far camının içten buğulu olup olmadığına bak. Buğu, far içine su girdiğini ve ampul yuvasının paslanacağını gösterir.',
    riskIfBroken: 'Far ünitesi 3.000 - 12.000 TL; ampul çok ucuzdur.'
  },
  {
    id: 'led-gunduz',
    label: 'LED gündüz farı',
    category: 'aydinlatma',
    whyItMatters:
      'Farın kendisi LED olmasa da gündüz farı LED olabilir. İlanlarda "LED far" diye yazılan şeyin çoğu aslında budur.',
    checkHow: 'Kontağı aç, farları kapalı tut. Yanan ince çizgi gündüz farıdır; kısa huzmeyi ayrıca yakıp rengini karşılaştır.',
    riskIfBroken: 'LED şeridi çoğu araçta far ünitesine gömülüdür; tek LED sönse bile ünite komple değişir.'
  },
  {
    id: 'otomatik-far',
    label: 'Otomatik far (ışık sensörü)',
    category: 'aydinlatma',
    whyItMatters: 'Tünel ve akşam geçişlerinde farı unutmayı önler; orta ve üst donanım göstergesidir.',
    checkHow: 'Far kolunu AUTO konumuna al, aracı kapalı bir garaja/gölgeye sok. Farlar kendiliğinden yanmalıdır.',
    riskIfBroken: 'Ön cam iç yüzeyindeki sensör 2.000 - 6.000 TL; ön cam değiştiyse sensör doğru takılmamış olabilir.'
  },


  // ---------------------------------------------------------------- KONFOR
  {
    id: 'manuel-klima',
    label: 'Manuel klima',
    category: 'konfor',
    whyItMatters:
      'Giriş donanımının işaretidir. Soğutma gücü otomatik klimayla aynıdır; fark sadece sıcaklığın elle ayarlanmasıdır.',
    checkHow:
      'Fanı en yükseğe, sıcaklığı en soğuğa al ve 5 dakika bekle. Menfezden gelen hava soğumuyorsa gaz kaçağı vardır.',
    riskIfBroken: 'Gaz + kaçak onarımı 3.000 - 10.000 TL; kompresör 12.000 - 35.000 TL.'
  },
  {
    id: 'arka-klima-menfezi',
    label: 'Arka konsol havalandırma',
    category: 'konfor',
    whyItMatters: 'Arkada sürekli yolcu taşıyan aile için gerçek bir fark yaratır; alt donanımlarda çıkarılır.',
    checkHow: 'Ön koltuklar arasındaki konsolun arka yüzüne bak; menfez yoksa sonradan eklenemez.',
    riskIfBroken: 'Nadiren arızalanır.'
  },
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
    id: 'koltuk-hafiza',
    label: 'Hafızalı koltuk',
    category: 'konfor',
    whyItMatters: 'Üst donanım göstergesi; aracı iki kişi kullanıyorsa günlük konfor farkı yaratır.',
    checkHow: 'Bir konumu hafızaya al, koltuğu tamamen kaydır, sonra hafıza tuşuna bas. Koltuk aynı yere dönmelidir.',
    riskIfBroken: 'Hafıza modülü ve motorlar birlikte 10.000 - 30.000 TL.'
  },
  {
    id: 'koltuk-havalandirma',
    label: 'Havalandırmalı (soğutmalı) koltuk',
    category: 'konfor',
    whyItMatters: 'Türkiye yaz koşullarında en çok değer verilen üst donanımlardan biridir; genelde sadece tepe pakette bulunur.',
    checkHow:
      'Çalıştır ve elini koltuk yüzeyine bastır — hava emişini hissetmelisin. Fan sesi var ama emiş yoksa kanal tıkalıdır.',
    riskIfBroken: 'Koltuk fanı değişimi döşeme sökümü gerektirir: 8.000 - 25.000 TL.'
  },
  {
    id: 'direksiyon-isitma',
    label: 'Direksiyon ısıtma',
    category: 'konfor',
    whyItMatters: 'Kış konforu kalemidir; sonradan eklenmesi pratikte mümkün değildir.',
    checkHow: 'Düğmesine bas ve 2-3 dakika içinde jantın ısındığını elinle doğrula.',
    riskIfBroken: 'Direksiyon simidi komple değişir: 8.000 - 25.000 TL.'
  },
  {
    id: 'kumas-doseme',
    label: 'Kumaş döşeme',
    category: 'konfor',
    whyItMatters:
      'Giriş/orta donanım işaretidir. Deriye göre ucuz görünür ama iyi durumdaki kumaş, yıpranmış deriden daha az masraf çıkarır.',
    checkHow: 'Sürücü koltuğunun yan desteğinde tüylenme ve delik ara; leke temizliği 1.500 - 4.000 TL tutar.',
    riskIfBroken: 'Tek koltuk kılıfı yenileme 4.000 - 10.000 TL.'
  },
  {
    id: 'yarim-deri-doseme',
    label: 'Yarı deri (deri + kumaş) döşeme',
    category: 'konfor',
    whyItMatters:
      'İlanlarda çoğu zaman kısaca "deri" yazılır. Oturma yüzeyi kumaş, yanlar deri görünümlü suni malzemedir.',
    checkHow: 'Oturma yüzeyine elini sürt: kumaşsa yarı deridir. İlanda "deri" yazıp yarı deri çıkan araç pazarlık konusudur.',
    riskIfBroken: 'Suni deri yanlarda çatlama yapar; tek koltuk yenileme 6.000 - 15.000 TL.'
  },
  {
    id: 'ambiyans-isik',
    label: 'Ambiyans (iç mekân) aydınlatma',
    category: 'konfor',
    whyItMatters: 'Üst donanım göstergesidir; mekanik bir katkısı yoktur ama ikinci elde talebi artırır.',
    checkHow: 'Menüden rengi değiştir; bir bölgenin sönük kalması LED şeridinin öldüğünü gösterir.',
    riskIfBroken: 'Tek şerit değişimi kaplama sökümüyle 3.000 - 10.000 TL.'
  },
  {
    id: 'deri-direksiyon',
    label: 'Deri direksiyon',
    category: 'konfor',
    whyItMatters:
      'Küçük ama kilometre hakkında ipucu veren bir kalemdir: aşınmış deri direksiyon ile düşük kilometre yan yana durmaz.',
    checkHow:
      'Saat 10 ve 2 tutuş noktalarına bak. Parlamış/incelmiş deri, gösterge kilometresinden fazla kullanım anlamına gelir.',
    riskIfBroken: 'Deri kaplama yenileme 3.000 - 9.000 TL.'
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
    label: 'Park sensörü (arka)',
    category: 'surus',
    whyItMatters: 'Şehir içi kullanımda en çok kullanılan yardımcıdır.',
    checkHow: 'Geri vitese al, arkana bir engel koy. Sürekli öten ya da hiç ötmeyen sensör arızalıdır.',
    riskIfBroken: 'Tek sensör 1.500 - 5.000 TL.'
  },
  {
    id: 'on-park-sensoru',
    label: 'Ön park sensörü',
    category: 'surus',
    whyItMatters:
      'Çoğu araçta arka sensör standart, ön sensör üst pakete özeldir. İlanda "park sensörü var" cümlesi ikisini ayırmaz.',
    checkHow:
      'İleri vitese al ve ön tampona yaklaş. Ön tamponda sensör deliği görünmüyorsa donanım yoktur; delik varsa boyalı olup olmadığına da bak.',
    riskIfBroken: 'Tek sensör 1.500 - 5.000 TL; tampon boyandıysa sensör gövdesi boya yüzünden sağır kalabilir.'
  },
  {
    id: 'otomatik-park',
    label: 'Otomatik park asistanı',
    category: 'surus',
    whyItMatters: 'Üst donanım göstergesi; nadiren kullanılır ama varlığı paketin tepe seviye olduğunu doğrular.',
    checkHow: 'Boş bir park yerinde tuşuna basıp sistemin yer aradığını gör; hata veriyorsa sensörlerden biri arızalıdır.',
    riskIfBroken: 'Sensör + modül 15.000 - 40.000 TL.'
  },
  {
    id: 'hiz-sabitleyici',
    label: 'Hız sabitleyici (cruise control)',
    category: 'surus',
    whyItMatters: 'Adaptif olmayan klasik türü; uzun yol kullanımı olan alıcı için beklenen donanımdır.',
    checkHow: 'Test sürüşünde 80 km/s üzerinde devreye al ve hızın sabit kaldığını gör.',
    riskIfBroken: 'Direksiyon kumandası/kol değişimi 2.000 - 8.000 TL.'
  },
  {
    id: 'yagmur-sensoru',
    label: 'Yağmur sensörü',
    category: 'surus',
    whyItMatters: 'Orta ve üst donanım göstergesidir; ön cam değişimlerinde en sık atlanan parçadır.',
    checkHow:
      'Silecek kolunu AUTO\'ya al ve cama su püskürt. Çalışmıyorsa ön cam değişmiş ve sensör doğru yapıştırılmamış olabilir.',
    riskIfBroken: 'Sensör + yapıştırma 2.000 - 6.000 TL.'
  },
  {
    id: 'trafik-isareti',
    label: 'Trafik işareti tanıma',
    category: 'surus',
    whyItMatters: 'Ön cam kamerasının varlığını gösterir; şerit takip ve acil frenleme genelde aynı kameraya bağlıdır.',
    checkHow: 'Test sürüşünde gösterge panelinde hız limiti tabelasının belirdiğini gör.',
    riskIfBroken: 'Kamera arızası şerit takip ve acil frenlemeyi de düşürür: 15.000 - 40.000 TL.'
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
    id: 'acil-frenleme',
    label: 'Otonom acil frenleme',
    category: 'guvenlik',
    whyItMatters:
      'Şehir içi arkadan çarpmaların büyük kısmını önleyen donanımdır. 2018 sonrası araçlarda yaygınlaştı, öncesinde üst pakete özeldi.',
    checkHow:
      'Gösterge panelinde sistemin kapalı/arızalı ikazı olup olmadığına bak. Ön cam ya da ön tampon onarılmışsa kalibrasyonu sorulmalıdır.',
    riskIfBroken: 'Radar/kamera değişimi ve kalibrasyon 20.000 - 60.000 TL.'
  },
  {
    id: 'lastik-basinc',
    label: 'Lastik basınç uyarı sistemi',
    category: 'guvenlik',
    whyItMatters:
      'Yavaş hava kaçıran lastiği erken haber verir. Doğrudan ölçen türünde her jantta sensör vardır ve kış/yaz set değişiminde ek maliyet çıkarır.',
    checkHow: 'Kontak açıldığında ikaz lambasının yanıp sönmesi gerekir. Sürekli yanıyorsa bir jantın sensörü ölmüştür.',
    riskIfBroken: 'Sensör başına 1.500 - 5.000 TL; ikinci jant setinde sensör yoksa uyarı sürekli yanar.'
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

  {
    id: 'bluetooth',
    label: 'Bluetooth telefon bağlantısı',
    category: 'multimedya',
    whyItMatters:
      'Ekransız araçlarda bile bulunabilir. 2015 öncesi giriş donanımlarında yoktur ve sonradan eklenmesi ünite değişimi gerektirir.',
    checkHow: 'Kendi telefonunu eşleştir ve bir arama yap; karşı taraf seni duyuyor mu diye sor — mikrofon ayrı arızalanır.',
    riskIfBroken: 'Mikrofon 1.500 - 4.000 TL; ünite değişimi 8.000 - 30.000 TL.'
  },
  {
    id: 'kablosuz-sarj',
    label: 'Kablosuz telefon şarjı',
    category: 'multimedya',
    whyItMatters: 'Üst donanım göstergesi; 2018 sonrası araçlarda yaygınlaştı.',
    checkHow: 'Telefonunu koy ve şarj ikonunun gerçekten geçtiğini gör; ısınma yapıyorsa ped zayıflamıştır.',
    riskIfBroken: 'Şarj pedi 3.000 - 10.000 TL.'
  },
  {
    id: 'dijital-gosterge',
    label: 'Dijital gösterge paneli',
    category: 'multimedya',
    whyItMatters:
      'Üst donanım göstergesidir. Analog göstergeye göre pahalıdır ve arızasında komple ünite değişir.',
    checkHow: 'Ekranda ölü piksel, titreme ve açılış gecikmesi ara; soğuk havada geç açılan panel arızaya yakındır.',
    riskIfBroken: 'Gösterge ünitesi + kodlama 20.000 - 60.000 TL.'
  },

  // ---------------------------------------------------------------- DIŞ
  {
    id: 'celik-jant',
    label: 'Çelik jant (kapaklı)',
    category: 'dis',
    whyItMatters:
      'Giriş donanımının en görünür işaretidir. Kötü bir şey değildir — bordüre vurunca alaşım jant gibi çatlamaz — ama ikinci el fiyatını düşürür.',
    checkHow:
      'Kapağı çıkarıp jant yüzeyindeki pas ve ezikleri kontrol et. İlan fotoğrafında alaşım jant görünüp aracın kendisinde çelik jant çıkması sık rastlanan bir durumdur.',
    riskIfBroken: 'Tek jant 1.500 - 4.000 TL; kapak birkaç yüz TL.'
  },
  {
    id: 'alasim-jant',
    label: 'Alaşım jant',
    category: 'dis',
    whyItMatters: 'Görünümün yanında ikinci el fiyatına da yansır.',
    checkHow: 'Jant kenarlarındaki bordür izlerine bak; ağır darbe almış jant balans tutmaz.',
    riskIfBroken: 'Tek jant 4.000 - 20.000 TL.'
  },
  {
    id: 'sunroof',
    label: 'Açılır tavan (sunroof)',
    category: 'dis',
    whyItMatters: 'Panoramik tavanın küçük kardeşi; aynı su kaçağı riskini taşır ama onarımı daha ucuzdur.',
    checkHow:
      'Tam aç-kapa yaptır ve tavan döşemesinin köşelerini elle yokla. Nem, leke ya da küf kokusu drenaj kanallarının tıkalı olduğunu gösterir.',
    riskIfBroken: 'Mekanizma onarımı 8.000 - 25.000 TL; su kaçağının yaptığı elektrik hasarı ayrıca.'
  },
  {
    id: 'elektrikli-katlanir-ayna',
    label: 'Elektrikli katlanır ayna',
    category: 'dis',
    whyItMatters: 'Dar sokakta ayna kırdırmayı önler; orta/üst donanım göstergesidir.',
    checkHow: 'Katla-aç yaptır. Ses geliyor ama ayna hareket etmiyorsa dişli kırıktır — bu çok sık görülen bir arızadır.',
    riskIfBroken: 'Ayna motoru/kapak 3.000 - 12.000 TL.'
  },
  {
    id: 'tavan-rayi',
    label: 'Tavan rayı (port bagaj rayı)',
    category: 'dis',
    whyItMatters:
      'SUV ve station wagon\'larda donanım işaretidir. Ayrıca aracın yük/tatil kullanımı hakkında ipucu verir.',
    checkHow: 'Ray etrafındaki boyada çizik ve conta kabarması ara; ray sökülmüşse tavan boyası kontrol edilmelidir.',
    riskIfBroken: 'Ray seti 4.000 - 12.000 TL.'
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
  },

  // ------------------------------------------------------------- EK KONFOR
  {
    id: 'start-stop',
    label: 'Start-stop sistemi',
    category: 'surus',
    whyItMatters: 'Şehir içi yakıt tüketimini düşürür; ama marş motoru ve aküyü normalden fazla yorar.',
    checkHow: 'Trafikte durup fren pedalını bırak; motor otomatik durup vitese basınca tekrar çalışmalı. Çalışmıyorsa akü/marş kontrol edilmeli.',
    riskIfBroken: 'AGM akü değişimi 4.000 - 9.000 TL; marş motoru 6.000 - 18.000 TL.'
  },
  {
    id: 'elektronik-el-freni',
    label: 'Elektronik el freni',
    category: 'konfor',
    whyItMatters: 'Klasik kablolu el frenine göre kullanımı kolaydır ama arızası daha maliyetlidir.',
    checkHow: 'Düğmeye basıp bırak; gösterge panelinde ilgili ikaz doğru şekilde yanıp sönmeli.',
    riskIfBroken: 'Aktüatör değişimi 6.000 - 15.000 TL.'
  },
  {
    id: 'uc-bolge-klima',
    label: '3 (çoklu) bölge klima',
    category: 'konfor',
    whyItMatters: 'Üst donanım göstergesidir; arka koltuk yolcuları kendi sıcaklığını ayarlayabilir.',
    checkHow: 'Ön ve arka paneli farklı sıcaklıklara ayarla, menfezlerden gelen havanın gerçekten farklı olduğunu doğrula.',
    riskIfBroken: 'Ek aktüatör ve sensör arızası 3.000 - 10.000 TL.'
  },
  {
    id: 'masaj-koltuk',
    label: 'Masaj fonksiyonlu koltuk',
    category: 'konfor',
    whyItMatters: 'Üst/premium donanım göstergesidir.',
    checkHow: 'Menüden masaj fonksiyonunu çalıştır; koltuk sırtındaki hava yastıklarının hareket ettiğini hisset.',
    riskIfBroken: 'Koltuk modülü arızası 8.000 - 25.000 TL.'
  },
  {
    id: 'gece-gorus',
    label: 'Gece görüş sistemi',
    category: 'surus',
    whyItMatters: 'Üst/premium donanım göstergesidir; termal kamera ile yaya/hayvan tespiti yapar.',
    checkHow: 'Gece kullanım geçmişi olmadan test edilemez; ilan/servis kaydından fonksiyonun çalıştığı teyit edilmelidir.',
    riskIfBroken: 'Kamera ünitesi 15.000 - 40.000 TL.'
  },
  {
    id: 'arka-cam-perdesi',
    label: 'Elektrikli arka cam perdesi',
    category: 'konfor',
    whyItMatters: 'Üst donanım göstergesidir; arka koltuk mahremiyeti ve güneşten korunma sağlar.',
    checkHow: 'Düğmesine basıp perdenin düzgün açılıp kapandığını gör.',
    riskIfBroken: 'Motor/mekanizma arızası 3.000 - 8.000 TL.'
  },
  {
    id: 'elektrikli-direksiyon-ayari',
    label: 'Elektrikli direksiyon ayarı (hafızalı)',
    category: 'konfor',
    whyItMatters: 'Koltuk hafızasıyla birlikte çalışır; birden fazla kullanıcı için hızlı ayar sağlar.',
    checkHow: 'Hafıza düğmesine bas; direksiyon ve koltuğun birlikte ayarlanan konuma geldiğini doğrula.',
    riskIfBroken: 'Motor/mekanizma arızası 5.000 - 15.000 TL.'
  },
  {
    id: 'otomatik-sinyal-sekmesi',
    label: 'Şeritler arası otomatik direksiyon desteği',
    category: 'surus',
    whyItMatters: 'Şerit takip sisteminin bir adım ilerisidir; aracı şerit içinde otomatik olarak ortalar.',
    checkHow: 'Şerit çizgileri belirgin bir yolda etkinleştir; direksiyona hafif bir düzeltme torku hissedilmeli.',
    riskIfBroken: 'Kamera/sensör kalibrasyonu gerektirir, 3.000 - 10.000 TL.'
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
