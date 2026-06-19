import { Image, Video, Zap } from 'lucide-react'
import type { MediaItem } from '@shared/types'

interface MediaTypeBadgeProps {
  item: MediaItem
  size?: 'sm' | 'md'
}

export function MediaTypeBadge({ item, size = 'sm' }: MediaTypeBadgeProps): JSX.Element {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  const iconSize = size === 'sm' ? 10 : 12

  if (item.isLivePhoto) {
    return (
      <div className={`${sizeClass} rounded-full bg-amber-500/20 flex items-center justify-center`}>
        <Zap size={iconSize} className="text-amber-400" />
      </div>
    )
  }

  if (item.type === 'video') {
    return (
      <div className={`${sizeClass} rounded-full bg-purple-500/20 flex items-center justify-center`}>
        <Video size={iconSize} className="text-purple-400" />
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-blue-500/20 flex items-center justify-center`}>
      <Image size={iconSize} className="text-blue-400" />
    </div>
  )
}
