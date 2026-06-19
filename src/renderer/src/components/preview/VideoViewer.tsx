import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import type { MediaItem } from '@shared/types'

interface VideoViewerProps {
  item: MediaItem
}

export function VideoViewer({ item }: VideoViewerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    setLoading(true)
    setPlaying(false)
    window.electronAPI.readFileForPreview(item.filePath).then((filePath) => {
      setSrc(filePath)
      setLoading(false)
    })
  }, [item.filePath])

  const togglePlay = (): void => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  const toggleMute = (): void => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const handleTimeUpdate = (): void => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = (): void => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full max-h-full flex flex-col items-center p-8">
      {src && (
        <video
          ref={videoRef}
          src={src}
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4 bg-surface-800/80 rounded-full px-6 py-3">
        <button
          onClick={togglePlay}
          className="text-white hover:text-blue-400 transition-colors"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Progress bar */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-xs text-surface-200 tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-1 bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-surface-200 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        <button
          onClick={toggleMute}
          className="text-white hover:text-blue-400 transition-colors"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  )
}
