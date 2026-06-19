import { useState, useEffect } from 'react'
import { RotateCw } from 'lucide-react'
import type { MediaItem } from '@shared/types'

interface ImageViewerProps {
  item: MediaItem
  thumbnailSrc?: string | null
}

export function ImageViewer({ item, thumbnailSrc }: ImageViewerProps): JSX.Element {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)  // 1600px fast preview
  const [originalSrc, setOriginalSrc] = useState<string | null>(null) // full-res
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const [originalLoaded, setOriginalLoaded] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270

  useEffect(() => {
    setPreviewLoaded(false)
    setOriginalLoaded(false)
    setZoom(1)
    setRotation(0)
    setPreviewSrc(null)
    setOriginalSrc(null)

    let cancelled = false

    // Stage 1: Load 1600px preview (fast, cached on disk)
    window.electronAPI.readFileForPreview(item.filePath).then((src) => {
      if (!cancelled) {
        setPreviewSrc(src)
        setPreviewLoaded(true)
      }
    })

    // Stage 2: Load full-res original in background
    window.electronAPI.readOriginalForPreview(item.filePath).then((src) => {
      if (!cancelled) {
        setOriginalSrc(src)
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

  const handleRotate = (): void => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Use original if loaded, otherwise use preview
  const displaySrc = originalSrc || previewSrc
  const isFullQuality = !!originalSrc

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-8 relative">
      {/* Thumbnail placeholder */}
      {thumbnailSrc && !previewLoaded && (
        <img
          src={thumbnailSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-contain blur-xl scale-105"
        />
      )}

      {/* Display image (preview → original) */}
      {displaySrc && (
        <img
          src={displaySrc}
          alt={item.baseName}
          className={`absolute inset-0 w-full h-full object-contain cursor-zoom-in transition-all duration-300
            ${previewLoaded ? 'opacity-100' : 'opacity-0'}
            ${isFullQuality ? 'image-rendering-auto' : ''}`}
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
          onClick={handleDbClick}
          onLoad={() => {
            if (displaySrc === originalSrc) {
              setOriginalLoaded(true)
            }
          }}
          draggable={false}
        />
      )}

      {/* Loading spinner */}
      {!previewLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Rotate button */}
      <button
        onClick={handleRotate}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 p-2 rounded-full
                   bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        title="Rotate 90°"
      >
        <RotateCw size={20} />
      </button>
    </div>
  )
}
