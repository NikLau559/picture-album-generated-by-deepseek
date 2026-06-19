import type { MediaItem } from '@shared/types'
import { MediaCard } from '../media/MediaCard'
import { LivePhotoCard } from '../media/LivePhotoCard'

interface MediaGridProps {
  items: MediaItem[]
  thumbnailSize: number
  onItemClick: (item: MediaItem) => void
}

export function MediaGrid({ items, thumbnailSize, onItemClick }: MediaGridProps): JSX.Element {
  return (
    <div
      className="pb-6"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))`,
        gap: '8px',
      }}
    >
      {items.map((item) =>
        item.isLivePhoto ? (
          <LivePhotoCard
            key={item.id}
            item={item}
            size={thumbnailSize}
            onClick={() => onItemClick(item)}
          />
        ) : (
          <MediaCard
            key={item.id}
            item={item}
            size={thumbnailSize}
            onClick={() => onItemClick(item)}
          />
        )
      )}
    </div>
  )
}
