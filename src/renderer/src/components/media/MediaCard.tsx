import { memo, useRef, useState, useEffect } from 'react'
import { Play, Image as ImageIcon } from 'lucide-react'
import type { MediaItem } from '@shared/types'
import { useThumbnail } from '../../hooks/useThumbnail'

interface MediaCardProps {
  item: MediaItem
  size: number
  onClick: () => void
}

export const MediaCard = memo(function MediaCard({ item, size, onClick }: MediaCardProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Lazy-load thumbnail only after card stays visible for 200ms
  // Fast scrolling won't trigger loads for cards that flash by
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Card entered viewport — wait 200ms before loading
          timer = setTimeout(() => {
            setIsVisible(true)
            observer.disconnect()
          }, 200)
        } else {
          // Card left viewport — cancel pending load
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => {
      if (timer) clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const { dataUri, loading } = useThumbnail(
    isVisible ? item.filePath : null,
    'small'
  )

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="group relative rounded-lg overflow-hidden bg-surface-800 cursor-pointer
                 hover:ring-2 hover:ring-blue-500/50 transition-all duration-200
                 hover:scale-[1.02] active:scale-[0.98]"
      style={{ width: size, height: size, aspectRatio: '1' }}
    >
      {/* Thumbnail */}
      {dataUri ? (
        <img
          src={dataUri}
          alt={item.baseName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-800">
          {loading ? (
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon size={24} className="text-surface-700" />
          )}
        </div>
      )}

      {/* Video play icon overlay */}
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center
                        group-hover:bg-blue-500/80 transition-colors">
            <Play size={16} className="text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Type badge */}
      {item.type === 'video' && item.duration && (
        <div className="absolute bottom-2 right-2">
          <span className="badge-video text-xs px-1.5 py-0.5 rounded">
            {formatDuration(item.duration)}
          </span>
        </div>
      )}

      {/* Date overlay (on hover) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-xs text-white truncate">
          {formatDate(item.dateTaken || item.modifiedAt)}
        </p>
      </div>
    </div>
  )
})
