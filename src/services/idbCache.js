/**
 * Küçük IndexedDB anahtar-değer deposu.
 *
 * Araç veritabanı localStorage'a sığmayacak kadar büyüdü (600 KB ve büyüyor);
 * localStorage'ın 5 MB sınırı ve senkron API'si bu iş için uygun değil.
 * Harici bir kütüphane eklemek yerine ihtiyaç duyulan üç işlem burada
 * doğrudan yazıldı: oku, yaz, sil.
 *
 * IndexedDB kullanılamıyorsa (gizli sekme, eski tarayıcı) tüm fonksiyonlar
 * sessizce başarısız olur ve uygulama gömülü veriyle çalışmaya devam eder.
 */

const DB_NAME = 'arac-dedektifi'
const DB_VERSION = 1
const STORE = 'kv'

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB yok'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).catch((err) => {
    dbPromise = null
    throw err
  })
  return dbPromise
}

function withStore(mode, work) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const store = tx.objectStore(STORE)
        const request = work(store)
        tx.oncomplete = () => resolve(request ? request.result : undefined)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      })
  )
}

export async function idbGet(key) {
  try {
    return await withStore('readonly', (store) => store.get(key))
  } catch {
    return undefined
  }
}

export async function idbSet(key, value) {
  try {
    await withStore('readwrite', (store) => store.put(value, key))
    return true
  } catch {
    return false
  }
}

export async function idbDelete(key) {
  try {
    await withStore('readwrite', (store) => store.delete(key))
    return true
  } catch {
    return false
  }
}
