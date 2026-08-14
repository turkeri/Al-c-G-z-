/**
 * Analiz sonucunu tek bir karar cümlesine indirger.
 *
 * Kritik kural: eksik veri, kötü araç demek DEĞİLDİR. Kullanıcı sadece marka
 * ve model girdiğinde motor bilgisi olmadığı için skor düşük çıkar; bunu
 * "tavsiye edilmez" diye sunmak kullanıcıyı yanıltır ve sağlam bir araçtan
 * vazgeçirebilir. Veri yetersizse karar verilmez, veri istenir.
 */

/** Bu eşiğin altında sayısal skor bir karar için yeterli dayanak sağlamaz. */
const MIN_COMPLETENESS_FOR_VERDICT = 60

export function buildDecisionSummary(result, marketEstimate) {
  const quality = result.dataQuality

  if (quality && quality.completeness < MIN_COMPLETENESS_FOR_VERDICT) {
    return {
      verdict: 'belirsiz',
      title: 'Karar için veri yetersiz',
      description:
        'Eksik alanlar yüzünden sağlıklı bir değerlendirme yapılamıyor. En azından model yılı ve kilometreyi girersen net bir sonuç verebiliriz.' +
        (quality.missingLabels.length ? ' Eksik olanlar: ' + quality.missingLabels.join(', ') + '.' : '')
    }
  }

  const tone = result.band.tone

  let verdict = 'dikkatli'
  let title = 'Dikkatli değerlendir'
  let description = 'Bazı riskler mevcut; ekspertize götürmeden karar verme.'

  if (tone === 'danger') {
    verdict = 'alma'
    title = 'Yüksek risk — tavsiye edilmez'
    description = 'Tespit edilen riskler ciddi; bu haliyle almanı önermeyiz.'
  } else if (tone === 'excellent') {
    verdict = 'al'
    title = 'Alınabilir'
    description = 'Genel görünüm olumlu, standart kontrolleri yaptırıp devam edebilirsin.'
  } else if (tone === 'good') {
    verdict = 'al'
    title = 'Kontrol ederek alınabilir'
    description = 'Riskler yönetilebilir seviyede; belirtilen noktaları kontrol ettir.'
  }

  // Araç veritabanında yoksa kronik sorun verisi hiç yoktur; skor yalnızca yaş
  // ve kilometreye dayanır. Bu durumda hiçbir yönde KESİN hüküm verilmez:
  // ne "alınabilir" denir, ne de "tavsiye edilmez". Elimizde o motoru
  // suçlayacak da aklayacak da veri yok.
  if (quality && !quality.knownVehicle && verdict !== 'dikkatli') {
    const wasPositive = verdict === 'al'
    verdict = 'dikkatli'
    title = 'Kontrol ederek değerlendir'
    description = wasPositive
      ? 'Yaş ve kilometre açısından tablo olumlu, ancak bu aracın motoruna özgü kronik sorunlar veritabanımızda yok. Aşağıdaki araştırma bölümünü kullan ve ekspertize götür.'
      : 'Yaş ve kilometre risk tarafında görünüyor, ancak bu motora ait arıza kaydımız olmadığı için kesin bir olumsuz hüküm vermiyoruz. Aşağıdaki araştırma bölümünden bu aracın bilinen sorunlarını öğren ve mutlaka ekspertize götür.'
  }

  if (marketEstimate?.verdict === 'pahali' && verdict === 'al') {
    verdict = 'dikkatli'
    title = 'Fiyat pazarlığı yap'
    description =
      'Araç kendi içinde makul görünüyor ama ilan fiyatı piyasanın üzerinde; pazarlık önerisine bak.'
  }

  return { verdict, title, description }
}
