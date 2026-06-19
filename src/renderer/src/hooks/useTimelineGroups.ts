import { useMemo } from 'react'
import type { MediaItem, MonthGroup, FilterType } from '@shared/types'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function useTimelineGroups(
  items: MediaItem[],
  filter: FilterType
): MonthGroup[] {
  return useMemo(() => {
    // Sort items by dateTaken (oldest first)
    const sorted = [...items].sort((a, b) => {
      const dateA = a.dateTaken ? new Date(a.dateTaken).getTime() : 0
      const dateB = b.dateTaken ? new Date(b.dateTaken).getTime() : 0
      return dateA - dateB
    })

    // Filter
    const filtered = sorted.filter(item => {
      switch (filter) {
        case 'photos': return item.type === 'photo'
        case 'videos': return item.type === 'video'
        default: return true
      }
    })

    // Group by year-month
    const groupsMap = new Map<string, MonthGroup>()

    for (const item of filtered) {
      const date = item.dateTaken ? new Date(item.dateTaken) : new Date(item.modifiedAt)
      const year = date.getFullYear()
      const month = date.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          key,
          year,
          month,
          label: `${MONTH_NAMES[month]} ${year}`,
          items: []
        })
      }

      groupsMap.get(key)!.items.push(item)
    }

    return Array.from(groupsMap.values())
  }, [items, filter])
}
