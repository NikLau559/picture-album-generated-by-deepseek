import { FolderOpen, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useMediaScanner } from '../../hooks/useMediaScanner'
import { FilterPanel } from './FilterPanel'
import { Statistics } from './Statistics'
import { ScanProgressBar } from './ScanProgressBar'

export function Sidebar(): JSX.Element {
  const selectedDirectory = useAppStore(s => s.selectedDirectory)
  const setDirectory = useAppStore(s => s.setDirectory)
  const reset = useAppStore(s => s.reset)
  const isScanning = useAppStore(s => s.isScanning)
  const hasItems = useAppStore(s => s.mediaItems.length > 0)

  const { startScan } = useMediaScanner()

  const handleSelectDirectory = async (): Promise<void> => {
    const path = await window.electronAPI.selectDirectory()
    if (path) {
      setDirectory(path)
      await startScan(path)
    }
  }

  const handleClear = async (): Promise<void> => {
    reset()
    await window.electronAPI.clearThumbnailCache()
  }

  return (
    <aside className="w-64 h-full bg-surface-900 border-r border-surface-700 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-surface-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">📸</span>
          Picture Album
        </h1>
      </div>

      {/* Directory selector */}
      <div className="p-4 border-b border-surface-700">
        <button
          onClick={handleSelectDirectory}
          disabled={isScanning}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <FolderOpen size={16} />
          {selectedDirectory ? 'Change Folder' : 'Open Folder'}
        </button>

        {selectedDirectory && (
          <p className="mt-2 text-xs text-surface-200 truncate" title={selectedDirectory}>
            {selectedDirectory}
          </p>
        )}
      </div>

      {/* Scan progress */}
      {isScanning && (
        <div className="p-4 border-b border-surface-700">
          <ScanProgressBar />
        </div>
      )}

      {/* Filter */}
      {hasItems && (
        <div className="p-4 border-b border-surface-700">
          <FilterPanel />
        </div>
      )}

      {/* Statistics */}
      {hasItems && (
        <div className="p-4 border-b border-surface-700">
          <Statistics />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 mt-auto">
        {hasItems && (
          <button
            onClick={handleClear}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-surface-200 hover:text-red-400"
          >
            <Trash2 size={14} />
            Clear Cache & Reset
          </button>
        )}
      </div>
    </aside>
  )
}
