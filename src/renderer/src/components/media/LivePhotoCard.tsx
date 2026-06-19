import { memo, useRef, useState, useEffect, useCallback } from 'react'
import { Zap } from 'lucide-react'
import type { MediaItem } from '@shared/types'
import { useThumbnail } from '../../hooks/useThumbnail'

interface LivePhotoCardProps {
  item: MediaItem
  size: number
  onClick: () => void
}

export const LivePhotoCard = memo(function LivePhotoCard({
  item,
  size,
  onClick,
}: LivePhotoCardProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { dataUri, loading } = useThumbnail(
    isVisible ? item.filePath : null,
    'small'
  )

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    if (videoRef.current && item.livePhotoVideoPath) {
      const videoSrc = `file:///${item.livePhotoVideoPath.replace(/\\/g, '/')}`
      videoRef.current.src = videoSrc
      videoRef.current.play().catch(() => {
        // Autoplay may fail silently
      })
    }
  }, [item.livePhotoVideoPath])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [])

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-lg overflow-hidden bg-surface-800 cursor-pointer
                 hover:ring-2 hover:ring-amber-500/50 transition-all duration-200
                 hover:scale-[1.02] active:scale-[0.98]"
      style={{ width: size, height: size, aspectRatio: '1' }}
    >
      {/* Still image */}
      {dataUri ? (
        <img
          src={dataUri}
          alt={item.baseName}
          className={`w-full h-full object-cover transition-opacity duration-300
            ${isHovering ? 'opacity-0' : 'opacity-100'}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-800">
          {loading && (
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Live Photo video (plays on hover) */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300
          ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        muted
        loop
        playsInline
        preload="none"
      />

      {/* Live Photo badge */}
      <div className="absolute top-2 left-2">
        <span className="badge-live flex items-center gap-1 px-1.5 py-0.5 rounded text-xs">
          <Zap size={10} />
          LIVE
        </span>
      </div>
    </div>
  )
})
