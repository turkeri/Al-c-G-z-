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

  // ==========================================================================
  // NISSAN
  // ==========================================================================
  {
    brand: 'Nissan',
    model: 'Qashqai',
    segment: 'suv',
    generations: [
      {
        code: 'J11',
        years: '2014-2021',
        facelift: '2017',
        bodyTypes: ['SUV'],
        engineIds: ['renault-r9m', 'renault-m9r', 'renault-h5h-13tce'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: 'Nissan-Renault ittifakı sayesinde motor ailesi Renault kayıtlarıyla aynıdır; 2018 sonrası kendi 1.2 DIG-T motorunun yerini Renault kaynaklı 1.3 TCe aldı.'
      }
    ]
  },
  {
    brand: 'Nissan',
    model: 'X-Trail',
    segment: 'suv',
    generations: [
      {
        code: 'T32',
        years: '2014-2022',
        facelift: '2017',
        bodyTypes: ['SUV'],
        engineIds: ['renault-r9m', 'renault-m9r'],
        transmissionIds: ['manuel', 'jatco-cvt', 'aisin-6at'],
        note: '1.6 dCi Renault kaynaklı R9M motordur; 4x4 versiyonlarda farklı otomatik şanzıman kullanılabilir, VIN\'den teyit edilmeli.'
      }
    ]
  },
  {
    brand: 'Nissan',
    model: 'Micra',
    segment: 'mini',
    generations: [
      {
        code: 'K14',
        years: '2017-2022',
        bodyTypes: ['Hatchback'],
        engineIds: ['renault-h4d-b4d', 'renault-k9k'],
        transmissionIds: ['manuel'],
        note: 'Renault Clio 4/5 ile aynı CMF-B platformu ve motor ailesini paylaşır.'
      }
    ]
  },

  // ==========================================================================
  // VOLVO
  // ==========================================================================
  {
    brand: 'Volvo',
    model: 'XC60',
    segment: 'suv',
    generations: [
      {
        code: 'Gen1 facelift (Drive-E)',
        years: '2013-2017',
        bodyTypes: ['SUV'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80'],
        note: '2013 facelift ile eski 5 silindirli motorlar yerini Drive-E ailesine bıraktı; öncesi nesil için motor verisi kataloglanmadı.'
      },
      {
        code: 'Gen2',
        years: '2017-2023',
        bodyTypes: ['SUV'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80'],
        note: 'Türkiye\'de neredeyse tamamı otomatik (Geartronic) satılmıştır.'
      }
    ]
  },
  {
    brand: 'Volvo',
    model: 'S60',
    segment: 'sedan',
    generations: [
      {
        code: 'Gen2 facelift (Drive-E)',
        years: '2013-2018',
        bodyTypes: ['Sedan'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80'],
        note: 'V60 karavan kasası ile aynı motor/şanzıman ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Volvo',
    model: 'XC90',
    segment: 'premium',
    generations: [
      {
        code: 'Gen2',
        years: '2015-2024',
        bodyTypes: ['SUV'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80'],
        note: 'Tüm motorlar 2.0 litre 4 silindir turbo/turbo-kompresörlüdür; V8/6 silindir seçenek yoktur.'
      }
    ]
  },

  // ==========================================================================
  // MINI
  // ==========================================================================
  {
    brand: 'Mini',
    model: 'Cooper',
    segment: 'kompakt',
    generations: [
      {
        code: 'R56',
        years: '2006-2013',
        facelift: '2010',
        bodyTypes: ['Hatchback'],
        engineIds: ['psa-ep6', 'bmw-n13-b38', 'psa-dv6'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: '2010 öncesi Cooper/Cooper S motorları BMW-PSA ortak girişimi Prince ailesindendir (psa-ep6); Cooper D dizeli PSA kaynaklı DV6\'dır.'
      },
      {
        code: 'F56',
        years: '2014-2021',
        facelift: '2018',
        bodyTypes: ['Hatchback'],
        engineIds: ['bmw-n13-b38', 'bmw-b48', 'bmw-b47'],
        transmissionIds: ['manuel', 'zf8hp'],
        note: 'F56 ile birlikte tüm motorlar BMW\'nin kendi üç/dört silindirli ailesine (B-serisi) geçti.'
      }
    ]
  },
  {
    brand: 'Mini',
    model: 'Countryman',
    segment: 'suv',
    generations: [
      {
        code: 'F60',
        years: '2017-2023',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-b48', 'bmw-b47'],
        transmissionIds: ['manuel', 'zf8hp'],
        note: 'ALL4 (4x4) versiyonlarında şanzıman kodu farklı olabilir; ilan/VIN üzerinden doğrulanmalı.'
      }
    ]
  },

  // ==========================================================================
  // JEEP
  // ==========================================================================
  {
    brand: 'Jeep',
    model: 'Renegade',
    segment: 'suv',
    generations: [
      {
        code: 'BU',
        years: '2014-2024',
        facelift: '2018',
        bodyTypes: ['SUV'],
        engineIds: ['fiat-multijet-16', 'fiat-firefly-hybrid'],
        transmissionIds: ['manuel', 'zf9hp'],
        note: 'Fiat 500X ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Jeep',
    model: 'Compass',
    segment: 'suv',
    generations: [
      {
        code: 'MP',
        years: '2017-2024',
        facelift: '2021',
        bodyTypes: ['SUV'],
        engineIds: ['fiat-multijet-16', 'fiat-firefly-hybrid'],
        transmissionIds: ['manuel', 'zf9hp'],
        note: '4xe hibrit versiyonlarda ayrı bir güç aktarma organı vardır; bu kayıt yalnızca klasik içten yanmalı motorları kapsar.'
      }
    ]
  },

  // ==========================================================================
  // CITROËN
  // ==========================================================================
  {
    brand: 'Citroën',
    model: 'C4',
    segment: 'kompakt',
    generations: [
      {
        code: 'B7',
        years: '2010-2018',
        bodyTypes: ['Hatchback'],
        engineIds: ['psa-dv6', 'psa-puretech', 'psa-ep6'],
        transmissionIds: ['manuel', 'al4-dp0'],
        note: 'Peugeot 308 ile aynı PSA platformu ve motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Citroën',
    model: 'C3',
    segment: 'mini',
    generations: [
      {
        code: 'Gen3',
        years: '2017-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // MAZDA
  // ==========================================================================
  {
    brand: 'Mazda',
    model: 'Mazda3',
    segment: 'kompakt',
    generations: [
      {
        code: 'BM/BN',
        years: '2013-2019',
        facelift: '2016',
        bodyTypes: ['Hatchback', 'Sedan'],
        engineIds: ['mazda-skyactiv-g', 'mazda-skyactiv-d'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      },
      {
        code: 'BP',
        years: '2019-2024',
        bodyTypes: ['Hatchback', 'Sedan'],
        engineIds: ['mazda-skyactiv-g', 'mazda-skyactiv-d'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mazda',
    model: 'CX-5',
    segment: 'suv',
    generations: [
      {
        code: 'KE',
        years: '2012-2017',
        bodyTypes: ['SUV'],
        engineIds: ['mazda-skyactiv-g', 'mazda-skyactiv-d'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      },
      {
        code: 'KF',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['mazda-skyactiv-g', 'mazda-skyactiv-d'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // SUZUKI
  // ==========================================================================
  {
    brand: 'Suzuki',
    model: 'Vitara',
    segment: 'suv',
    generations: [
      {
        code: 'LY',
        years: '2015-2024',
        facelift: '2018',
        bodyTypes: ['SUV'],
        engineIds: ['suzuki-k-petrol', 'suzuki-ddis'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Suzuki',
    model: 'Swift',
    segment: 'mini',
    generations: [
      {
        code: 'AZ',
        years: '2017-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['suzuki-k-petrol'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // MITSUBISHI
  // ==========================================================================
  {
    brand: 'Mitsubishi',
    model: 'ASX',
    segment: 'suv',
    generations: [
      {
        code: 'GA',
        years: '2010-2023',
        facelift: '2016',
        bodyTypes: ['SUV'],
        engineIds: ['mitsubishi-did-16', 'mitsubishi-mivec'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: 'Uzun üretim ömrü boyunca birkaç kez hafif yüz güncellemesi aldı; motor ailesi büyük ölçüde sabit kaldı.'
      }
    ]
  },
  {
    brand: 'Mitsubishi',
    model: 'Outlander',
    segment: 'suv',
    generations: [
      {
        code: 'GF',
        years: '2012-2021',
        facelift: '2015',
        bodyTypes: ['SUV'],
        engineIds: ['mitsubishi-did-16', 'mitsubishi-mivec'],
        transmissionIds: ['manuel', 'jatco-cvt', 'aisin-6at'],
        note: 'PHEV (plug-in hibrit) versiyon ayrı bir güç aktarma organına sahiptir; bu kayıt klasik motorları kapsar.'
      }
    ]
  },

  // ==========================================================================
  // ALFA ROMEO
  // ==========================================================================
  {
    brand: 'Alfa Romeo',
    model: 'Giulietta',
    segment: 'kompakt',
    generations: [
      {
        code: '940',
        years: '2010-2020',
        facelift: '2016',
        bodyTypes: ['Hatchback'],
        engineIds: ['fiat-multijet-16', 'fiat-tjet-14'],
        transmissionIds: ['manuel'],
        note: 'TCT çift kavramalı otomatik seçeneği de sunulmuştur; bu şanzıman katalogda ayrıca kayıtlı değildir, ilan üzerinden teyit edilmelidir.'
      }
    ]
  },

  // ==========================================================================
  // LAND ROVER / JAGUAR
  // ==========================================================================
  {
    brand: 'Land Rover',
    model: 'Discovery Sport',
    segment: 'premium',
    generations: [
      {
        code: 'L550',
        years: '2015-2024',
        facelift: '2019',
        bodyTypes: ['SUV'],
        engineIds: ['jlr-ingenium-20d'],
        transmissionIds: ['zf9hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'Land Rover',
    model: 'Range Rover Evoque',
    segment: 'premium',
    generations: [
      {
        code: 'L538',
        years: '2011-2018',
        bodyTypes: ['SUV'],
        engineIds: [],
        transmissionIds: [],
        note: 'Bu nesil Ingenium öncesi (Ford kaynaklı) motorlar kullanır; motor verisi henüz kataloglanmadı.'
      },
      {
        code: 'L551',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['jlr-ingenium-20d'],
        transmissionIds: ['zf9hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'Jaguar',
    model: 'XE',
    segment: 'premium',
    generations: [
      {
        code: 'X760',
        years: '2015-2024',
        facelift: '2019',
        bodyTypes: ['Sedan'],
        engineIds: ['jlr-ingenium-20d'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'Jaguar',
    model: 'XF',
    segment: 'premium',
    generations: [
      {
        code: 'X260',
        years: '2015-2024',
        bodyTypes: ['Sedan'],
        engineIds: ['jlr-ingenium-20d'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // SUBARU
  // ==========================================================================
  {
    brand: 'Subaru',
    model: 'Forester',
    segment: 'suv',
    generations: [
      {
        code: 'SJ',
        years: '2013-2018',
        bodyTypes: ['SUV'],
        engineIds: ['subaru-fb'],
        transmissionIds: ['manuel'],
        note: 'Otomatik versiyonlar Subaru\'ya özgü Lineartronic CVT kullanır; bu şanzıman katalogda ayrıca kayıtlı değildir.'
      }
    ]
  },
  {
    brand: 'Subaru',
    model: 'XV',
    segment: 'suv',
    generations: [
      {
        code: 'GP',
        years: '2012-2017',
        bodyTypes: ['SUV'],
        engineIds: ['subaru-fb'],
        transmissionIds: ['manuel'],
        note: 'Otomatik versiyonlar Subaru\'ya özgü Lineartronic CVT kullanır; bu şanzıman katalogda ayrıca kayıtlı değildir.'
      }
    ]
  },

  // ==========================================================================
  // CHEVROLET
  // ==========================================================================
  {
    brand: 'Chevrolet',
    model: 'Cruze',
    segment: 'kompakt',
    generations: [
      {
        code: 'J300',
        years: '2009-2016',
        bodyTypes: ['Sedan', 'Hatchback'],
        engineIds: ['gm-vcdi-20', 'gm-ecotec'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'Opel Astra J ile aynı GM platformunu ve büyük ölçüde aynı motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Chevrolet',
    model: 'Captiva',
    segment: 'suv',
    generations: [
      {
        code: 'C100/C140',
        years: '2006-2016',
        bodyTypes: ['SUV'],
        engineIds: ['gm-vcdi-20'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'Opel Antara ile aynı platform ve motoru paylaşır.'
      }
    ]
  },

  // ==========================================================================
  // SSANGYONG
  // ==========================================================================
  {
    brand: 'SsangYong',
    model: 'Korando',
    segment: 'suv',
    generations: [
      {
        code: 'C300',
        years: '2010-2019',
        facelift: '2013',
        bodyTypes: ['SUV'],
        engineIds: ['ssangyong-xdi'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // TOFAŞ
  // ==========================================================================
  {
    brand: 'Tofaş',
    model: 'Şahin',
    segment: 'sedan',
    generations: [
      {
        code: 'Klasik',
        years: '1986-1998',
        bodyTypes: ['Sedan'],
        engineIds: [],
        transmissionIds: ['manuel'],
        note: 'Fiat 131 tabanlı 1.6 SOHC motor; karbüratörlü ve sonradan enjeksiyonlu versiyonları vardır. Motor kodu bu katalogda ayrıca tutulmaz. Gövde paslanmaya yatkındır; alt kaporta ve savaş mahalli mutlaka kontrol edilmeli.'
      }
    ]
  },
  {
    brand: 'Tofaş',
    model: 'Doğan',
    segment: 'sedan',
    generations: [
      {
        code: 'Klasik',
        years: '1987-1999',
        bodyTypes: ['Sedan'],
        engineIds: [],
        transmissionIds: ['manuel'],
        note: 'Şahin ile aynı platform ve motor ailesini paylaşır; kaporta paslanması ve karbüratör bakımı en yaygın gündem maddeleridir.'
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
  ['Ford', 'EcoSport', 'suv'], ['Ford', 'Kuga', 'suv'], ['Ford', 'Mondeo', 'orta'],
  ['Skoda', 'Fabia', 'mini'], ['Skoda', 'Superb', 'üst'], ['Skoda', 'Kodiaq', 'suv'], ['Skoda', 'Karoq', 'suv'],
  ['Seat', 'Ibiza', 'mini'], ['Seat', 'Ateca', 'suv'],
  ['Kia', 'Ceed', 'kompakt'], ['Kia', 'Picanto', 'mini'], ['Kia', 'Sorento', 'suv'], ['Kia', 'Stonic', 'suv'],
  ['Opel', 'Insignia', 'orta'], ['Opel', 'Mokka', 'suv'], ['Opel', 'Grandland', 'suv'],
  ['Dacia', 'Jogger', 'suv'], ['Dacia', 'Spring', 'mini'],
  ['Honda', 'Jazz', 'mini'], ['Honda', 'HR-V', 'suv'], ['Honda', 'Accord', 'orta'],
  ['Hyundai', 'Elantra', 'sedan'], ['Hyundai', 'Bayon', 'suv'], ['Hyundai', 'Santa Fe', 'suv'],
  ['Peugeot', '508', 'orta'], ['Peugeot', '2008', 'suv'], ['Peugeot', 'Partner', 'ticari']
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
