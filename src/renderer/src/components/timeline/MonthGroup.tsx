import type { MediaItem } from '@shared/types'
import { MonthHeader } from './MonthHeader'
import { MediaGrid } from './MediaGrid'

interface MonthGroupProps {
  label: string
  items: MediaItem[]
  thumbnailSize: number
  onItemClick: (item: MediaItem) => void
}

export function MonthGroup({ label, items, thumbnailSize, onItemClick }: MonthGroupProps): JSX.Element {
  return (
    <div>
      <MonthHeader label={label} count={items.length} />
      <MediaGrid
        items={items}
        thumbnailSize={thumbnailSize}
        onItemClick={onItemClick}
      />
    </div>
  )
}
