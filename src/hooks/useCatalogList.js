import { useEffect, useRef, useState } from 'react'

/**
 * Canonical-first katalog listeleri için ortak async durum kancası.
 *
 * `catalogAdapter`'daki `listBrands`/`listModels`/`listGenerations`/
 * `listEngines`/... fonksiyonlarının hepsi aynı şekilde kullanılır: bir
 * bağımlılık değiştiğinde yeniden çek, çekerken göster, hata olursa göster
 * ve tekrar dene imkânı ver, eski (stale) bir cevap yeni bir isteğin
 * üzerine yazmasın. Bu döngü VehiclePicker'da dört kez (marka/model/nesil/
 * motor) tekrar ettiği için tek yerde toplanır.
 *
 * @param {() => Promise<any>} fetcher   null/undefined dönerse "atla" sayılır
 * @param {Array} deps                    fetcher'ı yeniden tetikleyen bağımlılıklar
 * @param {boolean} enabled                false ise hiç çekmez, durumu sıfırlar
 */
export function useCatalogList(fetcher, deps, enabled = true) {
  const [state, setState] = useState({ data: null, loading: false, error: null })
  const seqRef = useRef(0)

  function load() {
    if (!enabled) {
      setState({ data: null, loading: false, error: null })
      return
    }
    const seq = ++seqRef.current
    setState((current) => ({ ...current, loading: true, error: null }))
    Promise.resolve()
      .then(fetcher)
      .then((data) => {
        if (seq !== seqRef.current) return
        setState({ data: data ?? null, loading: false, error: null })
      })
      .catch((err) => {
        if (seq !== seqRef.current) return
        setState({ data: null, loading: false, error: err?.message || 'Yüklenemedi' })
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { ...state, retry: load }
}
