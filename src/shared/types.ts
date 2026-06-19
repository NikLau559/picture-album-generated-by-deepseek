export interface MediaItem {
  id: string
  filePath: string
  baseName: string
  extension: string
  type: 'photo' | 'video'
  subType: 'standard' | 'livePhoto' | 'screenshot'

  size: number
  modifiedAt: string
  createdAt: string

  dateTaken: string | null
  dimensions: { width: number; height: number } | null
  orientation: number
  cameraModel: string | null
  gps: { lat: number; lng: number } | null
  duration: number | null

  livePhotoVideoPath: string | null
  isLivePhoto: boolean

  thumbnailCacheKey: string
}

export type FilterType = 'all' | 'photos' | 'videos'

export interface MonthGroup {
  key: string
  year: number
  month: number
  label: string
  items: MediaItem[]
}

export interface ScanProgress {
  scanned: number
  total: number
  currentFile: string
  phase: 'walking' | 'metadata'
}

export interface ScanResult {
  items: MediaItem[]
  livePhotoPairs: Record<string, string>
  totalFiles: number
  totalSize: number
}

export interface MediaMetadata {
  dateTaken: string | null
  dimensions: { width: number; height: number } | null
  orientation: number
  cameraModel: string | null
  gps: { lat: number; lng: number } | null
  duration: number | null
}

export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>
  scanDirectory: (dirPath: string) => Promise<ScanResult>
  onScanProgress: (callback: (progress: ScanProgress) => void) => () => void
  getThumbnail: (filePath: string, size: 'small' | 'medium' | 'large' | 'preview') => Promise<string>
  getMetadata: (filePath: string) => Promise<MediaMetadata | null>
  readFileForPreview: (filePath: string) => Promise<string>
  getLivePhotoVideoPath: (heicPath: string) => Promise<string | null>
  clearThumbnailCache: () => Promise<void>
}
