import { Sidebar } from './Sidebar'
import { MainArea } from './MainArea'
import { PreviewModal } from '../preview/PreviewModal'
import { useAppStore } from '../../store/useAppStore'

export function AppShell(): JSX.Element {
  const isPreviewOpen = useAppStore(s => s.isPreviewOpen)
  const hasItems = useAppStore(s => s.mediaItems.length > 0)
  const selectedDirectory = useAppStore(s => s.selectedDirectory)

  return (
    <div className="h-screen w-screen flex bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <MainArea />

      {/* Empty state */}
      {!selectedDirectory && !hasItems && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4">📸</div>
            <h1 className="text-2xl font-semibold text-white mb-2">Picture Album</h1>
            <p className="text-surface-200">
              Select a folder to start browsing your photos and videos
            </p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && <PreviewModal />}
    </div>
  )
}
