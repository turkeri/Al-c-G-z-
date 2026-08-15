/**
 * ŞANZIMAN VERİTABANI
 *
 * Şanzıman, ikinci el alımında motordan sonra en pahalı kalemdir ve çoğu
 * alıcı "otomatik" yazısına bakıp geçer. Oysa aynı marka içinde bile
 * şanzımanlar arasında uçurum vardır: VW'nin DQ250 (ıslak DSG) şanzımanı
 * makul, DQ200 (kuru DSG) ise ciddi risk taşır.
 *
 * Bu yüzden şanzımanlar motorlardan ayrı bir tabloda tutulur; bir araç
 * kaydı hem motoruna hem şanzımanına bağlanır.
 *
 * `reliability` (0-100) mutlak bir ölçüm değil, göreli değerlendirmedir.
 * Maliyetler Türkiye piyasası için kaba tahmindir.
 */

export const TRANSMISSIONS = [
  // ==========================================================================
  // VW GRUBU
  // ==========================================================================
  {
    id: 'dq200',
    name: 'DSG 7 (DQ200)',
    type: 'Çift kavramalı, kuru',
    gears: 7,
    group: 'VAG',
    usedIn: ['VW Golf', 'VW Polo', 'VW Passat', 'Audi A3', 'Skoda Octavia', 'Seat Leon'],
    reliability: 52,
    service: { intervalKm: null, note: 'Kuru kavrama olduğu için yağ değişimi gerektirmez; mekatronik ünitesinin kendi yağı vardır.' },
    problems: [
      { title: 'Mekatronik ünitesi arızası', risk: 'Yüksek', cost: '25.000 - 60.000 TL', note: 'Sarsıntı, vitese geçmeme ve acil durum moduyla kendini gösterir.' },
      { title: 'Kuru kavrama aşınması', risk: 'Yüksek', cost: '25.000 - 55.000 TL', note: 'Şehir içi dur-kalk trafiğinde ömrü belirgin biçimde kısalır.' },
      { title: 'Düşük hızda sarsıntı ve titreşim', risk: 'Orta', cost: '0 - 25.000 TL', note: 'Önce yazılım güncellemesi ve adaptasyon denenmelidir.' }
    ],
    buyingNote:
      'Bu şanzımanda servis geçmişi ve kavrama değişim kaydı sorulmadan alım yapılmamalı. Test sürüşünde 20-40 km/s aralığında dur-kalk yapıp sarsıntıyı dinle.'
  },
  {
    id: 'dq250',
    name: 'DSG 6 (DQ250)',
    type: 'Çift kavramalı, ıslak',
    gears: 6,
    group: 'VAG',
    usedIn: ['VW Golf GTI', 'VW Passat', 'VW Tiguan', 'Audi A3', 'Skoda Superb', 'Seat Leon'],
    reliability: 72,
    service: { intervalKm: 60000, note: 'Yağ ve filtre değişimi 60.000 km\'de yapılmalı; atlanırsa mekatronik riski artar.' },
    problems: [
      { title: 'Mekatronik ünitesi arızası', risk: 'Orta', cost: '25.000 - 55.000 TL', note: '' },
      { title: 'Kavrama paketi aşınması', risk: 'Orta', cost: '30.000 - 70.000 TL', note: '' },
      { title: 'Yağ bakımı atlanması kaynaklı sarsıntı', risk: 'Orta', cost: '6.000 - 15.000 TL', note: 'Erken yakalanırsa yağ/filtre değişimi çözebilir.' }
    ],
    buyingNote: 'DQ200\'e göre belirgin biçimde dayanıklıdır. 60.000 km yağ bakım faturası varsa güven artar.'
  },
  {
    id: 'dq381',
    name: 'DSG 7 (DQ381/DQ500)',
    type: 'Çift kavramalı, ıslak',
    gears: 7,
    group: 'VAG',
    usedIn: ['VW Golf 7/8', 'VW Passat B8', 'VW Tiguan', 'Audi Q3', 'Skoda Kodiaq'],
    reliability: 80,
    service: { intervalKm: 60000, note: 'Yağ ve filtre değişimi 60.000 km.' },
    problems: [
      { title: 'Mekatronik arızası', risk: 'Düşük', cost: '25.000 - 55.000 TL', note: '' },
      { title: 'Düşük hızda hafif sarsıntı', risk: 'Düşük', cost: '0 - 12.000 TL', note: 'Yazılım güncellemesiyle giderilebilir.' }
    ],
    buyingNote: 'VW grubunun en güvenilir çift kavramalı şanzımanıdır.'
  },
  {
    id: 'multitronic',
    name: 'Multitronic (CVT)',
    type: 'Kayışlı sürekli değişken (CVT)',
    gears: null,
    group: 'VAG',
    usedIn: ['Audi A4 B7/B8', 'Audi A6 C6', 'Audi A5'],
    reliability: 42,
    service: { intervalKm: 60000, note: 'Yağ değişimi kritiktir; atlanırsa kayış ve konik disk aşınır.' },
    problems: [
      { title: 'Kayış ve konik disk aşınması', risk: 'Yüksek', cost: '45.000 - 120.000 TL', note: 'Bu şanzımanın en pahalı arızası; onarımı çoğu zaman ekonomik değildir.' },
      { title: 'Kontrol ünitesi arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Hızlanırken devir yükselip hız artmaması', risk: 'Yüksek', cost: '45.000 - 120.000 TL', note: 'Kayma başlangıcı; bu belirti varsa araçtan uzak dur.' }
    ],
    buyingNote:
      'Yağ bakım kaydı olmayan Multitronic\'li araç alım riski çok yüksektir. Test sürüşünde tam gazda kayma olup olmadığını mutlaka dene.'
  },
  {
    id: 'tiptronic-09g',
    name: 'Tiptronic (09G / TF-60SN)',
    type: 'Tork konvertörlü otomatik',
    gears: 6,
    group: 'VAG',
    usedIn: ['VW Passat', 'VW Jetta', 'VW Tiguan', 'Skoda Octavia', 'Audi A3'],
    reliability: 74,
    service: { intervalKm: 60000, note: 'Aisin tabanlıdır; yağ değişimi ömrünü belirgin uzatır.' },
    problems: [
      { title: 'Solenoid valf arızası', risk: 'Orta', cost: '12.000 - 30.000 TL', note: '' },
      { title: 'Tork konvertörü aşınması', risk: 'Orta', cost: '20.000 - 50.000 TL', note: 'Sabit hızda titreme tipik belirtidir.' }
    ],
    buyingNote: 'Çift kavramalılara göre daha az dertlidir; yağ bakımı yapılmışsa uzun ömürlüdür.'
  },

  // ==========================================================================
  // ZF / AISIN (ÇOK MARKALI)
  // ==========================================================================
  {
    id: 'zf8hp',
    name: 'ZF 8HP',
    type: 'Tork konvertörlü otomatik',
    gears: 8,
    group: 'ZF',
    usedIn: ['BMW 3/5/7 Serisi', 'BMW X3/X5', 'Audi A6/A8', 'Land Rover', 'Jaguar', 'Alfa Romeo Giulia'],
    reliability: 90,
    service: { intervalKm: 80000, note: 'Üretici "ömürlük" dese de 80.000-100.000 km yağ değişimi ömrünü ciddi biçimde uzatır.' },
    problems: [
      { title: 'Mekatronik/valf gövdesi arızası', risk: 'Düşük', cost: '20.000 - 50.000 TL', note: 'Genellikle yağ bakımı hiç yapılmamış araçlarda.' },
      { title: 'Yağ kaçağı (mekatronik soketi)', risk: 'Düşük', cost: '5.000 - 15.000 TL', note: '' }
    ],
    buyingNote: 'Piyasadaki en güvenilir otomatik şanzımanlardan biridir. Yağ değişim kaydı varsa büyük artı.'
  },
  {
    id: 'zf6hp',
    name: 'ZF 6HP',
    type: 'Tork konvertörlü otomatik',
    gears: 6,
    group: 'ZF',
    usedIn: ['BMW 3/5 Serisi E90/E60', 'BMW X5', 'Audi A6', 'Jaguar', 'Ford Ranger'],
    reliability: 78,
    service: { intervalKm: 80000, note: '' },
    problems: [
      { title: 'Mekatronik kovan (bushing) aşınması', risk: 'Orta', cost: '15.000 - 40.000 TL', note: 'Sert vites geçişi ve kayma yapar.' },
      { title: 'Yağ kaçağı (mekatronik soketi)', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' }
    ],
    buyingNote: 'Yağ bakımı yapılmışsa uzun ömürlü; hiç yapılmamışsa mekatronik riski yüksek.'
  },
  {
    id: 'aisin-tf80',
    name: 'Aisin TF-80SC / AWF8',
    type: 'Tork konvertörlü otomatik',
    gears: 6,
    group: 'Aisin',
    usedIn: ['Volvo XC60', 'Peugeot 508', 'Opel Insignia', 'Ford Mondeo', 'Fiat Egea'],
    reliability: 82,
    service: { intervalKm: 80000, note: '' },
    problems: [
      { title: 'Solenoid ve valf gövdesi arızası', risk: 'Düşük', cost: '12.000 - 32.000 TL', note: '' },
      { title: 'Tork konvertörü titreşimi', risk: 'Düşük', cost: '18.000 - 45.000 TL', note: '' }
    ],
    buyingNote: 'Sağlam ve yaygın; parça ve usta bulmak kolaydır.'
  },
  {
    id: 'eat8',
    name: 'EAT6 / EAT8 (Aisin)',
    type: 'Tork konvertörlü otomatik',
    gears: 8,
    group: 'Stellantis-PSA',
    usedIn: ['Peugeot 3008', 'Peugeot 508', 'Citroen C5 Aircross', 'Opel Grandland', 'DS7'],
    reliability: 84,
    service: { intervalKm: 60000, note: '' },
    problems: [
      { title: 'Yazılım kaynaklı vites geçiş gecikmesi', risk: 'Düşük', cost: '0 - 6.000 TL', note: 'Güncelleme ile giderilir.' },
      { title: 'Valf gövdesi arızası', risk: 'Düşük', cost: '12.000 - 35.000 TL', note: '' }
    ],
    buyingNote: 'PSA\'nın eski AL4 şanzımanına göre çok büyük iyileşme; tercih edilebilir.'
  },
  {
    id: 'al4-dp0',
    name: 'AL4 / DP0',
    type: 'Tork konvertörlü otomatik',
    gears: 4,
    group: 'Stellantis-PSA',
    usedIn: ['Peugeot 307', 'Peugeot 206', 'Citroen C4', 'Renault Megane 2'],
    reliability: 40,
    service: { intervalKm: 60000, note: 'Yağ değişimi kritiktir ve çoğu araçta hiç yapılmamıştır.' },
    problems: [
      { title: 'Sert ve gecikmeli vites geçişi', risk: 'Yüksek', cost: '10.000 - 35.000 TL', note: '' },
      { title: 'Yağ sıcaklık sensörü ve solenoid arızası', risk: 'Yüksek', cost: '6.000 - 20.000 TL', note: '' },
      { title: 'Komple şanzıman yenileme ihtiyacı', risk: 'Yüksek', cost: '30.000 - 70.000 TL', note: '' }
    ],
    buyingNote: 'Bu şanzımanlı araçlarda bakım geçmişi yoksa alımdan kaçınılması önerilir.'
  },

  // ==========================================================================
  // FORD
  // ==========================================================================
  {
    id: 'powershift-dps6',
    name: 'Powershift DPS6',
    type: 'Çift kavramalı, kuru',
    gears: 6,
    group: 'Ford',
    usedIn: ['Ford Fiesta', 'Ford Focus', 'Ford EcoSport', 'Ford B-Max'],
    reliability: 34,
    service: { intervalKm: null, note: 'Kuru kavrama; kavrama ve TCM arızaları yaygındır.' },
    problems: [
      { title: 'Kavrama aşınması ve sarsıntı', risk: 'Yüksek', cost: '20.000 - 50.000 TL', note: 'Kalkışta belirgin sarsıntı bu şanzımanın imzasıdır; dünya çapında dava ve geri çağırma konusu olmuştur.' },
      { title: 'TCM (şanzıman kontrol modülü) arızası', risk: 'Yüksek', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Kavrama contası yağ kaçağı', risk: 'Yüksek', cost: '15.000 - 40.000 TL', note: '' }
    ],
    buyingNote:
      'Bu şanzımanlı araçlarda kavrama ve TCM değişim kaydı yoksa alım riski çok yüksektir. Test sürüşünde kalkış sarsıntısını mutlaka dene.'
  },
  {
    id: 'powershift-mps6',
    name: 'Powershift MPS6',
    type: 'Çift kavramalı, ıslak',
    gears: 6,
    group: 'Ford',
    usedIn: ['Ford Mondeo', 'Ford S-Max', 'Ford Kuga', 'Volvo S60/V60'],
    reliability: 60,
    service: { intervalKm: 60000, note: 'Yağ değişimi ihmal edilmemeli.' },
    problems: [
      { title: 'Mekatronik ünitesi arızası', risk: 'Orta', cost: '20.000 - 50.000 TL', note: '' },
      { title: 'Kavrama paketi aşınması', risk: 'Orta', cost: '25.000 - 60.000 TL', note: '' }
    ],
    buyingNote: 'Kuru DPS6\'ya göre belirgin biçimde daha dayanıklıdır.'
  },

  // ==========================================================================
  // HYUNDAI / KIA / RENAULT / MERCEDES / JAPON
  // ==========================================================================
  {
    id: 'kia-7dct',
    name: '7DCT (D7UF1)',
    type: 'Çift kavramalı, kuru',
    gears: 7,
    group: 'Hyundai-Kia',
    usedIn: ['Hyundai i30', 'Hyundai Tucson', 'Kia Ceed', 'Kia Sportage'],
    reliability: 62,
    service: { intervalKm: 60000, note: '' },
    problems: [
      { title: 'Düşük hızda sarsıntı ve gecikme', risk: 'Orta', cost: '0 - 30.000 TL', note: 'Önce yazılım güncellemesi ve adaptasyon denenmelidir.' },
      { title: 'Kavrama aşırı ısınma uyarısı', risk: 'Orta', cost: '15.000 - 45.000 TL', note: 'Yokuşta dur-kalk trafikte belirgindir.' }
    ],
    buyingNote: 'DQ200\'e benzer bir yapıdadır; test sürüşünde dur-kalk denemesi şarttır.'
  },
  {
    id: 'renault-edc',
    name: 'EDC (DC4 / DW6)',
    type: 'Çift kavramalı',
    gears: 6,
    group: 'Renault-Nissan',
    usedIn: ['Renault Megane', 'Renault Clio', 'Renault Kadjar', 'Dacia Duster'],
    reliability: 62,
    service: { intervalKm: 60000, note: '' },
    problems: [
      { title: 'Düşük hızda sarsıntı', risk: 'Orta', cost: '0 - 25.000 TL', note: '' },
      { title: 'Mekatronik/aktüatör arızası', risk: 'Orta', cost: '18.000 - 45.000 TL', note: '' }
    ],
    buyingNote: 'Getrag tabanlıdır; yazılım güncellemeleri sarsıntıyı belirgin biçimde azaltmıştır.'
  },
  {
    id: 'mb-7g-tronic',
    name: '7G-Tronic (722.9)',
    type: 'Tork konvertörlü otomatik',
    gears: 7,
    group: 'Mercedes-Benz',
    usedIn: ['Mercedes C Serisi W204', 'Mercedes E Serisi W212', 'Mercedes ML', 'Mercedes S Serisi'],
    reliability: 76,
    service: { intervalKm: 60000, note: 'Yağ ve filtre değişimi ömrü belirgin uzatır.' },
    problems: [
      { title: 'İletken plaka (conductor plate) arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: 'Bu şanzımanın en bilinen kusuru; vites geçmeme ve acil mod yapar.' },
      { title: 'Tork konvertörü titreşimi', risk: 'Orta', cost: '20.000 - 50.000 TL', note: '' }
    ],
    buyingNote: 'İletken plaka değişimi yapılmış araçlar daha güvenlidir; kaydı sorulmalı.'
  },
  {
    id: 'mb-9g-tronic',
    name: '9G-Tronic (725.0)',
    type: 'Tork konvertörlü otomatik',
    gears: 9,
    group: 'Mercedes-Benz',
    usedIn: ['Mercedes C Serisi W205/W206', 'Mercedes E Serisi W213', 'Mercedes GLC'],
    reliability: 86,
    service: { intervalKm: 80000, note: '' },
    problems: [
      { title: 'Yazılım kaynaklı vites geçiş sertliği', risk: 'Düşük', cost: '0 - 6.000 TL', note: '' },
      { title: 'Valf gövdesi arızası', risk: 'Düşük', cost: '18.000 - 45.000 TL', note: '' }
    ],
    buyingNote: '7G-Tronic\'e göre belirgin iyileşme; sorunsuz kabul edilir.'
  },
  {
    id: 'mb-7g-dct',
    name: '7G-DCT (724.0)',
    type: 'Çift kavramalı, ıslak',
    gears: 7,
    group: 'Mercedes-Benz',
    usedIn: ['Mercedes A Serisi', 'Mercedes CLA', 'Mercedes GLA', 'Mercedes B Serisi'],
    reliability: 68,
    service: { intervalKm: 60000, note: '' },
    problems: [
      { title: 'Düşük hızda sarsıntı', risk: 'Orta', cost: '0 - 25.000 TL', note: '' },
      { title: 'Mekatronik arızası', risk: 'Orta', cost: '25.000 - 55.000 TL', note: '' }
    ],
    buyingNote: ''
  },
  {
    id: 'toyota-cvt',
    name: 'Toyota CVT / e-CVT',
    type: 'Sürekli değişken (hibritte planet dişli)',
    gears: null,
    group: 'Toyota',
    usedIn: ['Toyota Corolla', 'Toyota C-HR', 'Toyota Auris', 'Toyota Prius'],
    reliability: 90,
    service: { intervalKm: 60000, note: 'Hibrit e-CVT\'de kavrama yoktur; mekanik olarak çok basittir.' },
    problems: [
      { title: 'Yağ bakımı ihmalinde ısınma', risk: 'Düşük', cost: '8.000 - 25.000 TL', note: '' }
    ],
    buyingNote: 'Hibrit e-CVT, piyasadaki en dertsiz otomatik aktarma çözümlerinden biridir.'
  },
  {
    id: 'jatco-cvt',
    name: 'Jatco CVT',
    type: 'Kayışlı sürekli değişken (CVT)',
    gears: null,
    group: 'Renault-Nissan',
    usedIn: ['Nissan Qashqai', 'Nissan X-Trail', 'Nissan Juke', 'Renault Koleos'],
    reliability: 58,
    service: { intervalKm: 60000, note: 'Yağ değişimi kritiktir.' },
    problems: [
      { title: 'Kayış/kasnak aşınması ve kayma', risk: 'Orta', cost: '35.000 - 90.000 TL', note: '' },
      { title: 'Aşırı ısınma ve güç kesme', risk: 'Orta', cost: '10.000 - 40.000 TL', note: 'Yokuşta ve uzun yolda belirginleşir.' }
    ],
    buyingNote: 'Yağ bakım kaydı olmayan araçta risk yüksektir; test sürüşünde yokuş denemesi yapılmalı.'
  },
  {
    id: 'fiat-dualogic',
    name: 'Dualogic / MMT',
    type: 'Yarı otomatik (robotize manuel)',
    gears: 5,
    group: 'Stellantis-Fiat',
    usedIn: ['Fiat Punto', 'Fiat Linea', 'Fiat Egea', 'Fiat 500'],
    reliability: 46,
    service: { intervalKm: 40000, note: 'Aktüatör hidrolik yağı ve adaptasyon periyodik yapılmalı.' },
    problems: [
      { title: 'Aktüatör (hidrolik pompa) arızası', risk: 'Yüksek', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Vites geçişlerinde belirgin duraklama', risk: 'Yüksek', cost: '0 - 8.000 TL', note: 'Bu şanzımanın yapısal karakteridir, arıza değildir; sürüş hissi manuel gibidir.' },
      { title: 'Kavrama aşınması', risk: 'Orta', cost: '10.000 - 25.000 TL', note: '' }
    ],
    buyingNote:
      'Robotize manuel şanzımandır; tam otomatik bekleyen kullanıcıyı hayal kırıklığına uğratır. Test sürüşü yapmadan alma.'
  },
  // ==========================================================================
  // TORK KONVERTÖRLÜ KLASİK OTOMATİKLER
  // Araç ilanlarında çoğu zaman sadece "Otomatik" yazar. Bu kayıtlar, marka ve
  // yıl bilgisinden yola çıkılarak "muhtemelen bu şanzıman" şeklinde eşlenir;
  // eşleşme `confidence: 'tahmin'` ile işaretlenir ve ekranda öyle gösterilir.
  // ==========================================================================
  {
    id: 'hyundai-6at',
    name: '6 ileri otomatik (A6GF/A6MF/A6LF)',
    type: 'Tork konvertörlü otomatik',
    gears: 6,
    group: 'Hyundai-Kia',
    usedIn: ['Hyundai i30', 'Hyundai Tucson', 'Hyundai Elantra', 'Kia Ceed', 'Kia Sportage', 'Kia Rio'],
    reliability: 84,
    service: { intervalKm: 80000, note: 'Üretici "ömürlük" dese de 80.000 km yağ değişimi ömrü belirgin biçimde uzatır.' },
    problems: [
      { title: 'Yağ bakımı ihmalinde vites geçiş sertliği', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Valf gövdesi (solenoid) arızası', risk: 'Düşük', cost: '15.000 - 40.000 TL', note: 'Yüksek kilometrede görülebilir.' }
    ],
    buyingNote: 'Hyundai/Kia\'nın kendi ürettiği bu şanzıman, çift kavramalı alternatiflere göre belirgin biçimde dertsizdir.'
  },
  {
    id: 'aisin-6at',
    name: 'Aisin 6 ileri otomatik',
    type: 'Tork konvertörlü otomatik',
    gears: 6,
    group: 'Genel',
    usedIn: ['Opel Astra/Insignia', 'Ford Focus/Kuga', 'Peugeot 3008', 'Volvo S60/V40', 'Mazda 3/6', 'Toyota Auris'],
    reliability: 86,
    service: { intervalKm: 80000, note: 'Yağ değişimi çoğu markada "gereksiz" denilerek atlanır; 80.000 km\'de yapılması önerilir.' },
    problems: [
      { title: 'Tork konvertörü kilitleme (lock-up) titreşimi', risk: 'Orta', cost: '15.000 - 45.000 TL', note: 'Sabit hızda hafif titreme ilk belirtidir.' },
      { title: 'Yağ bozulmasına bağlı geçiş sertliği', risk: 'Düşük', cost: '6.000 - 15.000 TL', note: '' }
    ],
    buyingNote: 'Piyasadaki en dayanıklı otomatiklerden biridir; çift kavramalıya göre çok daha az risk taşır.'
  },
  {
    id: 'aisin-8at',
    name: 'Aisin 8 ileri otomatik',
    type: 'Tork konvertörlü otomatik',
    gears: 8,
    group: 'Genel',
    usedIn: ['Volvo XC60/XC90/S90', 'Ford Focus 2018+', 'Toyota RAV4', 'Lexus NX'],
    reliability: 88,
    service: { intervalKm: 80000, note: '' },
    problems: [
      { title: 'Yazılım kaynaklı geçiş tereddüdü', risk: 'Düşük', cost: '0 - 6.000 TL', note: 'Genellikle yazılım güncellemesiyle çözülür.' }
    ],
    buyingNote: 'Yeni nesil, sorunu az bir şanzımandır.'
  },
  {
    id: 'honda-cvt',
    name: 'Honda CVT',
    type: 'Kayışlı sürekli değişken (CVT)',
    gears: null,
    group: 'Honda',
    usedIn: ['Honda Civic', 'Honda Jazz', 'Honda HR-V', 'Honda CR-V'],
    reliability: 76,
    service: { intervalKm: 60000, note: 'Yalnızca Honda HCF-2 yağı kullanılmalı; farklı yağ şanzımanı bitirir.' },
    problems: [
      { title: 'Yanlış yağ kullanımına bağlı kayma', risk: 'Orta', cost: '30.000 - 80.000 TL', note: 'Bu şanzımanda yağ tipi pazarlık konusu değildir.' },
      { title: 'Kalkışta hafif zorlanma hissi', risk: 'Düşük', cost: '0 TL', note: 'CVT\'nin yapısal karakteridir, arıza değildir.' }
    ],
    buyingNote: 'Yağ bakım faturası varsa güvenilirdir; yağ geçmişi bilinmiyorsa temkinli ol.'
  },
  {
    id: 'zf9hp',
    name: 'ZF 9HP (9 ileri)',
    type: 'Tork konvertörlü otomatik',
    gears: 9,
    group: 'Genel',
    usedIn: ['Jeep Renegade/Compass', 'Land Rover Discovery Sport', 'Range Rover Evoque', 'Honda CR-V'],
    reliability: 58,
    service: { intervalKm: 60000, note: 'Yağ değişimi ihmal edilmemeli.' },
    problems: [
      { title: 'Vites geçişlerinde sarsıntı ve tereddüt', risk: 'Orta', cost: '0 - 25.000 TL', note: 'Çok sayıda yazılım güncellemesi yayınlanmıştır; güncel yazılım sorulmalı.' },
      { title: 'Valf gövdesi arızası', risk: 'Orta', cost: '25.000 - 60.000 TL', note: '' }
    ],
    buyingNote: 'İlk yıllarında bolca şikayet almış bir şanzımandır. Test sürüşünde düşük hızda geçişleri dikkatle dinle.'
  },
  {
    id: 'toyota-multidrive',
    name: 'Multidrive S (CVT)',
    type: 'Kayışlı sürekli değişken (CVT)',
    gears: null,
    group: 'Toyota',
    usedIn: ['Toyota Corolla', 'Toyota Auris', 'Toyota Avensis', 'Toyota C-HR'],
    reliability: 82,
    service: { intervalKm: 60000, note: 'Yağ değişimi önerilir.' },
    problems: [
      { title: 'Yüksek devirde "kayıyor" hissi', risk: 'Düşük', cost: '0 TL', note: 'CVT karakteridir; arıza değildir.' },
      { title: 'Yüksek kilometrede kayış aşınması', risk: 'Orta', cost: '30.000 - 70.000 TL', note: '' }
    ],
    buyingNote: 'Hibrit e-CVT ile karıştırılmamalı; bu klasik kayışlı CVT\'dir ama Toyota\'da sorun oranı düşüktür.'
  },
  {
    id: 'hyundai-6dct',
    name: '6DCT (kuru çift kavrama)',
    type: 'Çift kavramalı, kuru',
    gears: 6,
    group: 'Hyundai-Kia',
    usedIn: ['Hyundai i20', 'Hyundai Tucson', 'Hyundai Ioniq', 'Kia Ceed', 'Kia Niro', 'Kia Stonic'],
    reliability: 60,
    service: { intervalKm: 60000, note: 'Kuru kavramadır; kavrama aşınması kullanım tarzına doğrudan bağlıdır.' },
    problems: [
      { title: 'Düşük hızda sarsıntı ve titreşim', risk: 'Orta', cost: '0 - 30.000 TL', note: 'Önce yazılım güncellemesi ve kavrama adaptasyonu denenmelidir.' },
      { title: 'Kuru kavrama aşınması', risk: 'Orta', cost: '25.000 - 55.000 TL', note: 'Şehir içi dur-kalk trafiği ömrü belirgin biçimde kısaltır.' },
      { title: 'Yokuşta geri kaçma hissi', risk: 'Düşük', cost: '0 TL', note: 'Kuru çift kavramalı şanzımanların yapısal karakteridir.' }
    ],
    buyingNote:
      'Aynı markanın 6 ileri tork konvertörlü otomatiğine göre daha risklidir. Test sürüşünde 20-40 km/s dur-kalk yapıp sarsıntıyı dinle, kavrama değişim kaydını sor.'
  },
  {
    id: 'manuel',
    name: 'Manuel',
    type: 'Düz şanzıman',
    gears: null,
    group: 'Genel',
    usedIn: ['Tüm markalar'],
    reliability: 92,
    service: { intervalKm: 100000, note: 'Yağ değişimi çoğu araçta önerilir ama sık atlanır.' },
    problems: [
      { title: 'Debriyaj ve baskı balata aşınması', risk: 'Orta', cost: '8.000 - 30.000 TL', note: 'Kullanım tarzına bağlı normal aşınma kalemidir.' },
      { title: 'Çift kütleli volan aşınması', risk: 'Orta', cost: '20.000 - 50.000 TL', note: 'Rölantide gıcırtı ve kalkışta titreme yapar.' }
    ],
    buyingNote: 'Bakım maliyeti en düşük, arıza riski en az aktarma çözümüdür.'
  }
]

export function getTransmissionById(id) {
  return TRANSMISSIONS.find((t) => t.id === id) || null
}

/**
 * Araç kayıtlarındaki serbest metin şanzıman adını ("S tronic", "7DCT",
 * "DSG" gibi) katalogdaki kayda eşler.
 *
 * Eşleşme sırası önemlidir: özel adlar genel adlardan önce denenir, aksi
 * halde "DSG 7" araması "DSG" ile eşleşip yanlış kaydı döndürür.
 */
const NAME_PATTERNS = [
  [/dq200|dsg\s*7|7\s*ileri.*kuru/i, 'dq200'],
  [/dq250|dsg\s*6/i, 'dq250'],
  [/dq381|dq500/i, 'dq381'],
  [/multitronic/i, 'multitronic'],
  [/s\s*tronic|dsg/i, 'dq250'],
  [/zf\s*8|8hp|8\s*ileri otomatik/i, 'zf8hp'],
  [/zf\s*6|6hp/i, 'zf6hp'],
  [/9hp|9\s*ileri/i, 'zf9hp'],
  [/eat\s*[68]/i, 'eat8'],
  [/al4|dp0/i, 'al4-dp0'],
  [/dps6|powershift.*kuru/i, 'powershift-dps6'],
  [/mps6|powershift/i, 'powershift-mps6'],
  [/7dct|d7uf/i, 'kia-7dct'],
  [/6dct|d6gf/i, 'hyundai-6dct'],
  [/edc/i, 'renault-edc'],
  [/dct/i, 'renault-edc'],
  [/9g/i, 'mb-9g-tronic'],
  [/7g-dct|7g\s*dct/i, 'mb-7g-dct'],
  [/7g/i, 'mb-7g-tronic'],
  [/multidrive/i, 'toyota-multidrive'],
  [/e-cvt|hibrit|hybrid/i, 'toyota-cvt'],
  [/jatco|x-?tronic/i, 'jatco-cvt'],
  [/dualogic|mmt|robotize/i, 'fiat-dualogic'],
  [/tiptronic/i, 'tiptronic-09g'],
  [/aisin/i, 'aisin-6at'],
  [/cvt/i, 'jatco-cvt'],
  [/manuel|düz/i, 'manuel']
]

/*
 * "Otomatik" tek başına hiçbir şey anlatmaz — ilanların çoğunda böyle yazar.
 * Markanın o yıllarda hangi otomatiği kullandığı belgelenmiş bir bilgidir, bu
 * yüzden marka + yıl ile daraltılabilir. Ancak bu bir ÇIKARIMDIR: kullanıcıya
 * "kesin bu şanzıman" denmez, `confidence: 'tahmin'` ile işaretlenip ekranda
 * "muhtemelen" diye gösterilir.
 *
 * Her kayıt: [markalar, yıl eşiği, eşikten önce, eşikten sonra]
 */
const GENERIC_AUTOMATIC = [
  [['bmw', 'mini'], 2011, 'zf6hp', 'zf8hp'],
  [['mercedes', 'mercedes-benz'], 2016, 'mb-7g-tronic', 'mb-9g-tronic'],
  [['hyundai', 'kia'], null, 'hyundai-6at', 'hyundai-6at'],
  [['honda'], null, 'honda-cvt', 'honda-cvt'],
  [['toyota', 'lexus'], null, 'aisin-6at', 'aisin-6at'],
  [['volvo'], 2015, 'aisin-6at', 'aisin-8at'],
  [['jeep', 'land rover', 'range rover'], 2014, 'aisin-6at', 'zf9hp'],
  [['opel', 'ford', 'mazda', 'peugeot', 'citroën', 'citroen', 'chevrolet', 'suzuki'], null, 'aisin-6at', 'aisin-6at']
]

function resolveGenericAutomatic(brand, year) {
  const key = String(brand || '').toLocaleLowerCase('tr')
  const row = GENERIC_AUTOMATIC.find(([brands]) => brands.some((b) => key.includes(b)))
  if (!row) return null
  const [, threshold, before, after] = row
  const y = Number(year)
  if (!threshold) return before
  if (!y) return null // yıl bilinmiyorsa nesli tahmin etmeyiz
  return y < threshold ? before : after
}

/**
 * Serbest metin şanzıman adını katalogdaki kayda eşler.
 *
 * @param name     "S tronic", "7DCT", "Otomatik" ...
 * @param context  { brand, year } — yalnızca "Otomatik" gibi jenerik
 *                 yazımlarda kullanılır.
 */
export function matchTransmission(name, context = {}) {
  const info = matchTransmissionInfo(name, context)
  return info ? info.transmission : null
}

/**
 * matchTransmission ile aynı işi yapar ama sonucun ne kadar kesin olduğunu da
 * söyler. Ekranda "muhtemelen" ibaresi bu alana göre gösterilir.
 */
export function matchTransmissionInfo(name, context = {}) {
  if (typeof name !== 'string' || !name.trim()) return null

  const found = NAME_PATTERNS.find(([pattern]) => pattern.test(name))
  if (found) {
    const transmission = getTransmissionById(found[1])
    return transmission ? { transmission, confidence: 'kesin' } : null
  }

  if (/otomatik|automatic|steptronic/i.test(name)) {
    const id = resolveGenericAutomatic(context.brand, context.year)
    const transmission = id ? getTransmissionById(id) : null
    if (transmission) return { transmission, confidence: 'tahmin' }
  }

  return null
}
