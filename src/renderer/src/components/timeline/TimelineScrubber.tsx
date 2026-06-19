import { useRef, useCallback, useState, useEffect } from 'react'
import type { MonthGroup } from '@shared/types'

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

interface TimelineScrubberProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  groups: MonthGroup[]
}

export function TimelineScrubber({ scrollContainerRef, groups }: TimelineScrubberProps): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(activeIndex)

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  const goToGroup = useCallback((index: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const target = container.querySelector(`[data-month-index="${index}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [scrollContainerRef])

  // Track which group is closest to the top
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || groups.length === 0) return

    const handleScroll = () => {
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

      if (closestIdx !== activeIndexRef.current) {
        setActiveIndex(closestIdx)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    // Initialize
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef, groups.length])

  if (groups.length <= 1) return <></>

  return (
    <div className="absolute right-2 top-0 bottom-0 z-20 flex items-center pointer-events-none">
      {/* Mini timeline dots */}
      <div className="flex flex-col gap-0.5 py-2 pointer-events-auto">
        {groups.map((group, i) => (
          <button
            key={group.key}
            onClick={() => goToGroup(i)}
            className={`group flex items-center justify-end gap-1.5 px-1.5 py-1 rounded transition-all
              ${i === activeIndex ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
            title={group.label}
          >
            <span
              className={`text-[10px] font-medium transition-opacity
                ${i === activeIndex ? 'text-white opacity-100' : 'text-surface-200 opacity-0 group-hover:opacity-100'}`}
            >
              {MONTH_SHORT[group.month]}
            </span>
            <span
              className={`block rounded-full transition-all
                ${i === activeIndex
                  ? 'w-2.5 h-2.5 bg-blue-400'
                  : 'w-1.5 h-1.5 bg-surface-400 group-hover:w-2 group-hover:h-2 group-hover:bg-surface-200'
                }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
