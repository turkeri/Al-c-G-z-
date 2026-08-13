export function calculateLoan({ price, downPaymentPercent, months, monthlyRatePercent }) {
  const priceNum = Number(price) || 0
  const downPaymentAmount = Math.round((priceNum * Number(downPaymentPercent)) / 100)
  const loanAmount = Math.max(0, priceNum - downPaymentAmount)
  const monthlyRate = Number(monthlyRatePercent) / 100
  const n = Number(months)

  let monthlyInstallment
  if (monthlyRate === 0) {
    monthlyInstallment = n > 0 ? loanAmount / n : 0
  } else {
    const factor = Math.pow(1 + monthlyRate, n)
    monthlyInstallment = (loanAmount * monthlyRate * factor) / (factor - 1)
  }

  const totalPayment = monthlyInstallment * n
  const totalInterest = totalPayment - loanAmount

  return {
    downPaymentAmount,
    loanAmount,
    monthlyInstallment: Math.round(monthlyInstallment),
    totalPayment: Math.round(totalPayment + downPaymentAmount),
    totalInterest: Math.round(totalInterest)
  }
}
