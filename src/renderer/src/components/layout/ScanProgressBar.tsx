import { Loader2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export function ScanProgressBar(): JSX.Element {
  const progress = useAppStore(s => s.scanProgress)
  const scanned = progress?.scanned ?? 0
  const total = progress?.total || 0
  const currentFile = progress?.currentFile ?? ''
  const phase = progress?.phase ?? 'walking'

  const percentage = total > 0 ? Math.round((scanned / Math.max(total, 1)) * 100) : 0
  const fileName = currentFile.split(/[/\\]/).pop() ?? currentFile

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Loader2 size={14} className="animate-spin text-blue-400" />
        <span className="text-xs text-surface-200">
          {phase === 'walking' ? 'Scanning files...' : 'Extracting metadata...'}
        </span>
        {total > 0 && (
          <span className="ml-auto text-xs text-surface-200">{percentage}%</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: total > 0 ? `${percentage}%` : '100%', animation: total === 0 ? 'pulse 2s infinite' : undefined }}
        />
      </div>

      {/* Current file */}
      {fileName && (
        <p className="mt-1 text-xs text-surface-200 truncate" title={currentFile}>
          {fileName}
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { width: 10%; }
          50% { width: 90%; }
        }
      `}</style>
    </div>
  )
}
