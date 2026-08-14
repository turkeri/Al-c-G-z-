import { formatPrice } from '../utils/formatters'

const PROBLEM_RISK_BUFFER = { Yüksek: 25000, Orta: 12000, Düşük: 4000 }

export function buildNegotiationAdvice(result, marketEstimate) {
  const reasons = []
  let suggestedDiscount = 0

  if (marketEstimate && marketEstimate.diffAmount > 0) {
    suggestedDiscount += marketEstimate.diffAmount
    reasons.push(
      `İlan fiyatı tahmini piyasa değerinin yaklaşık %${marketEstimate.diffPercent} üzerinde (~${formatPrice(
        marketEstimate.diffAmount
      )} fark).`
    )
  }

  const problemBuffer = result.knownProblems.reduce((sum, p) => sum + (PROBLEM_RISK_BUFFER[p.risk] || 0), 0)
  if (problemBuffer > 0) {
    suggestedDiscount += problemBuffer
    reasons.push(
      `Bilinen ${result.knownProblems.length} kronik sorun için kontrol/olası bakım payı olarak ${formatPrice(
        problemBuffer
      )} ek pay önerilir.`
    )
  }

  if (suggestedDiscount === 0) {
    // Fiyat karşılaştırması hiç yapılamadıysa "fiyat uygun" demek yanlış olur;
    // elde bir dayanak olmadığı açıkça söylenir.
    const reason = marketEstimate
      ? 'Fiyat piyasa seviyesinde ve belirgin bir kronik risk yok; güçlü bir pazarlık gerekçesi bulunmuyor.'
      : 'Bu araç için piyasa fiyat karşılaştırması yapılamadı (ilan fiyatı girilmedi ya da araç veritabanımızda yok). Pazarlık payı hesaplanamıyor.'
    return { hasSuggestion: false, suggestedDiscount: 0, reasons: [reason] }
  }

  return {
    hasSuggestion: true,
    suggestedDiscount: Math.round(suggestedDiscount / 1000) * 1000,
    reasons
  }
}
