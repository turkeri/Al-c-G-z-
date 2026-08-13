import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { formatPrice } from '../utils/formatters'
import { calculateLoan } from '../services/loanService'

const TERM_OPTIONS = [12, 24, 36, 48, 60]

export default function LoanCalculatorPage() {
  const location = useLocation()
  const initialPrice = location.state?.price || ''

  const [price, setPrice] = useState(initialPrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState(30)
  const [months, setMonths] = useState(36)
  const [monthlyRatePercent, setMonthlyRatePercent] = useState(4)

  const result = useMemo(
    () => calculateLoan({ price, downPaymentPercent, months, monthlyRatePercent }),
    [price, downPaymentPercent, months, monthlyRatePercent]
  )

  return (
    <>
      <Header title="Kredi / Taksit Hesaplayıcı" subtitle="Peşinat ve vadeye göre tahmini aylık ödeme." showBack />
      <PageContainer>
        <form className="analysis-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Araç Fiyatı (TL)
            <input
              type="number"
              inputMode="numeric"
              placeholder="Örn. 1420000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>

          <div className="form-row">
            <label>
              Peşinat (%)
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="100"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(e.target.value)}
              />
            </label>

            <label>
              Vade (ay)
              <select value={months} onChange={(e) => setMonths(e.target.value)}>
                {TERM_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} ay
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Aylık Faiz Oranı (%)
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={monthlyRatePercent}
              onChange={(e) => setMonthlyRatePercent(e.target.value)}
            />
          </label>
        </form>

        <section className="result-card">
          <h3>Tahmini Ödeme Planı</h3>
          <div className="market-facts">
            <div>
              <span>Peşinat</span>
              <strong>{formatPrice(result.downPaymentAmount)}</strong>
            </div>
            <div>
              <span>Çekilecek Kredi</span>
              <strong>{formatPrice(result.loanAmount)}</strong>
            </div>
          </div>
          <p className="negotiation-amount">{formatPrice(result.monthlyInstallment)} / ay</p>
          <div className="market-facts">
            <div>
              <span>Toplam Geri Ödeme</span>
              <strong>{formatPrice(result.totalPayment)}</strong>
            </div>
            <div>
              <span>Toplam Faiz</span>
              <strong>{formatPrice(result.totalInterest)}</strong>
            </div>
          </div>
          <p className="market-disclaimer">
            Bu hesaplama örnek bir faiz oranıyla yapılan basit bir simülasyondur; gerçek banka/finansman
            teklifleri BSMV, KKDF ve masraflara göre farklılık gösterebilir.
          </p>
        </section>
      </PageContainer>
    </>
  )
}
