import { Camera, Calendar, MapPin, Maximize, Clock } from 'lucide-react'
import type { MediaItem } from '@shared/types'
import { useAppStore } from '../../store/useAppStore'

interface MetadataPanelProps {
  item: MediaItem
}

export function MetadataPanel({ item }: MetadataPanelProps): JSX.Element {
  const metadataCache = useAppStore(s => s.metadataCache)
  const metadata = metadataCache[item.filePath]

  const formatDate = (dateStr: string | null): string | null => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const dateTaken = formatDate(metadata?.dateTaken ?? item.dateTaken)
  const dimensions = metadata?.dimensions ?? item.dimensions

  return (
    <aside className="w-72 bg-surface-900/95 border-l border-surface-700 p-4 overflow-y-auto animate-slide-up">
      <h3 className="text-sm font-semibold text-white mb-4">Info</h3>

      <div className="space-y-4">
        {/* File name */}
        <div>
          <p className="text-xs text-surface-200 mb-1">File</p>
          <p className="text-sm text-white truncate" title={item.baseName + item.extension}>
            {item.baseName}{item.extension}
          </p>
        </div>

        {/* Date taken */}
        {dateTaken && (
          <div className="flex items-start gap-2">
            <Calendar size={14} className="text-surface-200 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-200">Date Taken</p>
              <p className="text-sm text-white">{dateTaken}</p>
            </div>
          </div>
        )}

        {/* Camera */}
        {metadata?.cameraModel && (
          <div className="flex items-start gap-2">
            <Camera size={14} className="text-surface-200 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-200">Camera</p>
              <p className="text-sm text-white">{metadata.cameraModel}</p>
            </div>
          </div>
        )}

        {/* Dimensions */}
        {dimensions && (
          <div className="flex items-start gap-2">
            <Maximize size={14} className="text-surface-200 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-200">Dimensions</p>
              <p className="text-sm text-white">
                {dimensions.width} × {dimensions.height}
              </p>
            </div>
          </div>
        )}

        {/* Duration (video) */}
        {metadata?.duration && (
          <div className="flex items-start gap-2">
            <Clock size={14} className="text-surface-200 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-200">Duration</p>
              <p className="text-sm text-white">{formatDuration(metadata.duration)}</p>
            </div>
          </div>
        )}

        {/* GPS */}
        {metadata?.gps && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-surface-200 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-200">Location</p>
              <p className="text-sm text-white">
                {metadata.gps.lat.toFixed(4)}, {metadata.gps.lng.toFixed(4)}
              </p>
            </div>
          </div>
        )}

        {/* File size */}
        <div>
          <p className="text-xs text-surface-200">File Size</p>
          <p className="text-sm text-white">{formatFileSize(item.size)}</p>
        </div>

        {/* Type */}
        <div>
          <p className="text-xs text-surface-200">Type</p>
          <p className="text-sm text-white capitalize">
            {item.isLivePhoto ? 'Live Photo' : item.type}
          </p>
        </div>
      </div>
    </aside>
  )
}
