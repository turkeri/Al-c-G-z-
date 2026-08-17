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
  },

  // ==========================================================================
  // AUDI — ek modeller
  // ==========================================================================
  {
    brand: 'Audi',
    model: 'A1',
    segment: 'mini',
    generations: [
      {
        code: '8X',
        years: '2010-2018',
        facelift: '2014',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea211-10tsi', 'vag-ea189-16tdi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      },
      {
        code: 'GB',
        years: '2018-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea211-10tsi', 'vag-ea288-16tdi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'A5',
    segment: 'orta',
    generations: [
      {
        code: '8T',
        years: '2007-2016',
        facelift: '2011',
        bodyTypes: ['Coupe', 'Sportback'],
        engineIds: ['vag-ea189-20tdi', 'vag-ea888-gen2', 'vag-18t-20v'],
        transmissionIds: ['dq250', 'tiptronic-09g', 'manuel'],
        note: ''
      },
      {
        code: 'F5',
        years: '2016-2024',
        bodyTypes: ['Coupe', 'Sportback'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea888-gen3'],
        transmissionIds: ['dq381', 'tiptronic-09g'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'A6',
    segment: 'üst',
    generations: [
      {
        code: 'C7',
        years: '2011-2018',
        facelift: '2014',
        bodyTypes: ['Sedan', 'Avant'],
        engineIds: ['vag-ea189-20tdi', 'vag-30tdi-v6', 'vag-ea888-gen2'],
        transmissionIds: ['tiptronic-09g', 'multitronic'],
        note: 'V6 dizel (3.0 TDI) versiyonlarda zincir gerdirici ve enjektör bakımı bütçeye eklenmelidir.'
      },
      {
        code: 'C8',
        years: '2018-2024',
        bodyTypes: ['Sedan', 'Avant'],
        engineIds: ['vag-ea288-20tdi', 'vag-30tdi-v6', 'vag-ea888-gen3'],
        transmissionIds: ['tiptronic-09g', 'dq381'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'Q2',
    segment: 'suv',
    generations: [
      {
        code: 'GA',
        years: '2016-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-14tsi', 'vag-ea288-16tdi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'Q3',
    segment: 'suv',
    generations: [
      {
        code: '8U',
        years: '2011-2018',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea189-20tdi', 'vag-ea888-gen2'],
        transmissionIds: ['dq250', 'manuel'],
        note: ''
      },
      {
        code: 'F3',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea888-gen3'],
        transmissionIds: ['dq381', 'manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'Q5',
    segment: 'suv',
    generations: [
      {
        code: '8R',
        years: '2008-2017',
        facelift: '2012',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea189-20tdi', 'vag-30tdi-v6', 'vag-ea888-gen2'],
        transmissionIds: ['tiptronic-09g'],
        note: ''
      },
      {
        code: 'FY',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea288-20tdi', 'vag-30tdi-v6', 'vag-ea888-gen3'],
        transmissionIds: ['tiptronic-09g'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'Q7',
    segment: 'suv',
    generations: [
      {
        code: '4L',
        years: '2005-2015',
        bodyTypes: ['SUV'],
        engineIds: ['vag-30tdi-v6'],
        transmissionIds: ['tiptronic-09g'],
        note: 'Hava süspansiyon körükleri ve zincir gerdiricisi büyük bakım kalemleridir.'
      },
      {
        code: '4M',
        years: '2015-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-30tdi-v6'],
        transmissionIds: ['tiptronic-09g'],
        note: ''
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'TT',
    segment: 'spor',
    generations: [
      {
        code: '8J',
        years: '2006-2014',
        bodyTypes: ['Coupe', 'Roadster'],
        engineIds: ['vag-18t-20v', 'vag-ea888-gen2'],
        transmissionIds: ['dq250', 'manuel'],
        note: ''
      },
      {
        code: '8S',
        years: '2014-2023',
        bodyTypes: ['Coupe', 'Roadster'],
        engineIds: ['vag-ea888-gen3'],
        transmissionIds: ['dq381', 'manuel'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // BMW — ek modeller
  // ==========================================================================
  {
    brand: 'BMW',
    model: '2 Serisi',
    segment: 'orta',
    generations: [
      {
        code: 'F22/F23 Coupe',
        years: '2014-2021',
        bodyTypes: ['Coupe', 'Cabrio'],
        engineIds: ['bmw-b47', 'bmw-b48', 'bmw-n20'],
        transmissionIds: ['zf8hp', 'manuel'],
        note: 'Arkadan itişli klasik BMW platformudur.'
      },
      {
        code: 'F45/F46 Active Tourer/Gran Tourer',
        years: '2014-2021',
        bodyTypes: ['MPV'],
        engineIds: ['bmw-n13-b38', 'bmw-b47'],
        transmissionIds: ['manuel', 'aisin-8at'],
        note: 'Öndeon çekişli, Mini ile aynı platform ve motor ailesini paylaşır; otomatik şanzıman ZF değil Aisin kaynaklıdır.'
      }
    ]
  },
  {
    brand: 'BMW',
    model: '4 Serisi',
    segment: 'orta',
    generations: [
      {
        code: 'F32/F36',
        years: '2013-2020',
        bodyTypes: ['Coupe', 'Gran Coupe', 'Cabrio'],
        engineIds: ['bmw-n20', 'bmw-b47', 'bmw-b48', 'bmw-b58'],
        transmissionIds: ['zf8hp', 'manuel'],
        note: ''
      },
      {
        code: 'G22/G26',
        years: '2020-2024',
        bodyTypes: ['Coupe', 'Gran Coupe'],
        engineIds: ['bmw-b47', 'bmw-b48', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'BMW',
    model: '7 Serisi',
    segment: 'üst',
    generations: [
      {
        code: 'F01',
        years: '2008-2015',
        bodyTypes: ['Sedan'],
        engineIds: ['bmw-n57', 'bmw-n63'],
        transmissionIds: ['zf6hp', 'zf8hp'],
        note: 'Hava süspansiyon ve çok sayıda elektronik donanım kalemi bakım maliyetini artırır.'
      },
      {
        code: 'G11',
        years: '2015-2022',
        bodyTypes: ['Sedan'],
        engineIds: ['bmw-b57', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'BMW',
    model: 'X1',
    segment: 'suv',
    generations: [
      {
        code: 'E84',
        years: '2009-2015',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-n47', 'bmw-n20'],
        transmissionIds: ['zf6hp', 'manuel'],
        note: 'Arkadan itişli/xDrive tabanlı ilk nesildir.'
      },
      {
        code: 'F48',
        years: '2015-2022',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-b47', 'bmw-b48', 'bmw-n13-b38'],
        transmissionIds: ['manuel', 'aisin-8at'],
        note: 'Öndeon çekişli, Mini tabanlı platforma geçti; otomatik şanzıman Aisin kaynaklıdır, ZF8HP değildir.'
      }
    ]
  },
  {
    brand: 'BMW',
    model: 'X3',
    segment: 'suv',
    generations: [
      {
        code: 'F25',
        years: '2010-2017',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-n47', 'bmw-b47', 'bmw-n20', 'bmw-b48'],
        transmissionIds: ['zf8hp', 'manuel'],
        note: ''
      },
      {
        code: 'G01',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-b47', 'bmw-b48', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'BMW',
    model: 'X4',
    segment: 'suv',
    generations: [
      {
        code: 'F26',
        years: '2014-2018',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-n47', 'bmw-b47', 'bmw-b48'],
        transmissionIds: ['zf8hp'],
        note: 'X3 ile aynı platform ve motor ailesini paylaşır, kupe tavanlı gövdedir.'
      },
      {
        code: 'G02',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-b47', 'bmw-b48', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'BMW',
    model: 'X5',
    segment: 'suv',
    generations: [
      {
        code: 'F15',
        years: '2013-2018',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-n57', 'bmw-n63', 'bmw-b57'],
        transmissionIds: ['zf8hp'],
        note: 'Hava süspansiyon körükleri önemli bir bütçe kalemidir.'
      },
      {
        code: 'G05',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-b57', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'BMW',
    model: 'X6',
    segment: 'suv',
    generations: [
      {
        code: 'F16',
        years: '2014-2019',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-n57', 'bmw-b57', 'bmw-n63'],
        transmissionIds: ['zf8hp'],
        note: 'X5 ile aynı platform ve motor ailesini paylaşır, kupe tavanlı gövdedir.'
      },
      {
        code: 'G06',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-b57', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // MERCEDES-BENZ — ek modeller
  // ==========================================================================
  {
    brand: 'Mercedes-Benz',
    model: 'B Serisi',
    segment: 'mini',
    generations: [
      {
        code: 'W246',
        years: '2011-2018',
        bodyTypes: ['MPV'],
        engineIds: ['mb-m270-m260', 'mb-om607'],
        transmissionIds: ['mb-7g-dct', 'manuel'],
        note: ''
      },
      {
        code: 'W247',
        years: '2018-2024',
        bodyTypes: ['MPV'],
        engineIds: ['mb-m282'],
        transmissionIds: ['mb-7g-dct'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'CLA',
    segment: 'orta',
    generations: [
      {
        code: 'C117',
        years: '2013-2019',
        bodyTypes: ['Sedan', 'Shooting Brake'],
        engineIds: ['mb-m270-m260', 'mb-om607'],
        transmissionIds: ['mb-7g-dct'],
        note: ''
      },
      {
        code: 'C118',
        years: '2019-2024',
        bodyTypes: ['Sedan', 'Shooting Brake'],
        engineIds: ['mb-m282'],
        transmissionIds: ['mb-7g-dct'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'GLA',
    segment: 'suv',
    generations: [
      {
        code: 'X156',
        years: '2013-2020',
        bodyTypes: ['SUV'],
        engineIds: ['mb-m270-m260', 'mb-om607'],
        transmissionIds: ['mb-7g-dct'],
        note: ''
      },
      {
        code: 'H247',
        years: '2020-2024',
        bodyTypes: ['SUV'],
        engineIds: ['mb-m282'],
        transmissionIds: ['mb-7g-dct'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'GLC',
    segment: 'suv',
    generations: [
      {
        code: 'X253',
        years: '2015-2022',
        facelift: '2019',
        bodyTypes: ['SUV'],
        engineIds: ['mb-om651', 'mb-om654', 'mb-m274', 'mb-m264'],
        transmissionIds: ['mb-9g-tronic'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'GLE / ML',
    segment: 'suv',
    generations: [
      {
        code: 'W166 (ML/GLE)',
        years: '2011-2019',
        bodyTypes: ['SUV'],
        engineIds: ['mb-om642'],
        transmissionIds: ['mb-7g-tronic'],
        note: 'ML ismi 2015\'te GLE olarak değiştirildi; aynı gövde/motor ailesidir.'
      },
      {
        code: 'W167 (GLE)',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['mb-om656'],
        transmissionIds: ['mb-9g-tronic'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'Vito',
    segment: 'ticari',
    generations: [
      {
        code: 'W447',
        years: '2014-2024',
        bodyTypes: ['Panelvan', 'Minibüs'],
        engineIds: ['mb-om651', 'mb-om646'],
        transmissionIds: ['manuel', 'mb-7g-tronic'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },

  // ==========================================================================
  // VOLKSWAGEN — ek modeller
  // ==========================================================================
  {
    brand: 'Volkswagen',
    model: 'Arteon',
    segment: 'orta',
    generations: [
      {
        code: 'Arteon',
        years: '2017-2024',
        bodyTypes: ['Liftback'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea888-gen3'],
        transmissionIds: ['dq381'],
        note: 'Passat ile aynı MQB platformunu paylaşır, üst donanım konumundadır.'
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'T-Roc',
    segment: 'suv',
    generations: [
      {
        code: 'T-Roc',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-10tsi', 'vag-ea211-14tsi', 'vag-ea288-16tdi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // TOYOTA — ek modeller
  // ==========================================================================
  {
    brand: 'Toyota',
    model: 'Auris',
    segment: 'kompakt',
    generations: [
      {
        code: 'E150',
        years: '2007-2012',
        bodyTypes: ['Hatchback'],
        engineIds: ['toyota-1nd-tv', 'toyota-1nz-fe', 'toyota-zr-valvematic'],
        transmissionIds: ['manuel', 'toyota-multidrive'],
        note: ''
      },
      {
        code: 'E180',
        years: '2012-2018',
        bodyTypes: ['Hatchback', 'Touring Sports'],
        engineIds: ['toyota-1nd-tv', 'toyota-1ww-16d4d', 'toyota-2zr-fxe'],
        transmissionIds: ['manuel', 'toyota-cvt'],
        note: 'Hibrit versiyon Toyota\'nın CVT tipi otomatiğini kullanır.'
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Avensis',
    segment: 'orta',
    generations: [
      {
        code: 'T27',
        years: '2009-2015',
        facelift: '2012',
        bodyTypes: ['Sedan', 'Wagon'],
        engineIds: ['toyota-ad-d4d', 'toyota-zr-valvematic'],
        transmissionIds: ['manuel', 'toyota-multidrive'],
        note: ''
      },
      {
        code: 'T27 facelift',
        years: '2015-2018',
        bodyTypes: ['Sedan', 'Wagon'],
        engineIds: ['toyota-1ww-16d4d', 'toyota-zr-valvematic'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'C-HR',
    segment: 'suv',
    generations: [
      {
        code: 'Gen1',
        years: '2016-2023',
        facelift: '2019',
        bodyTypes: ['SUV'],
        engineIds: ['toyota-2zr-fxe'],
        transmissionIds: ['toyota-cvt', 'manuel'],
        note: 'Türkiye\'de büyük çoğunluğu hibrittir; hibrit olmayan turbo benzinli versiyon bu katalogda ayrıca kayıtlı değildir.'
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Camry',
    segment: 'üst',
    generations: [
      {
        code: 'XV70',
        years: '2018-2024',
        bodyTypes: ['Sedan'],
        engineIds: ['toyota-25-hybrid'],
        transmissionIds: ['toyota-cvt'],
        note: 'Türkiye\'de yalnızca hibrit motorla satılmıştır.'
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'RAV4',
    segment: 'suv',
    generations: [
      {
        code: 'XA40',
        years: '2013-2018',
        bodyTypes: ['SUV'],
        engineIds: ['toyota-ad-d4d'],
        transmissionIds: ['manuel'],
        note: ''
      },
      {
        code: 'XA50',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['toyota-25-hybrid'],
        transmissionIds: ['toyota-cvt'],
        note: 'Bu nesilden itibaren Türkiye\'de ağırlıklı olarak hibrit satılmıştır.'
      }
    ]
  },

  // ==========================================================================
  // RENAULT — ek modeller
  // ==========================================================================
  {
    brand: 'Renault',
    model: 'Captur',
    segment: 'suv',
    generations: [
      {
        code: 'Gen1',
        years: '2013-2019',
        bodyTypes: ['SUV'],
        engineIds: ['renault-h4d-b4d', 'renault-tce-h5f', 'renault-k9k'],
        transmissionIds: ['manuel', 'renault-edc'],
        note: ''
      },
      {
        code: 'Gen2',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['renault-h5h-13tce', 'renault-etech'],
        transmissionIds: ['manuel', 'renault-edc'],
        note: ''
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Kadjar',
    segment: 'suv',
    generations: [
      {
        code: 'Kadjar',
        years: '2015-2022',
        facelift: '2018',
        bodyTypes: ['SUV'],
        engineIds: ['renault-h5h-13tce', 'renault-r9m'],
        transmissionIds: ['manuel', 'renault-edc'],
        note: 'Nissan Qashqai ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Kangoo',
    segment: 'ticari',
    generations: [
      {
        code: 'Gen2',
        years: '2008-2021',
        bodyTypes: ['Panelvan'],
        engineIds: ['renault-k9k', 'renault-k4m'],
        transmissionIds: ['manuel'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      },
      {
        code: 'Gen3',
        years: '2021-2024',
        bodyTypes: ['Panelvan'],
        engineIds: ['renault-r9m', 'renault-h4d-b4d'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Symbol',
    segment: 'mini',
    generations: [
      {
        code: 'Symbol',
        years: '2008-2021',
        facelift: '2013',
        bodyTypes: ['Sedan'],
        engineIds: ['renault-k4j-k7m', 'renault-d4f-d7f', 'renault-k9k'],
        transmissionIds: ['manuel'],
        note: 'Clio tabanlı, Türkiye ve benzeri pazarlara özel sedan gövdedir.'
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Talisman',
    segment: 'orta',
    generations: [
      {
        code: 'Talisman',
        years: '2016-2022',
        bodyTypes: ['Sedan', 'Grandtour'],
        engineIds: ['renault-r9m', 'renault-tce-h5f'],
        transmissionIds: ['manuel', 'renault-edc'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // FIAT — ek modeller
  // ==========================================================================
  {
    brand: 'Fiat',
    model: 'Doblo',
    segment: 'ticari',
    generations: [
      {
        code: 'Gen2',
        years: '2010-2022',
        facelift: '2015',
        bodyTypes: ['Panelvan'],
        engineIds: ['fiat-multijet-13', 'fiat-multijet-16', 'fiat-fire'],
        transmissionIds: ['manuel', 'fiat-dualogic'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },
  {
    brand: 'Fiat',
    model: 'Linea',
    segment: 'kompakt',
    generations: [
      {
        code: 'Linea',
        years: '2007-2018',
        facelift: '2012',
        bodyTypes: ['Sedan'],
        engineIds: ['fiat-fire', 'tofas-16-fire', 'fiat-tjet-14', 'fiat-multijet-13'],
        transmissionIds: ['manuel', 'fiat-dualogic'],
        note: ''
      }
    ]
  },
  {
    brand: 'Fiat',
    model: 'Panda',
    segment: 'mini',
    generations: [
      {
        code: '169/312',
        years: '2012-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['fiat-fire'],
        transmissionIds: ['manuel', 'fiat-dualogic'],
        note: ''
      }
    ]
  },
  {
    brand: 'Fiat',
    model: 'Tipo',
    segment: 'kompakt',
    generations: [
      {
        code: 'Tipo',
        years: '2016-2024',
        bodyTypes: ['Sedan', 'Hatchback', 'Station Wagon'],
        engineIds: ['fiat-fire', 'fiat-multijet-16', 'fiat-firefly-hybrid', 'fiat-tjet-14'],
        transmissionIds: ['manuel', 'fiat-dualogic'],
        note: 'Fiat Egea\'nın ihracat pazarlarındaki adıdır; aynı fabrika, motor ve şanzıman ailesini paylaşır.'
      }
    ]
  },

  // ==========================================================================
  // FORD — ek modeller
  // ==========================================================================
  {
    brand: 'Ford',
    model: 'EcoSport',
    segment: 'suv',
    generations: [
      {
        code: 'EcoSport',
        years: '2014-2022',
        facelift: '2017',
        bodyTypes: ['SUV'],
        engineIds: ['ford-ecoboost-10', 'ford-tdci-15-16', 'ford-ecoblue-15'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'Kuga',
    segment: 'suv',
    generations: [
      {
        code: 'Gen2',
        years: '2013-2019',
        bodyTypes: ['SUV'],
        engineIds: ['ford-tdci-20', 'ford-ecoboost-10'],
        transmissionIds: ['manuel', 'powershift-mps6'],
        note: ''
      },
      {
        code: 'Gen3',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['ford-ecoblue-15', 'ford-ecoboost-10'],
        transmissionIds: ['manuel', 'powershift-mps6'],
        note: ''
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'Mondeo',
    segment: 'orta',
    generations: [
      {
        code: 'Mk4',
        years: '2007-2014',
        facelift: '2010',
        bodyTypes: ['Sedan', 'Wagon'],
        engineIds: ['ford-tdci-18', 'ford-tdci-20'],
        transmissionIds: ['manuel', 'powershift-mps6'],
        note: ''
      },
      {
        code: 'Mk5',
        years: '2014-2022',
        bodyTypes: ['Sedan', 'Wagon', 'Liftback'],
        engineIds: ['ford-tdci-20', 'ford-ecoboost-10'],
        transmissionIds: ['manuel', 'powershift-mps6'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // SKODA — ek modeller
  // ==========================================================================
  {
    brand: 'Skoda',
    model: 'Fabia',
    segment: 'mini',
    generations: [
      {
        code: 'Gen2',
        years: '2007-2014',
        bodyTypes: ['Hatchback', 'Combi'],
        engineIds: ['vag-pd-19tdi', 'vag-ea211-10tsi'],
        transmissionIds: ['manuel'],
        note: ''
      },
      {
        code: 'Gen3',
        years: '2014-2021',
        bodyTypes: ['Hatchback', 'Combi'],
        engineIds: ['vag-14tdi-3cyl', 'vag-ea211-10tsi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },
  {
    brand: 'Skoda',
    model: 'Superb',
    segment: 'üst',
    generations: [
      {
        code: 'Gen2',
        years: '2008-2015',
        bodyTypes: ['Liftback', 'Combi'],
        engineIds: ['vag-ea189-20tdi', 'vag-ea888-gen2'],
        transmissionIds: ['dq250', 'tiptronic-09g', 'manuel'],
        note: ''
      },
      {
        code: 'Gen3',
        years: '2015-2023',
        bodyTypes: ['Liftback', 'Combi'],
        engineIds: ['vag-ea288-20tdi', 'vag-ea888-gen3'],
        transmissionIds: ['dq381', 'tiptronic-09g', 'manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Skoda',
    model: 'Kodiaq',
    segment: 'suv',
    generations: [
      {
        code: 'Kodiaq',
        years: '2016-2024',
        facelift: '2021',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-14tsi', 'vag-ea288-20tdi'],
        transmissionIds: ['manuel', 'dq381'],
        note: '4x4 versiyonlarda şanzıman/çekiş kombinasyonu ilan üzerinden teyit edilmelidir.'
      }
    ]
  },
  {
    brand: 'Skoda',
    model: 'Karoq',
    segment: 'suv',
    generations: [
      {
        code: 'Karoq',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-14tsi', 'vag-ea288-16tdi', 'vag-ea288-20tdi'],
        transmissionIds: ['manuel', 'dq200', 'dq381'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // SEAT — ek modeller
  // ==========================================================================
  {
    brand: 'Seat',
    model: 'Ibiza',
    segment: 'mini',
    generations: [
      {
        code: '6J',
        years: '2008-2017',
        facelift: '2012',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-pd-19tdi', 'vag-ea211-10tsi'],
        transmissionIds: ['manuel'],
        note: ''
      },
      {
        code: 'KJ',
        years: '2017-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-14tdi-3cyl', 'vag-ea211-10tsi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },
  {
    brand: 'Seat',
    model: 'Ateca',
    segment: 'suv',
    generations: [
      {
        code: 'Ateca',
        years: '2016-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-14tsi', 'vag-ea288-16tdi', 'vag-ea288-20tdi'],
        transmissionIds: ['manuel', 'dq200', 'dq381'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // KIA — ek modeller
  // ==========================================================================
  {
    brand: 'Kia',
    model: 'Ceed',
    segment: 'kompakt',
    generations: [
      {
        code: 'JD',
        years: '2012-2018',
        facelift: '2015',
        bodyTypes: ['Hatchback', 'Station Wagon'],
        engineIds: ['hyundai-d4fb', 'hyundai-gamma'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      },
      {
        code: 'CD',
        years: '2018-2024',
        bodyTypes: ['Hatchback', 'Station Wagon'],
        engineIds: ['hyundai-d4fc', 'hyundai-smartstream-15', 'hyundai-hybrid-16'],
        transmissionIds: ['manuel', 'kia-7dct'],
        note: ''
      }
    ]
  },
  {
    brand: 'Kia',
    model: 'Picanto',
    segment: 'mini',
    generations: [
      {
        code: 'TA',
        years: '2011-2017',
        facelift: '2015',
        bodyTypes: ['Hatchback'],
        engineIds: ['hyundai-kappa'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      },
      {
        code: 'JA',
        years: '2017-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['hyundai-kappa'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Kia',
    model: 'Sorento',
    segment: 'suv',
    generations: [
      {
        code: 'UM',
        years: '2014-2020',
        facelift: '2017',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-r-crdi', 'hyundai-theta2'],
        transmissionIds: ['hyundai-6at'],
        note: ''
      },
      {
        code: 'MQ4',
        years: '2020-2024',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-r-crdi'],
        transmissionIds: ['kia-7dct'],
        note: ''
      }
    ]
  },
  {
    brand: 'Kia',
    model: 'Stonic',
    segment: 'suv',
    generations: [
      {
        code: 'Stonic',
        years: '2017-2024',
        facelift: '2020',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-kappa', 'hyundai-smartstream-15'],
        transmissionIds: ['manuel', 'hyundai-6dct'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // OPEL — ek modeller
  // ==========================================================================
  {
    brand: 'Opel',
    model: 'Insignia',
    segment: 'orta',
    generations: [
      {
        code: 'A',
        years: '2008-2017',
        facelift: '2013',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['opel-cdti-20', 'opel-turbo-14'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      },
      {
        code: 'B',
        years: '2017-2024',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['opel-cdti-20', 'psa-bluehdi', 'psa-puretech'],
        transmissionIds: ['manuel', 'aisin-6at', 'eat8'],
        note: 'B nesli GM tabanlı geliştirildi; PSA\'nın Opel\'i devralmasından sonraki üretimlerde PSA kaynaklı motorlar da görülür, motor kodu ilan/servis kaydından teyit edilmelidir.'
      }
    ]
  },
  {
    brand: 'Opel',
    model: 'Mokka',
    segment: 'suv',
    generations: [
      {
        code: 'A',
        years: '2012-2019',
        facelift: '2016',
        bodyTypes: ['SUV'],
        engineIds: ['opel-cdti-16', 'opel-turbo-14'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'GM dönemi üretimidir.'
      },
      {
        code: 'B',
        years: '2020-2024',
        bodyTypes: ['SUV'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: 'PSA dönemi üretimidir; Peugeot 2008 ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Opel',
    model: 'Grandland',
    segment: 'suv',
    generations: [
      {
        code: 'Grandland (X)',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: 'PSA döneminde geliştirildi; Peugeot 3008 ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },

  // ==========================================================================
  // DACIA — ek modeller
  // ==========================================================================
  {
    brand: 'Dacia',
    model: 'Jogger',
    segment: 'suv',
    generations: [
      {
        code: 'Jogger',
        years: '2022-2024',
        bodyTypes: ['Station Wagon'],
        engineIds: ['renault-h4d-b4d', 'renault-etech'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: 'LPG (ECO-G) versiyonu da satılmıştır; yakıt tipi ilandan doğrulanmalıdır.'
      }
    ]
  },
  {
    brand: 'Dacia',
    model: 'Spring',
    segment: 'mini',
    generations: [
      {
        code: 'Spring',
        years: '2021-2024',
        bodyTypes: ['Hatchback'],
        engineIds: [],
        transmissionIds: [],
        note: 'Tamamen elektrikli bir modeldir; katalogdaki motor/şanzıman veritabanı içten yanmalı araçlar için kurulduğundan burada ayrı bir elektrikli motor/redüktör kaydı henüz yoktur. Alım öncesi batarya sağlığı (SOH) mutlaka sorulmalıdır.'
      }
    ]
  },

  // ==========================================================================
  // HONDA — ek modeller
  // ==========================================================================
  {
    brand: 'Honda',
    model: 'Jazz',
    segment: 'mini',
    generations: [
      {
        code: 'GK5',
        years: '2015-2020',
        bodyTypes: ['Hatchback'],
        engineIds: ['honda-l-series'],
        transmissionIds: ['manuel', 'honda-cvt'],
        note: ''
      },
      {
        code: 'GR (e:HEV)',
        years: '2020-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['honda-ehev'],
        transmissionIds: ['honda-cvt'],
        note: 'Bu nesilden itibaren Türkiye\'de yalnızca hibrit (e:HEV) satılmıştır.'
      }
    ]
  },
  {
    brand: 'Honda',
    model: 'HR-V',
    segment: 'suv',
    generations: [
      {
        code: 'Gen2',
        years: '2015-2021',
        bodyTypes: ['SUV'],
        engineIds: ['honda-15-vtec-turbo', 'honda-16-idtec'],
        transmissionIds: ['manuel', 'honda-cvt'],
        note: ''
      },
      {
        code: 'Gen3 (e:HEV)',
        years: '2021-2024',
        bodyTypes: ['SUV'],
        engineIds: ['honda-ehev'],
        transmissionIds: ['honda-cvt'],
        note: ''
      }
    ]
  },
  {
    brand: 'Honda',
    model: 'Accord',
    segment: 'orta',
    generations: [
      {
        code: 'CU',
        years: '2008-2015',
        bodyTypes: ['Sedan'],
        engineIds: ['honda-k-series', 'honda-n22'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      },
      {
        code: 'CR (Hibrit)',
        years: '2018-2022',
        bodyTypes: ['Sedan'],
        engineIds: ['honda-15-vtec-turbo'],
        transmissionIds: ['honda-cvt'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // HYUNDAI — ek modeller
  // ==========================================================================
  {
    brand: 'Hyundai',
    model: 'Elantra',
    segment: 'sedan',
    generations: [
      {
        code: 'MD',
        years: '2010-2015',
        bodyTypes: ['Sedan'],
        engineIds: ['hyundai-d4fb', 'hyundai-gamma'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      },
      {
        code: 'AD',
        years: '2016-2020',
        bodyTypes: ['Sedan'],
        engineIds: ['hyundai-d4fb', 'hyundai-gamma'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Hyundai',
    model: 'Bayon',
    segment: 'suv',
    generations: [
      {
        code: 'Bayon',
        years: '2021-2024',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-kappa', 'hyundai-smartstream-15'],
        transmissionIds: ['manuel', 'hyundai-6dct'],
        note: 'i20 ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Hyundai',
    model: 'Santa Fe',
    segment: 'suv',
    generations: [
      {
        code: 'DM',
        years: '2012-2018',
        facelift: '2016',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-r-crdi', 'hyundai-theta2'],
        transmissionIds: ['hyundai-6at'],
        note: ''
      },
      {
        code: 'TM',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-r-crdi'],
        transmissionIds: ['hyundai-6at', 'kia-7dct'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // PEUGEOT — ek modeller
  // ==========================================================================
  {
    brand: 'Peugeot',
    model: '508',
    segment: 'orta',
    generations: [
      {
        code: 'Gen1',
        years: '2010-2018',
        facelift: '2014',
        bodyTypes: ['Sedan', 'SW'],
        engineIds: ['psa-dw10', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'al4-dp0'],
        note: ''
      },
      {
        code: 'Gen2',
        years: '2018-2024',
        bodyTypes: ['Liftback', 'SW'],
        engineIds: ['psa-bluehdi', 'psa-puretech'],
        transmissionIds: ['manuel', 'eat8'],
        note: ''
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: '2008',
    segment: 'suv',
    generations: [
      {
        code: 'Gen1',
        years: '2013-2019',
        bodyTypes: ['SUV'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'al4-dp0'],
        note: '208 ile aynı platform ve motor ailesini paylaşır.'
      },
      {
        code: 'Gen2',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: ''
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: 'Partner',
    segment: 'ticari',
    generations: [
      {
        code: 'Gen2',
        years: '2008-2018',
        bodyTypes: ['Panelvan'],
        engineIds: ['psa-bluehdi'],
        transmissionIds: ['manuel'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      },
      {
        code: 'Gen3',
        years: '2018-2024',
        bodyTypes: ['Panelvan'],
        engineIds: ['psa-bluehdi', 'psa-puretech'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },

  // ==========================================================================
  // 3. TUR GENİŞLETME — kullanıcı geri bildirimi: "her markaya benzer sayıda
  // model ekle, veri setini ~2 katına çıkar". Bu blok markaların model
  // sayısını, mevcut motor/şanzıman havuzu üzerinden gerçek nesillerle
  // genişletir.
  // ==========================================================================

  // ---- ALFA ROMEO ----
  {
    brand: 'Alfa Romeo',
    model: 'Giulia',
    segment: 'sedan',
    generations: [
      {
        code: '952',
        years: '2016-2024',
        bodyTypes: ['Sedan'],
        engineIds: ['alfa-jtdm-22', 'fiat-tjet-14'],
        transmissionIds: ['zf8hp', 'manuel'],
        note: 'Arkadan itişli, RWD tabanlı platformdur; ZF kaynaklı 8 ileri otomatik yaygındır.'
      }
    ]
  },
  {
    brand: 'Alfa Romeo',
    model: 'Stelvio',
    segment: 'suv',
    generations: [
      {
        code: 'Stelvio',
        years: '2016-2024',
        bodyTypes: ['SUV'],
        engineIds: ['alfa-jtdm-22', 'fiat-tjet-14'],
        transmissionIds: ['zf8hp'],
        note: 'Giulia ile aynı RWD/AWD platformu ve motor ailesini paylaşır.'
      }
    ]
  },

  // ---- SSANGYONG ----
  {
    brand: 'SsangYong',
    model: 'Tivoli',
    segment: 'suv',
    generations: [
      {
        code: 'Tivoli',
        years: '2015-2024',
        facelift: '2019',
        bodyTypes: ['SUV'],
        engineIds: ['ssangyong-gdi-16', 'ssangyong-xdi'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'SsangYong',
    model: 'Rexton',
    segment: 'suv',
    generations: [
      {
        code: 'Y400',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['ssangyong-xdi'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },

  // ---- MINI ----
  {
    brand: 'Mini',
    model: 'Clubman',
    segment: 'kompakt',
    generations: [
      {
        code: 'F54',
        years: '2015-2024',
        bodyTypes: ['Station Wagon'],
        engineIds: ['bmw-b47', 'bmw-b48'],
        transmissionIds: ['manuel', 'zf8hp'],
        note: 'Countryman ile aynı platformu paylaşır, uzatılmış gövdelidir.'
      }
    ]
  },
  {
    brand: 'Mini',
    model: 'Cabrio',
    segment: 'kompakt',
    generations: [
      {
        code: 'F57',
        years: '2015-2024',
        bodyTypes: ['Cabrio'],
        engineIds: ['bmw-n13-b38', 'bmw-b48'],
        transmissionIds: ['manuel', 'aisin-8at'],
        note: ''
      }
    ]
  },

  // ---- JEEP ----
  {
    brand: 'Jeep',
    model: 'Grand Cherokee',
    segment: 'suv',
    generations: [
      {
        code: 'WK2',
        years: '2011-2021',
        facelift: '2017',
        bodyTypes: ['SUV'],
        engineIds: ['jeep-pentastar-36', 'mb-om642'],
        transmissionIds: ['zf8hp'],
        note: 'Türkiye\'ye gelen dizel versiyon Mercedes kaynaklı 3.0 CRD (OM642) kullanır.'
      }
    ]
  },
  {
    brand: 'Jeep',
    model: 'Wrangler',
    segment: 'suv',
    generations: [
      {
        code: 'JK',
        years: '2007-2018',
        bodyTypes: ['SUV'],
        engineIds: ['jeep-crd-28', 'jeep-pentastar-36'],
        transmissionIds: ['manuel', 'zf8hp'],
        note: 'Arazi aracı karakteri nedeniyle km başına aşınma şehir kullanımından farklı yorumlanmalıdır.'
      },
      {
        code: 'JL',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['jeep-pentastar-36'],
        transmissionIds: ['manuel', 'zf8hp'],
        note: ''
      }
    ]
  },

  // ---- CITROËN ----
  {
    brand: 'Citroën',
    model: 'C3 Aircross',
    segment: 'suv',
    generations: [
      {
        code: 'C3 Aircross',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: ''
      }
    ]
  },
  {
    brand: 'Citroën',
    model: 'Berlingo',
    segment: 'ticari',
    generations: [
      {
        code: 'Gen2/3',
        years: '2008-2024',
        bodyTypes: ['Panelvan'],
        engineIds: ['psa-bluehdi', 'psa-puretech'],
        transmissionIds: ['manuel'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },

  // ---- MAZDA ----
  {
    brand: 'Mazda',
    model: 'Mazda6',
    segment: 'orta',
    generations: [
      {
        code: 'GJ',
        years: '2012-2024',
        facelift: '2018',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['mazda-skyactiv-g', 'mazda-skyactiv-d'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mazda',
    model: 'CX-3',
    segment: 'suv',
    generations: [
      {
        code: 'CX-3',
        years: '2015-2021',
        bodyTypes: ['SUV'],
        engineIds: ['mazda-skyactiv-g'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },

  // ---- SUZUKI ----
  {
    brand: 'Suzuki',
    model: 'S-Cross',
    segment: 'suv',
    generations: [
      {
        code: 'S-Cross',
        years: '2013-2024',
        facelift: '2016',
        bodyTypes: ['SUV'],
        engineIds: ['suzuki-k-petrol', 'suzuki-ddis'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Suzuki',
    model: 'Jimny',
    segment: 'suv',
    generations: [
      {
        code: 'Gen4',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['suzuki-k-petrol'],
        transmissionIds: ['manuel'],
        note: 'Merdiven şasili gerçek arazi aracıdır; km başına aşınma şehir kullanımından farklı yorumlanmalıdır.'
      }
    ]
  },

  // ---- MITSUBISHI ----
  {
    brand: 'Mitsubishi',
    model: 'Lancer',
    segment: 'sedan',
    generations: [
      {
        code: 'X',
        years: '2007-2017',
        bodyTypes: ['Sedan'],
        engineIds: ['mitsubishi-mivec', 'mitsubishi-did-16'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mitsubishi',
    model: 'Space Star',
    segment: 'mini',
    generations: [
      {
        code: 'Space Star',
        years: '2013-2024',
        facelift: '2019',
        bodyTypes: ['Hatchback'],
        engineIds: ['mitsubishi-mivec'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: ''
      }
    ]
  },

  // ---- LAND ROVER ----
  {
    brand: 'Land Rover',
    model: 'Range Rover Sport',
    segment: 'premium',
    generations: [
      {
        code: 'L494',
        years: '2013-2022',
        bodyTypes: ['SUV'],
        engineIds: ['jlr-td6-v6', 'jlr-ingenium-p300'],
        transmissionIds: ['zf8hp'],
        note: 'Hava süspansiyon körükleri önemli bir bakım kalemidir.'
      }
    ]
  },
  {
    brand: 'Land Rover',
    model: 'Defender',
    segment: 'premium',
    generations: [
      {
        code: 'L663',
        years: '2020-2024',
        bodyTypes: ['SUV'],
        engineIds: ['jlr-ingenium-20d', 'jlr-td6-v6', 'jlr-ingenium-p300'],
        transmissionIds: ['zf8hp'],
        note: 'Klasik Defender (1990-2016) tamamen farklı bir platform/motor ailesidir ve bu kayıtta yer almaz.'
      }
    ]
  },

  // ---- JAGUAR ----
  {
    brand: 'Jaguar',
    model: 'F-Pace',
    segment: 'premium',
    generations: [
      {
        code: 'X761',
        years: '2016-2024',
        bodyTypes: ['SUV'],
        engineIds: ['jlr-ingenium-20d', 'jlr-td6-v6', 'jlr-ingenium-p300'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },
  {
    brand: 'Jaguar',
    model: 'E-Pace',
    segment: 'suv',
    generations: [
      {
        code: 'X540',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['jlr-ingenium-20d'],
        transmissionIds: ['zf9hp'],
        note: 'Land Rover Discovery Sport ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },

  // ---- SUBARU ----
  {
    brand: 'Subaru',
    model: 'Outback',
    segment: 'suv',
    generations: [
      {
        code: 'Gen5/6',
        years: '2014-2024',
        bodyTypes: ['Station Wagon'],
        engineIds: ['subaru-fb'],
        transmissionIds: ['manuel'],
        note: 'Otomatik versiyonlar Subaru\'ya özgü Lineartronic CVT kullanır; bu şanzıman katalogda ayrıca kayıtlı değildir.'
      }
    ]
  },
  {
    brand: 'Subaru',
    model: 'Legacy',
    segment: 'sedan',
    generations: [
      {
        code: 'Gen6',
        years: '2014-2019',
        bodyTypes: ['Sedan'],
        engineIds: ['subaru-fb'],
        transmissionIds: ['manuel'],
        note: 'Outback ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },

  // ---- CHEVROLET ----
  {
    brand: 'Chevrolet',
    model: 'Spark',
    segment: 'mini',
    generations: [
      {
        code: 'Gen3/4',
        years: '2010-2022',
        bodyTypes: ['Hatchback'],
        engineIds: ['gm-spark-10'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Chevrolet',
    model: 'Trax',
    segment: 'suv',
    generations: [
      {
        code: 'Gen1',
        years: '2013-2020',
        bodyTypes: ['SUV'],
        engineIds: ['gm-ecotec', 'gm-vcdi-20'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'Opel Mokka (A) ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },

  // ---- TOFAŞ ----
  {
    brand: 'Tofaş',
    model: 'Kartal',
    segment: 'sedan',
    generations: [
      {
        code: 'Klasik',
        years: '1994-2000',
        bodyTypes: ['Hatchback'],
        engineIds: [],
        transmissionIds: ['manuel'],
        note: 'Şahin/Doğan ile aynı Fiat 131 tabanlı motor ailesini paylaşır; ayrı motor kaydı tutulmaz. Kaporta paslanması en yaygın gündem maddesidir.'
      }
    ]
  },
  {
    brand: 'Tofaş',
    model: 'Serçe',
    segment: 'mini',
    generations: [
      {
        code: 'Klasik',
        years: '1986-1999',
        bodyTypes: ['Hatchback'],
        engineIds: [],
        transmissionIds: ['manuel'],
        note: 'Fiat 147 tabanlı, dönemin en küçük ve ekonomik Tofaş modelidir; ayrı motor kaydı tutulmaz.'
      }
    ]
  },

  // ---- SEAT ----
  {
    brand: 'Seat',
    model: 'Arona',
    segment: 'suv',
    generations: [
      {
        code: 'Arona',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-10tsi', 'vag-ea211-14tsi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },
  {
    brand: 'Seat',
    model: 'Tarraco',
    segment: 'suv',
    generations: [
      {
        code: 'Tarraco',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-14tsi', 'vag-ea288-20tdi'],
        transmissionIds: ['manuel', 'dq381'],
        note: 'Skoda Kodiaq ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },

  // ---- NISSAN ----
  {
    brand: 'Nissan',
    model: 'Juke',
    segment: 'suv',
    generations: [
      {
        code: 'Gen1',
        years: '2010-2019',
        facelift: '2014',
        bodyTypes: ['SUV'],
        engineIds: ['renault-h4d-b4d', 'renault-k9k'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: ''
      }
    ]
  },
  {
    brand: 'Nissan',
    model: 'Note',
    segment: 'mini',
    generations: [
      {
        code: 'E12',
        years: '2013-2017',
        bodyTypes: ['Hatchback'],
        engineIds: ['renault-h4d-b4d', 'renault-k9k'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: ''
      }
    ]
  },

  // ---- VOLVO ----
  {
    brand: 'Volvo',
    model: 'V40',
    segment: 'kompakt',
    generations: [
      {
        code: 'V40',
        years: '2012-2019',
        facelift: '2016',
        bodyTypes: ['Hatchback'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80', 'manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Volvo',
    model: 'S90',
    segment: 'üst',
    generations: [
      {
        code: 'S90',
        years: '2016-2024',
        bodyTypes: ['Sedan'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80'],
        note: ''
      }
    ]
  },
  {
    brand: 'Volvo',
    model: 'XC40',
    segment: 'suv',
    generations: [
      {
        code: 'XC40',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80', 'manuel'],
        note: ''
      }
    ]
  },

  // ---- DACIA ----
  {
    brand: 'Dacia',
    model: 'Lodgy',
    segment: 'suv',
    generations: [
      {
        code: 'Lodgy',
        years: '2012-2022',
        bodyTypes: ['MPV'],
        engineIds: ['renault-k9k', 'renault-h4d-b4d'],
        transmissionIds: ['manuel'],
        note: '7 koltuklu, aile kullanımı için uygun bütçeli MPV.'
      }
    ]
  },
  {
    brand: 'Dacia',
    model: 'Dokker',
    segment: 'ticari',
    generations: [
      {
        code: 'Dokker',
        years: '2012-2021',
        bodyTypes: ['Panelvan', 'MPV'],
        engineIds: ['renault-k9k', 'renault-h4d-b4d'],
        transmissionIds: ['manuel'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },

  // ---- FORD ----
  {
    brand: 'Ford',
    model: 'Puma',
    segment: 'suv',
    generations: [
      {
        code: 'Puma',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['ford-ecoboost-10', 'ford-ecoblue-15'],
        transmissionIds: ['manuel', 'powershift-dps6'],
        note: ''
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'Transit Connect',
    segment: 'ticari',
    generations: [
      {
        code: 'Gen2',
        years: '2013-2024',
        bodyTypes: ['Panelvan'],
        engineIds: ['ford-tdci-15-16', 'ford-ecoblue-15'],
        transmissionIds: ['manuel'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'S-Max / Galaxy',
    segment: 'orta',
    generations: [
      {
        code: 'Gen2',
        years: '2015-2024',
        bodyTypes: ['MPV'],
        engineIds: ['ford-tdci-20'],
        transmissionIds: ['manuel', 'powershift-mps6'],
        note: 'Aynı platform, motor ve şanzıman ailesini paylaşan iki 7 koltuklu model.'
      }
    ]
  },

  // ---- FIAT ----
  {
    brand: 'Fiat',
    model: '500',
    segment: 'mini',
    generations: [
      {
        code: '500',
        years: '2007-2024',
        facelift: '2015',
        bodyTypes: ['Hatchback'],
        engineIds: ['fiat-fire'],
        transmissionIds: ['manuel', 'fiat-dualogic'],
        note: ''
      }
    ]
  },
  {
    brand: 'Fiat',
    model: 'Bravo',
    segment: 'kompakt',
    generations: [
      {
        code: 'Bravo',
        years: '2007-2014',
        bodyTypes: ['Hatchback'],
        engineIds: ['fiat-fire', 'fiat-multijet-13', 'fiat-tjet-14'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Fiat',
    model: 'Albea',
    segment: 'sedan',
    generations: [
      {
        code: 'Albea',
        years: '2002-2012',
        facelift: '2006',
        bodyTypes: ['Sedan'],
        engineIds: ['fiat-fire'],
        transmissionIds: ['manuel'],
        note: 'Türkiye\'de uzun yıllar taksi ve filo aracı olarak yaygın kullanılmıştır.'
      }
    ]
  },

  // ---- HYUNDAI ----
  {
    brand: 'Hyundai',
    model: 'Accent',
    segment: 'sedan',
    generations: [
      {
        code: 'RB',
        years: '2010-2019',
        bodyTypes: ['Sedan'],
        engineIds: ['hyundai-d4fc', 'hyundai-gamma'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Hyundai',
    model: 'i30',
    segment: 'kompakt',
    generations: [
      {
        code: 'GD',
        years: '2012-2017',
        bodyTypes: ['Hatchback', 'Station Wagon'],
        engineIds: ['hyundai-d4fb', 'hyundai-gamma'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      },
      {
        code: 'PD',
        years: '2017-2024',
        bodyTypes: ['Hatchback', 'Station Wagon'],
        engineIds: ['hyundai-d4fb', 'hyundai-smartstream-15'],
        transmissionIds: ['manuel', 'hyundai-6dct'],
        note: ''
      }
    ]
  },
  {
    brand: 'Hyundai',
    model: 'Kona',
    segment: 'suv',
    generations: [
      {
        code: 'Gen1',
        years: '2017-2023',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-smartstream-15', 'hyundai-kappa'],
        transmissionIds: ['manuel', 'hyundai-6dct'],
        note: ''
      }
    ]
  },

  // ---- KIA ----
  {
    brand: 'Kia',
    model: 'Soul',
    segment: 'suv',
    generations: [
      {
        code: 'PS',
        years: '2013-2019',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-gamma', 'hyundai-d4fb'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Kia',
    model: 'Optima',
    segment: 'üst',
    generations: [
      {
        code: 'JF',
        years: '2015-2020',
        bodyTypes: ['Sedan'],
        engineIds: ['hyundai-theta2', 'hyundai-r-crdi'],
        transmissionIds: ['hyundai-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Kia',
    model: 'Niro',
    segment: 'suv',
    generations: [
      {
        code: 'DE',
        years: '2016-2022',
        bodyTypes: ['SUV'],
        engineIds: ['hyundai-hybrid-16'],
        transmissionIds: ['kia-7dct'],
        note: ''
      }
    ]
  },

  // ---- OPEL ----
  {
    brand: 'Opel',
    model: 'Meriva',
    segment: 'mini',
    generations: [
      {
        code: 'B',
        years: '2010-2017',
        bodyTypes: ['MPV'],
        engineIds: ['opel-turbo-14', 'opel-cdti-16'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Opel',
    model: 'Zafira',
    segment: 'orta',
    generations: [
      {
        code: 'Tourer',
        years: '2011-2019',
        bodyTypes: ['MPV'],
        engineIds: ['opel-cdti-20', 'opel-turbo-14'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: '7 koltuklu, aile kullanımı için uygun bütçeli MPV.'
      }
    ]
  },
  {
    brand: 'Opel',
    model: 'Vectra',
    segment: 'sedan',
    generations: [
      {
        code: 'C',
        years: '2002-2008',
        facelift: '2005',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['opel-twinport'],
        transmissionIds: ['manuel'],
        note: 'Dizel versiyonlarda motor kodu bu katalogda ayrıca tutulmaz; ilan/servis kaydından teyit edilmelidir.'
      }
    ]
  },

  // ---- SKODA ----
  {
    brand: 'Skoda',
    model: 'Rapid',
    segment: 'kompakt',
    generations: [
      {
        code: 'Rapid',
        years: '2012-2019',
        bodyTypes: ['Sedan', 'Hatchback'],
        engineIds: ['vag-14tdi-3cyl', 'vag-ea211-10tsi'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Skoda',
    model: 'Yeti',
    segment: 'suv',
    generations: [
      {
        code: 'Yeti',
        years: '2009-2017',
        facelift: '2013',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea189-16tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },
  {
    brand: 'Skoda',
    model: 'Scala',
    segment: 'kompakt',
    generations: [
      {
        code: 'Scala',
        years: '2019-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea211-10tsi', 'vag-ea211-14tsi', 'vag-ea288-16tdi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },

  // ---- HONDA ----
  {
    brand: 'Honda',
    model: 'Honda e',
    segment: 'mini',
    generations: [
      {
        code: 'Honda e',
        years: '2020-2023',
        bodyTypes: ['Hatchback'],
        engineIds: [],
        transmissionIds: [],
        note: 'Tamamen elektrikli bir modeldir; katalogdaki motor/şanzıman veritabanı içten yanmalı araçlar için kurulduğundan burada ayrı bir elektrikli motor/redüktör kaydı henüz yoktur. Alım öncesi batarya sağlığı (SOH) mutlaka sorulmalıdır.'
      }
    ]
  },

  // ---- AUDI ----
  {
    brand: 'Audi',
    model: 'A8',
    segment: 'üst',
    generations: [
      {
        code: 'D4/D5',
        years: '2010-2024',
        bodyTypes: ['Sedan'],
        engineIds: ['vag-30tdi-v6', 'vag-ea888-gen3'],
        transmissionIds: ['tiptronic-09g'],
        note: 'Marka amiral gemisidir; hava süspansiyon ve çok sayıda elektronik donanım kalemi bakım maliyetini artırır.'
      }
    ]
  },
  {
    brand: 'Audi',
    model: 'Q8',
    segment: 'suv',
    generations: [
      {
        code: 'Q8',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-30tdi-v6', 'vag-ea888-gen3'],
        transmissionIds: ['tiptronic-09g'],
        note: 'Q7 ile aynı platform ve motor ailesini paylaşan kupe tavanlı gövdedir.'
      }
    ]
  },

  // ---- BMW ----
  {
    brand: 'BMW',
    model: 'X2',
    segment: 'suv',
    generations: [
      {
        code: 'F39',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['bmw-b47', 'bmw-b48', 'bmw-n13-b38'],
        transmissionIds: ['manuel', 'aisin-8at'],
        note: 'X1 ile aynı öndeon çekişli platformu paylaşır; otomatik şanzıman ZF değil Aisin kaynaklıdır.'
      }
    ]
  },
  {
    brand: 'BMW',
    model: '8 Serisi',
    segment: 'üst',
    generations: [
      {
        code: 'G14/G15',
        years: '2018-2024',
        bodyTypes: ['Coupe', 'Cabrio', 'Gran Coupe'],
        engineIds: ['bmw-b57', 'bmw-b58'],
        transmissionIds: ['zf8hp'],
        note: ''
      }
    ]
  },

  // ---- MERCEDES-BENZ ----
  {
    brand: 'Mercedes-Benz',
    model: 'S Serisi',
    segment: 'üst',
    generations: [
      {
        code: 'W222',
        years: '2013-2020',
        bodyTypes: ['Sedan'],
        engineIds: ['mb-om642', 'mb-om656'],
        transmissionIds: ['mb-9g-tronic', 'mb-7g-tronic'],
        note: 'Marka amiral gemisidir; hava süspansiyon ve çok sayıda elektronik donanım kalemi bakım maliyetini artırır.'
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'GLS',
    segment: 'suv',
    generations: [
      {
        code: 'X167',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['mb-om656'],
        transmissionIds: ['mb-9g-tronic'],
        note: 'GLE ile aynı platform ve motor ailesini paylaşan 7 koltuklu, uzun gövdeli versiyondur.'
      }
    ]
  },

  // ---- PEUGEOT ----
  {
    brand: 'Peugeot',
    model: '5008',
    segment: 'suv',
    generations: [
      {
        code: '5008',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: '3008 ile aynı platform ve motor ailesini paylaşan 7 koltuklu versiyondur.'
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: '108',
    segment: 'mini',
    generations: [
      {
        code: '108',
        years: '2014-2021',
        bodyTypes: ['Hatchback'],
        engineIds: ['toyota-1nr-1kr'],
        transmissionIds: ['manuel'],
        note: 'Toyota Aygo ve Citroën C1 ile aynı fabrikada üretilen, aynı platform ve motoru paylaşan üçüz modellerden biridir.'
      }
    ]
  },

  // ---- RENAULT ----
  {
    brand: 'Renault',
    model: 'Twingo',
    segment: 'mini',
    generations: [
      {
        code: 'Gen2/3',
        years: '2007-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['renault-d4f-d7f', 'renault-h4d-b4d'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Scenic',
    segment: 'orta',
    generations: [
      {
        code: 'Gen3/4',
        years: '2009-2022',
        bodyTypes: ['MPV'],
        engineIds: ['renault-k9k', 'renault-r9m'],
        transmissionIds: ['manuel', 'renault-edc'],
        note: '7 koltuklu Grand Scenic versiyonu da aynı motor/şanzıman ailesini kullanır.'
      }
    ]
  },

  // ---- TOYOTA ----
  {
    brand: 'Toyota',
    model: 'Hilux',
    segment: 'ticari',
    generations: [
      {
        code: 'AN120/AN130',
        years: '2015-2024',
        bodyTypes: ['Pickup'],
        engineIds: ['toyota-kd-d4d'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'Ticari/arazi kullanımı nedeniyle km başına aşınma şehir kullanımından farklı yorumlanmalıdır.'
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Land Cruiser',
    segment: 'suv',
    generations: [
      {
        code: 'J150',
        years: '2009-2024',
        facelift: '2017',
        bodyTypes: ['SUV'],
        engineIds: ['toyota-kd-d4d'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },

  // ---- VOLKSWAGEN ----
  {
    brand: 'Volkswagen',
    model: 'Caddy',
    segment: 'ticari',
    generations: [
      {
        code: 'Gen3/4',
        years: '2010-2024',
        bodyTypes: ['Panelvan'],
        engineIds: ['vag-ea189-16tdi', 'vag-ea288-16tdi'],
        transmissionIds: ['manuel', 'dq200'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Touran',
    segment: 'orta',
    generations: [
      {
        code: 'Gen2/3',
        years: '2010-2023',
        bodyTypes: ['MPV'],
        engineIds: ['vag-ea189-16tdi', 'vag-ea288-20tdi', 'vag-ea211-14tsi'],
        transmissionIds: ['manuel', 'dq200'],
        note: '7 koltuklu, aile kullanımı için uygun MPV.'
      }
    ]
  },

  // ==========================================================================
  // 3. TUR GENİŞLETME — yeni markalar ve mevcut markalara ikinci/üçüncü
  // kademe modeller.
  // ==========================================================================

  // ---- YENİ MARKALAR ----
  {
    brand: 'Lexus',
    model: 'IS',
    segment: 'orta',
    generations: [
      {
        code: 'XE20/30',
        years: '2013-2024',
        bodyTypes: ['Sedan'],
        engineIds: ['toyota-ad-d4d'],
        transmissionIds: ['toyota-multidrive'],
        note: 'Türkiye\'de dizel (220d) versiyonu daha yaygındır; benzinli/hibrit versiyonlar da satılmıştır.'
      }
    ]
  },
  {
    brand: 'Lexus',
    model: 'NX',
    segment: 'suv',
    generations: [
      {
        code: 'AZ10',
        years: '2014-2021',
        bodyTypes: ['SUV'],
        engineIds: ['toyota-2zr-fxe'],
        transmissionIds: ['toyota-cvt'],
        note: 'Toyota RAV4/C-HR ile aynı hibrit sistem ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Lexus',
    model: 'RX',
    segment: 'suv',
    generations: [
      {
        code: 'AL20',
        years: '2015-2022',
        bodyTypes: ['SUV'],
        engineIds: ['toyota-25-hybrid'],
        transmissionIds: ['toyota-cvt'],
        note: 'Toyota Camry/RAV4 ile aynı hibrit sistem ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Porsche',
    model: 'Cayenne',
    segment: 'premium',
    generations: [
      {
        code: '9YA',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['porsche-v6-turbo', 'vag-30tdi-v6'],
        transmissionIds: ['zf8hp'],
        note: 'Audi Q7/VW Touareg ile aynı VAG platformunu paylaşır; hava süspansiyon körükleri önemli bir bakım kalemidir.'
      }
    ]
  },
  {
    brand: 'Porsche',
    model: 'Macan',
    segment: 'premium',
    generations: [
      {
        code: '95B',
        years: '2014-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea888-gen3', 'porsche-v6-turbo'],
        transmissionIds: ['zf8hp'],
        note: 'Audi Q5 ile aynı platform ve 2.0 TFSI motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'MG',
    model: 'ZS',
    segment: 'suv',
    generations: [
      {
        code: 'ZS',
        years: '2018-2024',
        bodyTypes: ['SUV'],
        engineIds: ['mg-turbo-15'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'Türkiye pazarına yeni giren bir modeldir; uzun vadeli arıza istatistiği henüz sınırlıdır.'
      }
    ]
  },
  {
    brand: 'MG',
    model: 'HS',
    segment: 'suv',
    generations: [
      {
        code: 'HS',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['mg-turbo-15'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'Türkiye pazarına yeni giren bir modeldir; uzun vadeli arıza istatistiği henüz sınırlıdır.'
      }
    ]
  },
  {
    brand: 'DS',
    model: 'DS4',
    segment: 'kompakt',
    generations: [
      {
        code: 'DS4',
        years: '2011-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: 'Citroën/Peugeot ile aynı PSA motor ailesini paylaşan premium alt markadır.'
      }
    ]
  },
  {
    brand: 'DS',
    model: 'DS7',
    segment: 'suv',
    generations: [
      {
        code: 'DS7 Crossback',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['psa-puretech', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'eat8'],
        note: ''
      }
    ]
  },

  // ---- MEVCUT MARKALARA EK MODELLER ----
  {
    brand: 'Alfa Romeo',
    model: 'MiTo',
    segment: 'mini',
    generations: [
      {
        code: 'MiTo',
        years: '2008-2018',
        bodyTypes: ['Hatchback'],
        engineIds: ['fiat-tjet-14', 'fiat-multijet-13'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Chevrolet',
    model: 'Aveo',
    segment: 'mini',
    generations: [
      {
        code: 'T300',
        years: '2011-2020',
        bodyTypes: ['Sedan', 'Hatchback'],
        engineIds: ['gm-ecotec'],
        transmissionIds: ['manuel'],
        note: 'Opel Corsa D/E ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Citroën',
    model: 'C5',
    segment: 'orta',
    generations: [
      {
        code: 'C5',
        years: '2008-2017',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['psa-dw10', 'psa-bluehdi'],
        transmissionIds: ['manuel', 'al4-dp0'],
        note: ''
      }
    ]
  },
  {
    brand: 'Dacia',
    model: 'Logan',
    segment: 'sedan',
    generations: [
      {
        code: 'Gen2',
        years: '2012-2022',
        bodyTypes: ['Sedan'],
        engineIds: ['renault-k4j-k7m', 'renault-k9k'],
        transmissionIds: ['manuel'],
        note: 'Sandero ile aynı platform ve motor ailesini paylaşır.'
      }
    ]
  },
  {
    brand: 'Fiat',
    model: 'Punto',
    segment: 'mini',
    generations: [
      {
        code: 'Grande/Evo/Punto',
        years: '2005-2018',
        bodyTypes: ['Hatchback'],
        engineIds: ['fiat-fire', 'fiat-multijet-13'],
        transmissionIds: ['manuel', 'fiat-dualogic'],
        note: ''
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'Ranger',
    segment: 'ticari',
    generations: [
      {
        code: 'T6',
        years: '2011-2022',
        bodyTypes: ['Pickup'],
        engineIds: ['ford-duratorq-32', 'ford-tdci-20'],
        transmissionIds: ['manuel', 'powershift-mps6'],
        note: 'Ticari/arazi kullanımı nedeniyle km başına aşınma şehir kullanımından farklı yorumlanmalıdır.'
      }
    ]
  },
  {
    brand: 'Hyundai',
    model: 'i40',
    segment: 'orta',
    generations: [
      {
        code: 'i40',
        years: '2011-2019',
        bodyTypes: ['Sedan', 'Station Wagon'],
        engineIds: ['hyundai-r-crdi', 'hyundai-theta2'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Jaguar',
    model: 'XJ',
    segment: 'üst',
    generations: [
      {
        code: 'X351',
        years: '2010-2019',
        bodyTypes: ['Sedan'],
        engineIds: ['jlr-td6-v6'],
        transmissionIds: ['zf8hp'],
        note: 'Marka amiral gemisidir; hava süspansiyon önemli bir bakım kalemidir.'
      }
    ]
  },
  {
    brand: 'Jeep',
    model: 'Cherokee',
    segment: 'suv',
    generations: [
      {
        code: 'KL',
        years: '2014-2021',
        bodyTypes: ['SUV'],
        engineIds: ['jeep-pentastar-36', 'mb-om642'],
        transmissionIds: ['zf8hp'],
        note: 'Grand Cherokee\'den daha kompakt gövdedir; dizel versiyon Mercedes kaynaklı 2.2/3.0 motor kullanmıştır.'
      }
    ]
  },
  {
    brand: 'Kia',
    model: 'Rio',
    segment: 'mini',
    generations: [
      {
        code: 'UB/YB',
        years: '2011-2022',
        bodyTypes: ['Hatchback', 'Sedan'],
        engineIds: ['hyundai-d4fc', 'hyundai-gamma'],
        transmissionIds: ['manuel', 'hyundai-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Land Rover',
    model: 'Discovery',
    segment: 'premium',
    generations: [
      {
        code: 'L462',
        years: '2017-2024',
        bodyTypes: ['SUV'],
        engineIds: ['jlr-td6-v6', 'jlr-ingenium-20d'],
        transmissionIds: ['zf8hp'],
        note: 'Range Rover ailesinden daha uygun fiyatlı, 7 koltuklu aile SUV\'udur.'
      }
    ]
  },
  {
    brand: 'Mazda',
    model: 'Mazda2',
    segment: 'mini',
    generations: [
      {
        code: 'DJ',
        years: '2015-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['mazda-skyactiv-g'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Mercedes-Benz',
    model: 'CLS',
    segment: 'üst',
    generations: [
      {
        code: 'C218/C257',
        years: '2011-2023',
        bodyTypes: ['Sedan'],
        engineIds: ['mb-om642', 'mb-m274'],
        transmissionIds: ['mb-7g-tronic', 'mb-9g-tronic'],
        note: 'E Serisi ile aynı platform ve motor ailesini paylaşan kupe tavanlı sedan.'
      }
    ]
  },
  {
    brand: 'Mitsubishi',
    model: 'Pajero Sport',
    segment: 'suv',
    generations: [
      {
        code: 'Pajero Sport',
        years: '2015-2024',
        bodyTypes: ['SUV'],
        engineIds: ['mitsubishi-did-16'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: 'Arazi kullanımı nedeniyle km başına aşınma şehir kullanımından farklı yorumlanmalıdır.'
      }
    ]
  },
  {
    brand: 'Nissan',
    model: 'Navara',
    segment: 'ticari',
    generations: [
      {
        code: 'D23',
        years: '2015-2024',
        bodyTypes: ['Pickup'],
        engineIds: ['renault-r9m'],
        transmissionIds: ['manuel', 'jatco-cvt'],
        note: 'Renault Alaskan ile aynı platform ve motor ailesini paylaşır; ticari kullanım nedeniyle kilometre kaydı önemlidir.'
      }
    ]
  },
  {
    brand: 'Opel',
    model: 'Antara',
    segment: 'suv',
    generations: [
      {
        code: 'Antara',
        years: '2006-2015',
        bodyTypes: ['SUV'],
        engineIds: ['gm-vcdi-20'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: 'Chevrolet Captiva ile aynı platform ve motoru paylaşır.'
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: 'Boxer',
    segment: 'ticari',
    generations: [
      {
        code: 'Boxer',
        years: '2006-2024',
        bodyTypes: ['Panelvan'],
        engineIds: ['psa-bluehdi'],
        transmissionIds: ['manuel'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Trafic',
    segment: 'ticari',
    generations: [
      {
        code: 'Gen3',
        years: '2014-2024',
        bodyTypes: ['Panelvan', 'Minibüs'],
        engineIds: ['renault-m9r'],
        transmissionIds: ['manuel'],
        note: 'Ticari kullanım nedeniyle kilometre ve servis kaydı ciddi önem taşır.'
      }
    ]
  },
  {
    brand: 'Seat',
    model: 'Alhambra',
    segment: 'orta',
    generations: [
      {
        code: 'Gen2',
        years: '2010-2020',
        bodyTypes: ['MPV'],
        engineIds: ['vag-ea288-20tdi'],
        transmissionIds: ['manuel', 'dq381'],
        note: 'VW Sharan ile aynı platform ve motor ailesini paylaşan 7 koltuklu MPV.'
      }
    ]
  },
  {
    brand: 'Skoda',
    model: 'Kamiq',
    segment: 'suv',
    generations: [
      {
        code: 'Kamiq',
        years: '2019-2024',
        bodyTypes: ['SUV'],
        engineIds: ['vag-ea211-10tsi', 'vag-ea211-14tsi'],
        transmissionIds: ['manuel', 'dq200'],
        note: ''
      }
    ]
  },
  {
    brand: 'SsangYong',
    model: 'Actyon',
    segment: 'suv',
    generations: [
      {
        code: 'Actyon',
        years: '2005-2017',
        bodyTypes: ['SUV'],
        engineIds: ['ssangyong-xdi'],
        transmissionIds: ['manuel', 'aisin-6at'],
        note: ''
      }
    ]
  },
  {
    brand: 'Subaru',
    model: 'Impreza',
    segment: 'kompakt',
    generations: [
      {
        code: 'GJ/GP',
        years: '2011-2024',
        bodyTypes: ['Sedan', 'Hatchback'],
        engineIds: ['subaru-fb'],
        transmissionIds: ['manuel'],
        note: 'Otomatik versiyonlar Subaru\'ya özgü Lineartronic CVT kullanır; bu şanzıman katalogda ayrıca kayıtlı değildir.'
      }
    ]
  },
  {
    brand: 'Suzuki',
    model: 'Baleno',
    segment: 'mini',
    generations: [
      {
        code: 'Baleno',
        years: '2015-2024',
        bodyTypes: ['Hatchback'],
        engineIds: ['suzuki-k-petrol'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Prius',
    segment: 'kompakt',
    generations: [
      {
        code: 'XW50',
        years: '2016-2022',
        bodyTypes: ['Hatchback'],
        engineIds: ['toyota-2zr-fxe'],
        transmissionIds: ['toyota-cvt'],
        note: 'Hibrit teknolojisinin öncü modelidir; batarya sağlığı (SOH) alım öncesi mutlaka sorulmalıdır.'
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Up!',
    segment: 'mini',
    generations: [
      {
        code: 'Up!',
        years: '2011-2023',
        bodyTypes: ['Hatchback'],
        engineIds: ['vag-ea211-10tsi'],
        transmissionIds: ['manuel'],
        note: ''
      }
    ]
  },
  {
    brand: 'Volvo',
    model: 'V60',
    segment: 'kompakt',
    generations: [
      {
        code: 'V60',
        years: '2013-2024',
        bodyTypes: ['Station Wagon'],
        engineIds: ['volvo-vea-d4', 'volvo-vea-t'],
        transmissionIds: ['aisin-tf80', 'manuel'],
        note: 'S60 ile aynı platform ve motor ailesini paylaşan karavan gövdedir.'
      }
    ]
  }
]

export const MODELS = CURATED_MODELS

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
