/**
 * ARIZA ARKETİPLERİ (SİSTEM BAZLI ORTAK SORUNLAR)
 *
 * ============================================================================
 * BU DOSYA NEYİ TUTAR, engines.js NEYİ TUTAR
 * ============================================================================
 * engines.js ve transmissions.js, O MOTORA/ŞANZIMANA ÖZGÜ arızaları tutar:
 * "N47'de triger zinciri motorun arkasındadır" gibi. Bu bilgi başka motora
 * taşınamaz.
 *
 * Bu dosya ise SİSTEME ÖZGÜ, markadan bağımsız arızaları tutar: DPF tıkanması
 * her dizelde, süspansiyon salıncak burcu her araçta aynı mantıkla çalışır.
 * Bu bilgiyi 107 motor kaydına tek tek kopyalamak hem veriyi şişirir hem de
 * bir düzeltme gerektiğinde 107 yerde güncelleme demektir.
 *
 * ============================================================================
 * NEDEN AYRI BİR KATMAN GEREKLİ
 * ============================================================================
 * Katalogda kaydı olmayan bir araç (örneğin Volvo XC90) girildiğinde motor
 * eşleşmesi bulunamaz ve kullanıcıya hiçbir şey gösterilemezdi. Oysa o aracın
 * dizel olduğunu, otomatik olduğunu ve 200.000 km'de olduğunu biliyoruz —
 * bu kadarı bile anlamlı bir kontrol listesi üretmeye yeter.
 *
 * Yani bu katman, veritabanı boşluğunu ÜRETİLMİŞ BİLGİYLE değil, GENEL GEÇER
 * mühendislik bilgisiyle doldurur.
 *
 * ============================================================================
 * ALANLAR
 * ============================================================================
 *   system      motor | sanziman | suspansiyon | fren | elektrik | kaporta | iklimlendirme
 *   appliesTo   { fuel?, transmissionType?, minKm?, minAge? } — hangi araçta geçerli
 *   risk        Yüksek | Orta | Düşük
 *   cost        TL aralığı (Türkiye piyasası, kaba tahmin)
 *   checkKm     hangi kilometre bandında gündeme gelir
 *   symptom     kullanıcının fark edeceği belirti
 *   checkHow    araç başında nasıl kontrol edilir
 */

export const PROBLEM_SYSTEMS = [
  { id: 'motor', label: 'Motor' },
  { id: 'sanziman', label: 'Şanzıman' },
  { id: 'suspansiyon', label: 'Süspansiyon ve direksiyon' },
  { id: 'fren', label: 'Fren' },
  { id: 'elektrik', label: 'Elektrik' },
  { id: 'iklimlendirme', label: 'İklimlendirme' },
  { id: 'kaporta', label: 'Kaporta ve gövde' }
]

export const PROBLEM_ARCHETYPES = [
  // ------------------------------------------------------------------ MOTOR
  {
    id: 'dpf-tikanma',
    system: 'motor',
    title: 'DPF (partikül filtresi) tıkanması',
    appliesTo: { fuel: 'Dizel', minKm: 90000 },
    risk: 'Orta',
    cost: '6.000 - 45.000 TL',
    checkKm: '90000-200000',
    symptom: 'Motor uyarı lambası, güç kaybı, yağ seviyesinin kendiliğinden ARTMASI',
    checkHow:
      'Yağ çubuğunu çek; seviye maksimumun üstündeyse ve yakıt kokuyorsa rejenerasyon tamamlanamıyor demektir. Bu, motor için ciddi risktir.'
  },
  {
    id: 'egr-kurumlanma',
    system: 'motor',
    title: 'EGR valfi kurumlanması',
    appliesTo: { fuel: 'Dizel', minKm: 80000 },
    risk: 'Orta',
    cost: '3.000 - 18.000 TL',
    checkKm: '80000-180000',
    symptom: 'Rölantide titreme, gaz tepkisinde gecikme, siyah duman',
    checkHow: 'Arıza kodu okut; EGR ile ilgili kayıtlı ya da silinmiş kod olup olmadığını sor.'
  },
  {
    id: 'turbo-aktuator',
    system: 'motor',
    title: 'Turbo kanatçık / aktüatör yapışması',
    appliesTo: { fuel: 'Dizel', minKm: 120000 },
    risk: 'Orta',
    cost: '10.000 - 40.000 TL',
    checkKm: '120000-250000',
    symptom: 'Belirli devirde güç kaybı, ıslık sesi, mavi duman',
    checkHow: 'Test sürüşünde tam gazda çekiş kesintisi olup olmadığını dinle.'
  },
  {
    id: 'karbon-birikimi',
    system: 'motor',
    title: 'Emme supabı karbon birikimi',
    appliesTo: { fuel: 'Benzin', minKm: 80000 },
    risk: 'Orta',
    cost: '6.000 - 22.000 TL',
    checkKm: '80000-160000',
    symptom: 'Soğuk çalıştırmada titreme, rölanti düzensizliği, yakıt tüketiminde artış',
    checkHow:
      'Direkt enjeksiyonlu (GDI/TSI/TFSI) motorlarda yaygındır; ceviz kabuğu temizliği yapılıp yapılmadığını sor.'
  },
  {
    id: 'yag-kacagi',
    system: 'motor',
    title: 'Conta ve keçelerden yağ kaçağı',
    appliesTo: { minAge: 8 },
    risk: 'Orta',
    cost: '4.000 - 25.000 TL',
    checkKm: '120000-300000',
    symptom: 'Park yerinde damla, motor altında yağ birikintisi, yanık yağ kokusu',
    checkHow:
      'Aracı kaldırıp motorun altına bak. Motor aşırı temizse şüphelen — kaçak gizlemek için yıkanmış olabilir.'
  },
  {
    id: 'sogutma-plastik',
    system: 'motor',
    title: 'Soğutma sistemi plastik parçalarının yaşlanması',
    appliesTo: { minAge: 8 },
    risk: 'Orta',
    cost: '5.000 - 25.000 TL',
    checkKm: '100000-250000',
    symptom: 'Antifriz eksilmesi, hararet iğnesinde oynama, tatlımsı koku',
    checkHow:
      'Genleşme kabını, radyatör kenarlarını ve hortum bağlantılarını beyaz/yeşil kuruma izine karşı kontrol et. Hararet yapan motorda silindir kapağı riski doğar.'
  },

  // --------------------------------------------------------------- ŞANZIMAN
  {
    id: 'dct-sarsinti',
    system: 'sanziman',
    title: 'Çift kavramalı şanzımanda düşük hız sarsıntısı',
    appliesTo: { transmissionType: 'cift-kavrama' },
    risk: 'Yüksek',
    cost: '0 - 55.000 TL',
    checkKm: '60000-200000',
    symptom: '20-40 km/s arası dur-kalkta sarsıntı, yokuşta geri kaçma',
    checkHow:
      'Test sürüşünü mutlaka trafikte, dur-kalk yaparak yap. Boş yolda düzgün giden şanzıman trafikte kendini belli eder.'
  },
  {
    id: 'at-yag-bakimi',
    system: 'sanziman',
    title: 'Otomatik şanzıman yağı hiç değişmemiş',
    appliesTo: { transmissionType: 'otomatik', minKm: 80000 },
    risk: 'Orta',
    cost: '7.000 - 25.000 TL',
    checkKm: '80000-250000',
    symptom: 'Sert ya da geç vites geçişleri, sabit hızda titreme',
    checkHow:
      '"Ömürlük yağ" denilse bile 80.000 km sonrası değişim kaydı sorulmalı. Kayıt yoksa mekatronik riski artar ve bu pazarlık kalemidir.'
  },
  {
    id: 'cvt-kayma',
    system: 'sanziman',
    title: 'CVT kayış/kasnak aşınması',
    appliesTo: { transmissionType: 'cvt', minKm: 100000 },
    risk: 'Yüksek',
    cost: '30.000 - 90.000 TL',
    checkKm: '100000-220000',
    symptom: 'Tam gazda devir yükselirken hızın artmaması',
    checkHow:
      'Test sürüşünde boş bir yolda tam gaz ver. Devir fırlayıp hız gelmiyorsa kayma başlamıştır — bu araçtan uzak dur.'
  },
  {
    id: 'debriyaj-asinma',
    system: 'sanziman',
    title: 'Debriyaj ve çift kütleli volan aşınması',
    appliesTo: { transmissionType: 'manuel', minKm: 120000 },
    risk: 'Orta',
    cost: '12.000 - 45.000 TL',
    checkKm: '120000-250000',
    symptom: 'Kalkışta titreme, debriyaj pedalının yüksekte tutması, rölantide gıcırtı',
    checkHow:
      'Yokuşta 2. viteste kalkmayı dene; motor devri yükselip araç ilerlemiyorsa debriyaj kaymıştır.'
  },

  // ------------------------------------------------------------ SÜSPANSİYON
  {
    id: 'salincak-burc',
    system: 'suspansiyon',
    title: 'Salıncak burcu ve rotil aşınması',
    appliesTo: { minKm: 90000 },
    risk: 'Düşük',
    cost: '3.000 - 15.000 TL',
    checkKm: '90000-200000',
    symptom: 'Bozuk yolda tık sesi, direksiyonda boşluk',
    checkHow: 'Test sürüşünü mutlaka bozuk bir yolda yap; düz asfaltta bu sesler duyulmaz.'
  },
  {
    id: 'amortisor',
    system: 'suspansiyon',
    title: 'Amortisör ömrünü doldurmuş',
    appliesTo: { minKm: 120000 },
    risk: 'Orta',
    cost: '8.000 - 30.000 TL',
    checkKm: '120000-250000',
    symptom: 'Tümsekten sonra zıplama, frende burun daldırma, düzensiz lastik aşınması',
    checkHow:
      'Aracın köşesine bastırıp bırak; bir kez gidip gelip durmalı. Yaylanmaya devam ediyorsa amortisör bitmiştir.'
  },
  {
    id: 'direksiyon-kutusu',
    system: 'suspansiyon',
    title: 'Elektrikli direksiyon ünitesi arızası',
    appliesTo: { minAge: 8 },
    risk: 'Orta',
    cost: '10.000 - 45.000 TL',
    checkKm: '120000-250000',
    symptom: 'Direksiyonun ağırlaşması, uyarı lambası, merkeze dönmeme',
    checkHow: 'Park halinde direksiyonu iki uca kadar çevir; ses ve ağırlık farkı olmamalı.'
  },

  // ------------------------------------------------------------------ FREN
  {
    id: 'disk-balata',
    system: 'fren',
    title: 'Fren diski ve balata ömrü',
    appliesTo: { minKm: 60000 },
    risk: 'Düşük',
    cost: '5.000 - 20.000 TL',
    checkKm: '60000-150000',
    symptom: 'Frende titreme, metalik ses, pedal derinliği',
    checkHow: 'Jant aralığından diske bak; kenarında belirgin bir basamak oluşmuşsa disk incelmiştir.'
  },
  {
    id: 'fren-hidrolik-nem',
    system: 'fren',
    title: 'Fren hidroliği nem çekmiş',
    appliesTo: { minAge: 3 },
    risk: 'Orta',
    cost: '1.200 - 4.000 TL',
    checkKm: '0-999999',
    symptom: 'Pedalın süngerimsi hissi, uzun inişte fren zayıflaması',
    checkHow:
      'Kilometreden bağımsız, 2 yılda bir değişmeli. En çok atlanan kalem budur; değişim kaydı sor.'
  },

  // -------------------------------------------------------------- ELEKTRİK
  {
    id: 'aku-yaslanma',
    system: 'elektrik',
    title: 'Akü ömrünü doldurmuş',
    appliesTo: { minAge: 4 },
    risk: 'Düşük',
    cost: '3.500 - 14.000 TL',
    checkKm: '0-999999',
    symptom: 'Zor çalışma, start-stop sisteminin devreye girmemesi',
    checkHow:
      'Akünün üzerindeki üretim tarihine bak. Start-stop sistemli araçta AGM akü gerekir ve fiyatı iki katıdır.'
  },
  {
    id: 'sensor-ariza',
    system: 'elektrik',
    title: 'Sensör arızaları (park, ABS, lastik basıncı)',
    appliesTo: { minAge: 6 },
    risk: 'Düşük',
    cost: '2.000 - 12.000 TL',
    checkKm: '80000-250000',
    symptom: 'Gösterge panelinde sönmeyen uyarı lambaları',
    checkHow:
      'Kontak açıldığında tüm ikaz lambalarının yanıp SÖNMESİ gerekir. Hiç yanmayan lamba, iptal edilmiş olabilir — bu daha kötüdür.'
  },

  // --------------------------------------------------------- İKLİMLENDİRME
  {
    id: 'klima-gaz',
    system: 'iklimlendirme',
    title: 'Klima soğutmuyor',
    appliesTo: { minAge: 5 },
    risk: 'Düşük',
    cost: '2.000 - 30.000 TL',
    checkKm: '0-999999',
    symptom: 'Yetersiz soğutma, kompresörün devreye girmemesi',
    checkHow:
      'Mevsim ne olursa olsun klimayı en soğuğa al ve 5 dakika bekle. Sadece gaz eksikse ucuz, kompresör arızalıysa pahalıdır.'
  },

  // --------------------------------------------------------------- KAPORTA
  {
    id: 'pas-korozyon',
    system: 'kaporta',
    title: 'Marşpiyel ve bagaj havuzunda korozyon',
    appliesTo: { minAge: 10 },
    risk: 'Orta',
    cost: '5.000 - 40.000 TL',
    checkKm: '0-999999',
    symptom: 'Kapı altında kabarma, bagaj havuzunda pas lekesi',
    checkHow:
      'Bagaj halısını kaldır, stepne yuvasına bak. Kapı fitillerini kaldırıp altına bak — pas buradan başlar.'
  },
  {
    id: 'su-kacagi',
    system: 'kaporta',
    title: 'Tavan/cam çevresinden su kaçağı',
    appliesTo: { minAge: 6 },
    risk: 'Orta',
    cost: '3.000 - 25.000 TL',
    checkKm: '0-999999',
    symptom: 'Araç içinde nem kokusu, camlarda buğulanma, tavan döşemesinde leke',
    checkHow:
      'Tavan döşemesinin köşelerini elle yokla. Panoramik tavanlı araçlarda drenaj kanalları tıkanınca elektronik aksama su verir.'
  },

  // --------------------------------------------------------------- MOTOR (2)
  {
    id: 'zincir-gerdirici',
    system: 'motor',
    title: 'Triger zinciri gerdiricisi aşınması',
    appliesTo: { minKm: 100000 },
    risk: 'Orta',
    cost: '8.000 - 35.000 TL',
    checkKm: '100000-220000',
    symptom: 'Soğuk çalıştırmada 1-2 saniyelik metalik tıkırtı, rölantide hafif titreşim',
    checkHow:
      'Motoru soğukken çalıştır ve ilk saniyelere kulak ver; tıkırtı hemen kaybolmuyorsa gerdirici veya zincir kılavuzu aşınmış olabilir.'
  },
  {
    id: 'enjektor-arizasi',
    system: 'motor',
    title: 'Enjektör aşınması / sızdırması',
    appliesTo: { fuel: 'Dizel', minKm: 150000 },
    risk: 'Orta',
    cost: '10.000 - 40.000 TL',
    checkKm: '150000-300000',
    symptom: 'Sert/düzensiz rölanti, duman rengi değişimi, yakıt tüketiminde artış',
    checkHow:
      'Servis kaydında enjektör debisi (return flow) testi yapılıp yapılmadığını sor; yapılmadıysa alım öncesi ölçtürülmesi önerilir.'
  },
  {
    id: 'yakit-pompasi',
    system: 'motor',
    title: 'Yüksek basınç yakıt pompası aşınması',
    appliesTo: { minKm: 150000 },
    risk: 'Orta',
    cost: '10.000 - 45.000 TL',
    checkKm: '150000-300000',
    symptom: 'Zor çalışma, güç kesilmesi, arıza lambası',
    checkHow:
      'Kötü kalite yakıtla uzun süre kullanılan araçlarda daha sık görülür; yakıt istasyonu geçmişi ilan sahibine sorulmalı.'
  },

  // ------------------------------------------------------------- ŞANZIMAN (1)
  {
    id: 'volan-cift-kutleli',
    system: 'sanziman',
    title: 'Çift kütleli volan (DMF) aşınması',
    appliesTo: { transmissionType: 'Manuel', minKm: 150000 },
    risk: 'Orta',
    cost: '15.000 - 45.000 TL',
    checkKm: '150000-280000',
    symptom: 'Rölantide vuruntu/tıkırtı, debriyaja basınca titreşim, hızlanırken sarsıntı',
    checkHow:
      'Rölantide vitesi boşta bırakıp debriyaj pedalını yarı bas; ses değişiyorsa DMF aşınmış olabilir. Debriyaj değişiminde birlikte değiştirilmesi önerilir.'
  },

  // --------------------------------------------------------- SÜSPANSİYON (1)
  {
    id: 'rot-basi',
    system: 'suspansiyon',
    title: 'Rot başı / rotil aşınması',
    appliesTo: { minKm: 80000 },
    risk: 'Düşük',
    cost: '2.000 - 8.000 TL',
    checkKm: '80000-200000',
    symptom: 'Direksiyonda oynama, düz yolda hafif titreşim, lastik iç/dış kenar aşınması',
    checkHow:
      'Aracı kaldırıp lastikleri saat 3-9 yönünde tutup sallayarak boşluk kontrol edilir.'
  },

  // ------------------------------------------------------------------ FREN (2)
  {
    id: 'abs-sensor',
    system: 'fren',
    title: 'ABS teker hız sensörü arızası',
    appliesTo: { minKm: 100000 },
    risk: 'Düşük',
    cost: '1.500 - 6.000 TL',
    checkKm: '100000-999999',
    symptom: 'ABS/ESP arıza lambası, fren sırasında ABS devreye girmemesi',
    checkHow: 'Gösterge panelinde ABS lambası kontağı açınca kısa süre yanıp sönmeli ve sönmelidir; sönmüyorsa arıza var demektir.'
  },
  {
    id: 'el-freni-kablosu',
    system: 'fren',
    title: 'El freni kablosu paslanması/sıkışması',
    appliesTo: { minAge: 8 },
    risk: 'Düşük',
    cost: '2.000 - 6.000 TL',
    checkKm: '0-999999',
    symptom: 'El freni tutmuyor veya bırakılınca açılmıyor, sürüşte hafif çekme',
    checkHow: 'El frenini çekip bırak; her iki arka tekerlek de aynı anda ve tam serbest kalmalı.'
  },

  // --------------------------------------------------------------- ELEKTRİK (2)
  {
    id: 'alternator-arizasi',
    system: 'elektrik',
    title: 'Alternatör aşınması',
    appliesTo: { minKm: 150000 },
    risk: 'Orta',
    cost: '4.000 - 15.000 TL',
    checkKm: '150000-999999',
    symptom: 'Akü şarj lambası, gece farlarda titreşim, marşın zayıflaması',
    checkHow: 'Motor çalışırken çoklu ölçer ile akü uçlarından voltaj ölç; 13.5-14.5V dışındaysa alternatör/regülatör şüphelidir.'
  },
  {
    id: 'cam-mekanizmasi',
    system: 'elektrik',
    title: 'Elektrikli cam mekanizması (regülatör) arızası',
    appliesTo: { minAge: 7 },
    risk: 'Düşük',
    cost: '1.500 - 5.000 TL',
    checkKm: '0-999999',
    symptom: 'Cam yavaş iniyor/çıkıyor, inerken takılıyor, tuhaf motor sesi',
    checkHow: 'Tüm camları teker teker aç/kapat; asimetrik hız veya duraksama regülatör halatının koptuğunu gösterebilir.'
  },

  // --------------------------------------------------------- İKLİMLENDİRME (1)
  {
    id: 'klima-kompresoru',
    system: 'iklimlendirme',
    title: 'Klima kompresörü arızası',
    appliesTo: { minKm: 120000 },
    risk: 'Orta',
    cost: '8.000 - 25.000 TL',
    checkKm: '120000-999999',
    symptom: 'Klima açıldığında vuruntu/gıcırtı sesi, soğutmanın aniden kesilmesi',
    checkHow: 'Klimayı açıp motor kaputunu aç; kompresör kasnağı devreye girerken anormal ses/titreşim varsa şüphelen.'
  }
]

// ============================================================================
// SORGU
// ============================================================================

/** Şanzıman adından tip çıkarır — arketip filtresi bunu kullanır. */
export function transmissionTypeOf(name) {
  const text = String(name || '').toLocaleLowerCase('tr')
  if (!text) return null
  if (/dsg|dct|edc|powershift|s tronic|7g-dct|çift kavrama|cift kavrama/.test(text)) return 'cift-kavrama'
  if (/cvt|multidrive|x-?tronic|multitronic/.test(text)) return 'cvt'
  if (/manuel|düz|duz/.test(text)) return 'manuel'
  if (/otomatik|tronic|automatic|eat|zf|aisin/.test(text)) return 'otomatik'
  return null
}

/**
 * Araca uyan arketipleri döner.
 *
 * Bu liste motor kataloğunun YERİNE geçmez, boşluğunu doldurur: katalogda
 * kaydı olmayan bir araçta bile yaşa, kilometreye, yakıta ve şanzıman tipine
 * göre anlamlı bir kontrol listesi üretir.
 *
 * @param {object} vehicle { fuelType, transmission, km, year }
 */
export function matchArchetypes(vehicle) {
  if (!vehicle) return []

  const km = Number(vehicle.km) || 0
  const year = Number(vehicle.year) || null
  const age = year ? Math.max(0, new Date().getFullYear() - year) : null
  const transmissionType = transmissionTypeOf(vehicle.transmission)

  return PROBLEM_ARCHETYPES.filter((item) => {
    const rule = item.appliesTo || {}

    // Yakıt kısıtı: araç yakıtı biliniyorsa ve uymuyorsa elenir.
    if (rule.fuel && vehicle.fuelType && rule.fuel !== vehicle.fuelType) return false
    if (rule.fuel && !vehicle.fuelType) return false

    // Şanzıman kısıtı
    if (rule.transmissionType) {
      if (!transmissionType) return false
      if (rule.transmissionType !== transmissionType) return false
    }

    // Kilometre/yaş eşiği — ikisinden biri tutuyorsa yeterli.
    const kmOk = rule.minKm ? km >= rule.minKm : true
    const ageOk = rule.minAge ? age !== null && age >= rule.minAge : true
    if (rule.minKm && rule.minAge) return kmOk || ageOk
    return kmOk && ageOk
  })
}

/** Sisteme göre gruplar — ekranda başlıklı liste için. */
export function groupBySystem(items) {
  const groups = new Map()
  items.forEach((item) => {
    if (!groups.has(item.system)) groups.set(item.system, [])
    groups.get(item.system).push(item)
  })
  return PROBLEM_SYSTEMS.filter((s) => groups.has(s.id)).map((s) => ({
    ...s,
    items: groups.get(s.id)
  }))
}

export function getArchetypeCount() {
  return PROBLEM_ARCHETYPES.length
}
