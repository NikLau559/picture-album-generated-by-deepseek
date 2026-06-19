import { useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useMediaScanner(): {
  startScan: (directoryPath?: string) => Promise<void>
  isScanning: boolean
  progress: { scanned: number; total: number; currentFile: string; phase: string } | null
} {
  const setMediaItems = useAppStore(s => s.setMediaItems)
  const setScanning = useAppStore(s => s.setScanning)
  const setScanProgress = useAppStore(s => s.setScanProgress)
  const setScanError = useAppStore(s => s.setScanError)
  const selectedDirectory = useAppStore(s => s.selectedDirectory)
  const isScanning = useAppStore(s => s.isScanning)
  const progress = useAppStore(s => s.scanProgress)

  const startScan = useCallback(async (directoryPath?: string) => {
    const dirPath = directoryPath || selectedDirectory
    if (!dirPath) return

    setScanning(true)
    setScanProgress(null)
    setScanError(null)

    try {
      // Register progress listener
      const unsub = window.electronAPI.onScanProgress((progress) => {
        setScanProgress(progress)
      })

      const result = await window.electronAPI.scanDirectory(dirPath)
      unsub()

      // Apply live photo pairs
      const items = result.items.map(item => ({
        ...item,
        livePhotoVideoPath: result.livePhotoPairs[item.filePath] || null,
        isLivePhoto: !!result.livePhotoPairs[item.filePath],
        subType: result.livePhotoPairs[item.filePath]
          ? ('livePhoto' as const)
          : item.subType
      }))

      setMediaItems(items)
      setScanning(false)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Scan failed')
      setScanning(false)
    }
  }, [selectedDirectory, setMediaItems, setScanning, setScanProgress, setScanError])

  return { startScan, isScanning, progress }
}
