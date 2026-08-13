export function buildDecisionSummary(result, marketEstimate) {
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

  if (marketEstimate?.verdict === 'pahali' && verdict === 'al') {
    verdict = 'dikkatli'
    title = 'Fiyat pazarlığı yap'
    description = 'Araç kendi içinde makul görünüyor ama ilan fiyatı piyasanın üzerinde; pazarlık önerisine bak.'
  }

  return { verdict, title, description }
}
