import { useRef, useState } from 'react'
import { loadImageFromFile, drawToCanvas, analyzePhoto, canvasToJpeg } from '../services/photoAnalysisService'

export default function PhotoUpload({ photos, onAddPhoto, onRemovePhoto }) {
  const inputRef = useRef(null)
  const [processing, setProcessing] = useState(false)

  async function handleFiles(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    setProcessing(true)
    for (const file of files) {
      try {
        const img = await loadImageFromFile(file)
        const canvas = drawToCanvas(img)
        const analysis = analyzePhoto(canvas)
        const dataUrl = canvasToJpeg(canvas)
        onAddPhoto({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          dataUrl,
          warnings: analysis.warnings,
          fileDate: file.lastModified
        })
      } catch (err) {
        console.error('Fotoğraf işlenemedi:', err)
      }
    }
    setProcessing(false)
  }

  return (
    <div className="photo-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFiles}
        style={{ display: 'none' }}
      />
      <button type="button" className="favorite-button" onClick={() => inputRef.current?.click()}>
        {processing ? 'İşleniyor...' : 'Fotoğraf Ekle'}
      </button>
      <p className="market-disclaimer" style={{ marginTop: 8 }}>
        Fotoğraflar bu cihazda saklanır. Bulanıklık, ışık ve doku düzensizliği için otomatik kod
        tabanlı kontrol yapılır — bu bir yapay zeka hasar tespiti değildir, sadece yakından bakman
        gereken noktalar için kaba bir ipucudur.
      </p>

      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div className="photo-thumb" key={photo.id}>
              <img src={photo.dataUrl} alt="Yüklenen araç fotoğrafı" />
              <button
                type="button"
                className="photo-thumb-remove"
                onClick={() => onRemovePhoto(photo.id)}
                aria-label="Fotoğrafı kaldır"
              >
                ×
              </button>
              {photo.warnings.length > 0 && (
                <div className="photo-thumb-warnings">
                  {photo.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
