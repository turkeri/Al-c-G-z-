export function formatKm(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '-'
  return `${num.toLocaleString('tr-TR')} km`
}

export function formatPrice(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '-'
  return `${num.toLocaleString('tr-TR')} TL`
}

export function formatYear(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '-'
  return String(num)
}

export function vehicleAge(year, referenceYear = new Date().getFullYear()) {
  const num = Number(year)
  if (Number.isNaN(num)) return 0
  return Math.max(0, referenceYear - num)
}
