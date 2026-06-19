import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export function PreviewNav(): JSX.Element {
  const navigatePreview = useAppStore(s => s.navigatePreview)
  const filteredItems = useAppStore(s => s.mediaItems)
  const activeFilter = useAppStore(s => s.activeFilter)
  const previewIndex = useAppStore(s => s.previewIndex)

  const filtered = activeFilter === 'all'
    ? filteredItems
    : filteredItems.filter(i =>
        activeFilter === 'photos' ? i.type === 'photo' : i.type === 'video'
      )

  if (filtered.length <= 1) return null

  return (
    <>
      {/* Previous button */}
      <button
        onClick={() => navigatePreview('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10
                   hover:bg-white/20 text-white transition-all hover:scale-110"
        title="Previous (←)"
      >
        <ChevronLeft size={28} />
      </button>

      {/* Next button */}
      <button
        onClick={() => navigatePreview('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10
                   hover:bg-white/20 text-white transition-all hover:scale-110"
        title="Next (→)"
      >
        <ChevronRight size={28} />
      </button>
    </>
  )
}
