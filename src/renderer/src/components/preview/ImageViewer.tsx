import { useState, useEffect } from 'react'
import type { MediaItem } from '@shared/types'

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

    let cancelled = false
    window.electronAPI.readFileForPreview(item.filePath).then((src) => {
      if (!cancelled) setFullSrc(src)
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
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-8 relative">
      {/* Thumbnail placeholder until preview loads */}
      {thumbnailSrc && !fullLoaded && (
        <img
          src={thumbnailSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-contain blur-xl scale-105"
        />
      )}

      {fullSrc && (
        <img
          src={fullSrc}
          alt={item.baseName}
          className={`absolute inset-0 w-full h-full object-contain cursor-zoom-in transition-opacity duration-300
            ${fullLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: `scale(${zoom})` }}
          onClick={handleDbClick}
          onLoad={() => setFullLoaded(true)}
          draggable={false}
        />
      )}

      {!fullLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
