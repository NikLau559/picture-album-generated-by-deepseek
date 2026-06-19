import { VirtualTimeline } from '../timeline/VirtualTimeline'
import { useAppStore } from '../../store/useAppStore'

export function MainArea(): JSX.Element {
  const hasItems = useAppStore(s => s.mediaItems.length > 0)

  if (!hasItems) {
    return <div className="flex-1" />
  }

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <VirtualTimeline />
    </main>
  )
}
