/**
 * MOTOR AİLESİ VERİTABANI
 *
 * ============================================================================
 * NEDEN AYRI BİR TABLO
 * ============================================================================
 * Aynı motor onlarca farklı araçta kullanılır: EA189 1.6 TDI, Golf'te de
 * Octavia'da da A3'te de aynı motordur ve aynı arızaları yapar. Bu bilgiyi
 * her araç kaydına tekrar tekrar yazmak hem veriyi şişirir hem de bir düzeltme
 * gerektiğinde onlarca yerde güncelleme demektir.
 *
 * Bu yüzden motor bilgisi burada BİR KEZ tanımlanır, araç kayıtları buraya
 * bağlanır. Yeni araç eklemek, mevcut bir motora bir satır bağlamaktan ibarettir.
 *
 * ============================================================================
 * VERİ KAYNAĞI VE SINIRLARI (önemli)
 * ============================================================================
 * Buradaki motor kodları, hacimler, kullanıldığı modeller ve kronik arızalar
 * yaygın olarak belgelenmiş, doğrulanabilir teknik bilgilerdir. Güç ve tork
 * değerleri ARALIK olarak verilir; aynı motor farklı modellerde farklı
 * güçlerde sunulmuştur ve tek bir sayı vermek yanıltıcı olurdu.
 *
 * Maliyet aralıkları Türkiye piyasası için kaba tahmindir; şehir, servis ve
 * parça tercihine göre ciddi biçimde değişir.
 *
 * `durability` (0-100) mutlak bir ölçüm değil, o motorun kendi sınıfı içindeki
 * göreli dayanıklılık değerlendirmesidir.
 */

/** Risk seviyeleri, uygulamanın geri kalanıyla aynı sözlüğü kullanır. */
export const ENGINE_RISK = ['Yüksek', 'Orta', 'Düşük']

export const ENGINES = [
  // ==========================================================================
  // VOLKSWAGEN GRUBU (VW, Audi, Skoda, Seat, Cupra)
  // ==========================================================================
  {
    id: 'vag-ea189-16tdi',
    family: 'EA189',
    name: '1.6 TDI',
    codes: ['CAYC', 'CAYB', 'CLHA', 'CAYE'],
    group: 'VAG',
    displacement: 1598,
    fuel: 'Dizel',
    power: '90 - 110 HP',
    torque: '230 - 250 Nm',
    years: '2009 - 2015',
    usedIn: ['VW Golf', 'VW Polo', 'VW Passat', 'Audi A3', 'Skoda Octavia', 'Seat Leon'],
    durability: 76,
    maintenance: { oilKm: 15000, timing: 'Kayış · 180.000 km', note: 'Kayış değişiminde devirdaim birlikte yapılmalı.' },
    problems: [
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '3.000 - 15.000 TL', note: 'Şehir içi kullanımda kaçınılmaz sayılır.' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '3.000 - 35.000 TL', note: 'Kısa mesafe kullanımda rejenerasyon tamamlanamaz.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '6.000 - 25.000 TL', note: 'Değişen enjektör beyne kodlanmalıdır.' },
      { title: 'Emisyon yazılımı güncellemesi sonrası performans/EGR şikayetleri', risk: 'Düşük', cost: '0 - 12.000 TL', note: 'Güncelleme yapılıp yapılmadığı servis kaydından sorulmalı.' }
    ]
  },
  {
    id: 'vag-ea189-20tdi',
    family: 'EA189',
    name: '2.0 TDI',
    codes: ['CFFB', 'CBAB', 'CFHC', 'CLCA'],
    group: 'VAG',
    displacement: 1968,
    fuel: 'Dizel',
    power: '110 - 170 HP',
    torque: '250 - 350 Nm',
    years: '2008 - 2015',
    usedIn: ['VW Golf', 'VW Passat', 'VW Tiguan', 'Audi A3', 'Audi A4', 'Skoda Superb', 'Seat Leon'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Kayış · 180.000 km', note: '' },
    problems: [
      { title: 'EGR soğutucusu tıkanması/kaçağı', risk: 'Orta', cost: '6.000 - 20.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '3.000 - 40.000 TL', note: '' },
      { title: 'Emme manifoldu girdap kelebeği kırılması', risk: 'Orta', cost: '3.000 - 22.000 TL', note: 'P2015 kodu tipiktir.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'vag-pd-20tdi',
    family: 'PD (Pumpe Düse)',
    name: '2.0 TDI PD',
    codes: ['BKD', 'BMN', 'BMM', 'AZV'],
    group: 'VAG',
    displacement: 1968,
    fuel: 'Dizel',
    power: '140 - 170 HP',
    torque: '320 - 350 Nm',
    years: '2003 - 2010',
    usedIn: ['VW Golf 5', 'VW Passat B6', 'Audi A3 8P', 'Skoda Octavia 2', 'Seat Leon 1P'],
    durability: 70,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: 'PD motorlarda özel yağ (VW 505.01) şarttır.' },
    problems: [
      { title: 'Denge mili modülü (yağ pompası) arızası', risk: 'Yüksek', cost: '25.000 - 70.000 TL', note: 'Bu motorun en ölümcül arızası; yağ basıncı kesilirse motor gider.' },
      { title: 'Enjektör (pumpe düse) arızası', risk: 'Orta', cost: '8.000 - 30.000 TL', note: '' },
      { title: 'Emme manifoldu kurumlanması', risk: 'Orta', cost: '4.000 - 15.000 TL', note: '' },
      { title: 'Silindir kapağı çatlağı (BKD)', risk: 'Orta', cost: '25.000 - 60.000 TL', note: '' }
    ]
  },
  {
    id: 'vag-ea288-16tdi',
    family: 'EA288',
    name: '1.6 TDI',
    designations: ['30 tdi','1.6 tdi'],
    codes: ['CXXB', 'DDYA', 'CRKB'],
    group: 'VAG',
    displacement: 1598,
    fuel: 'Dizel',
    power: '90 - 116 HP',
    torque: '230 - 250 Nm',
    years: '2013 - 2020',
    usedIn: ['VW Golf 7', 'VW Polo', 'Audi A3 8V', 'Skoda Octavia 3', 'Seat Leon 5F'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Kayış · 210.000 km', note: '' },
    problems: [
      { title: 'DPF tıkanması', risk: 'Orta', cost: '3.000 - 35.000 TL', note: '' },
      { title: 'AdBlue sistemi arızası (2016 sonrası)', risk: 'Orta', cost: '5.000 - 25.000 TL', note: 'NOx sensörü en sık değişen parçadır.' },
      { title: 'EGR valfi kurumlanması', risk: 'Düşük', cost: '3.000 - 14.000 TL', note: 'EA189\'a göre belirgin biçimde iyileşti.' }
    ]
  },
  {
    id: 'vag-ea288-20tdi',
    family: 'EA288',
    name: '2.0 TDI',
    designations: ['35 tdi','40 tdi','2.0 tdi'],
    codes: ['CRBC', 'DFGA', 'DTUA', 'CUNA'],
    group: 'VAG',
    displacement: 1968,
    fuel: 'Dizel',
    power: '140 - 190 HP',
    torque: '320 - 400 Nm',
    years: '2013 - 2022',
    usedIn: ['VW Golf 7', 'VW Passat B8', 'VW Tiguan', 'Audi A3', 'Audi Q3', 'Skoda Superb 3'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Kayış · 210.000 km', note: '' },
    problems: [
      { title: 'AdBlue/SCR sistemi arızası', risk: 'Orta', cost: '5.000 - 30.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '3.000 - 40.000 TL', note: '' },
      { title: 'Devirdaim (elektrikli) arızası', risk: 'Düşük', cost: '5.000 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'vag-ea111-14tsi',
    family: 'EA111',
    name: '1.4 TSI',
    codes: ['CAXA', 'CTHA', 'CAVD', 'BMY'],
    group: 'VAG',
    displacement: 1390,
    fuel: 'Benzin',
    power: '122 - 180 HP',
    torque: '200 - 250 Nm',
    years: '2006 - 2015',
    usedIn: ['VW Golf 6', 'VW Jetta', 'VW Passat B6/B7', 'Audi A3 8P', 'Skoda Octavia 2', 'Seat Leon'],
    durability: 58,
    maintenance: { oilKm: 10000, timing: 'Zincir · ömürlük (pratikte değil)', note: 'Bu motorda yağ bakımını uzatmak zincir gergisini öldürür.' },
    problems: [
      { title: 'Triger zinciri gergisi arızası', risk: 'Yüksek', cost: '18.000 - 55.000 TL', note: 'Zincir atlarsa motor komple gider. Bu motorun en bilinen kusuru.' },
      { title: 'Piston/segman arızası (twincharger 1.4 TSI)', risk: 'Yüksek', cost: '40.000 - 100.000 TL', note: 'Aşırı yağ tüketimi ve tekleme ile başlar.' },
      { title: 'Su pompası/termostat kaçağı', risk: 'Orta', cost: '4.000 - 14.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Orta', cost: '4.000 - 14.000 TL', note: '' }
    ]
  },
  {
    id: 'vag-ea211-10tsi',
    family: 'EA211',
    name: '1.0 TSI',
    codes: ['CHZ', 'DKR', 'DLA'],
    group: 'VAG',
    displacement: 999,
    fuel: 'Benzin',
    power: '95 - 116 HP',
    torque: '160 - 200 Nm',
    years: '2015 - 2024',
    usedIn: ['VW Polo', 'VW Golf 7/8', 'VW T-Cross', 'Skoda Fabia', 'Seat Ibiza', 'Audi A1'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Kayış · 210.000 km', note: '' },
    problems: [
      { title: 'Devirdaim/termostat modülü kaçağı', risk: 'Orta', cost: '4.000 - 14.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '4.000 - 12.000 TL', note: 'Direkt enjeksiyonlu motorlarda beklenen bakım kalemi.' }
    ]
  },
  {
    id: 'vag-ea211-14tsi',
    family: 'EA211',
    name: '1.4 / 1.5 TSI',
    designations: ['30 tsi','35 tsi','30 tfsi','35 tfsi'],
    codes: ['CZC', 'CZD', 'DPC', 'DAD'],
    group: 'VAG',
    displacement: 1395,
    fuel: 'Benzin',
    power: '125 - 150 HP',
    torque: '200 - 250 Nm',
    years: '2012 - 2022',
    usedIn: ['VW Golf 7', 'VW Passat B8', 'VW Tiguan', 'Audi A3 8V', 'Skoda Octavia 3', 'Seat Leon 5F'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Kayış · 210.000 km', note: 'EA111\'in aksine kayışlı ve zincir sorunu yok.' },
    problems: [
      { title: 'Devirdaim/termostat kaçağı', risk: 'Orta', cost: '4.000 - 15.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '4.000 - 12.000 TL', note: '' },
      { title: '1.5 TSI ACT düşük devirde tekleme/sarsıntı', risk: 'Düşük', cost: '0 - 6.000 TL', note: 'Yazılım güncellemesiyle giderilebiliyor.' }
    ]
  },
  {
    id: 'vag-ea888-gen2',
    family: 'EA888 Gen2',
    name: '1.8 / 2.0 TSI',
    aliases: ['1.8 TFSI / 2.0 TFSI (EA888)','1.8 TFSI','2.0 TFSI'],
    codes: ['CDAA', 'CCZA', 'CDNC', 'CAWB'],
    group: 'VAG',
    displacement: 1984,
    fuel: 'Benzin',
    power: '160 - 211 HP',
    torque: '250 - 350 Nm',
    years: '2008 - 2013',
    usedIn: ['VW Golf 6 GTI', 'VW Passat B7', 'VW Tiguan', 'Audi A4 B8', 'Audi A3 8P', 'Skoda Superb 2'],
    durability: 62,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Aşırı yağ tüketimi (piston segmanı)', risk: 'Yüksek', cost: '40.000 - 110.000 TL', note: 'Bu neslin en bilinen ve en pahalı kusuru.' },
      { title: 'Triger zinciri gergisi arızası', risk: 'Yüksek', cost: '18.000 - 50.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' },
      { title: 'PCV/karter havalandırma valfi arızası', risk: 'Düşük', cost: '3.000 - 9.000 TL', note: '' }
    ]
  },
  {
    id: 'vag-ea888-gen3',
    family: 'EA888 Gen3',
    name: '2.0 TSI',
    designations: ['40 tfsi','45 tfsi','2.0 tfsi'],
    codes: ['CJSA', 'CHHB', 'DKZA', 'CZPB'],
    group: 'VAG',
    displacement: 1984,
    fuel: 'Benzin',
    power: '190 - 310 HP',
    torque: '320 - 400 Nm',
    years: '2013 - 2023',
    usedIn: ['VW Golf 7 GTI/R', 'VW Passat B8', 'VW Tiguan', 'Audi A3 8V', 'Audi A4 B9', 'Skoda Superb 3'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Gen2\'deki segman ve zincir sorunları büyük ölçüde çözüldü.' },
    problems: [
      { title: 'Devirdaim/termostat modülü kaçağı', risk: 'Orta', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' },
      { title: 'PCV valfi arızası', risk: 'Düşük', cost: '3.000 - 9.000 TL', note: '' }
    ]
  },
  {
    id: 'vag-30tdi-v6',
    family: 'EA896/EA897',
    name: '3.0 TDI V6',
    codes: ['CASA', 'CDUC', 'CLAB', 'CRTC'],
    group: 'VAG',
    displacement: 2967,
    fuel: 'Dizel',
    power: '204 - 313 HP',
    torque: '450 - 650 Nm',
    years: '2004 - 2022',
    usedIn: ['Audi A6', 'Audi A7', 'Audi Q7', 'VW Touareg', 'Porsche Cayenne'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Zincir (motor arkası)', note: 'Zincir motorun arkasındadır, işçilik çok yüksektir.' },
    problems: [
      { title: 'Triger zinciri uzaması (motor arkası)', risk: 'Yüksek', cost: '45.000 - 120.000 TL', note: 'Soğuk çalıştırmada tıkırtı ilk belirtidir.' },
      { title: 'Emme manifoldu girdap kelebeği kırılması', risk: 'Orta', cost: '15.000 - 45.000 TL', note: '' },
      { title: 'EGR soğutucusu ve AdBlue arızaları', risk: 'Orta', cost: '10.000 - 40.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // BMW
  // ==========================================================================
  {
    id: 'bmw-n47',
    family: 'N47',
    name: '2.0d (N47)',
    designations: ['116d','118d','120d','123d','316d','318d','320d','325d','520d','525d','18d','20d','23d'],
    codes: ['N47D20', 'N47D20C'],
    group: 'BMW',
    displacement: 1995,
    fuel: 'Dizel',
    power: '116 - 204 HP',
    torque: '260 - 430 Nm',
    years: '2007 - 2015',
    usedIn: ['BMW 1 Serisi E87/F20', 'BMW 3 Serisi E90/F30', 'BMW 5 Serisi F10', 'BMW X1', 'BMW X3'],
    durability: 58,
    maintenance: { oilKm: 15000, timing: 'Zincir (motor arkası)', note: 'Yağ bakımını uzatmak zincir ömrünü doğrudan kısaltır.' },
    problems: [
      { title: 'Triger zinciri uzaması (motor arkası)', risk: 'Yüksek', cost: '25.000 - 70.000 TL', note: 'Zincir motorun ARKASINDA olduğu için ses geç fark edilir; koparsa motor komple gider. 2007-2011 üretimlerde en sık bildirilen sorundur.' },
      { title: 'EGR soğutucusu tıkanması/kaçağı', risk: 'Orta', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'Emme manifoldu girdap kelebeği', risk: 'Orta', cost: '6.000 - 20.000 TL', note: '' },
      { title: 'Turbo aktüatör arızası', risk: 'Orta', cost: '8.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-b47',
    family: 'B47',
    name: '2.0d (B47)',
    designations: ['116d','118d','120d','316d','318d','320d','520d','18d','20d','25d'],
    codes: ['B47D20'],
    group: 'BMW',
    displacement: 1995,
    fuel: 'Dizel',
    power: '150 - 231 HP',
    torque: '320 - 500 Nm',
    years: '2014 - 2024',
    usedIn: ['BMW 1 Serisi F20/F40', 'BMW 3 Serisi F30/G20', 'BMW 5 Serisi G30', 'BMW X1', 'BMW X3'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'N47\'deki zincir sorunu bu nesilde büyük ölçüde giderildi.' },
    problems: [
      { title: 'EGR soğutucusu arızası', risk: 'Orta', cost: '10.000 - 30.000 TL', note: 'Bazı üretim aralıklarında geri çağırma yapılmıştır; kaydı sorulmalı.' },
      { title: 'AdBlue sistemi arızası', risk: 'Orta', cost: '8.000 - 30.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '5.000 - 45.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-n20',
    family: 'N20',
    name: '2.0i (N20)',
    designations: ['320i','328i','520i','528i','20i','28i'],
    codes: ['N20B20'],
    group: 'BMW',
    displacement: 1997,
    fuel: 'Benzin',
    power: '184 - 245 HP',
    torque: '270 - 350 Nm',
    years: '2011 - 2017',
    usedIn: ['BMW 3 Serisi F30', 'BMW 5 Serisi F10', 'BMW X1', 'BMW X3', 'BMW 4 Serisi F32'],
    durability: 64,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Triger zinciri kızak/gergi arızası', risk: 'Yüksek', cost: '25.000 - 65.000 TL', note: '2011-2015 üretimlerde belirgin; soğuk çalıştırmada tıkırtı ilk belirtidir.' },
      { title: 'Yağ filtre yuvası contası kaçağı', risk: 'Orta', cost: '4.000 - 14.000 TL', note: '' },
      { title: 'Devirdaim (elektrikli) arızası', risk: 'Orta', cost: '10.000 - 28.000 TL', note: '' },
      { title: 'Vanos solenoid arızası', risk: 'Düşük', cost: '4.000 - 12.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-b48',
    family: 'B48',
    name: '2.0i (B48)',
    designations: ['320i','330i','520i','530i','20i','30i','230i'],
    codes: ['B48B20'],
    group: 'BMW',
    displacement: 1998,
    fuel: 'Benzin',
    power: '184 - 306 HP',
    torque: '290 - 450 Nm',
    years: '2015 - 2024',
    usedIn: ['BMW 3 Serisi G20', 'BMW 5 Serisi G30', 'BMW X1', 'BMW X3', 'Mini Cooper S'],
    durability: 86,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'N20\'deki zincir sorunu giderildi.' },
    problems: [
      { title: 'Devirdaim/termostat arızası', risk: 'Düşük', cost: '8.000 - 22.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-n46-n43',
    family: 'N43/N46',
    name: '1.6i / 2.0i (N43/N46)',
    designations: ['316i','318i','320i','116i','118i','120i'],
    codes: ['N43B20', 'N46B20'],
    group: 'BMW',
    displacement: 1995,
    fuel: 'Benzin',
    power: '122 - 170 HP',
    torque: '180 - 210 Nm',
    years: '2004 - 2013',
    usedIn: ['BMW 1 Serisi E87', 'BMW 3 Serisi E90', 'BMW X1 E84'],
    durability: 62,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Ateşleme bobini ve buji arızaları (N43)', risk: 'Orta', cost: '4.000 - 14.000 TL', note: 'N43\'te NOx sensörü de sık arıza verir.' },
      { title: 'Triger zinciri uzaması (N46)', risk: 'Yüksek', cost: '20.000 - 50.000 TL', note: '' },
      { title: 'Vanos ve valvetronic arızaları', risk: 'Orta', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'Yağ tüketimi', risk: 'Orta', cost: '10.000 - 60.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-n57',
    family: 'N57',
    name: '3.0d (N57)',
    designations: ['330d','530d','730d','30d','40d','50d'],
    codes: ['N57D30'],
    group: 'BMW',
    displacement: 2993,
    fuel: 'Dizel',
    power: '245 - 381 HP',
    torque: '540 - 740 Nm',
    years: '2008 - 2019',
    usedIn: ['BMW 5 Serisi F10', 'BMW 7 Serisi', 'BMW X5', 'BMW X6'],
    durability: 80,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Emme manifoldu girdap kelebeği kırılması', risk: 'Orta', cost: '12.000 - 40.000 TL', note: 'Kırılan parça motora kaçarsa hasar büyür.' },
      { title: 'EGR soğutucusu arızası', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'Turbo (çift turbo modellerde) arızası', risk: 'Orta', cost: '25.000 - 80.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-n54-n55',
    family: 'N54/N55',
    name: '3.0i Turbo (N54/N55)',
    designations: ['335i','535i','135i','35i','740i'],
    codes: ['N54B30', 'N55B30'],
    group: 'BMW',
    displacement: 2979,
    fuel: 'Benzin',
    power: '306 - 340 HP',
    torque: '400 - 450 Nm',
    years: '2006 - 2016',
    usedIn: ['BMW 3 Serisi E90/F30', 'BMW 5 Serisi F10', 'BMW X5', 'BMW 1 Serisi M'],
    durability: 66,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Yüksek basınç yakıt pompası (HPFP) arızası — N54', risk: 'Yüksek', cost: '15.000 - 40.000 TL', note: 'N54\'ün en bilinen kusuru; geri çağırma yapılmıştır.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '12.000 - 45.000 TL', note: '' },
      { title: 'Wastegate takırtısı', risk: 'Orta', cost: '10.000 - 45.000 TL', note: '' },
      { title: 'Devirdaim ve termostat arızası', risk: 'Orta', cost: '10.000 - 25.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // MERCEDES-BENZ
  // ==========================================================================
  {
    id: 'mb-om651',
    family: 'OM651',
    name: '2.1 CDI (OM651)',
    designations: ['200 cdi','220 cdi','250 cdi','180d','200d','220d','250d','c220d','e220d','c200d','vito 111','glk220'],
    codes: ['OM651.911', 'OM651.930'],
    group: 'Mercedes-Benz',
    displacement: 2143,
    fuel: 'Dizel',
    power: '136 - 204 HP',
    torque: '300 - 500 Nm',
    years: '2008 - 2019',
    usedIn: ['Mercedes C Serisi W204/W205', 'Mercedes E Serisi W212', 'Mercedes Vito', 'Mercedes Sprinter', 'Mercedes GLK'],
    durability: 70,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Enjektör arızası (Delphi)', risk: 'Yüksek', cost: '15.000 - 50.000 TL', note: 'Erken üretimlerde en sık bildirilen sorun; geri dönüş testi yapılmalı.' },
      { title: 'Triger zinciri uzaması', risk: 'Orta', cost: '20.000 - 55.000 TL', note: 'Özellikle erken üretimlerde.' },
      { title: 'Yüksek basınç yakıt pompası arızası', risk: 'Orta', cost: '15.000 - 45.000 TL', note: 'Pompa parçalanırsa metal talaşı tüm sisteme dağılır.' },
      { title: 'EGR ve DPF tıkanması', risk: 'Orta', cost: '6.000 - 40.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-om642',
    family: 'OM642',
    name: '3.0 V6 CDI (OM642)',
    designations: ['320 cdi','350d','350 cdi','ml350d','gle350d','s350d'],
    codes: ['OM642.920', 'OM642.850'],
    group: 'Mercedes-Benz',
    displacement: 2987,
    fuel: 'Dizel',
    power: '190 - 265 HP',
    torque: '440 - 620 Nm',
    years: '2005 - 2019',
    usedIn: ['Mercedes E Serisi W211/W212', 'Mercedes ML', 'Mercedes S Serisi', 'Mercedes Sprinter', 'Jeep Grand Cherokee'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Yağ soğutucusu conta kaçağı', risk: 'Yüksek', cost: '20.000 - 50.000 TL', note: 'Motorun V yatağındadır, işçilik ağırdır. Bu motorun klasik sorunu.' },
      { title: 'Emme manifoldu girdap kelebeği kırılması', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '25.000 - 60.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-m271',
    family: 'M271',
    name: '1.8 Kompressor / CGI (M271)',
    designations: ['c180','c200','c250','e200','e250','slk200','180 kompressor','200 kompressor'],
    codes: ['M271.940', 'M271.860'],
    group: 'Mercedes-Benz',
    displacement: 1796,
    fuel: 'Benzin',
    power: '156 - 204 HP',
    torque: '230 - 310 Nm',
    years: '2002 - 2015',
    usedIn: ['Mercedes C Serisi W203/W204', 'Mercedes E Serisi W212', 'Mercedes SLK'],
    durability: 64,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Triger zinciri uzaması', risk: 'Yüksek', cost: '18.000 - 50.000 TL', note: 'Bu motorun en bilinen kusuru; soğukta tıkırtı ilk belirtidir.' },
      { title: 'Denge mili dişlisi aşınması', risk: 'Yüksek', cost: '35.000 - 90.000 TL', note: 'Erken üretimlerde; motor açılmasını gerektirir.' },
      { title: 'Kompresör kavraması (Kompressor)', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'Enjektör arızası (CGI direkt enjeksiyon)', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-m274',
    family: 'M274',
    name: '2.0 Turbo (M274)',
    designations: ['c200','c250','c300','e200','e250','a250','cla250','gla250','slk200'],
    codes: ['M274.910', 'M274.920'],
    group: 'Mercedes-Benz',
    displacement: 1991,
    fuel: 'Benzin',
    power: '156 - 245 HP',
    torque: '250 - 370 Nm',
    years: '2012 - 2021',
    usedIn: ['Mercedes C Serisi W205', 'Mercedes E Serisi W213', 'Mercedes GLC', 'Mercedes A/CLA'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Eksantrik ayarlayıcı (camshaft adjuster) arızası', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Triger zinciri gergisi', risk: 'Orta', cost: '15.000 - 45.000 TL', note: 'M271\'e göre belirgin iyileşme var.' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-om654',
    family: 'OM654',
    name: '2.0d (OM654)',
    designations: ['180d','200d','220d','300d','c200d','c220d','e220d','glc220d'],
    codes: ['OM654.920'],
    group: 'Mercedes-Benz',
    displacement: 1950,
    fuel: 'Dizel',
    power: '150 - 245 HP',
    torque: '320 - 500 Nm',
    years: '2016 - 2024',
    usedIn: ['Mercedes C Serisi W205/W206', 'Mercedes E Serisi W213', 'Mercedes GLC', 'Mercedes Sprinter'],
    durability: 85,
    maintenance: { oilKm: 20000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'AdBlue/SCR sistemi arızası', risk: 'Orta', cost: '8.000 - 35.000 TL', note: '' },
      { title: 'DPF tıkanması (şehir içi kullanımda)', risk: 'Düşük', cost: '6.000 - 45.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // RENAULT / DACIA / NISSAN
  // ==========================================================================
  {
    id: 'renault-k9k',
    family: 'K9K',
    name: '1.5 dCi',
    aliases: ['1.5 Blue dCi','1.5 Blue dCi (85-115 hp)','1.5 dCi (85-110 hp)','1.5 DCI'],
    codes: ['K9K 636', 'K9K 846', 'K9K 872'],
    group: 'Renault-Nissan',
    displacement: 1461,
    fuel: 'Dizel',
    power: '75 - 115 HP',
    torque: '180 - 260 Nm',
    years: '2001 - 2022',
    usedIn: ['Renault Clio', 'Renault Megane', 'Renault Fluence', 'Dacia Duster', 'Dacia Sandero', 'Nissan Qashqai'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: 'Türkiye\'de en yaygın dizel motorlardan biri; parça ve usta bulmak kolaydır.' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '5.000 - 20.000 TL', note: 'Geri dönüş testi ile kolay tespit edilir.' },
      { title: 'Turbo yağ besleme borusu tıkanması', risk: 'Orta', cost: '8.000 - 30.000 TL', note: 'Boru tıkanırsa turbo yağsız kalır ve gider; yağ bakımı kritiktir.' },
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '2.500 - 10.000 TL', note: '' },
      { title: 'DPF tıkanması (2011 sonrası)', risk: 'Orta', cost: '3.000 - 25.000 TL', note: '' }
    ]
  },
  {
    id: 'renault-r9m',
    family: 'R9M',
    name: '1.6 dCi',
    codes: ['R9M 402', 'R9M 452'],
    group: 'Renault-Nissan',
    displacement: 1598,
    fuel: 'Dizel',
    power: '130 - 160 HP',
    torque: '320 - 380 Nm',
    years: '2011 - 2021',
    usedIn: ['Renault Megane 4', 'Renault Talisman', 'Renault Kadjar', 'Nissan Qashqai', 'Nissan X-Trail'],
    durability: 72,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Triger zinciri gergisi arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'AdBlue ve DPF sistemi arızası', risk: 'Orta', cost: '5.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'renault-tce-h5f',
    family: 'H4Bt/H5Ft (TCe)',
    name: '0.9 / 1.2 TCe',
    aliases: ['0.9 IG-T','1.2 TCe','0.9 TCe (90 hp)','1.2 TCe (115-130 hp)'],
    codes: ['H4Bt', 'H5Ft'],
    group: 'Renault-Nissan',
    displacement: 1197,
    fuel: 'Benzin',
    power: '90 - 130 HP',
    torque: '135 - 205 Nm',
    years: '2012 - 2020',
    usedIn: ['Renault Clio 4', 'Renault Megane 3/4', 'Renault Captur', 'Dacia Duster'],
    durability: 58,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Bu motorda yağ seviyesi düzenli kontrol edilmeli.' },
    problems: [
      { title: 'Aşırı yağ tüketimi ve turbo arızası (1.2 TCe)', risk: 'Yüksek', cost: '25.000 - 80.000 TL', note: '1.2 TCe\'nin en bilinen kusuru; yağ eksiltmesi turbo ve motoru birlikte götürebilir.' },
      { title: 'Triger zinciri uzaması', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Orta', cost: '4.000 - 12.000 TL', note: '' }
    ]
  },
  {
    id: 'renault-k4m',
    family: 'K4M',
    name: '1.6 16V',
    codes: ['K4M 838', 'K4M 690'],
    group: 'Renault-Nissan',
    displacement: 1598,
    fuel: 'Benzin',
    power: '105 - 115 HP',
    torque: '145 - 156 Nm',
    years: '1999 - 2019',
    usedIn: ['Renault Megane', 'Renault Fluence', 'Renault Clio', 'Dacia Duster', 'Dacia Logan'],
    durability: 86,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: 'Basit, dayanıklı ve ucuz bakımlı; Türkiye\'de çok yaygın.' },
    problems: [
      { title: 'Ateşleme bobini arızası', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' },
      { title: 'Rölanti dalgalanması (gaz kelebeği kirlenmesi)', risk: 'Düşük', cost: '1.500 - 5.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // PSA (PEUGEOT / CITROEN / OPEL / DS)
  // ==========================================================================
  {
    id: 'psa-dv6',
    family: 'DV6',
    name: '1.6 HDi',
    codes: ['DV6TED4', 'DV6C', 'DV6D'],
    group: 'Stellantis-PSA',
    displacement: 1560,
    fuel: 'Dizel',
    power: '90 - 120 HP',
    torque: '215 - 300 Nm',
    years: '2004 - 2019',
    usedIn: ['Peugeot 308', 'Peugeot 3008', 'Citroen C4', 'Ford Focus', 'Ford Fiesta', 'Mini Cooper D', 'Volvo V40'],
    durability: 68,
    maintenance: { oilKm: 15000, timing: 'Kayış · 150.000 km', note: 'Turbo yağ besleme borusu ve süzgeci periyodik temizlenmeli.' },
    problems: [
      { title: 'Turbo yağ besleme borusu tıkanması', risk: 'Yüksek', cost: '10.000 - 35.000 TL', note: 'Bu motorun klasik ölümcül arızası; boru tıkanınca turbo yağsız kalır.' },
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '3.000 - 12.000 TL', note: '' },
      { title: 'DPF tıkanması ve katkı (Eolys) sıvısı', risk: 'Orta', cost: '4.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'psa-bluehdi',
    family: 'DV5/DW10 BlueHDi',
    name: '1.5 / 1.6 BlueHDi',
    codes: ['DV5RC', 'DV6FC'],
    group: 'Stellantis-PSA',
    displacement: 1499,
    fuel: 'Dizel',
    power: '100 - 130 HP',
    torque: '250 - 300 Nm',
    years: '2013 - 2023',
    usedIn: ['Peugeot 308', 'Peugeot 3008', 'Citroen C3', 'Citroen C4', 'Opel Corsa', 'Opel Astra'],
    durability: 72,
    maintenance: { oilKm: 20000, timing: 'Yağ banyolu kayış · 180.000 km', note: 'Yağ banyolu kayış dağılırsa parçaları yağ kanallarını tıkar; değişim aralığına uyulmalı.' },
    problems: [
      { title: 'Yağ banyolu triger kayışı bozulması (1.5 BlueHDi)', risk: 'Yüksek', cost: '20.000 - 70.000 TL', note: 'Kayış parçacıkları yağ pompası süzgecini tıkayıp motoru götürebilir.' },
      { title: 'AdBlue sistemi arızası', risk: 'Orta', cost: '6.000 - 25.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '4.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'psa-ep6',
    family: 'EP6 (Prince)',
    name: '1.6 THP / VTi',
    aliases: ['1.6 VTi','1.6 THP','1.6 Turbo'],
    codes: ['EP6DT', 'EP6CDT', 'N14', 'N18'],
    group: 'Stellantis-PSA',
    displacement: 1598,
    fuel: 'Benzin',
    power: '120 - 200 HP',
    torque: '160 - 300 Nm',
    years: '2006 - 2019',
    usedIn: ['Peugeot 308', 'Peugeot 3008', 'Citroen C4', 'Citroen DS3', 'Mini Cooper S', 'BMW 116i'],
    durability: 52,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Bu motorda yağ bakımını uzatmak zincir ve turbo ömrünü doğrudan kısaltır.' },
    problems: [
      { title: 'Triger zinciri uzaması', risk: 'Yüksek', cost: '18.000 - 50.000 TL', note: 'BMW ile ortak geliştirilen bu motorun en bilinen kusuru.' },
      { title: 'Aşırı yağ tüketimi', risk: 'Yüksek', cost: '20.000 - 80.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Yüksek', cost: '5.000 - 15.000 TL', note: 'Direkt enjeksiyonda çok belirgin; periyodik temizlik gerekir.' },
      { title: 'Devirdaim ve termostat kaçağı', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'psa-puretech',
    family: 'EB2 PureTech',
    name: '1.2 PureTech',
    codes: ['EB2DTS', 'EB2ADTS'],
    group: 'Stellantis-PSA',
    displacement: 1199,
    fuel: 'Benzin',
    power: '100 - 155 HP',
    torque: '205 - 240 Nm',
    years: '2014 - 2023',
    usedIn: ['Peugeot 208', 'Peugeot 308', 'Peugeot 3008', 'Citroen C3', 'Citroen C4', 'Opel Corsa', 'Opel Crossland'],
    durability: 56,
    maintenance: { oilKm: 15000, timing: 'Yağ banyolu kayış · 100.000 km (revize edildi)', note: 'Üretici değişim aralığını sonradan kısaltmıştır; kayış değişim kaydı mutlaka sorulmalı.' },
    problems: [
      { title: 'Yağ banyolu triger kayışı dağılması', risk: 'Yüksek', cost: '25.000 - 90.000 TL', note: 'Bu motorun en bilinen ve en pahalı kusuru: kayış parçacıkları yağ süzgecini tıkayıp motoru götürür.' },
      { title: 'Aşırı yağ tüketimi', risk: 'Orta', cost: '15.000 - 60.000 TL', note: '' },
      { title: 'Devirdaim/termostat kaçağı', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'psa-dw10',
    family: 'DW10',
    name: '2.0 HDi / BlueHDi',
    aliases: ['2.0 HDi','2.0 BlueHDi','2.0 Multijet'],
    codes: ['DW10BTED4', 'DW10FC'],
    group: 'Stellantis-PSA',
    displacement: 1997,
    fuel: 'Dizel',
    power: '136 - 180 HP',
    torque: '320 - 400 Nm',
    years: '2004 - 2022',
    usedIn: ['Peugeot 508', 'Peugeot 3008', 'Citroen C5', 'Opel Insignia', 'Ford Mondeo'],
    durability: 82,
    maintenance: { oilKm: 20000, timing: 'Kayış · 180.000 km', note: '' },
    problems: [
      { title: 'AdBlue sistemi arızası', risk: 'Orta', cost: '6.000 - 25.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '4.000 - 30.000 TL', note: '' },
      { title: 'Turbo aktüatör arızası', risk: 'Düşük', cost: '6.000 - 20.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // FORD
  // ==========================================================================
  {
    id: 'ford-ecoboost-10',
    family: 'EcoBoost (Fox)',
    name: '1.0 EcoBoost',
    codes: ['M1DA', 'M2DA', 'B7DA'],
    group: 'Ford',
    displacement: 999,
    fuel: 'Benzin',
    power: '100 - 155 HP',
    torque: '170 - 240 Nm',
    years: '2012 - 2022',
    usedIn: ['Ford Fiesta', 'Ford Focus', 'Ford EcoSport', 'Ford Puma', 'Ford Kuga'],
    durability: 60,
    maintenance: { oilKm: 15000, timing: 'Yağ banyolu kayış · 150.000 km', note: 'Kayış ve devirdaim birlikte değerlendirilmelidir.' },
    problems: [
      { title: 'Yağ banyolu triger kayışı dağılması', risk: 'Yüksek', cost: '20.000 - 70.000 TL', note: 'Kayış parçacıkları yağ süzgecini tıkar.' },
      { title: 'Soğutma sistemi hortum/degas arızası ve hararet', risk: 'Yüksek', cost: '10.000 - 60.000 TL', note: 'Üç silindirli bu motorda hararet silindir kapağı çatlağına yol açabilir; geri çağırma yapılmıştır.' },
      { title: 'Devirdaim arızası', risk: 'Orta', cost: '8.000 - 22.000 TL', note: '' }
    ]
  },
  {
    id: 'ford-tdci-15-16',
    family: 'DV/Duratorq TDCi',
    name: '1.5 / 1.6 TDCi',
    codes: ['XUGA', 'T1DA', 'UGJC'],
    group: 'Ford',
    displacement: 1560,
    fuel: 'Dizel',
    power: '90 - 120 HP',
    torque: '215 - 270 Nm',
    years: '2008 - 2021',
    usedIn: ['Ford Focus', 'Ford Fiesta', 'Ford C-Max', 'Ford Courier', 'Ford Connect'],
    durability: 70,
    maintenance: { oilKm: 15000, timing: 'Kayış · 150.000 km', note: 'PSA ile ortak DV6 tabanlıdır; turbo yağ borusu kritiktir.' },
    problems: [
      { title: 'Turbo yağ besleme borusu tıkanması', risk: 'Yüksek', cost: '10.000 - 32.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '4.000 - 28.000 TL', note: '' },
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '3.000 - 12.000 TL', note: '' }
    ]
  },
  {
    id: 'ford-tdci-20',
    family: 'Duratorq TDCi',
    name: '2.0 TDCi / EcoBlue',
    aliases: ['2.0 TDCi','2.0 EcoBlue','2.0 Duratorq'],
    codes: ['TXDA', 'T7CB', 'YLF6'],
    group: 'Ford',
    displacement: 1997,
    fuel: 'Dizel',
    power: '115 - 190 HP',
    torque: '300 - 400 Nm',
    years: '2007 - 2023',
    usedIn: ['Ford Focus', 'Ford Mondeo', 'Ford Kuga', 'Ford Transit', 'Ford S-Max'],
    durability: 80,
    maintenance: { oilKm: 20000, timing: 'Kayış/Zincir (nesle göre)', note: '' },
    problems: [
      { title: 'DPF tıkanması', risk: 'Orta', cost: '5.000 - 35.000 TL', note: '' },
      { title: 'EGR ve turbo aktüatör arızası', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '8.000 - 30.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // TOYOTA / LEXUS
  // ==========================================================================
  {
    id: 'toyota-2zr-fxe',
    family: 'Hybrid Synergy',
    name: '1.8 Hibrit (2ZR-FXE)',
    codes: ['2ZR-FXE'],
    group: 'Toyota',
    displacement: 1798,
    fuel: 'Hibrit',
    power: '98 - 122 HP (sistem)',
    torque: '142 Nm',
    years: '2009 - 2024',
    usedIn: ['Toyota Corolla', 'Toyota Auris', 'Toyota Prius', 'Toyota C-HR', 'Lexus CT200h'],
    durability: 92,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Hibrit sistemde fren balatası çok uzun ömürlüdür; hibrit batarya fanı temiz tutulmalı.' },
    problems: [
      { title: 'Hibrit batarya kapasite kaybı', risk: 'Orta', cost: '25.000 - 90.000 TL', note: 'Genellikle 250.000 km sonrası; hücre yenileme mümkündür.' },
      { title: 'EGR valfi kurumlanması (Prius)', risk: 'Düşük', cost: '4.000 - 12.000 TL', note: '' },
      { title: 'Su pompası (elektrikli) arızası', risk: 'Düşük', cost: '6.000 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'toyota-1nd-tv',
    family: '1ND',
    name: '1.4 D-4D',
    codes: ['1ND-TV'],
    group: 'Toyota',
    displacement: 1364,
    fuel: 'Dizel',
    power: '90 HP',
    torque: '205 Nm',
    years: '2002 - 2018',
    usedIn: ['Toyota Yaris', 'Toyota Auris', 'Toyota Corolla', 'Toyota Urban Cruiser'],
    durability: 76,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '6.000 - 22.000 TL', note: '' },
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '3.000 - 10.000 TL', note: '' },
      { title: 'DPF tıkanması (2011 sonrası)', risk: 'Orta', cost: '4.000 - 25.000 TL', note: '' }
    ]
  },
  {
    id: 'toyota-1nz-fe',
    family: 'NZ',
    name: '1.3 / 1.5 VVT-i',
    aliases: ['1.5 Benzin','1.3 VVT-i','1.5 VVT-i','1.5 Dual VVT-i'],
    codes: ['1NZ-FE', '2NZ-FE'],
    group: 'Toyota',
    displacement: 1497,
    fuel: 'Benzin',
    power: '87 - 110 HP',
    torque: '122 - 141 Nm',
    years: '1999 - 2019',
    usedIn: ['Toyota Yaris', 'Toyota Corolla', 'Toyota Auris'],
    durability: 92,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Bakımı yapıldığında çok uzun ömürlü, düşük maliyetli motor.' },
    problems: [
      { title: 'Ateşleme bobini arızası', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' },
      { title: 'Rölanti dalgalanması (gaz kelebeği kirlenmesi)', risk: 'Düşük', cost: '1.500 - 5.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // HYUNDAI / KIA
  // ==========================================================================
  {
    id: 'hyundai-d4fb',
    family: 'U-Line',
    name: '1.6 CRDi',
    codes: ['D4FB', 'D4FC'],
    group: 'Hyundai-Kia',
    displacement: 1582,
    fuel: 'Dizel',
    power: '110 - 136 HP',
    torque: '260 - 320 Nm',
    years: '2006 - 2022',
    usedIn: ['Hyundai i30', 'Hyundai Tucson', 'Hyundai Elantra', 'Kia Ceed', 'Kia Sportage'],
    durability: 80,
    maintenance: { oilKm: 15000, timing: 'Kayış/Zincir (nesle göre)', note: '' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '6.000 - 25.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '4.000 - 30.000 TL', note: '' },
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '3.000 - 12.000 TL', note: '' }
    ]
  },
  {
    id: 'hyundai-theta2',
    family: 'Theta II',
    name: '2.0 / 2.4 GDI',
    aliases: ['2.0 GDI','2.4 GDI','2.0 Benzin'],
    codes: ['G4KD', 'G4KE', 'G4KJ'],
    group: 'Hyundai-Kia',
    displacement: 1998,
    fuel: 'Benzin',
    power: '150 - 200 HP',
    torque: '190 - 240 Nm',
    years: '2009 - 2019',
    usedIn: ['Hyundai Sonata', 'Hyundai Tucson', 'Hyundai Santa Fe', 'Kia Sportage', 'Kia Optima'],
    durability: 54,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Yağ bakımı bu motorda kritiktir.' },
    problems: [
      { title: 'Kol yatağı (rod bearing) arızası — motor kilitlenmesi', risk: 'Yüksek', cost: '60.000 - 150.000 TL', note: 'Üretim artığı kaynaklı, dünya çapında geri çağırma yapılmıştır. Motordan tıkırtı geliyorsa uzak dur.' },
      { title: 'Aşırı yağ tüketimi', risk: 'Yüksek', cost: '20.000 - 80.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi (GDI)', risk: 'Orta', cost: '5.000 - 14.000 TL', note: '' }
    ]
  },
  {
    id: 'hyundai-gamma',
    family: 'Gamma',
    name: '1.4 / 1.6 MPI / GDI / T-GDI',
    codes: ['G4FA', 'G4FD', 'G4FJ'],
    group: 'Hyundai-Kia',
    displacement: 1591,
    fuel: 'Benzin',
    power: '100 - 204 HP',
    torque: '137 - 265 Nm',
    years: '2010 - 2023',
    usedIn: ['Hyundai i20', 'Hyundai i30', 'Hyundai Elantra', 'Kia Ceed', 'Kia Rio'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Emme supabı karbon birikimi (GDI)', risk: 'Orta', cost: '4.000 - 12.000 TL', note: '' },
      { title: 'Yüksek basınç yakıt pompası sesi/arızası (GDI)', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Ateşleme bobini arızası', risk: 'Düşük', cost: '2.000 - 7.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // FIAT / TOFAŞ
  // ==========================================================================
  {
    id: 'fiat-multijet-13',
    family: 'SDE Multijet',
    name: '1.3 Multijet',
    codes: ['199A2000', '330A1000'],
    group: 'Stellantis-Fiat',
    displacement: 1248,
    fuel: 'Dizel',
    power: '75 - 95 HP',
    torque: '190 - 200 Nm',
    years: '2003 - 2020',
    usedIn: ['Fiat Punto', 'Fiat Doblo', 'Fiat Egea', 'Opel Corsa', 'Lancia Ypsilon'],
    durability: 68,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Yağ bakımı ihmal edilirse zincir ve turbo birlikte etkilenir.' },
    problems: [
      { title: 'Turbo arızası (yağ besleme kaynaklı)', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '2.500 - 9.000 TL', note: '' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '5.000 - 18.000 TL', note: '' },
      { title: 'DPF tıkanması (2011 sonrası)', risk: 'Orta', cost: '3.000 - 22.000 TL', note: '' }
    ]
  },
  {
    id: 'fiat-multijet-16',
    family: 'JTD Multijet',
    name: '1.6 Multijet',
    aliases: ['1.6 JTDm','1.6 JTD','1.6 Multijet II'],
    codes: ['198A2000', '55260384'],
    group: 'Stellantis-Fiat',
    displacement: 1598,
    fuel: 'Dizel',
    power: '105 - 120 HP',
    torque: '290 - 320 Nm',
    years: '2008 - 2022',
    usedIn: ['Fiat Egea', 'Fiat Doblo', 'Fiat 500X', 'Jeep Renegade', 'Alfa Romeo Giulietta'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: 'Türkiye\'de çok yaygın; parça ve usta erişimi kolaydır.' },
    problems: [
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '3.000 - 10.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '3.000 - 25.000 TL', note: '' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '6.000 - 20.000 TL', note: '' }
    ]
  },
  {
    id: 'fiat-fire',
    family: 'FIRE',
    name: '1.2 / 1.4 FIRE',
    codes: ['169A4000', '350A1000'],
    group: 'Stellantis-Fiat',
    displacement: 1368,
    fuel: 'Benzin',
    power: '69 - 95 HP',
    torque: '102 - 127 Nm',
    years: '1995 - 2020',
    usedIn: ['Fiat Punto', 'Fiat Linea', 'Fiat Egea', 'Fiat Panda', 'Fiat Albea'],
    durability: 88,
    maintenance: { oilKm: 15000, timing: 'Kayış · 100.000 km', note: 'Basit ve çok ucuz bakımlı; Türkiye\'de en yaygın benzinli motorlardan.' },
    problems: [
      { title: 'Rölanti dalgalanması (gaz kelebeği/rölanti motoru)', risk: 'Düşük', cost: '1.500 - 5.000 TL', note: '' },
      { title: 'Devirdaim kaçağı', risk: 'Düşük', cost: '2.500 - 8.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // HONDA
  // ==========================================================================
  {
    id: 'honda-15-vtec-turbo',
    family: 'L15',
    name: '1.5 VTEC Turbo',
    codes: ['L15B7', 'L15BE'],
    group: 'Honda',
    displacement: 1498,
    fuel: 'Benzin',
    power: '173 - 182 HP',
    torque: '220 - 240 Nm',
    years: '2016 - 2023',
    usedIn: ['Honda Civic', 'Honda CR-V', 'Honda Accord'],
    durability: 74,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Kısa mesafe kullanımda yağ seyrelmesi nedeniyle yağ bakımı sık yapılmalı.' },
    problems: [
      { title: 'Yağa yakıt karışması (yağ seyrelmesi)', risk: 'Orta', cost: '3.000 - 25.000 TL', note: 'Soğuk iklimde ve kısa mesafede belirgin; yağ seviyesinin artması tipik belirtidir.' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '5.000 - 14.000 TL', note: '' }
    ]
  },
  {
    id: 'honda-16-idtec',
    family: 'N16',
    name: '1.6 i-DTEC',
    codes: ['N16A1'],
    group: 'Honda',
    displacement: 1597,
    fuel: 'Dizel',
    power: '120 HP',
    torque: '300 Nm',
    years: '2012 - 2021',
    usedIn: ['Honda Civic', 'Honda CR-V', 'Honda HR-V'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'DPF tıkanması', risk: 'Orta', cost: '4.000 - 28.000 TL', note: '' },
      { title: 'EGR valfi kurumlanması', risk: 'Düşük', cost: '3.000 - 10.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // OPEL (PSA ÖNCESİ) / VOLVO / SKODA ÖZEL
  // ==========================================================================
  {
    id: 'opel-cdti-17',
    family: 'Circle L / JTD',
    name: '1.3 / 1.7 CDTI',
    aliases: ['1.7 CDTI','1.3 CDTI','1.3 Multijet'],
    codes: ['Z17DTH', 'A17DTS'],
    group: 'Opel',
    displacement: 1686,
    fuel: 'Dizel',
    power: '100 - 130 HP',
    torque: '260 - 300 Nm',
    years: '2003 - 2015',
    usedIn: ['Opel Astra', 'Opel Corsa', 'Opel Meriva', 'Opel Zafira'],
    durability: 72,
    maintenance: { oilKm: 15000, timing: 'Kayış · 150.000 km', note: 'Isuzu tabanlı, sağlam yapılı bir motordur.' },
    problems: [
      { title: 'EGR valfi kurumlanması', risk: 'Orta', cost: '3.000 - 10.000 TL', note: '' },
      { title: 'Turbo aktüatör arızası', risk: 'Orta', cost: '6.000 - 20.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '4.000 - 25.000 TL', note: '' }
    ]
  },
  {
    id: 'volvo-vea-d4',
    family: 'VEA',
    name: '2.0 D3 / D4',
    codes: ['D4204T', 'D4204T14'],
    group: 'Volvo',
    displacement: 1969,
    fuel: 'Dizel',
    power: '150 - 190 HP',
    torque: '350 - 400 Nm',
    years: '2013 - 2022',
    usedIn: ['Volvo V40', 'Volvo S60', 'Volvo XC60', 'Volvo XC90'],
    durability: 80,
    maintenance: { oilKm: 20000, timing: 'Yağ banyolu kayış · 180.000 km', note: '' },
    problems: [
      { title: 'Yağ banyolu triger kayışı bozulması', risk: 'Orta', cost: '15.000 - 50.000 TL', note: '' },
      { title: 'AdBlue ve DPF sistemi arızası', risk: 'Orta', cost: '8.000 - 35.000 TL', note: '' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '10.000 - 35.000 TL', note: '' }
    ]
  }
,

  // ==========================================================================
  // VAG — ESKİ NESİL VE ATMOSFERİK MOTORLAR
  // Türkiye ikinci el pazarının çok büyük bölümünü bu motorlar oluşturur.
  // ==========================================================================
  {
    id: 'vag-pd-19tdi',
    family: 'EA188',
    name: '1.9 TDI',
    aliases: ['1.9 TDI PD', '1.9 TDI (PD)'],
    codes: ['BXE', 'BKC', 'BLS', 'AXR', 'ATD', 'ASZ', 'AVF'],
    group: 'VAG',
    displacement: 1896,
    fuel: 'Dizel',
    power: '90 - 160 HP',
    torque: '210 - 330 Nm',
    years: '1999 - 2010',
    usedIn: ['VW Golf 4/5', 'VW Passat B5/B6', 'Skoda Octavia', 'Seat Leon/Ibiza', 'Audi A3/A4'],
    durability: 88,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: 'Kayış atlaması bu motorda supap eğer; kayış aralığı kesinlikle uzatılmamalı.' },
    problems: [
      { title: 'Pompa enjektör (PD) arızası', risk: 'Orta', cost: '8.000 - 30.000 TL', note: 'Rölantide düzensiz çalışma ve duman ilk belirtidir.' },
      { title: 'Turbo kanatçık (VNT) yapışması', risk: 'Orta', cost: '8.000 - 25.000 TL', note: 'Kurumlanma nedeniyle güç kaybı yapar.' },
      { title: 'Volan (çift kütleli) aşınması', risk: 'Orta', cost: '20.000 - 45.000 TL', note: '' },
      { title: 'Eksantrik mili aşınması (BXE/BKC)', risk: 'Orta', cost: '15.000 - 40.000 TL', note: 'Yağ bakımı ihmal edilen araçlarda görülür.' }
    ]
  },
  {
    id: 'vag-14tdi-3cyl',
    family: 'EA288 3 silindir',
    name: '1.4 TDI',
    codes: ['CUSB', 'DGTA', 'CXMA'],
    group: 'VAG',
    displacement: 1422,
    fuel: 'Dizel',
    power: '75 - 90 HP',
    torque: '210 - 230 Nm',
    years: '2014 - 2020',
    usedIn: ['Skoda Fabia', 'Skoda Rapid', 'VW Polo', 'Seat Ibiza'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Kayış · 180.000 km', note: '' },
    problems: [
      { title: 'DPF tıkanması (kısa mesafede)', risk: 'Orta', cost: '4.000 - 30.000 TL', note: 'Küçük dizel motorlarda şehir içi kullanım DPF ömrünü kısaltır.' },
      { title: 'EGR kurumlanması', risk: 'Orta', cost: '3.000 - 12.000 TL', note: '' },
      { title: '3 silindir titreşimi', risk: 'Düşük', cost: '0 TL', note: 'Motor karakteridir, arıza değildir.' }
    ]
  },
  {
    id: 'vag-fsi',
    family: 'FSI',
    name: '1.6 FSI / 2.0 FSI',
    codes: ['BLF', 'BAG', 'BLR', 'BVY', 'BVX'],
    group: 'VAG',
    displacement: 1598,
    fuel: 'Benzin',
    power: '115 - 150 HP',
    torque: '155 - 200 Nm',
    years: '2003 - 2009',
    usedIn: ['VW Golf 5', 'VW Passat B6', 'Audi A3 8P', 'Audi A4 B7', 'Skoda Octavia 2'],
    durability: 68,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Emme supabı karbon birikimi', risk: 'Yüksek', cost: '8.000 - 25.000 TL', note: 'Direkt enjeksiyonun klasik sorunu; ceviz kabuğu ile temizlik gerektirir.' },
      { title: 'Emme manifoldu kelebek motoru arızası', risk: 'Orta', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Yüksek basınç yakıt pompası arızası', risk: 'Orta', cost: '8.000 - 22.000 TL', note: '' }
    ]
  },
  {
    id: 'vag-18t-20v',
    family: '20V Turbo',
    name: '1.8 T',
    aliases: ['1.8 T (20V)', '1.8 Turbo', '1.8 20V'],
    codes: ['AGU', 'AUM', 'AWT', 'BFB', 'BEX'],
    group: 'VAG',
    displacement: 1781,
    fuel: 'Benzin',
    power: '150 - 225 HP',
    torque: '210 - 280 Nm',
    years: '1996 - 2008',
    usedIn: ['Audi A4 B5/B6', 'Audi A3 8L', 'VW Passat B5', 'VW Golf 4 GTI', 'Seat Leon Cupra'],
    durability: 74,
    maintenance: { oilKm: 10000, timing: 'Kayış · 90.000 km', note: 'Yağ kalitesi bu motorda kritik; ucuz yağ turboyu ve yağ kanallarını tıkar.' },
    problems: [
      { title: 'Yağ çamurlaşması (sludge)', risk: 'Yüksek', cost: '15.000 - 60.000 TL', note: 'Bu motorun en bilinen kusuru; ihmal edilen yağ bakımı motoru bitirir.' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Ateşleme bobini arızası', risk: 'Orta', cost: '3.000 - 10.000 TL', note: 'Geri çağırma yapılmıştır.' },
      { title: 'Kam mili takip ünitesi ve su pompası', risk: 'Orta', cost: '6.000 - 18.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // BMW — EKSİK NESİLLER
  // ==========================================================================
  {
    id: 'bmw-m47',
    family: 'M47',
    name: '2.0d (M47)',
    aliases: ['320d (M47)', '2.0 dizel'],
    designations: ['318d', '320d', '520d', '18d', '20d'],
    codes: ['M47D20', 'M47TU'],
    group: 'BMW',
    displacement: 1995,
    fuel: 'Dizel',
    power: '116 - 163 HP',
    torque: '265 - 340 Nm',
    years: '1998 - 2007',
    usedIn: ['BMW 3 Serisi E46', 'BMW 5 Serisi E39/E60', 'BMW X3 E83'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'N47\'nin aksine zincir sorunu bu motorda yaygın değildir.' },
    problems: [
      { title: 'Emme manifoldu girdap kelebeği kırılması', risk: 'Yüksek', cost: '8.000 - 30.000 TL', note: 'Kırılan kelebek motora kaçarsa hasar çok büyür; sökülüp iptal edilmesi yaygındır.' },
      { title: 'Turbo kanatçık yapışması', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'EGR ve yağ ayırıcı tıkanması', risk: 'Orta', cost: '4.000 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-m57',
    family: 'M57',
    name: '3.0d (M57)',
    designations: ['330d', '530d', '730d', '30d', 'x5 3.0d'],
    codes: ['M57D30', 'M57TU'],
    group: 'BMW',
    displacement: 2993,
    fuel: 'Dizel',
    power: '184 - 286 HP',
    torque: '390 - 580 Nm',
    years: '1998 - 2011',
    usedIn: ['BMW 3 Serisi E46/E90', 'BMW 5 Serisi E39/E60', 'BMW 7 Serisi E65', 'BMW X5 E53/E70'],
    durability: 86,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Doğru bakıldığında çok yüksek kilometrelere çıkan bir motordur.' },
    problems: [
      { title: 'Emme manifoldu girdap kelebeği', risk: 'Yüksek', cost: '10.000 - 35.000 TL', note: '' },
      { title: 'Turbo aktüatör ve kanatçık arızası', risk: 'Orta', cost: '15.000 - 45.000 TL', note: '' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '10.000 - 35.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-m54-m52',
    family: 'M52/M54',
    name: '2.0i / 2.5i / 3.0i',
    aliases: ['320i / 325i (M54)', '2.5i', '3.0i'],
    designations: ['320i', '323i', '325i', '328i', '330i', '520i', '523i', '525i', '530i'],
    codes: ['M54B25', 'M54B30', 'M52B25', 'M54B22'],
    group: 'BMW',
    displacement: 2494,
    fuel: 'Benzin',
    power: '150 - 231 HP',
    torque: '190 - 300 Nm',
    years: '1998 - 2006',
    usedIn: ['BMW 3 Serisi E46', 'BMW 5 Serisi E39/E60', 'BMW X3 E83', 'BMW Z4'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Sıralı 6 silindir; dayanıklı ama plastik parçaları yaşlanır.' },
    problems: [
      { title: 'Soğutma sistemi plastik parçalarının kırılması', risk: 'Yüksek', cost: '8.000 - 25.000 TL', note: 'Radyatör, genleşme kabı ve termostat yuvası yaşla çatlar; motor hararet yaparsa silindir kapağı gider.' },
      { title: 'Vanos ünitesi sesi ve arızası', risk: 'Orta', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'Karter ve subap kapağı conta kaçağı', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' },
      { title: 'DISA emme manifoldu klapesi kırılması', risk: 'Orta', cost: '4.000 - 12.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-n42-m43',
    family: 'M43/N42/N46',
    name: '1.6i / 1.8i / 2.0i',
    aliases: ['316i / 318i (N42/M43)', '316i', '318i'],
    designations: ['316i', '318i', '320i'],
    codes: ['M43B16', 'M43B19', 'N42B18', 'N42B20'],
    group: 'BMW',
    displacement: 1796,
    fuel: 'Benzin',
    power: '105 - 143 HP',
    torque: '150 - 200 Nm',
    years: '1998 - 2007',
    usedIn: ['BMW 3 Serisi E46', 'BMW 1 Serisi E87'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Valvetronic ünitesi arızası (N42)', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'Triger zinciri sesi', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Soğutma sistemi plastik parçaları', risk: 'Orta', cost: '6.000 - 20.000 TL', note: '' },
      { title: 'Yağ tüketimi', risk: 'Orta', cost: '8.000 - 40.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-n13-b38',
    family: 'N13/B38',
    name: '1.5i / 1.6i',
    aliases: ['116i / 118i (N13/B38)', '218i (B38)'],
    designations: ['116i', '118i', '218i', '318i', '116', '118'],
    codes: ['N13B16', 'B38A15'],
    group: 'BMW',
    displacement: 1499,
    fuel: 'Benzin',
    power: '102 - 170 HP',
    torque: '180 - 250 Nm',
    years: '2011 - 2022',
    usedIn: ['BMW 1 Serisi F20', 'BMW 2 Serisi F45', 'BMW 3 Serisi F30', 'Mini Cooper'],
    durability: 72,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Emme supabı karbon birikimi (N13)', risk: 'Orta', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Triger zinciri gergi arızası (N13)', risk: 'Orta', cost: '18.000 - 45.000 TL', note: 'Erken üretimlerde bildirilmiştir.' },
      { title: 'Yüksek basınç yakıt pompası arızası', risk: 'Orta', cost: '10.000 - 25.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-n52',
    family: 'N52',
    name: '2.5i / 3.0i (N52)',
    aliases: ['523i / 525i (N52)'],
    designations: ['523i', '525i', '528i', '530i', '325i', '328i', '330i', '130i'],
    codes: ['N52B25', 'N52B30'],
    group: 'BMW',
    displacement: 2996,
    fuel: 'Benzin',
    power: '177 - 272 HP',
    torque: '230 - 320 Nm',
    years: '2004 - 2013',
    usedIn: ['BMW 3 Serisi E90', 'BMW 5 Serisi E60/F10', 'BMW X1', 'BMW X3', 'BMW Z4'],
    durability: 80,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Atmosferik sıralı 6; turbolulara göre dertsizdir.' },
    problems: [
      { title: 'Subap kapağı contası ve yağ kaçağı', risk: 'Orta', cost: '6.000 - 18.000 TL', note: 'Bu motorda neredeyse standart bir bakım kalemidir.' },
      { title: 'Elektrikli devirdaim arızası', risk: 'Orta', cost: '10.000 - 28.000 TL', note: 'Arıza anında hararet yapar; ani ve habersiz bozulur.' },
      { title: 'Valvetronic motoru arızası', risk: 'Düşük', cost: '8.000 - 22.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-b57',
    family: 'B57',
    name: '3.0d (B57)',
    aliases: ['xDrive30d (B57)'],
    designations: ['30d', '730d', '530d', '640d', 'x5 30d'],
    codes: ['B57D30'],
    group: 'BMW',
    displacement: 2993,
    fuel: 'Dizel',
    power: '249 - 400 HP',
    torque: '620 - 760 Nm',
    years: '2015 - 2024',
    usedIn: ['BMW 5 Serisi G30', 'BMW 7 Serisi G11', 'BMW X5 G05', 'BMW X7'],
    durability: 86,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'EGR soğutucusu arızası', risk: 'Orta', cost: '12.000 - 35.000 TL', note: 'Geri çağırma kaydı sorulmalı.' },
      { title: 'AdBlue sistemi arızası', risk: 'Orta', cost: '10.000 - 35.000 TL', note: '' }
    ]
  },
  {
    id: 'bmw-b58',
    family: 'B58',
    name: '3.0i (B58)',
    aliases: ['xDrive40i (B58)'],
    designations: ['40i', '540i', '340i', 'm340i', 'x5 40i'],
    codes: ['B58B30'],
    group: 'BMW',
    displacement: 2998,
    fuel: 'Benzin',
    power: '306 - 387 HP',
    torque: '450 - 500 Nm',
    years: '2015 - 2024',
    usedIn: ['BMW 3 Serisi G20', 'BMW 5 Serisi G30', 'BMW X5', 'Toyota Supra'],
    durability: 88,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: 'Modern BMW motorları arasında en güvenilir kabul edilenlerden.' },
    problems: [
      { title: 'Soğutma sistemi conta kaçağı', risk: 'Düşük', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'Yüksek yakıt tüketimi (kullanım tarzına bağlı)', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil, motor karakteri.' }
    ]
  },
  {
    id: 'bmw-n63',
    family: 'N63',
    name: '4.4 V8 Turbo (N63)',
    aliases: ['740i / 750i (N63)', 'xDrive50i (N63)'],
    designations: ['750i', '550i', '650i', '50i', 'x5 50i'],
    codes: ['N63B44'],
    group: 'BMW',
    displacement: 4395,
    fuel: 'Benzin',
    power: '407 - 530 HP',
    torque: '600 - 750 Nm',
    years: '2008 - 2019',
    usedIn: ['BMW 7 Serisi F01', 'BMW 5 Serisi F10', 'BMW X5', 'BMW X6'],
    durability: 54,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Turbolar V yatağının içindedir; ısı yönetimi bu motorun zayıf noktasıdır.' },
    problems: [
      { title: 'Aşırı yağ tüketimi', risk: 'Yüksek', cost: '20.000 - 100.000 TL', note: 'BMW bu motor için kapsamlı bir "müşteri memnuniyeti" programı yürütmüştür; yapılıp yapılmadığı sorulmalı.' },
      { title: 'Turbo arızası', risk: 'Yüksek', cost: '80.000 - 250.000 TL', note: 'V yatağındaki turbolar hem pahalı hem işçiliği ağırdır.' },
      { title: 'Valve stem seal (supap keçesi) aşınması', risk: 'Yüksek', cost: '60.000 - 180.000 TL', note: 'Mavi duman ilk belirtidir.' },
      { title: 'Enjektör ve yüksek basınç pompası arızası', risk: 'Orta', cost: '25.000 - 70.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // MERCEDES-BENZ — EKSİK NESİLLER
  // ==========================================================================
  {
    id: 'mb-om646',
    family: 'OM611/OM646',
    name: '2.1 CDI (OM646)',
    aliases: ['220 CDI', 'C200 CDI (OM611/OM646)', 'E200 CDI / E220 CDI (OM646)', '2.2 CDI'],
    designations: ['200 cdi', '220 cdi', 'c200 cdi', 'c220 cdi', 'e200 cdi', 'e220 cdi'],
    codes: ['OM646', 'OM611', 'OM612'],
    group: 'Mercedes-Benz',
    displacement: 2148,
    fuel: 'Dizel',
    power: '116 - 170 HP',
    torque: '250 - 400 Nm',
    years: '1998 - 2009',
    usedIn: ['Mercedes C Serisi W203', 'Mercedes E Serisi W211', 'Mercedes Vito', 'Mercedes Sprinter'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'OM651\'e göre belirgin biçimde dertsiz kabul edilir.' },
    problems: [
      { title: 'Enjektör bakır pul kaçağı (kurumlanma)', risk: 'Orta', cost: '6.000 - 20.000 TL', note: 'Enjektör yuvasında kurum birikir; geç kalınırsa enjektör yuvada sıkışır.' },
      { title: 'Turbo aktüatör arızası', risk: 'Orta', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'Yağ soğutucusu conta kaçağı', risk: 'Orta', cost: '6.000 - 18.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-om607',
    family: 'OM607',
    name: '1.5 CDI (OM607)',
    aliases: ['180 CDI', 'CLA180d / CLA200d', 'A180d'],
    designations: ['a180d', 'cla180d', 'b180d', '180d'],
    codes: ['OM607', 'OM607.951'],
    group: 'Mercedes-Benz',
    displacement: 1461,
    fuel: 'Dizel',
    power: '90 - 116 HP',
    torque: '230 - 260 Nm',
    years: '2013 - 2019',
    usedIn: ['Mercedes A Serisi W176', 'Mercedes B Serisi', 'Mercedes CLA C117'],
    durability: 70,
    maintenance: { oilKm: 15000, timing: 'Kayış', note: 'Bu motor Renault K9K tabanlıdır; yedek parçası Mercedes fiyatından gelir.' },
    problems: [
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: 'K9K ailesinin bilinen zayıf noktası; yağ bakımı kritiktir.' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '6.000 - 30.000 TL', note: 'Şehir içi kullanımda belirginleşir.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-m270-m260',
    family: 'M270/M260',
    name: '1.6 / 2.0 Turbo (M270)',
    aliases: ['A180 / A200 (M270)', 'CLA180 / CLA200', 'A200 (M270)'],
    designations: ['a180', 'a200', 'a250', 'cla180', 'cla200', 'cla250', 'b180', 'b200'],
    codes: ['M270.910', 'M270.920', 'M260'],
    group: 'Mercedes-Benz',
    displacement: 1595,
    fuel: 'Benzin',
    power: '122 - 224 HP',
    torque: '200 - 350 Nm',
    years: '2012 - 2019',
    usedIn: ['Mercedes A Serisi W176', 'Mercedes B Serisi W246', 'Mercedes CLA C117', 'Mercedes GLA X156'],
    durability: 76,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Triger zinciri gergisi ve ses', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Orta', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Turbo yağ besleme borusu tıkanması', risk: 'Orta', cost: '10.000 - 30.000 TL', note: 'Yağ bakımı aksatılan araçlarda görülür.' }
    ]
  },
  {
    id: 'mb-m282',
    family: 'M282',
    name: '1.3 Turbo (M282)',
    aliases: ['A200 (M282)', 'A180 (M282)'],
    designations: ['a180', 'a200', 'b180', 'b200', 'gla200', 'cla200'],
    codes: ['M282.914'],
    group: 'Mercedes-Benz',
    displacement: 1332,
    fuel: 'Benzin',
    power: '136 - 163 HP',
    torque: '200 - 250 Nm',
    years: '2018 - 2024',
    usedIn: ['Mercedes A Serisi W177', 'Mercedes B Serisi W247', 'Mercedes GLA H247', 'Mercedes CLA C118'],
    durability: 72,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Bu motor Renault-PSA ortak geliştirmesi olan 1.3 turbo tabanlıdır.' },
    problems: [
      { title: 'Emme supabı karbon birikimi', risk: 'Orta', cost: '8.000 - 20.000 TL', note: '' },
      { title: 'Turbo aktüatör arızası', risk: 'Düşük', cost: '10.000 - 28.000 TL', note: '' },
      { title: 'Silindir devre dışı bırakma sistemi şikayetleri', risk: 'Düşük', cost: '0 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-m264',
    family: 'M264/M254',
    name: '2.0 Turbo (M264)',
    aliases: ['E200 (M264)', 'C200 Mild Hybrid (M254)', 'C200 (M264)'],
    designations: ['c200', 'e200', 'c300', 'e300', 'gle300'],
    codes: ['M264.920', 'M254'],
    group: 'Mercedes-Benz',
    displacement: 1991,
    fuel: 'Benzin',
    power: '184 - 272 HP',
    torque: '280 - 400 Nm',
    years: '2018 - 2024',
    usedIn: ['Mercedes C Serisi W205/W206', 'Mercedes E Serisi W213', 'Mercedes GLC'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '48V hafif hibrit sistemi (EQ Boost) ile birlikte çalışır.' },
    problems: [
      { title: '48V starter-jeneratör arızası', risk: 'Orta', cost: '25.000 - 70.000 TL', note: 'Hafif hibrit sistemin en pahalı parçasıdır.' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '8.000 - 20.000 TL', note: '' }
    ]
  },
  {
    id: 'mb-om656',
    family: 'OM656',
    name: '3.0d Sıralı 6 (OM656)',
    aliases: ['350d', '400d'],
    designations: ['350d', '400d', 'e350d', 'e400d', 'gle350d'],
    codes: ['OM656.929'],
    group: 'Mercedes-Benz',
    displacement: 2925,
    fuel: 'Dizel',
    power: '286 - 340 HP',
    torque: '600 - 700 Nm',
    years: '2017 - 2024',
    usedIn: ['Mercedes E Serisi W213', 'Mercedes S Serisi W222', 'Mercedes GLE', 'Mercedes GLS'],
    durability: 86,
    maintenance: { oilKm: 20000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'AdBlue/SCR sistemi arızası', risk: 'Orta', cost: '15.000 - 50.000 TL', note: '' },
      { title: 'Elektrikli kompresör (eBooster) arızası', risk: 'Düşük', cost: '30.000 - 80.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // RENAULT / DACIA / NISSAN — EKSİK MOTORLAR
  // ==========================================================================
  {
    id: 'renault-d4f-d7f',
    family: 'D4F/D7F',
    name: '1.2 16V',
    aliases: ['1.2 Benzin', '1.2 8V'],
    codes: ['D4F', 'D7F'],
    group: 'Renault-Nissan',
    displacement: 1149,
    fuel: 'Benzin',
    power: '58 - 75 HP',
    torque: '93 - 105 Nm',
    years: '1996 - 2016',
    usedIn: ['Renault Clio', 'Renault Symbol', 'Renault Twingo', 'Dacia Sandero'],
    durability: 76,
    maintenance: { oilKm: 10000, timing: 'Kayış · 120.000 km', note: 'Küçük hacimli, basit ve ucuz bakımlı bir motordur.' },
    problems: [
      { title: 'Bobin ve buji arızası', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' },
      { title: 'Rölanti düzensizliği (gaz kelebeği kirlenmesi)', risk: 'Düşük', cost: '1.500 - 5.000 TL', note: '' },
      { title: 'Düşük çekiş gücü', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; klimayla birlikte belirginleşen motor karakteri.' }
    ]
  },
  {
    id: 'renault-k4j-k7m',
    family: 'K4J/K4M/K7M',
    name: '1.4 16V / 1.6 16V',
    aliases: ['1.4 Benzin', '1.4 8V', '1.6 8V'],
    codes: ['K4J', 'K7M', 'K7J'],
    group: 'Renault-Nissan',
    displacement: 1390,
    fuel: 'Benzin',
    power: '75 - 110 HP',
    torque: '110 - 150 Nm',
    years: '1998 - 2016',
    usedIn: ['Renault Megane', 'Renault Clio', 'Renault Symbol', 'Dacia Logan', 'Dacia Duster'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: 'Türkiye\'de parça ve usta bulmanın en kolay olduğu motor ailelerinden.' },
    problems: [
      { title: 'Bobin arızası', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' },
      { title: 'Devirdaim ve triger kayışı', risk: 'Orta', cost: '5.000 - 12.000 TL', note: 'Kayış atlarsa supap eğer; aralık uzatılmamalı.' },
      { title: 'Rölanti motoru/gaz kelebeği kirlenmesi', risk: 'Düşük', cost: '1.500 - 5.000 TL', note: '' }
    ]
  },
  {
    id: 'renault-h4d-b4d',
    family: 'H4D/B4D',
    name: '1.0 TCe / 1.0 SCe',
    aliases: ['1.0 TCe (100 hp)', '1.0 SCe (65-72 hp)', '1.0 TCe X-Tronic', '1.0 Benzin'],
    codes: ['H4D', 'B4D', 'HR10DDT'],
    group: 'Renault-Nissan',
    displacement: 999,
    fuel: 'Benzin',
    power: '65 - 100 HP',
    torque: '95 - 160 Nm',
    years: '2017 - 2024',
    usedIn: ['Renault Clio 5', 'Renault Captur', 'Dacia Sandero', 'Dacia Duster', 'Nissan Micra'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: '3 silindir; turbolu (TCe) ve atmosferik (SCe) versiyonları vardır.' },
    problems: [
      { title: 'Turbo arızası (TCe)', risk: 'Orta', cost: '15.000 - 35.000 TL', note: 'Yağ bakımı geciktirilmemeli.' },
      { title: 'Zincir/kayış sesi ve titreşim', risk: 'Düşük', cost: '0 - 12.000 TL', note: '3 silindir titreşimi normaldir.' },
      { title: 'Atmosferik (SCe) versiyonda yetersiz çekiş', risk: 'Düşük', cost: '0 TL', note: 'Dolu araçta ve yokuşta zorlanır; arıza değil, kapasite sınırıdır.' }
    ]
  },
  {
    id: 'renault-h5h-13tce',
    family: 'H5H/HR13DDT',
    name: '1.3 TCe',
    aliases: ['1.3 TCe (140-160 hp)', '1.3 TCe (140-155 hp)', '1.3 DIG-T', '1.3 TCe Mild Hybrid'],
    codes: ['H5H', 'HR13DDT'],
    group: 'Renault-Nissan',
    displacement: 1332,
    fuel: 'Benzin',
    power: '115 - 163 HP',
    torque: '240 - 270 Nm',
    years: '2018 - 2024',
    usedIn: ['Renault Megane', 'Renault Captur', 'Renault Kadjar', 'Dacia Duster', 'Nissan Qashqai'],
    durability: 76,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Mercedes ile ortak geliştirilmiştir; Mercedes M282 ile aynı tabandır.' },
    problems: [
      { title: 'Emme supabı karbon birikimi', risk: 'Orta', cost: '8.000 - 20.000 TL', note: 'Direkt enjeksiyonun yaygın sorunu.' },
      { title: 'Turbo aktüatör arızası', risk: 'Düşük', cost: '12.000 - 30.000 TL', note: '' },
      { title: 'EDC şanzımanla birlikte düşük hızda sarsıntı', risk: 'Orta', cost: '0 - 25.000 TL', note: 'Sorun çoğunlukla motorda değil şanzımandadır.' }
    ]
  },
  {
    id: 'renault-m9r',
    family: 'M9R',
    name: '2.0 dCi',
    codes: ['M9R'],
    group: 'Renault-Nissan',
    displacement: 1995,
    fuel: 'Dizel',
    power: '130 - 175 HP',
    torque: '320 - 380 Nm',
    years: '2005 - 2016',
    usedIn: ['Renault Megane', 'Renault Laguna', 'Renault Trafic', 'Nissan X-Trail', 'Nissan Qashqai'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'EGR ve DPF tıkanması', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' },
      { title: 'Yağ pompası zinciri (bazı üretimlerde)', risk: 'Orta', cost: '15.000 - 45.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // TOYOTA / LEXUS — EKSİK MOTORLAR
  // ==========================================================================
  {
    id: 'toyota-zr-valvematic',
    family: '1ZR/2ZR',
    name: '1.6 / 1.8 Valvematic',
    aliases: ['1.6 Benzin', '1.6 Dual VVT-i', '1.6 VVT-i', '1.8 Valvematic', '1.6 Valvematic'],
    codes: ['1ZR-FAE', '2ZR-FAE', '1ZR-FE', '2ZR-FE'],
    group: 'Toyota',
    displacement: 1598,
    fuel: 'Benzin',
    power: '124 - 147 HP',
    torque: '155 - 180 Nm',
    years: '2007 - 2019',
    usedIn: ['Toyota Corolla', 'Toyota Auris', 'Toyota Avensis', 'Toyota Verso'],
    durability: 90,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Toyota\'nın en dertsiz motor ailelerinden; olağanüstü bir sorunu yoktur.' },
    problems: [
      { title: 'Valvematic ünitesi arızası', risk: 'Düşük', cost: '10.000 - 30.000 TL', note: 'Nadir görülür ama olduğunda pahalıdır; motor uyarı lambası ve güç kaybı yapar.' },
      { title: 'Yağ tüketimi (yüksek kilometrede)', risk: 'Düşük', cost: '8.000 - 30.000 TL', note: '' },
      { title: 'Su pompası sızıntısı', risk: 'Düşük', cost: '4.000 - 10.000 TL', note: '' }
    ]
  },
  {
    id: 'toyota-1nr-1kr',
    family: '1KR/1NR',
    name: '1.0 / 1.33 Dual VVT-i',
    aliases: ['1.33 Dual VVT-i', '1.0 VVT-i', '1.33 VVT-i'],
    codes: ['1KR-FE', '1NR-FE', '1NR-FKE'],
    group: 'Toyota',
    displacement: 1329,
    fuel: 'Benzin',
    power: '69 - 101 HP',
    torque: '93 - 132 Nm',
    years: '2005 - 2020',
    usedIn: ['Toyota Yaris', 'Toyota Aygo', 'Toyota Corolla Verso', 'Toyota Urban Cruiser'],
    durability: 88,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Basit ve dayanıklı; bakım maliyeti düşüktür.' },
    problems: [
      { title: 'Yetersiz çekiş (yüklü kullanımda)', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil, hacim sınırıdır.' },
      { title: 'Zincir gergi sesi (yüksek kilometrede)', risk: 'Düşük', cost: '8.000 - 20.000 TL', note: '' }
    ]
  },
  {
    id: 'toyota-ad-d4d',
    family: '1AD/2AD',
    name: '2.0 / 2.2 D-4D',
    aliases: ['2.0 D-4D', '2.2 D-4D'],
    codes: ['1AD-FTV', '2AD-FTV', '2AD-FHV'],
    group: 'Toyota',
    displacement: 1998,
    fuel: 'Dizel',
    power: '126 - 177 HP',
    torque: '310 - 400 Nm',
    years: '2005 - 2015',
    usedIn: ['Toyota Avensis', 'Toyota RAV4', 'Toyota Auris', 'Toyota Corolla Verso', 'Lexus IS 220d'],
    durability: 62,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Yağ bakımı bu motorda kritiktir; uzatılan yağ değişimi silindir kapağını riske atar.' },
    problems: [
      { title: 'Silindir kapağı çatlaması / conta sorunu', risk: 'Yüksek', cost: '35.000 - 90.000 TL', note: '2AD-FTV\'nin en bilinen kusuru; Toyota bazı pazarlarda uzatılmış garanti vermiştir. Alım öncesi soğutma suyunda yağ/hava kontrolü şart.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'DPF tıkanması ve yağ seyrelmesi', risk: 'Orta', cost: '8.000 - 40.000 TL', note: 'Kısa mesafede yakıt yağa karışır; yağ seviyesi ARTIYORSA acil servis.' },
      { title: 'EGR tıkanması', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'toyota-1ww-16d4d',
    family: '1WW',
    name: '1.6 D-4D',
    codes: ['1WW', '1WW-TV'],
    group: 'Toyota',
    displacement: 1598,
    fuel: 'Dizel',
    power: '112 HP',
    torque: '270 Nm',
    years: '2013 - 2018',
    usedIn: ['Toyota Auris', 'Toyota Avensis', 'Toyota Verso'],
    durability: 66,
    maintenance: { oilKm: 15000, timing: 'Zincir (motor arkası)', note: 'Bu motor BMW N47 tabanlıdır; zincir konumu ve riskleri de aynıdır.' },
    problems: [
      { title: 'Triger zinciri uzaması (motor arkası)', risk: 'Yüksek', cost: '25.000 - 65.000 TL', note: 'BMW N47 ile aynı tasarım sorununu paylaşır.' },
      { title: 'EGR ve DPF tıkanması', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'toyota-kd-d4d',
    family: '1KD/2KD',
    name: '2.5 / 3.0 D-4D',
    aliases: ['2.4 / 2.5 / 3.0 D-4D', '2.5 D-4D', '3.0 D-4D'],
    codes: ['2KD-FTV', '1KD-FTV'],
    group: 'Toyota',
    displacement: 2494,
    fuel: 'Dizel',
    power: '102 - 190 HP',
    torque: '260 - 420 Nm',
    years: '2001 - 2016',
    usedIn: ['Toyota Hilux', 'Toyota Land Cruiser', 'Toyota Hiace'],
    durability: 88,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Ticari kullanıma göre tasarlanmış, çok dayanıklı motorlardır.' },
    problems: [
      { title: 'Enjektör arızası ve piston hasarı', risk: 'Orta', cost: '20.000 - 80.000 TL', note: 'Kaçıran enjektör pistonu deler; enjektör geri dönüş testi alım öncesi yapılmalı.' },
      { title: 'Turbo kanatçık yapışması', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'EGR kurumlanması', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' }
    ]
  },
  {
    id: 'toyota-25-hybrid',
    family: 'A25A-FXS',
    name: '2.5 Hibrit',
    aliases: ['2.5 Hybrid'],
    codes: ['A25A-FXS'],
    group: 'Toyota',
    displacement: 2487,
    fuel: 'Hibrit',
    power: '218 - 222 HP',
    torque: '221 Nm',
    years: '2018 - 2024',
    usedIn: ['Toyota RAV4', 'Toyota Camry', 'Lexus ES 300h'],
    durability: 90,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Hibrit sistemde motor sürekli çalışmadığı için aşınma düşüktür.' },
    problems: [
      { title: 'Hibrit batarya kapasitesi düşüşü (yüksek kilometrede)', risk: 'Düşük', cost: '40.000 - 120.000 TL', note: 'Toyota hibritlerinde batarya ömrü genelde beklenenden uzundur; yine de alım öncesi batarya sağlığı okutulmalı.' },
      { title: 'İnvertör soğutma pompası arızası', risk: 'Düşük', cost: '10.000 - 25.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // HYUNDAI / KIA — EKSİK MOTORLAR
  // ==========================================================================
  {
    id: 'hyundai-d4fc',
    family: 'U-II',
    name: '1.4 / 1.5 CRDi',
    aliases: ['1.4 CRDi', '1.5 CRDi'],
    codes: ['D4FC', 'D4FA', 'D4FE'],
    group: 'Hyundai-Kia',
    displacement: 1396,
    fuel: 'Dizel',
    power: '90 - 136 HP',
    torque: '220 - 320 Nm',
    years: '2008 - 2024',
    usedIn: ['Hyundai i20', 'Hyundai i30', 'Hyundai Accent', 'Kia Rio', 'Kia Ceed'],
    durability: 80,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'DPF tıkanması (şehir içi kullanımda)', risk: 'Orta', cost: '5.000 - 30.000 TL', note: 'Küçük dizellerde kısa mesafe kullanımı en büyük risktir.' },
      { title: 'EGR kurumlanması', risk: 'Orta', cost: '4.000 - 12.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Düşük', cost: '12.000 - 30.000 TL', note: '' }
    ]
  },
  {
    id: 'hyundai-r-crdi',
    family: 'R / U-II',
    name: '1.7 / 2.0 / 2.2 CRDi',
    aliases: ['1.7 CRDi', '2.0 CRDi', '2.2 CRDi', '2.0 / 2.2 CRDi'],
    codes: ['D4FD', 'D4HA', 'D4HB'],
    group: 'Hyundai-Kia',
    displacement: 1995,
    fuel: 'Dizel',
    power: '115 - 200 HP',
    torque: '260 - 440 Nm',
    years: '2009 - 2021',
    usedIn: ['Hyundai i40', 'Hyundai Tucson', 'Hyundai Santa Fe', 'Kia Sportage', 'Kia Sorento', 'Kia Ceed'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'EGR soğutucusu ve DPF tıkanması', risk: 'Orta', cost: '8.000 - 35.000 TL', note: '' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Yağ seyrelmesi (kısa mesafede)', risk: 'Orta', cost: '5.000 - 20.000 TL', note: 'Yağ seviyesi artıyorsa DPF rejenerasyonu tamamlanamıyor demektir.' }
    ]
  },
  {
    id: 'hyundai-kappa',
    family: 'Kappa',
    name: '1.0 / 1.2 MPI / T-GDI',
    aliases: ['1.2 MPI', '1.0 T-GDI', '1.2 Benzin', '1.0 / 1.2 Benzin', '1.0 Benzin', '1.25 MPI'],
    codes: ['G3LA', 'G3LC', 'G4LA', 'G4LC'],
    group: 'Hyundai-Kia',
    displacement: 1197,
    fuel: 'Benzin',
    power: '67 - 120 HP',
    torque: '95 - 172 Nm',
    years: '2011 - 2024',
    usedIn: ['Hyundai i10', 'Hyundai i20', 'Hyundai Bayon', 'Kia Picanto', 'Kia Rio', 'Kia Stonic'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Atmosferik (MPI) versiyonları özellikle dertsizdir.' },
    problems: [
      { title: 'Turbo arızası (T-GDI)', risk: 'Düşük', cost: '12.000 - 30.000 TL', note: 'Yalnızca turbolu versiyonlarda.' },
      { title: 'Emme supabı karbon birikimi (T-GDI)', risk: 'Düşük', cost: '6.000 - 15.000 TL', note: '' },
      { title: 'Yetersiz çekiş (MPI)', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil, hacim sınırıdır.' }
    ]
  },
  {
    id: 'hyundai-smartstream-15',
    family: 'Smartstream',
    name: '1.5 / 1.6 Smartstream',
    aliases: ['1.5 Benzin', '1.5 T-GDI', '1.6 GDI Hybrid', '1.6 T-GDI Hybrid', '1.5 MPI'],
    codes: ['G4FS', 'G4FP', 'G4FT'],
    group: 'Hyundai-Kia',
    displacement: 1497,
    fuel: 'Benzin',
    power: '115 - 180 HP',
    torque: '144 - 265 Nm',
    years: '2019 - 2024',
    usedIn: ['Hyundai i20', 'Hyundai Bayon', 'Hyundai Tucson', 'Kia Ceed', 'Kia Sportage'],
    durability: 82,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Yeni nesil; uzun vadeli güvenilirlik verisi henüz sınırlıdır.' },
    problems: [
      { title: 'Emme supabı karbon birikimi (T-GDI)', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' },
      { title: '48V hafif hibrit sistem arızası', risk: 'Düşük', cost: '15.000 - 45.000 TL', note: 'Yalnızca hibrit donanımlı versiyonlarda.' }
    ]
  },

  // ==========================================================================
  // HONDA
  // ==========================================================================
  {
    id: 'honda-l-series',
    family: 'L / D',
    name: '1.3 / 1.4 / 1.6 i-VTEC',
    aliases: ['1.3 / 1.4 i-VTEC', '1.4 i-VTEC', '1.6 i-VTEC', '1.6 VTEC', '1.5 i-VTEC'],
    codes: ['L13A', 'L15A', 'D14Z', 'D16W', 'R16A'],
    group: 'Honda',
    displacement: 1339,
    fuel: 'Benzin',
    power: '83 - 132 HP',
    torque: '114 - 152 Nm',
    years: '2001 - 2017',
    usedIn: ['Honda Jazz', 'Honda Civic', 'Honda City', 'Honda HR-V'],
    durability: 88,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Honda motorlarında yağ bakımı aralığı kısa tutulmalıdır.' },
    problems: [
      { title: 'Supap ayarı gerekliliği', risk: 'Düşük', cost: '3.000 - 8.000 TL', note: 'Bakım kalemidir; ihmal edilirse tıkırtı ve güç kaybı yapar.' },
      { title: 'Yağ tüketimi (yüksek kilometrede)', risk: 'Düşük', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'Gaz kelebeği kirlenmesi ve rölanti düzensizliği', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' }
    ]
  },
  {
    id: 'honda-r18',
    family: 'R',
    name: '1.8 i-VTEC',
    codes: ['R18A', 'R18Z'],
    group: 'Honda',
    displacement: 1799,
    fuel: 'Benzin',
    power: '140 - 142 HP',
    torque: '174 Nm',
    years: '2006 - 2017',
    usedIn: ['Honda Civic', 'Honda Stream'],
    durability: 88,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Supap ayarı gerekliliği', risk: 'Düşük', cost: '3.000 - 9.000 TL', note: '' },
      { title: 'Egzoz manifoldu çatlağı', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Yağ tüketimi', risk: 'Düşük', cost: '8.000 - 25.000 TL', note: '' }
    ]
  },
  {
    id: 'honda-k-series',
    family: 'K',
    name: '2.0 / 2.4 i-VTEC',
    codes: ['K20A', 'K24A', 'K24Z'],
    group: 'Honda',
    displacement: 1998,
    fuel: 'Benzin',
    power: '150 - 201 HP',
    torque: '190 - 245 Nm',
    years: '2001 - 2017',
    usedIn: ['Honda Accord', 'Honda CR-V', 'Honda Civic Type R'],
    durability: 90,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Dünya çapında en dayanıklı benzinli motorlardan biri kabul edilir.' },
    problems: [
      { title: 'Yağ tüketimi (bazı üretimlerde)', risk: 'Orta', cost: '10.000 - 40.000 TL', note: 'Segman tasarımı nedeniyle bazı yıllarda bildirilmiştir.' },
      { title: 'Supap ayarı gerekliliği', risk: 'Düşük', cost: '3.000 - 9.000 TL', note: '' }
    ]
  },
  {
    id: 'honda-n22',
    family: 'N22',
    name: '2.2 i-CTDi / i-DTEC',
    aliases: ['2.2 i-CTDi', '2.2 i-DTEC'],
    codes: ['N22A1', 'N22B1'],
    group: 'Honda',
    displacement: 2204,
    fuel: 'Dizel',
    power: '140 - 180 HP',
    torque: '340 - 380 Nm',
    years: '2004 - 2015',
    usedIn: ['Honda Accord', 'Honda CR-V', 'Honda Civic'],
    durability: 70,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'DPF tıkanması ve yağ seyrelmesi', risk: 'Yüksek', cost: '8.000 - 40.000 TL', note: 'Kısa mesafe kullanımda yağ seviyesi artar; yağ seviye çubuğu alım öncesi mutlaka kontrol edilmeli.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'Krank kasnağı ve turbo arızası', risk: 'Orta', cost: '10.000 - 35.000 TL', note: '' }
    ]
  },
  {
    id: 'honda-ehev',
    family: 'e:HEV',
    name: '2.0 e:HEV Hibrit',
    aliases: ['2.0 e:HEV Hybrid', '2.0 Hibrit'],
    codes: ['LFA', 'LFB'],
    group: 'Honda',
    displacement: 1993,
    fuel: 'Hibrit',
    power: '184 - 207 HP',
    torque: '315 - 335 Nm',
    years: '2019 - 2024',
    usedIn: ['Honda CR-V', 'Honda Civic', 'Honda HR-V'],
    durability: 86,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: 'Seri hibrit yapıdadır; motor çoğunlukla jeneratör olarak çalışır.' },
    problems: [
      { title: 'Hibrit batarya kapasitesi düşüşü', risk: 'Düşük', cost: '50.000 - 150.000 TL', note: 'Alım öncesi batarya sağlığı okutulmalı.' },
      { title: 'Yüksek devirde motor sesi (e:HEV karakteri)', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; hızlanmada devir sabitlenir.' }
    ]
  },

  // ==========================================================================
  // OPEL / CHEVROLET (GM)
  // ==========================================================================
  {
    id: 'opel-cdti-16',
    family: 'B16DTH',
    name: '1.6 CDTI',
    codes: ['B16DTH', 'B16DTE', 'B16DTL'],
    group: 'Opel',
    displacement: 1598,
    fuel: 'Dizel',
    power: '95 - 136 HP',
    torque: '280 - 320 Nm',
    years: '2013 - 2020',
    usedIn: ['Opel Astra K', 'Opel Insignia', 'Opel Zafira', 'Opel Mokka'],
    durability: 76,
    maintenance: { oilKm: 20000, timing: 'Kayış · 150.000 km', note: 'Opel\'in "sessiz dizel" olarak tanıttığı, önceki 1.7 CDTI\'ye göre belirgin biçimde iyi bir motordur.' },
    problems: [
      { title: 'DPF tıkanması', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' },
      { title: 'EGR arızası', risk: 'Orta', cost: '5.000 - 18.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Düşük', cost: '12.000 - 35.000 TL', note: '' }
    ]
  },
  {
    id: 'opel-cdti-20',
    family: 'A20DT',
    name: '2.0 CDTI',
    codes: ['A20DTH', 'A20DTJ', 'B20DTH'],
    group: 'Opel',
    displacement: 1956,
    fuel: 'Dizel',
    power: '110 - 195 HP',
    torque: '260 - 400 Nm',
    years: '2008 - 2018',
    usedIn: ['Opel Insignia', 'Opel Astra J', 'Opel Zafira Tourer'],
    durability: 72,
    maintenance: { oilKm: 20000, timing: 'Zincir', note: 'Fiat kökenli JTD tabanlıdır.' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '12.000 - 35.000 TL', note: '' },
      { title: 'DPF ve EGR tıkanması', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Zincir uzaması (yüksek kilometrede)', risk: 'Orta', cost: '18.000 - 45.000 TL', note: '' }
    ]
  },
  {
    id: 'opel-turbo-14',
    family: 'A14NET/B14',
    name: '1.4 Turbo',
    codes: ['A14NET', 'B14NET', 'A14NEL'],
    group: 'Opel',
    displacement: 1364,
    fuel: 'Benzin',
    power: '120 - 150 HP',
    torque: '175 - 245 Nm',
    years: '2009 - 2019',
    usedIn: ['Opel Astra J/K', 'Opel Corsa', 'Opel Mokka', 'Opel Insignia'],
    durability: 68,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Yağ bakımı ihmal edilirse zincir ve turbo birlikte risk altına girer.' },
    problems: [
      { title: 'Triger zinciri uzaması', risk: 'Orta', cost: '15.000 - 40.000 TL', note: 'Soğuk çalıştırmada tıkırtı ilk belirtidir.' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 35.000 TL', note: '' },
      { title: 'Su pompası ve termostat arızası', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' },
      { title: 'Karter havalandırma (PCV) diyafram yırtılması', risk: 'Orta', cost: '3.000 - 12.000 TL', note: 'Rölanti düzensizliği ve yağ tüketimi yapar.' }
    ]
  },
  {
    id: 'opel-twinport',
    family: 'Ecotec Twinport',
    name: '1.4 / 1.6 Benzin',
    aliases: ['1.4 Benzin', '1.6 Benzin', '1.4 Twinport', '1.6 Twinport', '1.6 Ecotec'],
    codes: ['A14XER', 'A16XER', 'Z14XEP', 'Z16XER'],
    group: 'Opel',
    displacement: 1398,
    fuel: 'Benzin',
    power: '87 - 115 HP',
    torque: '130 - 155 Nm',
    years: '2003 - 2015',
    usedIn: ['Opel Astra H/J', 'Opel Corsa D', 'Opel Meriva', 'Chevrolet Cruze'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Kayış · 100.000 km', note: '' },
    problems: [
      { title: 'Triger kayışı ve devirdaim', risk: 'Orta', cost: '5.000 - 14.000 TL', note: 'Kayış atlarsa supap eğer.' },
      { title: 'Bobin ve buji arızası', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' },
      { title: 'Termostat arızası', risk: 'Düşük', cost: '2.500 - 7.000 TL', note: '' }
    ]
  },
  {
    id: 'gm-vcdi-20',
    family: 'VCDi (VM Motori)',
    name: '2.0 VCDi',
    codes: ['Z20S1', 'Z20D1'],
    group: 'GM',
    displacement: 1991,
    fuel: 'Dizel',
    power: '150 - 163 HP',
    torque: '320 - 360 Nm',
    years: '2006 - 2015',
    usedIn: ['Chevrolet Captiva', 'Chevrolet Cruze', 'Opel Antara'],
    durability: 64,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Triger zinciri uzaması', risk: 'Yüksek', cost: '20.000 - 50.000 TL', note: 'Bu motorun en bilinen kusurudur.' },
      { title: 'Enjektör ve yakıt pompası arızası', risk: 'Orta', cost: '15.000 - 45.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // FORD — EKSİK MOTORLAR
  // ==========================================================================
  {
    id: 'ford-tivct-16',
    family: 'Sigma/Duratec',
    name: '1.4 / 1.6 Ti-VCT',
    aliases: ['1.6 Ti-VCT', '1.4 Duratec', '1.6 Duratec', '1.6 Benzin'],
    codes: ['SIDA', 'IQDB', 'HXDA'],
    group: 'Ford',
    displacement: 1596,
    fuel: 'Benzin',
    power: '80 - 125 HP',
    torque: '128 - 159 Nm',
    years: '2002 - 2018',
    usedIn: ['Ford Fiesta', 'Ford Focus', 'Ford Courier', 'Ford B-Max'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Kayış · 150.000 km', note: 'Atmosferik ve basit; bakım maliyeti düşüktür.' },
    problems: [
      { title: 'Triger kayışı ve gergi', risk: 'Orta', cost: '5.000 - 14.000 TL', note: '' },
      { title: 'Bobin arızası', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' },
      { title: 'Termostat ve su pompası', risk: 'Düşük', cost: '3.000 - 9.000 TL', note: '' }
    ]
  },
  {
    id: 'ford-tdci-18',
    family: 'Lynx',
    name: '1.8 TDCi',
    codes: ['KKDA', 'QYWA', 'FFDA'],
    group: 'Ford',
    displacement: 1753,
    fuel: 'Dizel',
    power: '90 - 125 HP',
    torque: '200 - 300 Nm',
    years: '2001 - 2012',
    usedIn: ['Ford Focus', 'Ford Connect', 'Ford Mondeo', 'Ford C-Max'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Kayış · 150.000 km', note: 'Kayış değişiminde yakıt pompası kayışı da kontrol edilmeli.' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '8.000 - 25.000 TL', note: '' },
      { title: 'Turbo kanatçık yapışması', risk: 'Orta', cost: '10.000 - 28.000 TL', note: '' },
      { title: 'EGR tıkanması', risk: 'Orta', cost: '3.000 - 10.000 TL', note: '' }
    ]
  },
  {
    id: 'ford-ecoblue-15',
    family: 'EcoBlue',
    name: '1.5 EcoBlue',
    codes: ['XWDA', 'ZTDA'],
    group: 'Ford',
    displacement: 1499,
    fuel: 'Dizel',
    power: '95 - 120 HP',
    torque: '215 - 300 Nm',
    years: '2018 - 2024',
    usedIn: ['Ford Focus', 'Ford Puma', 'Ford Courier', 'Ford Connect'],
    durability: 76,
    maintenance: { oilKm: 20000, timing: 'Yağ banyolu kayış · 200.000 km', note: 'Yağ banyolu kayış, yağ bakımı ihmal edilirse dağılıp yağ kanallarını tıkayabilir.' },
    problems: [
      { title: 'Yağ banyolu triger kayışı bozulması', risk: 'Orta', cost: '20.000 - 60.000 TL', note: 'Doğru yağ ve zamanında değişim bu motorda pazarlık konusu değildir.' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '6.000 - 30.000 TL', note: '' },
      { title: 'AdBlue sistemi arızası', risk: 'Düşük', cost: '8.000 - 25.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // FIAT / ALFA ROMEO / TOFAŞ
  // ==========================================================================
  {
    id: 'fiat-tjet-14',
    family: 'T-Jet',
    name: '1.4 T-Jet',
    aliases: ['1.4 Turbo Benzin'],
    codes: ['198A4000', '940A2000'],
    group: 'Stellantis-Fiat',
    displacement: 1368,
    fuel: 'Benzin',
    power: '120 - 170 HP',
    torque: '206 - 250 Nm',
    years: '2007 - 2020',
    usedIn: ['Fiat Linea', 'Fiat Bravo', 'Fiat Tipo', 'Alfa Romeo MiTo', 'Fiat 500 Abarth'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Turbo arızası', risk: 'Orta', cost: '12.000 - 30.000 TL', note: 'Yağ bakımı ihmal edilirse riski artar.' },
      { title: 'Bobin arızası', risk: 'Düşük', cost: '2.500 - 7.000 TL', note: '' },
      { title: 'Yağ tüketimi', risk: 'Düşük', cost: '6.000 - 20.000 TL', note: '' }
    ]
  },
  {
    id: 'fiat-firefly-hybrid',
    family: 'FireFly',
    name: '1.0 / 1.5 Hibrit',
    aliases: ['1.5 Hybrid', '1.0 FireFly', '1.5 Hibrit'],
    codes: ['55282062', 'F5P'],
    group: 'Stellantis-Fiat',
    displacement: 1469,
    fuel: 'Hibrit',
    power: '100 - 130 HP',
    torque: '190 - 240 Nm',
    years: '2020 - 2024',
    usedIn: ['Fiat Egea', 'Fiat 500', 'Jeep Renegade', 'Alfa Romeo Tonale'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Kayış', note: 'Yeni nesil; uzun vadeli veri henüz sınırlıdır.' },
    problems: [
      { title: '48V hafif hibrit sistem arızası', risk: 'Düşük', cost: '15.000 - 45.000 TL', note: '' },
      { title: 'Çift kavramalı şanzımanla düşük hızda sarsıntı', risk: 'Orta', cost: '0 - 30.000 TL', note: 'Sorun motorda değil şanzımanda aranmalıdır.' }
    ]
  },
  {
    id: 'tofas-16-fire',
    family: 'FIRE 16V',
    name: '1.6 Benzin',
    aliases: ['1.6', '1.6 FIRE', '1.6 E-TorQ'],
    codes: ['955A3000', '843A1000'],
    group: 'Stellantis-Fiat',
    displacement: 1598,
    fuel: 'Benzin',
    power: '110 - 120 HP',
    torque: '152 - 160 Nm',
    years: '2007 - 2022',
    usedIn: ['Fiat Egea', 'Fiat Linea', 'Fiat Doblo', 'Fiat Bravo'],
    durability: 80,
    maintenance: { oilKm: 15000, timing: 'Kayış · 120.000 km', note: 'Türkiye\'de parça ve servis ağı en geniş motorlardan biridir.' },
    problems: [
      { title: 'Triger kayışı ve devirdaim', risk: 'Orta', cost: '4.000 - 12.000 TL', note: '' },
      { title: 'Bobin ve buji arızası', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: '' },
      { title: 'Yağ tüketimi (yüksek kilometrede)', risk: 'Düşük', cost: '6.000 - 20.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // DİĞER MARKALAR
  // ==========================================================================
  {
    id: 'mazda-skyactiv-d',
    family: 'Skyactiv-D',
    name: '1.5 / 2.2 Skyactiv-D',
    aliases: ['1.5 Skyactiv-D', '2.2 Skyactiv-D'],
    codes: ['S5-DPTS', 'SH-VPTS'],
    group: 'Mazda',
    displacement: 2191,
    fuel: 'Dizel',
    power: '105 - 184 HP',
    torque: '270 - 445 Nm',
    years: '2012 - 2021',
    usedIn: ['Mazda 3', 'Mazda 6', 'Mazda CX-5', 'Mazda CX-3'],
    durability: 62,
    maintenance: { oilKm: 10000, timing: 'Zincir', note: 'Düşük sıkıştırma oranlı tasarım; kısa mesafe kullanım bu motorun düşmanıdır.' },
    problems: [
      { title: 'Karbon birikimi ve yağ seyrelmesi', risk: 'Yüksek', cost: '15.000 - 50.000 TL', note: 'Bu motorun en bilinen sorunu. Şehir içi kısa mesafede yakıt yağa karışır, yağ seviyesi ARTAR. Alım öncesi yağ çubuğu ve yağ kokusu kontrol edilmeli.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '15.000 - 45.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '8.000 - 40.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '20.000 - 55.000 TL', note: '' }
    ]
  },
  {
    id: 'mazda-skyactiv-g',
    family: 'Skyactiv-G',
    name: '1.5 / 2.0 Skyactiv-G',
    aliases: ['1.5 Skyactiv-G', '2.0 Skyactiv-G', '2.0 Benzin'],
    codes: ['P5-VPS', 'PE-VPS'],
    group: 'Mazda',
    displacement: 1998,
    fuel: 'Benzin',
    power: '100 - 165 HP',
    torque: '135 - 213 Nm',
    years: '2012 - 2024',
    usedIn: ['Mazda 2', 'Mazda 3', 'Mazda 6', 'Mazda CX-5'],
    durability: 86,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Atmosferik yapısı sayesinde turbolu rakiplerine göre dertsizdir.' },
    problems: [
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' },
      { title: 'Yüksek sıkıştırma nedeniyle kaliteli yakıt gerekliliği', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; düşük oktan yakıtta vuruntu yapabilir.' }
    ]
  },
  {
    id: 'suzuki-ddis',
    family: 'DDiS (Multijet tabanlı)',
    name: '1.3 / 1.6 DDiS',
    aliases: ['1.3 DDiS', '1.6 DDiS'],
    codes: ['D13A', 'D16AA'],
    group: 'Suzuki',
    displacement: 1248,
    fuel: 'Dizel',
    power: '75 - 120 HP',
    torque: '190 - 320 Nm',
    years: '2005 - 2018',
    usedIn: ['Suzuki SX4', 'Suzuki Vitara', 'Suzuki Swift'],
    durability: 76,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Fiat Multijet tabanlıdır; parça bulunabilirliği iyidir.' },
    problems: [
      { title: 'EGR ve DPF tıkanması', risk: 'Orta', cost: '5.000 - 25.000 TL', note: '' },
      { title: 'Turbo yağlama kanalı tıkanması', risk: 'Orta', cost: '12.000 - 30.000 TL', note: 'Multijet ailesinin bilinen zayıf noktası; yağ bakımı kritiktir.' },
      { title: 'Enjektör arızası', risk: 'Orta', cost: '10.000 - 28.000 TL', note: '' }
    ]
  },
  {
    id: 'mitsubishi-did-16',
    family: 'OM607 tabanlı',
    name: '1.6 DI-D',
    codes: ['4N13'],
    group: 'Mitsubishi',
    displacement: 1560,
    fuel: 'Dizel',
    power: '114 HP',
    torque: '270 Nm',
    years: '2010 - 2019',
    usedIn: ['Mitsubishi ASX', 'Mitsubishi Outlander', 'Mitsubishi Lancer'],
    durability: 72,
    maintenance: { oilKm: 15000, timing: 'Kayış', note: 'Renault/Mercedes 1.5-1.6 dizel ailesiyle akrabadır.' },
    problems: [
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 35.000 TL', note: '' },
      { title: 'DPF tıkanması', risk: 'Orta', cost: '6.000 - 28.000 TL', note: '' },
      { title: 'EGR kurumlanması', risk: 'Orta', cost: '4.000 - 12.000 TL', note: '' }
    ]
  },
  {
    id: 'subaru-fb',
    family: 'FB',
    name: '1.6i / 2.0i Boxer',
    aliases: ['1.6i', '2.0i', '1.6 Benzin'],
    codes: ['FB16', 'FB20'],
    group: 'Subaru',
    displacement: 1600,
    fuel: 'Benzin',
    power: '114 - 156 HP',
    torque: '150 - 196 Nm',
    years: '2011 - 2021',
    usedIn: ['Subaru XV', 'Subaru Impreza', 'Subaru Forester'],
    durability: 78,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: 'Boxer yapısı nedeniyle bazı işçilikler diğer motorlara göre pahalıdır.' },
    problems: [
      { title: 'Yağ tüketimi', risk: 'Orta', cost: '10.000 - 35.000 TL', note: 'Boxer motorlarda bilinen bir şikayettir.' },
      { title: 'Silindir kapağı conta sızıntısı', risk: 'Orta', cost: '20.000 - 55.000 TL', note: '' },
      { title: 'CVT şanzımanla birlikte ısınma', risk: 'Orta', cost: '10.000 - 40.000 TL', note: '' }
    ]
  },
  {
    id: 'ssangyong-xdi',
    family: 'OM664 tabanlı',
    name: '2.0 Xdi',
    codes: ['D20DT', 'D20DTF'],
    group: 'SsangYong',
    displacement: 1998,
    fuel: 'Dizel',
    power: '141 - 178 HP',
    torque: '310 - 400 Nm',
    years: '2005 - 2020',
    usedIn: ['SsangYong Korando', 'SsangYong Actyon', 'SsangYong Rexton'],
    durability: 70,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: 'Mercedes OM664 lisansı ile üretilmiştir.' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '12.000 - 30.000 TL', note: '' },
      { title: 'Turbo arızası', risk: 'Orta', cost: '15.000 - 35.000 TL', note: '' },
      { title: 'Yedek parça bulunabilirliği', risk: 'Orta', cost: '0 TL', note: 'Arıza değil ama Türkiye\'de servis ağı dardır; onarım süresi uzayabilir.' }
    ]
  },
  {
    id: 'jlr-ingenium-20d',
    family: 'Ingenium AJ200D',
    name: '2.0d Ingenium',
    aliases: ['2.0d', '2.0 eD4', '2.0 TD4', '2.0 SD4'],
    codes: ['204DTD', '204DTA'],
    group: 'JLR',
    displacement: 1999,
    fuel: 'Dizel',
    power: '150 - 240 HP',
    torque: '380 - 500 Nm',
    years: '2015 - 2023',
    usedIn: ['Jaguar XE', 'Jaguar XF', 'Land Rover Discovery Sport', 'Range Rover Evoque'],
    durability: 60,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Yağ bakımı bu motorda kritiktir; ihmal doğrudan zincire yansır.' },
    problems: [
      { title: 'Triger zinciri uzaması', risk: 'Yüksek', cost: '35.000 - 90.000 TL', note: 'Erken üretimlerde (2015-2018) sık bildirilmiştir; soğuk çalıştırmada tıkırtı ilk belirtidir.' },
      { title: 'Krank kasnağı arızası', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'DPF ve AdBlue sistemi arızası', risk: 'Orta', cost: '15.000 - 60.000 TL', note: '' },
      { title: 'Yüksek yedek parça ve işçilik maliyeti', risk: 'Orta', cost: '0 TL', note: 'Arıza değil; bu segmentte bakım maliyeti bütçenin parçası olarak hesaplanmalı.' }
    ]
  },
  {
    id: 'hyundai-hybrid-16',
    family: 'Kappa/Gamma Hibrit',
    name: '1.6 GDI / T-GDI Hibrit',
    aliases: ['1.6 GDI Hybrid', '1.6 T-GDI Hybrid', '1.6 Hibrit'],
    codes: ['G4LE', 'G4FM'],
    group: 'Hyundai-Kia',
    displacement: 1580,
    fuel: 'Hibrit',
    power: '141 - 230 HP',
    torque: '265 - 350 Nm',
    years: '2016 - 2024',
    usedIn: ['Hyundai Ioniq', 'Hyundai Tucson', 'Kia Niro', 'Kia Sportage', 'Kia Ceed'],
    durability: 84,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Atkinson çevrimli motor; hibrit sistemle birlikte çalışır.' },
    problems: [
      { title: 'Hibrit batarya kapasitesi düşüşü', risk: 'Düşük', cost: '45.000 - 130.000 TL', note: 'Alım öncesi batarya sağlık durumu (SOH) mutlaka okutulmalı.' },
      { title: 'Çift kavramalı (6DCT) şanzımanla düşük hızda sarsıntı', risk: 'Orta', cost: '0 - 40.000 TL', note: 'Bu hibritlerde CVT değil kuru çift kavramalı şanzıman vardır; sorun genelde şanzımandadır.' },
      { title: 'Emme supabı karbon birikimi (T-GDI)', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' }
    ]
  },
  {
    id: 'renault-etech',
    family: 'E-Tech',
    name: '1.2 / 1.6 E-Tech Hibrit',
    aliases: ['1.2 E-Tech Full Hybrid', '1.6 E-Tech', '1.6 Hibrit'],
    codes: ['H4M', 'HR12DDR'],
    group: 'Renault-Nissan',
    displacement: 1598,
    fuel: 'Hibrit',
    power: '140 - 145 HP',
    torque: '148 - 205 Nm',
    years: '2020 - 2024',
    usedIn: ['Renault Clio', 'Renault Captur', 'Renault Arkana', 'Renault Megane'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Kavramasız, dişli tabanlı hibrit şanzıman kullanır; debriyaj aşınması yoktur.' },
    problems: [
      { title: 'Hibrit batarya kapasitesi düşüşü', risk: 'Düşük', cost: '45.000 - 130.000 TL', note: 'Alım öncesi batarya sağlığı okutulmalı.' },
      { title: 'Hibrit şanzıman yazılım/geçiş şikayetleri', risk: 'Düşük', cost: '0 - 20.000 TL', note: 'Güncel yazılımın yüklü olup olmadığı servis kaydından sorulmalı.' },
      { title: 'Yeni teknoloji, uzun vadeli veri sınırlı', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; garanti kapsamı bu araçlarda önem kazanır.' }
    ]
  },

  // ==========================================================================
  // MARKA KAPSAMINI GENİŞLETME — daha önce yalnızca dizel/hibrit motoru
  // kayıtlı olan gruplara benzinli karşılıkları eklenir.
  // ==========================================================================
  {
    id: 'volvo-vea-t',
    family: 'Drive-E VEA',
    name: '1.5 T2/T3 · 2.0 T4/T5',
    aliases: ['T3', 'T4', 'T5', 'Drive-E Turbo'],
    codes: ['B4154T3', 'B4204T', 'B4204T19'],
    group: 'Volvo',
    displacement: 1969,
    fuel: 'Benzin',
    power: '150 - 254 HP',
    torque: '250 - 350 Nm',
    years: '2013 - 2022',
    usedIn: ['Volvo V40', 'Volvo S60', 'Volvo XC60', 'Volvo XC90'],
    durability: 76,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Turbo ve kompresörü (T5/T6) birlikte olan versiyonlarda yağ kalitesi önemlidir.' },
    problems: [
      { title: 'Triger zinciri gerdiricisi aşınması', risk: 'Orta', cost: '12.000 - 35.000 TL', note: 'Soğuk çalıştırmada kısa süreli metalik tıkırtı erken belirtidir.' },
      { title: 'Yağ buharı ayırıcısından (PCV) intercoolere yağ sızıntısı', risk: 'Orta', cost: '4.000 - 15.000 TL', note: 'Turbo borularında yağlanma görülürse kontrol ettirilmeli.' },
      { title: 'Yüksek basınç yakıt pompası arızası', risk: 'Düşük', cost: '8.000 - 20.000 TL', note: '' }
    ]
  },
  {
    id: 'mitsubishi-mivec',
    family: 'MIVEC',
    name: '1.6 / 2.0 / 2.4 MIVEC',
    aliases: ['4J11', '4B10', '4B11', '4B12'],
    codes: ['4J11', '4B10', '4B12'],
    group: 'Mitsubishi',
    displacement: 1998,
    fuel: 'Benzin',
    power: '117 - 150 HP',
    torque: '154 - 220 Nm',
    years: '2010 - 2021',
    usedIn: ['Mitsubishi ASX', 'Mitsubishi Outlander', 'Mitsubishi Lancer'],
    durability: 80,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'MIVEC değişken supap zamanlama aktüatörü arızası', risk: 'Düşük', cost: '5.000 - 15.000 TL', note: 'Rölantide hafif düzensizlik ve arıza lambası ile kendini gösterir.' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '5.000 - 15.000 TL', note: 'Direkt enjeksiyonlu versiyonlarda (4B12 MIVEC DI) görülür.' },
      { title: 'Motor takozu sertleşmesi', risk: 'Düşük', cost: '3.000 - 8.000 TL', note: 'Rölantide titreşim artışına yol açar.' }
    ]
  },
  {
    id: 'suzuki-k-petrol',
    family: 'K-Series',
    name: '1.0 Boosterjet · 1.4 / 1.6 VVT',
    aliases: ['K10C', 'K14D', 'M16A'],
    codes: ['K14D', 'K10C', 'M16A'],
    group: 'Suzuki',
    displacement: 1373,
    fuel: 'Benzin',
    power: '90 - 140 HP',
    torque: '130 - 235 Nm',
    years: '2010 - 2024',
    usedIn: ['Suzuki SX4', 'Suzuki Vitara', 'Suzuki Swift', 'Suzuki S-Cross'],
    durability: 86,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Ailenin genel güvenilirlik notu yüksektir; bakımı ihmal edilmediği sürece sorun azdır.' },
    problems: [
      { title: 'Rölanti kontrol/VVT aktüatörü kirlenmesi', risk: 'Düşük', cost: '2.000 - 6.000 TL', note: 'Rölantide dalgalanma ile fark edilir.' },
      { title: 'Boosterjet turbosunda hafif yağ tüketimi', risk: 'Düşük', cost: '0 - 6.000 TL', note: '1.0 Boosterjet\'te bazı araçlarda bildirilir; garanti takibi önemlidir.' },
      { title: 'Ateşleme bobini arızası', risk: 'Düşük', cost: '1.500 - 4.000 TL', note: '' }
    ]
  },
  {
    id: 'gm-ecotec',
    family: 'Ecotec Family 1',
    name: '1.4 / 1.6 / 1.8 Ecotec',
    aliases: ['LDE', 'F16D4', 'A16XER'],
    codes: ['LDE', 'A16XER', 'F16D4'],
    group: 'GM',
    displacement: 1598,
    fuel: 'Benzin',
    power: '86 - 141 HP',
    torque: '150 - 175 Nm',
    years: '2005 - 2016',
    usedIn: ['Chevrolet Cruze', 'Chevrolet Aveo', 'Opel Astra', 'Opel Corsa'],
    durability: 79,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'PCV (karter gazı) valfi tıkanması', risk: 'Düşük', cost: '1.500 - 4.000 TL', note: 'İhmal edilirse contalardan yağ sızıntısına yol açar.' },
      { title: 'Ateşleme bobini/kablo arızası', risk: 'Düşük', cost: '1.500 - 5.000 TL', note: 'Rölantide titreme ve arıza lambası ile kendini gösterir.' },
      { title: '1.8 (LDE) motorda hafif yağ tüketimi', risk: 'Orta', cost: '0 - 12.000 TL', note: 'Yüksek kilometrede piston segmanı kaynaklı yağ tüketimi bildirilir; yağ seviyesi sık kontrol edilmeli.' }
    ]
  },

  // ==========================================================================
  // MARKA KAPSAMINI GENİŞLETME — 2. tur: yeni eklenen modeller için eksik
  // motor varyantları.
  // ==========================================================================
  {
    id: 'ssangyong-gdi-16',
    family: 'G16',
    name: '1.6 GDI',
    codes: ['G16'],
    group: 'SsangYong',
    displacement: 1597,
    fuel: 'Benzin',
    power: '126 - 128 HP',
    torque: '160 Nm',
    years: '2015 - 2024',
    usedIn: ['SsangYong Tivoli'],
    durability: 76,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Direkt enjeksiyon karbon birikimi', risk: 'Orta', cost: '5.000 - 15.000 TL', note: '' },
      { title: 'Marka servis ağının dar olması', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; parça temin süresi uzayabilir.' }
    ]
  },
  {
    id: 'jeep-pentastar-36',
    family: 'Pentastar',
    name: '3.6 V6 Pentastar',
    codes: ['ERB'],
    group: 'Stellantis-Fiat',
    displacement: 3604,
    fuel: 'Benzin',
    power: '286 - 295 HP',
    torque: '347 Nm',
    years: '2011 - 2024',
    usedIn: ['Jeep Grand Cherokee', 'Jeep Wrangler'],
    durability: 82,
    maintenance: { oilKm: 12000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'İlk nesillerde supap iticisi (lifter) tıkırtısı', risk: 'Düşük', cost: '8.000 - 25.000 TL', note: '2011-2013 üretimlerinde bildirilir; sonraki üretimlerde büyük ölçüde giderildi.' },
      { title: 'Yüksek yakıt tüketimi', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; büyük hacimli V6 motorun karakteridir.' }
    ]
  },
  {
    id: 'jeep-crd-28',
    family: 'VM Motori',
    name: '2.8 CRD',
    codes: ['ENS'],
    group: 'Stellantis-Fiat',
    displacement: 2777,
    fuel: 'Dizel',
    power: '163 - 200 HP',
    torque: '360 - 460 Nm',
    years: '2007 - 2018',
    usedIn: ['Jeep Wrangler', 'Jeep Grand Cherokee'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Kayış', note: '' },
    problems: [
      { title: 'Enjektör ve yüksek basınç pompası arızası', risk: 'Orta', cost: '15.000 - 45.000 TL', note: '' },
      { title: 'EGR ve turbo kurumlanması', risk: 'Orta', cost: '6.000 - 20.000 TL', note: '' }
    ]
  },
  {
    id: 'jlr-td6-v6',
    family: 'SDV6 / TD6',
    name: '3.0 V6 Turbo Diesel',
    codes: ['306DT'],
    group: 'JLR',
    displacement: 2993,
    fuel: 'Dizel',
    power: '249 - 306 HP',
    torque: '600 - 700 Nm',
    years: '2010 - 2022',
    usedIn: ['Land Rover Range Rover Sport', 'Land Rover Defender', 'Jaguar F-Pace'],
    durability: 76,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Zincir gerdirici aşınması', risk: 'Orta', cost: '15.000 - 40.000 TL', note: '' },
      { title: 'Hava süspansiyon körükleri', risk: 'Orta', cost: '15.000 - 45.000 TL', note: 'Motora özgü değil ama bu gövdelerde neredeyse standarttır.' },
      { title: 'AdBlue/SCR sistemi arızası', risk: 'Orta', cost: '8.000 - 35.000 TL', note: '' }
    ]
  },
  {
    id: 'jlr-ingenium-p300',
    family: 'Ingenium',
    name: '2.0 P250 / P300 Turbo Benzin',
    codes: ['204PT'],
    group: 'JLR',
    displacement: 1997,
    fuel: 'Benzin',
    power: '250 - 300 HP',
    torque: '365 - 400 Nm',
    years: '2017 - 2024',
    usedIn: ['Jaguar F-Pace', 'Jaguar E-Pace', 'Land Rover Range Rover Sport', 'Land Rover Defender'],
    durability: 79,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Turbo aktüatör arızası', risk: 'Düşük', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'Emme supabı karbon birikimi', risk: 'Düşük', cost: '6.000 - 18.000 TL', note: '' }
    ]
  },
  {
    id: 'gm-spark-10',
    family: 'SmarTech',
    name: '1.0 / 1.2',
    codes: ['B10D1', 'B12D1'],
    group: 'GM',
    displacement: 995,
    fuel: 'Benzin',
    power: '68 - 80 HP',
    torque: '92 - 108 Nm',
    years: '2010 - 2022',
    usedIn: ['Chevrolet Spark'],
    durability: 77,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Rölanti motoru/gaz kelebeği kirlenmesi', risk: 'Düşük', cost: '1.500 - 4.000 TL', note: '' },
      { title: 'Düşük güç nedeniyle yokuş/yük altında zorlanma', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; motor karakteridir.' }
    ]
  },
  {
    id: 'alfa-jtdm-22',
    family: 'JTDm',
    name: '2.2 JTDm / MultiJet',
    codes: ['940B2'],
    group: 'Stellantis-Fiat',
    displacement: 2143,
    fuel: 'Dizel',
    power: '150 - 210 HP',
    torque: '380 - 470 Nm',
    years: '2016 - 2024',
    usedIn: ['Alfa Romeo Giulia', 'Alfa Romeo Stelvio'],
    durability: 78,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: '' },
    problems: [
      { title: 'Enjektör arızası', risk: 'Orta', cost: '10.000 - 35.000 TL', note: '' },
      { title: 'DPF tıkanması (kısa mesafede)', risk: 'Orta', cost: '6.000 - 40.000 TL', note: '' }
    ]
  },

  // ==========================================================================
  // 3. TUR GENİŞLETME — yeni markalar (Lexus, Porsche, MG, DS) ve yeni ikinci
  // kademe modeller (Ford Ranger vb.) için eksik motor varyantları.
  // ==========================================================================
  {
    id: 'porsche-v6-turbo',
    family: 'EA839',
    name: '3.0 V6 Turbo',
    codes: ['DFI'],
    group: 'VAG',
    displacement: 2995,
    fuel: 'Benzin',
    power: '340 - 440 HP',
    torque: '450 - 550 Nm',
    years: '2017 - 2024',
    usedIn: ['Porsche Cayenne', 'Porsche Macan', 'Audi SQ7', 'Audi SQ5'],
    durability: 80,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Yüksek performanslı motor; yağ kalitesi ve ısınma sonrası kullanım ömrü doğrudan etkiler.' },
    problems: [
      { title: 'Hava süspansiyon körükleri', risk: 'Orta', cost: '20.000 - 60.000 TL', note: 'Motora özgü değil ama bu gövdelerde neredeyse standarttır.' },
      { title: 'Turbo/aktüatör arızası', risk: 'Düşük', cost: '15.000 - 45.000 TL', note: '' },
      { title: 'Yüksek yakıt ve bakım maliyeti', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; performans motorunun karakteridir.' }
    ]
  },
  {
    id: 'mg-turbo-15',
    family: 'SGE',
    name: '1.5 Turbo',
    codes: ['15S4C'],
    group: 'MG',
    displacement: 1490,
    fuel: 'Benzin',
    power: '162 - 170 HP',
    torque: '230 - 250 Nm',
    years: '2018 - 2024',
    usedIn: ['MG ZS', 'MG HS'],
    durability: 74,
    maintenance: { oilKm: 15000, timing: 'Zincir', note: 'Yeni nesil bir motor ailesidir; Türkiye\'de uzun vadeli arıza istatistiği henüz sınırlıdır.' },
    problems: [
      { title: 'Turbo/aktüatör arızası', risk: 'Düşük', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'Uzun vadeli güvenilirlik verisi sınırlı', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; markanın Türkiye\'deki geçmişi kısa olduğundan istatistik azdır. Garanti kapsamı bu araçlarda önem kazanır.' }
    ]
  },
  {
    id: 'ford-duratorq-32',
    family: 'Duratorq TDCi',
    name: '3.2 TDCi',
    codes: ['P5AT'],
    group: 'Ford',
    displacement: 3198,
    fuel: 'Dizel',
    power: '200 HP',
    torque: '470 Nm',
    years: '2011 - 2019',
    usedIn: ['Ford Ranger'],
    durability: 81,
    maintenance: { oilKm: 15000, timing: 'Kayış', note: '' },
    problems: [
      { title: 'Turbo aktüatör yapışması', risk: 'Orta', cost: '10.000 - 30.000 TL', note: '' },
      { title: 'DPF tıkanması (kısa mesafede)', risk: 'Orta', cost: '6.000 - 40.000 TL', note: '' },
      { title: 'Ticari/arazi kullanımı nedeniyle aşırı yüklenme aşınması', risk: 'Düşük', cost: '0 TL', note: 'Arıza değil; kullanım amacına dikkat edilmeli.' }
    ]
  }
]

/** Motor kimliğine göre kayıt. */
export function getEngineById(id) {
  return ENGINES.find((engine) => engine.id === id) || null
}
