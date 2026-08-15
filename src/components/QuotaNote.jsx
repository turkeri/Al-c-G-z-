import { useEffect, useState } from 'react'
import { PROXY_BASE_URL } from '../services/aiService'
import { fetchAccount, getCachedAccount } from '../services/accountService'

/**
 * Kalan aylık analiz hakkı.
 *
 * Kullanıcı butona basmadan ÖNCE kaç hakkı kaldığını bilmeli; hakkın bittiğini
 * istek reddedildiğinde öğrenmek kötü bir deneyimdir.
 *
 * Buradaki sayı bir KAYIT DEĞİL, GÖSTERGEDİR. Gerçek sayaç sunucuda tutulur ve
 * karar orada verilir; bu bileşen yalnızca sunucunun bildirdiğini yazar.
 * Sunucuya ulaşılamıyorsa hiçbir şey gösterilmez — yanlış bir sayı göstermek,
 * hiç göstermemekten kötüdür.
 */
export function useAccount() {
  const [account, setAccount] = useState(() => getCachedAccount())

  useEffect(() => {
    let alive = true
    fetchAccount(PROXY_BASE_URL).then((fresh) => {
      if (alive && fresh) setAccount(fresh)
    })
    return () => {
      alive = false
    }
  }, [])

  return account
}

export default function QuotaNote({ account, style }) {
  if (!account || typeof account.remaining !== 'number') return null

  const exhausted = account.remaining <= 0
  return (
    <p className="market-disclaimer" style={style}>
      {exhausted
        ? `Bu ayki ${account.limit} analiz hakkının tamamını kullandın. Hakkın ayın başında yenilenir.`
        : `Bu ay kalan analiz hakkın: ${account.remaining} / ${account.limit} (${account.planLabel})`}
    </p>
  )
}
