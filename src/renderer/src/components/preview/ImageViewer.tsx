import { useState, useEffect, useRef } from 'react'
import type { MediaItem } from '@shared/types'

// Cache full-res previews to avoid re-converting HEIC on prev/next
const previewCache = new Map<string, string>()

interface ImageViewerProps {
  item: MediaItem
  thumbnailSrc?: string | null
}

export function ImageViewer({ item, thumbnailSrc }: ImageViewerProps): JSX.Element {
  const [fullSrc, setFullSrc] = useState<string | null>(null)
  const [fullLoaded, setFullLoaded] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    setFullLoaded(false)
    setZoom(1)

    // Check memory cache first
    const cached = previewCache.get(item.filePath)
    if (cached) {
      setFullSrc(cached)
      setFullLoaded(true)
      return
    }

    // Load full-res from main process
    let cancelled = false
    window.electronAPI.readFileForPreview(item.filePath).then((src) => {
      if (!cancelled) {
        previewCache.set(item.filePath, src)
        setFullSrc(src)
      }
    })

    return () => { cancelled = true }
  }, [item.filePath])

  const handleWheel = (e: React.WheelEvent): void => {
    e.preventDefault()
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + (e.deltaY > 0 ? -0.2 : 0.2))))
  }

  const handleDbClick = (): void => {
    setZoom((prev) => (prev === 1 ? 2 : 1))
  }

  return (
    <div
      className="max-w-full max-h-full flex items-center justify-center overflow-hidden p-8 relative"
      onWheel={handleWheel}
    >
      {/* Thumbnail placeholder — visible until full image loads */}
      {thumbnailSrc && !fullLoaded && (
        <img
          src={thumbnailSrc}
          alt=""
          className="max-w-full max-h-full object-contain absolute blur-xl scale-105"
        />
      )}

      {fullSrc && (
        <img
          src={fullSrc}
          alt={item.baseName}
          className={`max-w-full max-h-full object-contain cursor-zoom-in transition-all duration-300
            ${fullLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: `scale(${zoom})` }}
          onClick={handleDbClick}
          onLoad={() => setFullLoaded(true)}
          draggable={false}
        />
      )}

      {/* Loading spinner */}
      {!fullLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Max cache entries to prevent memory leaks
const MAX_CACHE = 20
export function prunePreviewCache(): void {
  if (previewCache.size > MAX_CACHE) {
    const keys = Array.from(previewCache.keys())
    const toDelete = keys.slice(0, keys.length - MAX_CACHE)
    for (const key of toDelete) {
      previewCache.delete(key)
    }
  }
}
