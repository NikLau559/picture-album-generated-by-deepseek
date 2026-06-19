import { Image, Video, Zap } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export function Statistics(): JSX.Element {
  const totalItems = useAppStore(s => s.mediaItems.length)
  const photoCount = useAppStore(s => s.photoCount)
  const videoCount = useAppStore(s => s.videoCount)
  const livePhotoCount = useAppStore(s => s.livePhotoCount)

  const stats = [
    { label: 'Total', value: totalItems, icon: null },
    { label: 'Photos', value: photoCount, icon: Image },
    { label: 'Videos', value: videoCount, icon: Video },
    { label: 'Live Photos', value: livePhotoCount, icon: Zap },
  ]

  return (
    <div>
      <h3 className="text-xs font-semibold text-surface-200 uppercase tracking-wider mb-3">
        Statistics
      </h3>
      <div className="space-y-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            {Icon && <Icon size={14} className="text-surface-200" />}
            <span className="text-surface-200">{label}</span>
            <span className="ml-auto text-white font-medium tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
