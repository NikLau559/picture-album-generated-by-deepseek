import { Image, Video, LayoutGrid } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { FilterType } from '@shared/types'

const FILTER_OPTIONS: { value: FilterType; label: string; icon: typeof Image }[] = [
  { value: 'all', label: 'All', icon: LayoutGrid },
  { value: 'photos', label: 'Photos', icon: Image },
  { value: 'videos', label: 'Videos', icon: Video },
]

export function FilterPanel(): JSX.Element {
  const activeFilter = useAppStore(s => s.activeFilter)
  const setFilter = useAppStore(s => s.setFilter)
  const totalItems = useAppStore(s => s.mediaItems.length)
  const photoCount = useAppStore(s => s.photoCount)
  const videoCount = useAppStore(s => s.videoCount)

  const getCount = (filter: FilterType): number => {
    switch (filter) {
      case 'photos': return photoCount
      case 'videos': return videoCount
      default: return totalItems
    }
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-surface-200 uppercase tracking-wider mb-3">
        Filter
      </h3>
      <div className="space-y-1">
        {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${activeFilter === value
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-surface-200 hover:bg-surface-700/50 border border-transparent'
              }`}
          >
            <Icon size={16} />
            <span className="flex-1 text-left">{label}</span>
            <span className="text-xs text-surface-200 tabular-nums">
              {getCount(value)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
