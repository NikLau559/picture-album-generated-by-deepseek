import { create } from 'zustand'
import type { MediaItem, FilterType, ScanProgress, MediaMetadata } from '@shared/types'

interface AppState {
  // Directory
  selectedDirectory: string | null

  // Scan state
  mediaItems: MediaItem[]
  isScanning: boolean
  scanProgress: ScanProgress | null
  scanError: string | null

  // Filter
  activeFilter: FilterType

  // Preview
  previewItem: MediaItem | null
  previewIndex: number
  isPreviewOpen: boolean

  // Thumbnail size
  thumbnailSize: number

  // Metadata cache
  metadataCache: Record<string, MediaMetadata>

  // Timeline position
  activeMonthLabel: string | null

  // Computed (could be derived, but stored for convenience)
  photoCount: number
  videoCount: number
  livePhotoCount: number

  // Actions
  setActiveMonthLabel: (label: string | null) => void
  setDirectory: (path: string | null) => void
  setMediaItems: (items: MediaItem[]) => void
  setScanning: (scanning: boolean) => void
  setScanProgress: (progress: ScanProgress | null) => void
  setScanError: (error: string | null) => void
  setFilter: (filter: FilterType) => void
  openPreview: (item: MediaItem, index: number) => void
  closePreview: () => void
  navigatePreview: (direction: 'prev' | 'next') => void
  setThumbnailSize: (size: number) => void
  setMetadata: (filePath: string, metadata: MediaMetadata) => void
  reset: () => void
}

const getFilteredItems = (items: MediaItem[], filter: FilterType): MediaItem[] => {
  switch (filter) {
    case 'photos':
      return items.filter(i => i.type === 'photo')
    case 'videos':
      return items.filter(i => i.type === 'video')
    default:
      return items
  }
}

const getFilteredIndex = (items: MediaItem[], filter: FilterType, itemId: string): number => {
  const filtered = getFilteredItems(items, filter)
  return filtered.findIndex(i => i.id === itemId)
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedDirectory: null,
  mediaItems: [],
  isScanning: false,
  scanProgress: null,
  scanError: null,
  activeFilter: 'all',
  previewItem: null,
  previewIndex: -1,
  isPreviewOpen: false,
  thumbnailSize: 200,
  metadataCache: {},
  activeMonthLabel: null,
  photoCount: 0,
  videoCount: 0,
  livePhotoCount: 0,

  // Actions
  setActiveMonthLabel: (label) => set({ activeMonthLabel: label }),
  setDirectory: (path) => set({ selectedDirectory: path }),

  setMediaItems: (items) => {
    const photos = items.filter(i => i.type === 'photo').length
    const videos = items.filter(i => i.type === 'video').length
    const livePhotos = items.filter(i => i.isLivePhoto).length

    set({
      mediaItems: items,
      photoCount: photos,
      videoCount: videos,
      livePhotoCount: livePhotos,
      scanError: null
    })
  },

  setScanning: (scanning) => set({ isScanning: scanning }),

  setScanProgress: (progress) => set({ scanProgress: progress }),

  setScanError: (error) => set({ scanError: error, isScanning: false }),

  setFilter: (filter) => set({ activeFilter: filter }),

  openPreview: (item, index) => {
    const state = get()
    set({
      previewItem: item,
      previewIndex: index,
      isPreviewOpen: true
    })
  },

  closePreview: () => set({
    previewItem: null,
    previewIndex: -1,
    isPreviewOpen: false
  }),

  navigatePreview: (direction) => {
    const state = get()
    const filtered = getFilteredItems(state.mediaItems, state.activeFilter)
    if (filtered.length === 0) return

    let newIndex = state.previewIndex
    if (direction === 'prev') {
      newIndex = (state.previewIndex - 1 + filtered.length) % filtered.length
    } else {
      newIndex = (state.previewIndex + 1) % filtered.length
    }

    set({
      previewItem: filtered[newIndex],
      previewIndex: newIndex
    })
  },

  setThumbnailSize: (size) => set({ thumbnailSize: size }),

  setMetadata: (filePath, metadata) => set((state) => ({
    metadataCache: { ...state.metadataCache, [filePath]: metadata }
  })),

  reset: () => set({
    mediaItems: [],
    isScanning: false,
    scanProgress: null,
    scanError: null,
    previewItem: null,
    previewIndex: -1,
    isPreviewOpen: false,
    metadataCache: {},
    photoCount: 0,
    videoCount: 0,
    livePhotoCount: 0
  })
}))

// Exported selector helpers
export function getFilteredList(items: MediaItem[], filter: FilterType): MediaItem[] {
  return getFilteredItems(items, filter)
}
