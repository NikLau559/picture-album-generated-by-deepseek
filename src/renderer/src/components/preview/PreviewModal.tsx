import { useEffect, useCallback, useState } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { ImageViewer } from './ImageViewer'
import { VideoViewer } from './VideoViewer'
import { LivePhotoViewer } from './LivePhotoViewer'
import { PreviewNav } from './PreviewNav'
import { MetadataPanel } from './MetadataPanel'

export function PreviewModal(): JSX.Element {
  const previewItem = useAppStore(s => s.previewItem)
  const closePreview = useAppStore(s => s.closePreview)
  const navigatePreview = useAppStore(s => s.navigatePreview)
  const mediaItems = useAppStore(s => s.mediaItems)
  const activeFilter = useAppStore(s => s.activeFilter)
  const previewIndex = useAppStore(s => s.previewIndex)
  const setMetadata = useAppStore(s => s.setMetadata)
  const metadataCache = useAppStore(s => s.metadataCache)
  const [thumbDataUri, setThumbDataUri] = useState<string | null>(null)

  // Compute filtered list
  const filteredItems = activeFilter === 'all'
    ? mediaItems
    : mediaItems.filter(i => activeFilter === 'photos' ? i.type === 'photo' : i.type === 'video')

  // Load thumbnail for current item as placeholder
  useEffect(() => {
    if (!previewItem) return
    setThumbDataUri(null)
    window.electronAPI.getThumbnail(previewItem.filePath, 'medium').then(setThumbDataUri)
  }, [previewItem?.filePath])

  // Extract metadata on open
  useEffect(() => {
    if (!previewItem) return
    const filePath = previewItem.filePath
    if (metadataCache[filePath]) return
    window.electronAPI.getMetadata(filePath).then((metadata) => {
      if (metadata) setMetadata(filePath, metadata)
    })
  }, [previewItem, metadataCache, setMetadata])

  // Preload adjacent items' full-res previews
  useEffect(() => {
    if (!previewItem || filteredItems.length <= 1) return
    const indices = [previewIndex - 1, previewIndex + 1]
    for (const idx of indices) {
      if (idx < 0 || idx >= filteredItems.length) continue
      const item = filteredItems[idx]
      // Preload in background (don't await)
      window.electronAPI.readFileForPreview(item.filePath).then((src) => {
        // Store in module-level cache via a side effect
        // ImageViewer's previewCache handles this
        const img = new Image()
        img.src = src
      })
    }
  }, [previewItem?.filePath, previewIndex, filteredItems.length])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closePreview()
          break
        case 'ArrowLeft':
          navigatePreview('prev')
          break
        case 'ArrowRight':
          navigatePreview('next')
          break
      }
    },
    [closePreview, navigatePreview]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!previewItem) return null

  const renderViewer = (): JSX.Element => {
    if (previewItem.isLivePhoto) {
      return <LivePhotoViewer item={previewItem} thumbnailSrc={thumbDataUri} />
    }
    if (previewItem.type === 'video') {
      return <VideoViewer item={previewItem} />
    }
    return <ImageViewer item={previewItem} thumbnailSrc={thumbDataUri} />
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 animate-fade-in">
      {/* Close button */}
      <button
        onClick={closePreview}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20
                   text-white transition-colors"
        title="Close (Esc)"
      >
        <X size={24} />
      </button>

      {/* Main content */}
      <div className="flex h-full">
        {/* Viewer area */}
        <div className="flex-1 flex items-center justify-center">
          {renderViewer()}
        </div>

        {/* Metadata sidebar */}
        <MetadataPanel item={previewItem} />
      </div>

      {/* Navigation */}
      <PreviewNav />

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {previewIndex + 1} / {filteredItems.length}
      </div>
    </div>
  )
}
