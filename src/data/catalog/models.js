/**
 * MODEL VE NESİL VERİTABANI
 *
 * ============================================================================
 * NEDEN NESİL BİLGİSİ KRİTİK
 * ============================================================================
 * İkinci el alımında en pahalı hatalardan biri, aynı model adının farklı
 * nesillerini aynı sanmaktır. "Golf" demek yeterli değildir:
 *
 *   Golf 6 (2008-2012)  → DQ200 kuru DSG, 1.6 TDI EA189 — bilinen riskler
 *   Golf 7 (2012-2020)  → EA288 dizel, sorunların çoğu giderilmiş
 *   Golf 8 (2020+)      → mekanik iyi ama yazılım/multimedya şikayetleri
 *
 * Aynı şey makyaj (facelift) için de geçerli: birçok kronik sorun makyajla
 * düzeltilir, bu yüzden "2015 Golf" ile "2013 Golf" farklı risk taşır.
 *
 * ============================================================================
 * VERİ YAPISI
 * ============================================================================
 *   brand        marka adı (brands.js ile aynı yazım)
 *   model        model adı
 *   segment      maliyet ölçeği için (maintenance.js)
 *   generations  [{ code, years, facelift, bodyTypes, engineIds, transmissionIds, note }]
 *
 * `engineIds` ve `transmissionIds`, engines.js / transmissions.js içindeki
 * kimliklerdir. Böylece bir motorun arızası güncellendiğinde onu kullanan tüm
 * nesiller otomatik yararlanır — veri tek yerde durur.
 *
 * ============================================================================
 * KAPSAM HAKKINDA DÜRÜST NOT
 * ============================================================================
 * Buradaki liste Türkiye ikinci el pazarında en çok işlem gören modellerle
 * başlar. Her markanın her modelini kapsamaz ve kapsıyormuş gibi de
 * gösterilmez: eşleşme bulunamayan araçta uygulama bu bölümü hiç göstermez,
 * uydurma nesil bilgisi üretmez.
 */

const CURATED_MODELS = [
  // ==========================================================================
  // VOLKSWAGEN
  // ==========================================================================
  {
    brand: 'Volkswagen',
    model: 'Golf',
    segment: 'kompakt',
    generations: [
      {
        code: 'Mk5 (1K)',
        years: '2003-2008',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-pd-19tdi', 'vag-fsi', 'vag-18t-20v'],
        transmissionIds: ['dq250', 'manuel'],
        note: 'FSI benzinlilerde emme supabı karbon birikimi, 1.9 TDI PD ise doğru bakımla çok uzun ömürlüdür.'
      },
      {
        code: 'Mk6 (5K)',
        years: '2008-2012',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea189-16tdi', 'vag-ea189-20tdi'],
        transmissionIds: ['dq200', 'dq250', 'manuel'],
        note: 'Kuru DSG (DQ200) bu nesilde yaygın; mekatronik ve kavrama geçmişi sorulmadan alınmamalı.'
      },
      {
        code: 'Mk7 (5G)',
        years: '2012-2020',
        facelift: '2017',
        bodyTypes: ['Hatchback', 'Station Wagon'],
        engineIds: ['vag-ea288-16tdi', 'vag-ea288-20tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['dq200', 'dq250', 'dq381', 'manuel'],
        note: 'EA288 dizellerde EA189\'un birçok sorunu giderildi. 2017 makyajıyla multimedya ve far seçenekleri yenilendi.'
      },
      {
        code: 'Mk8 (CD)',
        years: '2020-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['dq381', 'manuel'],
        note: 'Mekanik olgun; şikayetlerin çoğu dokunmatik kontroller ve yazılım kaynaklıdır. Yazılım güncellemesi yapılmış mı sorulmalı.'
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    segment: 'sedan',
    generations: [
      {
        code: 'B6/B7 (3C)',
        years: '2005-2014',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['vag-ea189-20tdi', 'vag-pd-19tdi', 'vag-fsi'],
        transmissionIds: ['dq250', 'tiptronic-09g', 'manuel'],
        note: 'Yaşa bağlı süspansiyon ve elektrik kalemleri sıraya girer.'
      },
      {
        code: 'B8 (3G)',
        years: '2015-2023',
        facelift: '2019',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea888-gen3'],
        transmissionIds: ['dq381', 'dq250', 'manuel'],
        note: 'Türkiye\'de en çok tercih edilen D segment sedanlardan; ikinci elde likiditesi yüksektir.'
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Polo',
    segment: 'mini',
    generations: [
      {
        code: '6R',
        years: '2009-2017',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea189-16tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['dq200', 'manuel'],
        note: ''
      },
      {
        code: 'AW',
        years: '2017-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea211-14tsi', 'vag-14tdi-3cyl'],
        transmissionIds: ['dq200', 'manuel'],
        note: 'MQB A0 platformu; iç hacim önceki nesle göre belirgin arttı.'
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Tiguan',
    segment: 'suv',
    generations: [
      {
        code: '5N',
        years: '2007-2016',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea189-20tdi', 'vag-ea888-gen2'],
        transmissionIds: ['dq250', 'tiptronic-09g', 'manuel'],
        note: 'Erken üretim TSI motorlarda zincir gergisi konusu sorulmalı.'
      },
      {
        code: 'AD1',
        years: '2016-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea211-14tsi', 'vag-ea888-gen3'],
        transmissionIds: ['dq381', 'dq250'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // AUDI
  // ==========================================================================
  {
    brand: 'Audi',
    model: 'A3',
    segment: 'premium',
    generations: [
      {
        code: '8P',
        years: '2003-2012',
        bodyTypes: ['Hatchback', 'Sportback'],
        engineIds: ['vag-pd-19tdi', 'vag-ea189-20tdi', 'vag-fsi', 'vag-18t-20v'],
        transmissionIds: ['dq250', 'manuel'],
        note: ''
      },
      {
        code: '8V',
        years: '2012-2020',
        facelift: '2016',
        bodyTypes: ['Sportback', 'Sedan'],
        engineIds: ['vag-ea288-16tdi', 'vag-ea288-20tdi', 'vag-ea211-14tsi', 'vag-ea888-gen3'],
        transmissionIds: ['dq200', 'dq381', 'manuel'],
        note: 'Türkiye\'de en çok işlem gören premium kompaktlardan. S tronic geçmişi kritik.'
      },
      {
        code: '8Y',
        years: '2020-2024',
        bodyTypes: ['Sportback', 'Sedan'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['dq381'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'A4',
    segment: 'premium',
    generations: [
      {
        code: 'B8',
        years: '2007-2015',
        facelift: '2011',
        bodyTypes: ['Sedan', 'Avant'],
        engineIds: ['vag-ea189-20tdi', 'vag-ea888-gen2'],
        transmissionIds: ['multitronic', 'dq250', 'manuel'],
        note: 'Multitronic (CVT) şanzımanlı versiyonlarda yağ bakım kaydı olmadan alım riski yüksektir.'
      },
      {
        code: 'B9',
        years: '2015-2023',
        bodyTypes: ['Sedan', 'Avant'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea888-gen3'],
        transmissionIds: ['dq381', 'manuel'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // BMW
  // ==========================================================================
  {
    brand: 'BMW',
    model: '3 Serisi',
    segment: 'premium',
    generations: [
      {
        code: 'E90/E91',
        years: '2005-2012',
        facelift: '2008',
        bodyTypes: ['Sedan', 'Touring'],
        engineIds: ['bmw-n47', 'bmw-n46-n43', 'bmw-n52', 'bmw-m57'],
        transmissionIds: ['zf6hp', 'manuel'],
        note:
          'N47 dizellerde triger zinciri motorun ARKASINDADIR; ses geç fark edilir, koparsa motor gider. 2007-2011 üretimlerde en sık bildirilen konudur.'
      },
      {
        code: 'F30/F31',
        years: '2012-2019',
        facelift: '2015',
        bodyTypes: ['Sedan', 'Touring'],
        engineIds: ['bmw-n47', 'bmw-b47', 'bmw-n20', 'bmw-b48', 'bmw-n13-b38'],
        transmissionIds: ['zf8hp', 'manuel'],
        note:
          '2015 makyajıyla N47 yerine B47, N20 yerine B48 geldi ve zincir sorunları büyük ölçüde giderildi. Üretim tarihi bu yüzden önemlidir.'
      },
      {
        code: 'G20',
        years: '2019-2024',
        bodyTypes: ['Sedan', 'Touring'],
        engineIds: ['bmw-b47', 'bmw-b48', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: 'Motor ve şanzıman tarafı olgun; maliyet kalemi daha çok elektronik ve donanımdır.'
      }
    ]
  },
  {
    brand: 'BMW',
    model: '5 Serisi',
    segment: 'premium',
    generations: [
      {
        code: 'F10',
        years: '2010-2017',
        facelift: '2013',
        bodyTypes: ['Sedan', 'Touring'],
        engineIds: ['bmw-n47', 'bmw-b47', 'bmw-n57', 'bmw-n20', 'bmw-n52'],
        transmissionIds: ['zf8hp', 'zf6hp'],
        note: 'Hava süspansiyonlu versiyonlarda körük maliyeti bütçeye eklenmelidir.'
      },
      {
        code: 'G30',
        years: '2017-2023',
        bodyTypes: ['Sedan', 'Touring'],
        engineIds: ['bmw-b47', 'bmw-b57', 'bmw-b48', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'BMW',
    model: '1 Serisi',
    segment: 'premium',
    generations: [
      {
        code: 'E87',
        years: '2004-2011',
        bodyTypes: ['Hatchback'],
        engineIds: ['bmw-n47', 'bmw-n46-n43'],
        transmissionIds: ['zf6hp', 'manuel'],
        note: 'N43 benzinlilerde bobin/buji ve NOx sensörü kalemleri sık gündeme gelir.'
      },
      {
        code: 'F20',
        years: '2011-2019',
        facelift: '2015',
        bodyTypes: ['Hatchback'],
        engineIds: ['bmw-n47', 'bmw-b47', 'bmw-n13-b38'],
        transmissionIds: ['zf8hp', 'manuel'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // MERCEDES-BENZ
  // ==========================================================================
  {
    brand: 'Mercedes-Benz',
    model: 'C Serisi',
    segment: 'premium',
    generations: [
      {
        code: 'W204',
        years: '2007-2014',
        facelift: '2011',
        bodyTypes: ['Sedan', 'Estate', 'Coupe'],
        engineIds: ['mb-om651', 'mb-om646', 'mb-m271', 'mb-m274'],
        transmissionIds: ['mb-7g-tronic', 'manuel'],
        note:
          'OM651 dizellerin erken üretimlerinde Delphi enjektör konusu yaygındır; enjektör geri dönüş testi alım öncesi yapılmalı.'
      },
      {
        code: 'W205',
        years: '2014-2021',
        facelift: '2018',
        bodyTypes: ['Sedan', 'Estate', 'Coupe'],
        engineIds: ['mb-om651', 'mb-om654', 'mb-m274', 'mb-m264'],
        transmissionIds: ['mb-9g-tronic', 'mb-7g-tronic'],
        note: '2018 makyajıyla OM654 dizel ve 9G şanzıman yaygınlaştı; bu kombinasyon belirgin biçimde dertsizdir.'
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E Serisi',
    segment: 'premium',
    generations: [
      {
        code: 'W212',
        years: '2009-2016',
        facelift: '2013',
        bodyTypes: ['Sedan', 'Estate'],
        engineIds: ['mb-om651', 'mb-om642', 'mb-m271'],
        transmissionIds: ['mb-7g-tronic'],
        note: 'OM642 V6 dizelde yağ soğutucusu conta kaçağı klasik ve işçiliği ağır bir kalemdir.'
      },
      {
        code: 'W213',
        years: '2016-2023',
        bodyTypes: ['Sedan', 'Estate'],
        engineIds: ['mb-om654', 'mb-om656', 'mb-m264', 'mb-m274'],
        transmissionIds: ['mb-9g-tronic'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'A Serisi',
    segment: 'premium',
    generations: [
      {
        code: 'W176',
        years: '2012-2018',
        facelift: '2015',
        bodyTypes: ['Hatchback'],
        engineIds: ['mb-m270-m260', 'mb-om607'],
        transmissionIds: ['mb-7g-dct', 'manuel'],
        note: 'A180 CDI motoru Renault K9K tabanlıdır; parça Mercedes fiyatından gelir.'
      },
      {
        code: 'W177',
        years: '2018-2024',
        bodyTypes: ['Hatchback', 'Sedan'],
        engineIds: ['mb-m282', 'mb-om654'],
        transmissionIds: ['mb-7g-dct'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // RENAULT / DACIA
  // ==========================================================================
  {
    brand: 'Renault',
    model: 'Megane',
    segment: 'kompakt',
    generations: [
      {
        code: 'Megane 3',
        years: '2008-2016',
        facelift: '2014',
        bodyTypes: ['Hatchback', 'Sedan', 'Station Wagon'],
        engineIds: ['renault-k9k', 'renault-k4j-k7m', 'renault-m9r'],
        transmissionIds: ['renault-edc', 'al4-dp0', 'manuel'],
        note: 'Türkiye\'de çok yaygın; parça ve usta her yerde bulunur, bakım maliyeti düşüktür.'
      },
      {
        code: 'Megane 4',
        years: '2016-2023',
        bodyTypes: ['Hatchback', 'Sedan'],
        engineIds: ['renault-k9k', 'renault-h5h-13tce', 'renault-h4d-b4d'],
        transmissionIds: ['renault-edc', 'manuel'],
        note: 'EDC çift kavramalı versiyonlarda düşük hız sarsıntısı için test sürüşü şart.'
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Clio',
    segment: 'mini',
    generations: [
      {
        code: 'Clio 4',
        years: '2012-2019',
        bodyTypes: ['Hatchback', 'Sport Tourer'],
        engineIds: ['renault-k9k', 'renault-tce-h5f'],
        transmissionIds: ['renault-edc', 'manuel'],
        note: ''
      },
      {
        code: 'Clio 5',
        years: '2019-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['renault-h4d-b4d', 'renault-k9k', 'renault-etech'],
        transmissionIds: ['renault-edc', 'manuel'],
        note: 'E-Tech hibrit versiyonunda kavrama yoktur; şanzıman tarafı dertsizdir.'
      }
    ]
  },
  {
    brand: 'Dacia',
    model: 'Duster',
    segment: 'suv',
    generations: [
      {
        code: 'Duster 1',
        years: '2010-2017',
        bodyTypes: ['SUV'],
        engineIds: ['renault-k9k', 'renault-k4j-k7m'],
        transmissionIds: ['manuel'],
        note: 'Sade mekanik, düşük bakım maliyeti; ikinci elde değer kaybı azdır.'
      },
      {
        code: 'Duster 2',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['renault-k9k', 'renault-h5h-13tce'],
        transmissionIds: ['renault-edc', 'manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Dacia',
    model: 'Sandero',
    segment: 'mini',
    generations: [
      {
        code: 'Sandero 2',
        years: '2012-2020',
        bodyTypes: ['Hatchback'],
        engineIds: ['renault-k9k', 'renault-tce-h5f', 'renault-d4f-d7f'],
        transmissionIds: ['manuel'],
        note: ''
      },
      {
        code: 'Sandero 3',
        years: '2020-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['renault-h4d-b4d'],
        transmissionIds: ['renault-edc', 'manuel'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // FORD
  // ==========================================================================
  {
    brand: 'Ford',
    model: 'Focus',
    segment: 'kompakt',
    generations: [
      {
        code: 'Focus 3',
        years: '2011-2018',
        facelift: '2014',
        bodyTypes: ['Hatchback', 'Sedan', 'Station Wagon'],
        engineIds: ['ford-tdci-15-16', 'ford-ecoboost-10', 'ford-tivct-16'],
        transmissionIds: ['powershift-dps6', 'manuel'],
        note:
          'Bu nesildeki kuru Powershift (DPS6) şanzıman en çok şikayet alan kalemdir; otomatik versiyonda şanzıman geçmişi sorulmadan alınmamalı.'
      },
      {
        code: 'Focus 4',
        years: '2018-2024',
        bodyTypes: ['Hatchback', 'Station Wagon'],
        engineIds: ['ford-ecoblue-15', 'ford-ecoboost-10'],
        transmissionIds: ['aisin-8at', 'manuel'],
        note: 'Powershift yerine tork konvertörlü otomatiğe geçildi; şanzıman riski belirgin biçimde azaldı.'
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'Fiesta',
    segment: 'mini',
    generations: [
      {
        code: 'Fiesta 6',
        years: '2008-2017',
        bodyTypes: ['Hatchback'],
        engineIds: ['ford-tdci-15-16', 'ford-tivct-16', 'ford-ecoboost-10'],
        transmissionIds: ['powershift-dps6', 'manuel'],
        note: 'Otomatik versiyonlarda DPS6 şanzıman konusu geçerlidir.'
      }
    ]
  },

  // ==========================================================================
  // FIAT / TOFAŞ
  // ==========================================================================
  {
    brand: 'Fiat',
    model: 'Egea',
    segment: 'kompakt',
    generations: [
      {
        code: 'Egea',
        years: '2015-2024',
        facelift: '2020',
        bodyTypes: ['Sedan', 'Hatchback', 'Station Wagon'],
        engineIds: ['fiat-multijet-13', 'fiat-multijet-16', 'tofas-16-fire', 'fiat-firefly-hybrid'],
        transmissionIds: ['fiat-dualogic', 'aisin-6at', 'manuel'],
        note:
          'Türkiye\'nin en çok satan modellerinden; parça ve usta her yerde. Dualogic (robotize) şanzıman tam otomatik değildir, test sürüşü yapılmadan alınmamalı.'
      }
    ]
  },

  // ==========================================================================
  // TOYOTA
  // ==========================================================================
  {
    brand: 'Toyota',
    model: 'Corolla',
    segment: 'kompakt',
    generations: [
      {
        code: 'E170',
        years: '2013-2018',
        bodyTypes: ['Sedan'],
        engineIds: ['toyota-zr-valvematic', 'toyota-1ww-16d4d'],
        transmissionIds: ['toyota-multidrive', 'manuel'],
        note: '1.6 D-4D dizel BMW N47 tabanlıdır ve aynı zincir konusunu paylaşır; benzinli versiyonlar çok daha dertsizdir.'
      },
      {
        code: 'E210',
        years: '2018-2024',
        bodyTypes: ['Sedan', 'Hatchback', 'Touring Sports'],
        engineIds: ['toyota-2zr-fxe', 'toyota-zr-valvematic'],
        transmissionIds: ['toyota-cvt', 'manuel'],
        note: 'Hibrit versiyon e-CVT kullanır; kavrama olmadığı için aktarma tarafı neredeyse dertsizdir.'
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Corolla Hybrid',
    segment: 'kompakt',
    generations: [
      {
        code: 'E210 Hybrid',
        years: '2019-2024',
        bodyTypes: ['Sedan', 'Hatchback'],
        engineIds: ['toyota-2zr-fxe'],
        transmissionIds: ['toyota-cvt'],
        note: 'Alım öncesi hibrit batarya sağlık durumu (SOH) okutulmalıdır.'
      }
    ]
  },

  // ==========================================================================
  // HYUNDAI / KIA
  // ==========================================================================
  {
    brand: 'Hyundai',
    model: 'i20',
    segment: 'mini',
    generations: [
      {
        code: 'GB',
        years: '2014-2020',
        bodyTypes: ['Hatchback'],
        engineIds: ['hyundai-kappa', 'hyundai-d4fc', 'hyundai-gamma'],
        transmissionIds: ['hyundai-6at', 'hyundai-6dct', 'manuel'],
        note: 'Türkiye üretimi; parça ve servis çok yaygındır.'
      },
      {
        code: 'BC3',
        years: '2020-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['hyundai-smartstream-15', 'hyundai-kappa'],
        transmissionIds: ['hyundai-6at', 'hyundai-6dct', 'manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Hyundai',
    model: 'Tucson',
    segment: 'suv',
    generations: [
      {
        code: 'TL',
        years: '2015-2020',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-r-crdi', 'hyundai-gamma'],
        transmissionIds: ['hyundai-6at', 'kia-7dct'],
        note: ''
      },
      {
        code: 'NX4',
        years: '2020-2024',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-smartstream-15', 'hyundai-hybrid-16'],
        transmissionIds: ['hyundai-6at', 'hyundai-6dct'],
        note: ''
      }
    ]
  },
  {
    brand: 'Kia',
    model: 'Sportage',
    segment: 'suv',
    generations: [
      {
        code: 'QL',
        years: '2015-2021',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-r-crdi', 'hyundai-gamma'],
        transmissionIds: ['hyundai-6at', 'kia-7dct'],
        note: 'Hyundai Tucson ile aynı teknik altyapıyı paylaşır.'
      }
    ]
  },

  // ==========================================================================
  // OPEL / PEUGEOT
  // ==========================================================================
  {
    brand: 'Opel',
    model: 'Astra',
    segment: 'kompakt',
    generations: [
      {
        code: 'Astra J',
        years: '2009-2015',
        bodyTypes: ['Hatchback', 'Sedan', 'Sports Tourer'],
        engineIds: ['opel-cdti-17', 'opel-cdti-20', 'opel-turbo-14', 'opel-twinport'],
        transmissionIds: ['aisin-6at', 'manuel'],
        note: '1.4 Turbo benzinlide zincir ve turbo kalemleri yağ bakımına doğrudan bağlıdır.'
      },
      {
        code: 'Astra K',
        years: '2015-2021',
        bodyTypes: ['Hatchback', 'Sports Tourer'],
        engineIds: ['opel-cdti-16', 'opel-turbo-14'],
        transmissionIds: ['aisin-6at', 'manuel'],
        note: '1.6 CDTI ("sessiz dizel") önceki 1.7\'ye göre belirgin iyileşmedir.'
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: '308',
    segment: 'kompakt',
    generations: [
      {
        code: 'T9',
        years: '2013-2021',
        facelift: '2017',
        bodyTypes: ['Hatchback', 'SW'],
        engineIds: ['psa-bluehdi', 'psa-puretech'],
        transmissionIds: ['eat8', 'manuel'],
        note:
          'PureTech benzinlilerde yağ banyolu triger kayışı, bakım aksatıldığında dağılıp yağ kanallarını tıkayabilir; kayış değişim kaydı sorulmalı.'
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: '3008',
    segment: 'suv',
    generations: [
      {
        code: 'P84',
        years: '2016-2024',
        bodyTypes: ['SUV'],
        engineIds: ['psa-bluehdi', 'psa-puretech'],
        transmissionIds: ['eat8', 'manuel'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // SKODA / SEAT
  // ==========================================================================
  {
    brand: 'Skoda',
    model: 'Octavia',
    segment: 'kompakt',
    generations: [
      {
        code: 'Mk2 (1Z)',
        years: '2004-2013',
        bodyTypes: ['Liftback', 'Combi'],
        engineIds: ['vag-pd-19tdi', 'vag-ea189-16tdi', 'vag-fsi'],
        transmissionIds: ['dq200', 'dq250', 'manuel'],
        note: ''
      },
      {
        code: 'Mk3 (5E)',
        years: '2013-2020',
        facelift: '2017',
        bodyTypes: ['Liftback', 'Combi'],
        engineIds: ['vag-ea288-16tdi', 'vag-ea288-20tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['dq200', 'dq381', 'manuel'],
        note: 'Golf ile aynı platform, daha geniş bagaj ve genelde daha uygun fiyat.'
      }
    ]
  },
  {
    brand: 'Seat',
    model: 'Leon',
    segment: 'kompakt',
    generations: [
      {
        code: '5F',
        years: '2012-2020',
        facelift: '2016',
        bodyTypes: ['Hatchback', 'ST'],
        engineIds: ['vag-ea288-16tdi', 'vag-ea288-20tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['dq200', 'dq250', 'manuel'],
        note: 'Golf Mk7 ile aynı platform.'
      }
    ]
  },

  // ==========================================================================
  // HONDA
  // ==========================================================================
  {
    brand: 'Honda',
    model: 'Civic',
    segment: 'kompakt',
    generations: [
      {
        code: 'FB/FC Sedan',
        years: '2012-2021',
        bodyTypes: ['Sedan'],
        engineIds: ['honda-r18', 'honda-l-series'],
        transmissionIds: ['honda-cvt', 'manuel'],
        note:
          'Türkiye üretimi sedan versiyon çok yaygındır. CVT şanzımanda yalnızca Honda HCF-2 yağı kullanılmalıdır; yanlış yağ şanzımanı bitirir.'
      }
    ]
  },
  {
    brand: 'Honda',
    model: 'CR-V',
    segment: 'suv',
    generations: [
      {
        code: 'RM',
        years: '2012-2018',
        bodyTypes: ['SUV'],
        engineIds: ['honda-k-series', 'honda-n22'],
        transmissionIds: ['honda-cvt', 'aisin-6at'],
        note: 'i-DTEC dizelde kısa mesafe kullanımı yağ seyrelmesine yol açar; yağ seviyesi ARTIYORSA servis şart.'
      }
    ]
  },

  // ========================================================================
  // KAPSAM GENİŞLETME — motor/şanzıman aileleri katalogda zaten kayıtlı olan
  // yaygın Türkiye modelleri. Burada yeni arıza veya maliyet uydurulmaz;
  // yalnızca mevcut, bağımsız motor/şanzıman kayıtları doğru nesle bağlanır.
  // Paket ayrıntısı doğrulanmadıkça ayrıca eklenmez.
  // ========================================================================
  {
    brand: 'Renault',
    model: 'Fluence',
    segment: 'kompakt',
    generations: [
      {
        code: 'Fluence',
        years: '2009-2016',
        facelift: '2012',
        bodyTypes: ['Sedan'],
        engineIds: ['renault-k4m', 'renault-k9k', 'renault-r9m'],
        transmissionIds: ['renault-edc', 'manuel'],
        note: 'Motor ve şanzıman eşlemesi mevcut Renault aile kayıtlarına dayanır; ilan üzerindeki motor kodu doğrulanmalıdır.'
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Yaris',
    segment: 'mini',
    generations: [
      {
        code: 'XP130',
        years: '2011-2020',
        facelift: '2014',
        bodyTypes: ['Hatchback'],
        engineIds: ['toyota-1nr-1kr', 'toyota-1nd-tv'],
        transmissionIds: ['toyota-multidrive', 'manuel'],
        note: 'Şanzıman tipi ilandan/VIN üzerinden teyit edilmeden kesin kabul edilmez.'
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: '208',
    segment: 'mini',
    generations: [
      {
        code: 'A9',
        years: '2012-2019',
        facelift: '2015',
        bodyTypes: ['Hatchback'],
        engineIds: ['psa-dv6', 'psa-puretech'],
        transmissionIds: ['manuel'],
        note: 'Otomatikleştirilmiş ve tork konvertörlü farklı seçenekler olabildiğinden şanzıman bilgisi yalnızca ilandan tahmin edilmemelidir.'
      }
    ]
  },
  {
    brand: 'Opel',
    model: 'Corsa',
    segment: 'mini',
    generations: [
      {
        code: 'Corsa D',
        years: '2006-2014',
        facelift: '2010',
        bodyTypes: ['Hatchback'],
        engineIds: ['opel-twinport', 'opel-cdti-17'],
        transmissionIds: ['manuel'],
        note: 'Otomatik/robotize seçenek varsa şanzıman kodu ayrı doğrulanmalıdır.'
      },
      {
        code: 'Corsa E',
        years: '2014-2019',
        bodyTypes: ['Hatchback'],
        engineIds: ['opel-turbo-14', 'opel-cdti-16'],
        transmissionIds: ['manuel'],
        note: 'Motor ve şanzıman kimliği, ilan ticari adından değil servis/VIN kaydından teyit edilmelidir.'
      }
    ]
  }
]

/*
 * TEMEL KAPSAMA
 *
 * Bu modeller `vehicles.json` içindeki mevcut, kullanıcıya zaten sunulan
 * kayıtlarla aynıdır. Ayrıntılı nesil/motor/paket ilişkisi henüz editoryal
 * olarak doğrulanmadığı için boş bırakılır: sistem bunları "bilinmeyen"
 * sayar, tahmin üretmez. Böylece katalogdaki model seçeneği iki katına
 * çıkarken yanlış nesil, paket veya kronik sorun gösterilmez.
 */
const BASIC_COVERAGE_MODELS = [
  ['Audi', 'A1', 'mini'], ['Audi', 'A5', 'orta'], ['Audi', 'A6', 'üst'],
  ['Audi', 'Q2', 'suv'], ['Audi', 'Q3', 'suv'], ['Audi', 'Q5', 'suv'],
  ['Audi', 'Q7', 'suv'], ['Audi', 'TT', 'spor'],
  ['BMW', '2 Serisi', 'orta'], ['BMW', '4 Serisi', 'orta'], ['BMW', '7 Serisi', 'üst'],
  ['BMW', 'X1', 'suv'], ['BMW', 'X3', 'suv'], ['BMW', 'X4', 'suv'],
  ['BMW', 'X5', 'suv'], ['BMW', 'X6', 'suv'],
  ['Mercedes-Benz', 'B Serisi', 'mini'], ['Mercedes-Benz', 'CLA', 'orta'],
  ['Mercedes-Benz', 'GLA', 'suv'], ['Mercedes-Benz', 'GLC', 'suv'],
  ['Mercedes-Benz', 'GLE / ML', 'suv'], ['Mercedes-Benz', 'Vito', 'ticari'],
  ['Volkswagen', 'Arteon', 'orta'], ['Volkswagen', 'T-Roc', 'suv'],
  ['Toyota', 'Auris', 'kompakt'], ['Toyota', 'Avensis', 'orta'], ['Toyota', 'C-HR', 'suv'],
  ['Toyota', 'Camry', 'üst'], ['Toyota', 'RAV4', 'suv'],
  ['Renault', 'Captur', 'suv'], ['Renault', 'Kadjar', 'suv'], ['Renault', 'Kangoo', 'ticari'],
  ['Renault', 'Symbol', 'mini'], ['Renault', 'Talisman', 'orta'],
  ['Fiat', 'Doblo', 'ticari'], ['Fiat', 'Linea', 'kompakt'], ['Fiat', 'Panda', 'mini'], ['Fiat', 'Tipo', 'kompakt'],
  ['Ford', 'EcoSport', 'suv'], ['Ford', 'Kuga', 'suv'], ['Ford', 'Mondeo', 'orta']
].map(([brand, model, segment]) => ({
  brand,
  model,
  segment,
  coverage: 'temel',
  generations: []
}))

export const MODELS = [...CURATED_MODELS, ...BASIC_COVERAGE_MODELS]

// ============================================================================
// SORGU YARDIMCILARI
// ============================================================================

function normalize(text) {
  return String(text || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "2013-2020" → [2013, 2020]; açık uçlu ise bugüne kadar. */
function yearSpan(text) {
  const found = String(text || '').match(/\d{4}/g)
  if (!found) return null
  return [Number(found[0]), found.length > 1 ? Number(found[1]) : new Date().getFullYear()]
}

export function getModelInfo(brand, model) {
  const b = normalize(brand)
  const m = normalize(model)
  if (!b || !m) return null
  return (
    MODELS.find((entry) => normalize(entry.brand) === b && normalize(entry.model) === m) ||
    // Model adı tam yazılmamış olabilir ("3 Serisi" ↔ "3 serisi sedan")
    MODELS.find(
      (entry) =>
        normalize(entry.brand) === b &&
        (m.includes(normalize(entry.model)) || normalize(entry.model).includes(m))
    ) ||
    null
  )
}

/**
 * Model yılından nesli bulur.
 * Yıl bilinmiyorsa null döner — yanlış nesil göstermektense hiç göstermemek
 * doğrudur, çünkü nesil bilgisi doğrudan risk değerlendirmesine giriyor.
 */
export function getGeneration(brand, model, year) {
  const entry = getModelInfo(brand, model)
  if (!entry) return null

  const y = Number(year)
  if (!y) return { model: entry, generation: null, generations: entry.generations }

  const generation =
    entry.generations.find((g) => {
      const span = yearSpan(g.years)
      return span && y >= span[0] && y <= span[1]
    }) || null

  return { model: entry, generation, generations: entry.generations }
}

/** Bir neslin makyaj öncesi mi sonrası mı olduğunu söyler. */
export function faceliftStatus(generation, year) {
  if (!generation?.facelift || !year) return null
  const y = Number(year)
  const f = Number(generation.facelift)
  if (!y || !f) return null
  return y >= f
    ? { after: true, label: `Makyaj sonrası (${f}+)` }
    : { after: false, label: `Makyaj öncesi (${f} öncesi)` }
}

export function getModelCount() {
  return MODELS.length
}

export function getGenerationCount() {
  return MODELS.reduce((sum, m) => sum + m.generations.length, 0)
}
