import { analyzeVehicle } from './analysisService'
import { estimateMarketPrice } from './marketService'
import { formatPrice } from '../utils/formatters'

export function compareTwoVehicles(formA, formB) {
  const resultA = analyzeVehicle(formA)
  const resultB = analyzeVehicle(formB)
  const marketA = estimateMarketPrice(formA)
  const marketB = estimateMarketPrice(formB)

  const labelA = `${formA.brand} ${formA.model}`
  const labelB = `${formB.brand} ${formB.model}`
  const summary = []

  const scoreDiff = resultA.score - resultB.score
  if (Math.abs(scoreDiff) >= 5) {
    const better = scoreDiff > 0 ? labelA : labelB
    summary.push(`${better}, risk skoru bakımından ${Math.abs(scoreDiff)} puan daha iyi görünüyor.`)
  } else {
    summary.push('İki araç risk skoru bakımından birbirine yakın.')
  }

  const problemDiff = resultA.knownProblems.length - resultB.knownProblems.length
  if (problemDiff !== 0) {
    const fewer = problemDiff < 0 ? labelA : labelB
    summary.push(`${fewer}, kayıtlı kronik sorun sayısı bakımından daha az riskli.`)
  }

  if (marketA && marketB) {
    if (marketA.diffPercent !== marketB.diffPercent) {
      const cheaper = marketA.diffPercent < marketB.diffPercent ? labelA : labelB
      summary.push(`${cheaper}, piyasa değerine göre fiyat açısından daha avantajlı görünüyor.`)
    }
  }

  const fuelA = resultA.engineData?.avgFuelConsumption
  const fuelB = resultB.engineData?.avgFuelConsumption
  if (fuelA && fuelB && fuelA !== fuelB) {
    const efficient = fuelA < fuelB ? labelA : labelB
    const diff = Math.abs(fuelA - fuelB).toFixed(1)
    summary.push(`${efficient}, ortalama yakıt tüketiminde 100 km başına ~${diff} L daha avantajlı.`)
  }

  if (Number(formA.price) && Number(formB.price)) {
    const priceDiff = Number(formA.price) - Number(formB.price)
    if (Math.abs(priceDiff) > 0) {
      const cheaperListed = priceDiff < 0 ? labelA : labelB
      summary.push(`${cheaperListed}, girilen ilan fiyatına göre ${formatPrice(Math.abs(priceDiff))} daha ucuz.`)
    }
  }

  return { resultA, resultB, marketA, marketB, summary }
}
