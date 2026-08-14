/**
 * Satıcıya sorulacak soruları üretir.
 *
 * Yeni veri yazmadan, elimizdeki kronik arıza kayıtlarından modele özel soru
 * listesi çıkarılır. "Bu arabanın nesi var?" diye soran alıcı ile "N47 zinciri
 * kaç kilometrede değişti?" diye soran alıcıya satıcı aynı cevabı vermez.
 */

import { getEnrichedProblems, getVehicleEntry } from './vehicleService'
import { CURRENT_YEAR } from '../utils/vehicleOptions'

const RISK_ORDER = { Yüksek: 0, Orta: 1, Düşük: 2 }

/** Her araçta sorulacak, modelden bağımsız sorular. */
const GENERIC_QUESTIONS = [
  {
    id: 'kacinci-sahip',
    question: 'Kaçıncı sahibisiniz ve aracı kaç yıldır kullanıyorsunuz?',
    why: 'Sık el değiştiren araçta genellikle kimsenin çözmediği bir sorun vardır.',
    category: 'Geçmiş'
  },
  {
    id: 'servis-gecmisi',
    question: 'Bakımları nerede yaptırdınız, faturaları veya servis kaydı var mı?',
    why: 'Belgeli bakım geçmişi, aracın en değerli ekidir; olmaması tek başına pazarlık sebebidir.',
    category: 'Geçmiş'
  },
  {
    id: 'son-bakim',
    question: 'En son hangi kilometrede ve neler yapıldı?',
    why: 'Yaklaşan büyük bakım kalemlerini (kayış, şanzıman yağı, debriyaj) hemen sen ödeyeceksin.',
    category: 'Bakım'
  },
  {
    id: 'degisen-parca',
    question: 'Değişen veya boyanan parça var mı, varsa hangileri?',
    why: 'Sorup cevabı not al. Ekspertiz raporu bununla çelişirse satıcının beyanı hakkında da bilgi edinmiş olursun.',
    category: 'Kaporta'
  },
  {
    id: 'ruhsat-kayit',
    question: 'Araçta rehin, haciz veya ödenmemiş ceza var mı?',
    why: 'Devir anında öğrenmek yerine baştan sor; sonrasında noterde iş tıkanır.',
    category: 'Evrak'
  },
  {
    id: 'neden-satiyor',
    question: 'Aracı neden satıyorsunuz?',
    why: 'Cevabın kendisinden çok tutarlılığı önemli. Süreç içinde değişen bir gerekçe uyarı işaretidir.',
    category: 'Geçmiş'
  }
]

function questionForProblem(problem) {
  const title = problem.title

  if (problem.archetypeId === 'triger-zinciri') {
    return {
      id: 'zincir',
      question: 'Triger zinciri ve gergisi değişti mi, kaç kilometrede yapıldı?',
      why:
        'Bu motorun bilinen en pahalı kalemi. Değiştiyse faturası aracın değerini artırır, değişmediyse yakın gelecekte seni bekleyen bir masraftır.',
      category: 'Motor',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'dsg-mekatronik' || problem.archetypeId === 'cvt') {
    return {
      id: 'sanziman',
      question: 'Şanzıman yağı ve filtresi değişti mi? Mekatronik/kavrama işlem gördü mü?',
      why:
        'Bu şanzımanda bakım kaydı olmayan araçta arıza riski çok yüksek ve onarımı motor kadar pahalı.',
      category: 'Şanzıman',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'dpf') {
    return {
      id: 'dpf-kullanim',
      question: 'Araç çoğunlukla şehir içinde mi kullanıldı? DPF hiç temizlendi veya değişti mi?',
      why:
        'Sadece kısa mesafe kullanılan dizelde partikül filtresi dolar. Cevap "şehir içi" ise DPF masrafını fiyata yansıt.',
      category: 'Egzoz',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'enjektor') {
    return {
      id: 'enjektor',
      question: 'Enjektörler hiç bakım gördü mü, değişen oldu mu?',
      why: 'Enjektör seti bu motorda ciddi bir masraf kalemi; değişmişse hangi markayla değiştiğini de sor.',
      category: 'Yakıt',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'yag-tuketimi') {
    return {
      id: 'yag-tuketimi',
      question: 'Araç yağ eksiltiyor mu? İki bakım arasında yağ ilave ediyor musunuz?',
      why:
        'Bu motorda yağ tüketimi bilinen bir sorun. "Az bir şey yer" cevabı segman aşınmasının başlangıcı olabilir.',
      category: 'Motor',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'hibrit-batarya') {
    return {
      id: 'batarya',
      question: 'Hibrit batarya sağlık raporu var mı, hiç hücre değişimi yapıldı mı?',
      why: 'Bataryanın durumu bu araçta motordan daha belirleyici; rapor istemekten çekinme.',
      category: 'Hibrit',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'hava-suspansiyon') {
    return {
      id: 'suspansiyon',
      question: 'Hava süspansiyonu körükleri veya kompresörü değişti mi?',
      why: 'Sabah araca bakıp çökmüş olup olmadığını da kontrol et; kaçak gece belli olur.',
      category: 'Süspansiyon',
      risk: problem.risk
    }
  }

  if (problem.archetypeId === 'egr' || problem.archetypeId === 'emme-karbon') {
    return {
      id: 'kurumlanma',
      question: 'EGR temizliği veya emme manifoldu kurum temizliği yaptırdınız mı?',
      why:
        'Bu motorda kurumlanma bir bakım kalemidir. Hiç yapılmadıysa rölanti sorunu ve güç kaybı kapıda demektir.',
      category: 'Motor',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'turbo' || problem.archetypeId === 'turbo-aktuator') {
    return {
      id: 'turbo',
      question: 'Turbo veya turbo aktüatörü hiç revizyon gördü mü?',
      why:
        'Soğuk çalıştırmada rölantide takırtı geliyorsa aktüatör konuşuyordur. Erken müdahale turboyu kurtarır, geç kalınırsa turbo komple gider.',
      category: 'Turbo',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'volan-debriyaj') {
    return {
      id: 'volan',
      question: 'Debriyaj ve volan değişti mi, kaç kilometrede?',
      why:
        'Çift kütleli volan bu araçta ciddi bir kalem. Rölantide debriyaja basınca sesin değişip değişmediğini test sürüşünde dinle.',
      category: 'Şanzıman',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'adblue') {
    return {
      id: 'adblue',
      question: 'AdBlue sistemi hiç arıza verdi mi, sistem orijinal mi?',
      why:
        'İptal edilmiş AdBlue sistemi muayenede ve emisyon denetiminde sorun çıkarır; geri dönüşü de pahalıdır.',
      category: 'Egzoz',
      risk: problem.risk
    }
  }
  if (problem.archetypeId === 'suspansiyon-burc') {
    return {
      id: 'suspansiyon-burc',
      question: 'Ön takım (salıncak, rotil, burç) yenilendi mi?',
      why:
        'Bozuk yolda normal bir aşınmadır ama yapılmamışsa hemen senin cebinden çıkar; pazarlık kalemi olarak kullan.',
      category: 'Süspansiyon',
      risk: problem.risk
    }
  }

  // Arketip eşleşmediyse arıza başlığından genel bir soru üretilir.
  return {
    id: 'problem-' + title.slice(0, 24),
    question: '"' + title + '" bu araçta hiç yaşandı mı?',
    why:
      'Bu motorun bilinen sorunlarından biri. Satıcının cevabını not al; ekspertiz bulgusuyla çelişirse pazarlıkta en güçlü kozun olur.',
    category: 'Bilinen arıza',
    risk: problem.risk
  }
}

/**
 * @param {object} formData { brand, model, engine, year, km }
 * @returns {{vehicleLabel: string, questions: Array}|null}
 */
export function buildSellerQuestions(formData) {
  if (!formData?.brand || !formData?.model) return null

  const entry = getVehicleEntry(formData.brand, formData.model)
  const problems = getEnrichedProblems(formData.brand, formData.model, formData.engine)

  const specific = []
  const seen = new Set()

  problems
    .slice()
    .sort((a, b) => (RISK_ORDER[a.risk] ?? 3) - (RISK_ORDER[b.risk] ?? 3))
    .forEach((problem) => {
      const question = questionForProblem(problem)
      if (seen.has(question.id)) return
      seen.add(question.id)
      specific.push(question)
    })

  const contextual = []
  const age = formData.year ? CURRENT_YEAR - Number(formData.year) : null
  const km = Number(formData.km) || 0

  if (km >= 150000) {
    contextual.push({
      id: 'yuksek-km',
      question: 'Bu kilometrede debriyaj, amortisör ve süspansiyon takımı yenilendi mi?',
      why: '150.000 km üzerinde bu kalemler sırayla gelir; yenilenmediyse alım sonrası ilk yılın masrafıdır.',
      category: 'Aşınma'
    })
  }
  if (age !== null && age >= 8) {
    contextual.push({
      id: 'yasli-arac',
      question: 'Su hortumları, körükler ve lastiklerin yaşı ne durumda?',
      why: 'Kilometreden bağımsız olarak kauçuk parçalar yaşlanır; 8 yaş üzeri araçlarda sık atlanan bir kalemdir.',
      category: 'Aşınma'
    })
  }
  if (entry?.features?.driveType === 'Dörtten Çekiş' || entry?.features?.driveType === '4x4') {
    contextual.push({
      id: 'dortceker',
      question: 'Dört çeker sistemin yağ/filtre bakımı yapıldı mı?',
      why: 'Bu bakım çoğunlukla atlanır ve atlanınca aktarma organları pahalıya patlar.',
      category: 'Aktarma'
    })
  }

  return {
    vehicleLabel: [formData.brand, formData.model, formData.engine, formData.year]
      .filter(Boolean)
      .join(' '),
    questions: [...specific, ...contextual, ...GENERIC_QUESTIONS]
  }
}
