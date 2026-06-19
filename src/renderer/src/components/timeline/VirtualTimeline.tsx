import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAppStore } from '../../store/useAppStore'
import { useTimelineGroups } from '../../hooks/useTimelineGroups'
import { MediaGrid } from './MediaGrid'
import { TimelineScrubber } from './TimelineScrubber'
import { FloatingMonthLabel } from './FloatingMonthLabel'

const CARD_MARGIN = 8

function estimateGroupHeight(itemCount: number, thumbnailSize: number): number {
  const containerWidth = 1000
  const cardWidth = thumbnailSize + CARD_MARGIN * 2
  const columns = Math.max(1, Math.floor(containerWidth / cardWidth))
  const rows = Math.ceil(itemCount / columns)
  const rowHeight = thumbnailSize + CARD_MARGIN * 2 + 40
  return rows * rowHeight + 12 // small gap between groups
}

export function VirtualTimeline(): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)
  const mediaItems = useAppStore(s => s.mediaItems)
  const activeFilter = useAppStore(s => s.activeFilter)
  const thumbnailSize = useAppStore(s => s.thumbnailSize)
  const openPreview = useAppStore(s => s.openPreview)
  const setActiveMonthLabel = useAppStore(s => s.setActiveMonthLabel)

  const groups = useTimelineGroups(mediaItems, activeFilter)

  const virtualizer = useVirtualizer({
    count: groups.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => estimateGroupHeight(groups[i].items.length, thumbnailSize),
    overscan: 2,
  })

  const flatFiltered = useMemo(() => groups.flatMap(g => g.items), [groups])

  // Track which month is visible and update the store
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container || groups.length === 0) return

    const headers = container.querySelectorAll('[data-month-index]')
    let closestIdx = 0
    let closestDist = Infinity

    headers.forEach((header) => {
      const rect = header.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const dist = Math.abs(rect.top - containerRect.top)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = Number((header as HTMLElement).dataset.monthIndex)
      }
    })

    if (groups[closestIdx]) {
      setActiveMonthLabel(groups[closestIdx].label)
    }
  }, [groups, setActiveMonthLabel])

  // Attach scroll listener
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    // Initialize
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleItemClick = (item: typeof flatFiltered[0]) => {
    const idx = flatFiltered.findIndex(i => i.id === item.id)
    openPreview(item, idx)
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={scrollRef} className="h-full overflow-auto p-4 pr-12">
        {groups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-surface-200">No items to display</p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const group = groups[virtualRow.index]
              if (!group) return null

              return (
                <div
                  key={group.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  ref={virtualizer.measureElement}
                >
                  <div data-month-index={virtualRow.index}>
                    <MediaGrid
                      items={group.items}
                      thumbnailSize={thumbnailSize}
                      onItemClick={handleItemClick}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating month label at top */}
      <FloatingMonthLabel />

      {/* Right-side mini timeline */}
      <TimelineScrubber
        scrollContainerRef={scrollRef}
        groups={groups}
      />
    </div>
  )
}
