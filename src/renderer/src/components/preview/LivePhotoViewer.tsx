import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Zap, RotateCw } from 'lucide-react'
import type { MediaItem } from '@shared/types'

interface LivePhotoViewerProps {
  item: MediaItem
  thumbnailSrc?: string | null
}

export function LivePhotoViewer({ item, thumbnailSrc }: LivePhotoViewerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [originalSrc, setOriginalSrc] = useState<string | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    setLoading(true)
    setPlaying(false)
    setShowVideo(false)
    setPreviewLoaded(false)
    setZoom(1)
    setRotation(0)
    setPreviewSrc(null)
    setOriginalSrc(null)
    setVideoSrc(null)

    let cancelled = false

    // Stage 1: 1600px previews (fast, cached)
    Promise.all([
      window.electronAPI.readFileForPreview(item.filePath),
      item.livePhotoVideoPath
        ? window.electronAPI.readFileForPreview(item.livePhotoVideoPath)
        : Promise.resolve(null),
    ]).then(([img, vid]) => {
      if (!cancelled) {
        setPreviewSrc(img)
        setVideoSrc(vid)
        setPreviewLoaded(true)
        setLoading(false)
      }
    })

    // Stage 2: Full-res original in background
    window.electronAPI.readOriginalForPreview(item.filePath).then((src) => {
      if (!cancelled) setOriginalSrc(src)
    })

    return () => { cancelled = true }
  }, [item.filePath, item.livePhotoVideoPath])

  const displaySrc = originalSrc || previewSrc

  const playVideo = useCallback(() => {
    if (!videoRef.current || !videoSrc) return
    setShowVideo(true)
    setPlaying(true)
    videoRef.current.play().catch(() => {})
  }, [videoSrc])

  const pauseVideo = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.pause()
    videoRef.current.currentTime = 0
    setPlaying(false)
    setShowVideo(false)
  }, [])

  const toggleVideo = useCallback(() => {
    if (playing) { pauseVideo() } else { playVideo() }
  }, [playing, playVideo, pauseVideo])

  const handleVideoEnded = useCallback(() => {
    setPlaying(false)
    setShowVideo(false)
    if (videoRef.current) videoRef.current.currentTime = 0
  }, [])

  const handleWheel = (e: React.WheelEvent): void => {
    if (playing) return
    e.preventDefault()
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + (e.deltaY > 0 ? -0.2 : 0.2))))
  }

  const handleDbClick = (): void => {
    if (playing) return
    setZoom((prev) => (prev === 1 ? 2 : 1))
  }

  const handleRotate = (): void => {
    if (playing) return
    setRotation((prev) => (prev + 90) % 360)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden p-8 relative" onWheel={handleWheel}>
      {/* Thumbnail placeholder */}
      {thumbnailSrc && !previewLoaded && (
        <img
          src={thumbnailSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-contain blur-xl scale-105"
        />
      )}

      {/* Still image */}
      {displaySrc && (
        <img
          src={displaySrc}
          alt={item.baseName}
          className={`absolute inset-0 w-full h-full object-contain cursor-zoom-in transition-opacity duration-300
            ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
          onClick={handleDbClick}
          draggable={false}
        />
      )}

      {/* Video overlay */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className={`absolute inset-0 w-full h-full object-contain rounded-lg
            transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          muted
          loop
          playsInline
          onEnded={handleVideoEnded}
        />
      )}

      {/* Loading spinner */}
      {!previewLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {/* Rotate button */}
        {!playing && (
          <button
            onClick={handleRotate}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Rotate 90°"
          >
            <RotateCw size={18} />
          </button>
        )}

        {/* Live Photo button */}
        {videoSrc && (
          <button
            onClick={toggleVideo}
            className="flex items-center gap-2 px-4 py-2
                       bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-full
                       text-amber-400 transition-colors"
          >
            {playing ? (
              <>
                <Pause size={16} />
                <span className="text-sm font-medium">Pause</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span className="text-sm font-medium">Live</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
