/**
 * Arıza arketipleri.
 *
 * Veritabanındaki 740 kronik arıza kaydı 137 farklı başlık altında toplanıyor:
 * "DPF tıkanması" 53 ayrı motorda, "EGR valfi tıkanması" 38 motorda geçiyor.
 * Bir arızanın belirtileri, OBD kodu, hangi kilometrede çıktığı ve aracı
 * almaktan vazgeçirip vazgeçirmediği ise motordan motora değişmez — arızanın
 * kendi doğasıdır.
 *
 * Bu yüzden bu bilgileri 740 kaydın her birine tek tek yazmak yerine burada
 * arketip olarak bir kez tanımlıyoruz ve çalışma anında eşleştiriyoruz.
 * Sonuç: her kayıt yeni sütunlar kazanıyor, teşhis motoru da bu belirtiler
 * üzerinden araca özel eşleşme yapabiliyor.
 *
 * `match` alanı arıza başlığına uygulanır; ilk eşleşen arketip kullanılır,
 * bu yüzden özel olanlar genel olanlardan önce yazılmıştır.
 */

export const PROBLEM_ARCHETYPES = [
  {
    id: 'dpf',
    match: /dpf|partikul|partikül/i,
    symptoms: [
      'gösterge panelinde dpf uyarısı',
      'güç kaybı',
      'egzozdan yoğun duman',
      'rölanti devri yükseliyor',
      'yakıt tüketimi arttı',
      'motor koruma moduna geçiyor'
    ],
    obdCodes: ['P2002', 'P2463'],
    typicalKm: '80.000 - 160.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote:
      'Temizleme/yıkama 3.000 - 8.000 TL, yeni orijinal filtre çoğu modelde 35.000 TL üzeri. Kısa mesafe kullanılan dizellerde tekrar eder.'
  },
  {
    id: 'adblue',
    match: /adblue|scr/i,
    symptoms: [
      'adblue uyarısı çıkıyor',
      'araç çalışmayacak uyarısı veriyor',
      'kalan mesafe sayacı görünüyor',
      'güç kaybı'
    ],
    obdCodes: ['P20E8', 'P204F'],
    typicalKm: '100.000 - 180.000 km',
    dealbreaker: false,
    laborHours: 2.5,
    partNote:
      'NOx sensörü 8.000 - 20.000 TL, AdBlue pompası/enjektörü 12.000 - 30.000 TL. Sistem devre dışı bırakılmış araçlarda muayene ve emisyon sorunu çıkar.'
  },
  {
    id: 'egr',
    match: /egr/i,
    symptoms: [
      'rölantide titriyor',
      'gaz verince tepki gecikmesi',
      'egzozdan siyah duman',
      'motor arıza lambası yanıyor',
      'güç kaybı'
    ],
    obdCodes: ['P0401', 'P0402'],
    typicalKm: '60.000 - 140.000 km',
    dealbreaker: false,
    laborHours: 2,
    partNote:
      'Temizlik 1.500 - 3.500 TL, valf değişimi 6.000 - 18.000 TL. Şehir içi kullanımda tekrar etmesi normaldir.'
  },
  {
    id: 'enjektor',
    match: /enjekt/i,
    symptoms: [
      'zor çalışıyor',
      'soğukta zor çalışıyor',
      'rölantide sarsıntı',
      'egzozdan siyah duman',
      'motor tekliyor',
      'yakıt tüketimi arttı',
      'çalışırken tak tak sesi'
    ],
    obdCodes: ['P0263', 'P0203', 'P0087'],
    typicalKm: '120.000 - 220.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote:
      'Enjektör başına 6.000 - 18.000 TL, dört silindir birden değişirse toplam 30.000 TL üzerine çıkabilir. Değişen enjektörün beyne kodlanması şarttır.'
  },
  {
    id: 'yakit-pompasi',
    match: /yakıt pompası|yakit pompasi|yüksek basınç pompası/i,
    symptoms: ['stop ediyor', 'çekişten düşüyor', 'zor çalışıyor', 'yokuşta güç kaybı'],
    obdCodes: ['P0087', 'P0089'],
    typicalKm: '130.000 - 250.000 km',
    dealbreaker: false,
    laborHours: 4,
    partNote:
      'Yüksek basınç pompası 15.000 - 45.000 TL. Pompa parçalanırsa metal talaşı tüm yakıt sistemine dağılır ve maliyet katlanır.'
  },
  {
    id: 'triger-zinciri',
    match: /zincir|timing zinciri|n47|n20|n26|gerdiric/i,
    symptoms: [
      'soğukta metalik tıkırtı',
      'ilk çalıştırmada zincir sesi',
      'motordan tıkırtı geliyor',
      'motor arıza lambası yanıyor'
    ],
    obdCodes: ['P0016', 'P0011', 'P1340'],
    typicalKm: '90.000 - 180.000 km',
    dealbreaker: true,
    laborHours: 10,
    partNote:
      'Zincir seti 8.000 - 20.000 TL ama işçilik çok yüksektir; motor arkası zincirli motorlarda motor indirilir. Toplam 25.000 - 70.000 TL. Zincir atlarsa motor komple gider.'
  },
  {
    id: 'triger-kayisi',
    match: /triger kay|yağ banyolu/i,
    symptoms: ['motordan ıslık sesi', 'kayıştan tırmalama sesi', 'yağda parçacık'],
    obdCodes: ['P0016'],
    typicalKm: '60.000 - 120.000 km',
    dealbreaker: false,
    laborHours: 5,
    partNote:
      'Kayış seti + devirdaim 6.000 - 18.000 TL. Yağ banyolu kayışlarda kayış dağılıp yağ kanallarını tıkayabilir; değişim aralığına uyulmuşsa büyük risk taşımaz.'
  },
  {
    id: 'turbo',
    match: /turbo (arızası|arizasi)|turbo yatak|turbo revizyon/i,
    symptoms: [
      'çekişten düştü',
      'egzozdan mavi duman',
      'turbo ıslık sesi',
      'yağ eksiltiyor',
      'motor koruma moduna geçiyor'
    ],
    obdCodes: ['P0299', 'P0234'],
    typicalKm: '120.000 - 200.000 km',
    dealbreaker: false,
    laborHours: 5,
    partNote:
      'Revizyon 8.000 - 20.000 TL, komple turbo 25.000 - 60.000 TL. Turbo yağ kaçırırsa katalizör/DPF de birlikte gider.'
  },
  {
    id: 'turbo-aktuator',
    match: /aktüatör|aktuator|wastegate|vnt/i,
    symptoms: ['rölantide takırtı', 'gaz kesince takırtı', 'çekiş dengesiz', 'güç kaybı'],
    obdCodes: ['P0299', 'P0234'],
    typicalKm: '100.000 - 180.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote:
      'Aktüatör 6.000 - 18.000 TL. Takırtı erken fark edilirse turboyu kurtarır, geciktirilirse turbo komple gider.'
  },
  {
    id: 'intercooler',
    match: /intercooler|turbo hortum/i,
    symptoms: ['ani güç kaybı', 'gaz verince ıslık', 'motor koruma moduna geçiyor'],
    obdCodes: ['P0299'],
    typicalKm: '80.000 - 160.000 km',
    dealbreaker: false,
    laborHours: 1.5,
    partNote: 'Hortum/kelepçe 1.500 - 6.000 TL. Ucuz ve sık görülen bir arızadır, pazarlıkta büyütülmemeli.'
  },
  {
    id: 'dsg-mekatronik',
    match: /mekatronik|dsg|s tronic|dct|edc|çift kavrama|cift kavrama|powershift/i,
    symptoms: [
      'kalkışta sarsıntı',
      'vites geçişlerinde darbe',
      'düşük hızda zıplama',
      'vitese takmıyor',
      'şanzıman uyarısı çıkıyor'
    ],
    obdCodes: ['P0700', 'P0715', 'U0101'],
    typicalKm: '100.000 - 180.000 km',
    dealbreaker: true,
    laborHours: 8,
    partNote:
      'Mekatronik revizyonu 25.000 - 60.000 TL, kavrama seti 30.000 - 70.000 TL. Yağ/filtre bakımı yapılmamış araçta neredeyse kaçınılmazdır; servis kaydı istemeden alma.'
  },
  {
    id: 'cvt',
    match: /cvt|multitronic/i,
    symptoms: ['hızlanırken devir yükselip hız artmıyor', 'kayma hissi', 'ısınınca sarsıntı'],
    obdCodes: ['P0700', 'P0740'],
    typicalKm: '120.000 - 200.000 km',
    dealbreaker: true,
    laborHours: 10,
    partNote:
      'CVT kayış/konik disk revizyonu 45.000 - 120.000 TL. Bu şanzımanlarda yağ değişimi ihmal edilmişse alım riski çok yüksektir.'
  },
  {
    id: 'tork-konvertoru',
    match: /tork konvert|otomatik şanzıman|otomatik sanziman/i,
    symptoms: ['sabit hızda titreme', 'vites geçişi geç', 'kalkışta gecikme'],
    obdCodes: ['P0740', 'P0700'],
    typicalKm: '130.000 - 220.000 km',
    dealbreaker: false,
    laborHours: 8,
    partNote: 'Konvertör revizyonu 20.000 - 55.000 TL. Yağ ve filtre bakımı zamanında yapılan şanzımanlar uzun ömürlüdür.'
  },
  {
    id: 'volan-debriyaj',
    match: /volan|debriyaj/i,
    symptoms: [
      'rölantide gıcırtı',
      'debriyaja basınca ses kesiliyor',
      'kalkışta titreme',
      'vites zor takılıyor'
    ],
    obdCodes: [],
    typicalKm: '120.000 - 200.000 km',
    dealbreaker: false,
    laborHours: 6,
    partNote:
      'Volan + debriyaj seti 20.000 - 50.000 TL. Test sürüşünde rölantide debriyaja basıp sesin değişip değişmediğini dinle.'
  },
  {
    id: 'devirdaim',
    match: /devirdaim|su pompası|su pompasi|termostat/i,
    symptoms: ['hararet yapıyor', 'motor geç ısınıyor', 'altında su lekesi', 'kalorifer üflemiyor'],
    obdCodes: ['P0128', 'P0217'],
    typicalKm: '80.000 - 150.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote:
      'Devirdaim 4.000 - 15.000 TL. Elektrikli devirdaimli motorlarda parça pahalıdır ve arıza verirse hararet yapıp conta yakabilir.'
  },
  {
    id: 'hararet-conta',
    match: /silindir kapak|conta yanması|hararet/i,
    symptoms: [
      'hararet yapıyor',
      'radyatörden kabarcık geliyor',
      'egzozdan beyaz duman',
      'yağ sütlenmiş',
      'su eksiliyor'
    ],
    obdCodes: ['P0217'],
    typicalKm: 'Bakımsız kullanımda her kilometrede',
    dealbreaker: true,
    laborHours: 12,
    partNote:
      'Conta + kapak planyası 25.000 - 80.000 TL. Yağ kapağının altında sütlenme varsa o araçtan uzak dur.'
  },
  {
    id: 'yag-tuketimi',
    match: /yağ tüketimi|yag tuketimi|piston segman/i,
    symptoms: [
      'yağ eksiltiyor',
      'egzozdan mavi duman',
      'yağ uyarı lambası yanıyor',
      'bujiler yağlanmış'
    ],
    obdCodes: ['P0300', 'P0420'],
    typicalKm: '100.000 - 180.000 km',
    dealbreaker: true,
    laborHours: 14,
    partNote:
      'Segman değişimi motor açmayı gerektirir: 40.000 - 110.000 TL. Test sürüşü öncesi ve sonrası yağ çubuğuna bak, satıcının "biraz yer, normaldir" cevabını kabul etme.'
  },
  {
    id: 'yag-kacagi',
    match: /yağ kaç|yag kac|subap kapağı contası|filtre yuvası/i,
    symptoms: ['park yerinde yağ lekesi', 'yanık yağ kokusu', 'motor altı yağlı'],
    obdCodes: [],
    typicalKm: '90.000 - 170.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote:
      'Conta/keçe 3.000 - 12.000 TL. Tek başına ciddi değildir ama sızan yağ kayışı ve elektrik tesisatını bozarsa maliyet büyür.'
  },
  {
    id: 'emme-karbon',
    match: /karbon birikimi|emme kanalı|emme manifoldu kurum/i,
    symptoms: ['rölantide titriyor', 'düşük devirde tekleme', 'güç kaybı', 'yakıt tüketimi arttı'],
    obdCodes: ['P0300', 'P0171'],
    typicalKm: '70.000 - 140.000 km',
    dealbreaker: false,
    laborHours: 4,
    partNote:
      'Ceviz kabuğu ile kumlama 6.000 - 15.000 TL. Direkt enjeksiyonlu motorlarda periyodik bir bakım kalemi sayılmalı.'
  },
  {
    id: 'swirl-flap',
    match: /girdap kelebe|swirl/i,
    symptoms: ['rölantide titriyor', 'motor arıza lambası yanıyor', 'güç kaybı'],
    obdCodes: ['P2015'],
    typicalKm: '100.000 - 180.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote: 'Onarım kiti 3.000 - 8.000 TL, manifold komple 12.000 - 25.000 TL.'
  },
  {
    id: 'vanos-vvt',
    match: /vanos|vvt|değişken supap|degisken supap/i,
    symptoms: ['soğukta tıkırtı', 'rölanti dengesiz', 'düşük devirde güç yok'],
    obdCodes: ['P0011', 'P0012'],
    typicalKm: '110.000 - 190.000 km',
    dealbreaker: false,
    laborHours: 4,
    partNote: 'Solenoid 3.000 - 9.000 TL, VANOS ünitesi 12.000 - 30.000 TL. Yağ bakımı düzenli yapılan motorlarda az görülür.'
  },
  {
    id: 'hava-suspansiyon',
    match: /hava süspansiyon|hava suspansiyon|airmatic/i,
    symptoms: [
      'araç bir tarafa yatıyor',
      'sabahları araç çökmüş',
      'süspansiyon uyarısı çıkıyor',
      'kompresör sürekli çalışıyor'
    ],
    obdCodes: [],
    typicalKm: '100.000 - 180.000 km',
    dealbreaker: false,
    laborHours: 4,
    partNote:
      'Körük başına 12.000 - 30.000 TL, kompresör 15.000 - 40.000 TL. Bir körük patlarsa kompresör de yorulur; genelde arkası gelir.'
  },
  {
    id: 'suspansiyon-burc',
    match: /salıncak|salincak|burç|burc|rotil|amortisör|amortisor/i,
    symptoms: [
      'ön taraftan gıcırtı',
      'tümsekte takırtı',
      'direksiyonda titreme',
      'lastikler düzensiz aşınıyor'
    ],
    obdCodes: [],
    typicalKm: '60.000 - 120.000 km',
    dealbreaker: false,
    laborHours: 2.5,
    partNote: 'Burç/rotil takımı 3.000 - 15.000 TL. Bozuk yolda normal aşınmadır, pazarlık kalemi olarak kullanılabilir.'
  },
  {
    id: 'direksiyon-eps',
    match: /direksiyon|eps|mdps/i,
    symptoms: ['direksiyon ağırlaştı', 'direksiyon uyarı lambası', 'manevrada ses'],
    obdCodes: ['C1210'],
    typicalKm: '90.000 - 170.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote: 'Kolon/motor 12.000 - 40.000 TL. Direksiyonun ağırlaşması sürüş güvenliğini doğrudan etkiler, ertelenmemeli.'
  },
  {
    id: 'klima',
    match: /klima|kondenser|kompresör|kompresor/i,
    symptoms: ['klima soğutmuyor', 'klima açınca ses', 'gaz kaçırıyor'],
    obdCodes: [],
    typicalKm: '80.000 - 150.000 km',
    dealbreaker: false,
    laborHours: 3,
    partNote: 'Kompresör 10.000 - 30.000 TL, kondenser 5.000 - 15.000 TL. Yazın bakılan araçta test etmeyi unutma.'
  },
  {
    id: 'multimedya',
    match: /multimedya|idrive|comand|elektronik|gösterge|gosterge/i,
    symptoms: ['ekran donuyor', 'ekran kendi kendine kapanıyor', 'gösterge sönüyor', 'ses gitmiyor'],
    obdCodes: ['B1000'],
    typicalKm: 'Yaşa bağlı, kilometreden bağımsız',
    dealbreaker: false,
    laborHours: 2,
    partNote:
      'Ünite onarımı 4.000 - 15.000 TL, orijinal ünite 25.000 TL üzeri. Premium markalarda bu kalem beklenenden pahalıdır.'
  },
  {
    id: 'hibrit-batarya',
    match: /hibrit batarya|batarya yaş|batarya yas/i,
    symptoms: ['elektrikli menzil kısaldı', 'hibrit uyarısı', 'yakıt tüketimi arttı'],
    obdCodes: ['P3000'],
    typicalKm: '180.000 - 300.000 km',
    dealbreaker: false,
    laborHours: 5,
    partNote:
      'Hücre yenileme 25.000 - 70.000 TL, komple batarya 80.000 - 250.000 TL. Alım öncesi batarya sağlık raporu istenmeli.'
  },
  {
    id: 'haldex',
    match: /haldex|quattro|4x4|aktarma/i,
    symptoms: ['dörtçeker uyarısı', 'virajda zorlanma', 'arkadan uğultu'],
    obdCodes: [],
    typicalKm: '60.000 km bakım aralığı',
    dealbreaker: false,
    laborHours: 2,
    partNote: 'Haldex yağ/filtre bakımı 4.000 - 9.000 TL. Bakımı atlanan sistemlerde pompa arızası 20.000 TL üzerine çıkar.'
  },
  {
    id: 'kizdirma',
    match: /kızdırma|kizdirma|glow/i,
    symptoms: ['soğukta zor çalışıyor', 'ilk çalışmada duman', 'kızdırma lambası yanıp sönüyor'],
    obdCodes: ['P0670'],
    typicalKm: '80.000 - 150.000 km',
    dealbreaker: false,
    laborHours: 2,
    partNote: 'Buji seti + işçilik 3.000 - 9.000 TL. Kırılan kızdırma bujisi kapakta kalırsa maliyet ciddi artar.'
  },
  {
    id: 'marş-alternator',
    match: /marş|mars motoru|alternatör|alternator|akü|aku/i,
    symptoms: ['marş basmıyor', 'akü şarj uyarısı', 'far kısılıyor', 'tik tik sesi'],
    obdCodes: ['P0562'],
    typicalKm: '100.000 - 180.000 km',
    dealbreaker: false,
    laborHours: 2,
    partNote: 'Alternatör 6.000 - 20.000 TL, marş motoru 5.000 - 15.000 TL, akü 4.000 - 12.000 TL.'
  },
  {
    id: 'katalizor',
    match: /katalizör|katalizor|lambda|oksijen sensör/i,
    symptoms: ['motor arıza lambası yanıyor', 'muayeneden kaldı', 'yakıt tüketimi arttı', 'çürük yumurta kokusu'],
    obdCodes: ['P0420', 'P0430', 'P0135'],
    typicalKm: '120.000 - 220.000 km',
    dealbreaker: false,
    laborHours: 2,
    partNote: 'Lambda sensörü 2.500 - 8.000 TL, katalizör 12.000 - 45.000 TL.'
  },
  {
    id: 'fren',
    match: /fren|abs|disk|balata/i,
    symptoms: ['frende titreme', 'fren pedalı yumuşak', 'abs lambası yanıyor', 'frende gıcırtı'],
    obdCodes: ['C0035', 'C1210'],
    typicalKm: '40.000 - 90.000 km',
    dealbreaker: false,
    laborHours: 2,
    partNote: 'Disk + balata takımı 5.000 - 20.000 TL. Sarf malzemesidir, pazarlıkta küçük bir kalem olarak kullanılır.'
  },
  {
    id: 'kaporta-pas',
    match: /pas|kaporta|boya kalınlığı|boya kalinligi/i,
    symptoms: ['kabarcık var', 'çamurluk kenarında pas', 'taş darbesi izleri'],
    obdCodes: [],
    typicalKm: 'Yaşa ve iklime bağlı',
    dealbreaker: false,
    laborHours: 6,
    partNote:
      'Pas onarımı 5.000 - 30.000 TL. Kapı altı, marşpiyel ve bagaj havuzunu mutlaka kontrol et; yüzeyde görünen pas altta çok daha büyüktür.'
  },
  {
    id: 'rolanti',
    match: /rölanti|rolanti/i,
    symptoms: ['rölantide titriyor', 'rölanti devri düşüp kalkıyor', 'durunca stop ediyor'],
    obdCodes: ['P0507', 'P0171', 'P0300'],
    typicalKm: '60.000 - 140.000 km',
    dealbreaker: false,
    laborHours: 2,
    partNote:
      'Sebebi çok geniştir: gaz kelebeği temizliği 1.500 TL ile başlar, enjektör sorunuysa 20.000 TL üzerine çıkar. Teşhis şart.'
  },
  {
    id: 'veri-yok',
    match: /sınırlı uzun dönem|sinirli uzun donem|yeterli veri/i,
    symptoms: [],
    obdCodes: [],
    typicalKm: null,
    dealbreaker: false,
    laborHours: null,
    partNote:
      'Bu model/motor piyasada yeterince yaşlanmadığı için uzun dönem arıza verisi henüz oluşmadı. Garanti kapsamı ve yetkili servis bakım geçmişi bu araçta normalden daha önemli.'
  }
]

/** Arıza başlığına uyan ilk arketipi döner. */
export function archetypeFor(title) {
  if (typeof title !== 'string') return null
  return PROBLEM_ARCHETYPES.find((archetype) => archetype.match.test(title)) || null
}
