import { promises as fs } from 'fs'
import { join, extname, basename } from 'path'
import { createHash } from 'crypto'
import type { MediaItem, ScanProgress } from '@shared/types'

const SUPPORTED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.heic', '.heif',
  '.mov', '.mp4', '.webm', '.mkv', '.avi',
  '.gif', '.tiff', '.bmp', '.webp', '.avif'
])

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.heic', '.heif',
  '.gif', '.tiff', '.bmp', '.webp', '.avif'
])

const VIDEO_EXTENSIONS = new Set([
  '.mov', '.mp4', '.webm', '.mkv', '.avi'
])

function getMediaType(ext: string): 'photo' | 'video' {
  if (IMAGE_EXTENSIONS.has(ext)) return 'photo'
  return 'video'
}

function generateId(filePath: string, mtime: Date): string {
  return createHash('sha256')
    .update(`${filePath}-${mtime.getTime()}`)
    .digest('hex')
    .substring(0, 16)
}

function generateCacheKey(filePath: string, mtime: Date, size: number): string {
  return createHash('sha256')
    .update(`${filePath}-${mtime.getTime()}-${size}`)
    .digest('hex')
    .substring(0, 16)
}

async function walkDirectory(
  dirPath: string,
  onProgress: (progress: ScanProgress) => void
): Promise<MediaItem[]> {
  const items: MediaItem[] = []
  let scanned = 0

  async function walk(currentPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name)

        if (entry.isDirectory()) {
          // Skip hidden directories
          if (!entry.name.startsWith('.')) {
            await walk(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase()
          if (SUPPORTED_EXTENSIONS.has(ext)) {
            try {
              const stat = await fs.stat(fullPath)
              const bName = basename(entry.name, ext)

              const item: MediaItem = {
                id: generateId(fullPath, stat.mtime),
                filePath: fullPath,
                baseName: bName,
                extension: ext,
                type: getMediaType(ext),
                subType: 'standard',
                size: stat.size,
                modifiedAt: stat.mtime.toISOString(),
                createdAt: stat.birthtime.toISOString(),
                dateTaken: stat.mtime.toISOString(),
                dimensions: null,
                orientation: 1,
                cameraModel: null,
                gps: null,
                duration: null,
                livePhotoVideoPath: null,
                isLivePhoto: false,
                thumbnailCacheKey: generateCacheKey(fullPath, stat.mtime, stat.size)
              }

              items.push(item)
              scanned++

              if (scanned % 100 === 0) {
                onProgress({ scanned, total: 0, currentFile: fullPath, phase: 'walking' })
              }
            } catch {
              // Skip files that can't be stat'd
            }
          }
        }
      }
    } catch {
      // Skip directories that can't be read
    }
  }

  await walk(dirPath)
  return items
}

export async function scanDirectoryService(
  dirPath: string,
  onProgress: (progress: ScanProgress) => void
): Promise<{ items: MediaItem[]; totalFiles: number; totalSize: number }> {
  onProgress({ scanned: 0, total: 0, currentFile: 'Scanning...', phase: 'walking' })
  const items = await walkDirectory(dirPath, onProgress)

  const totalSize = items.reduce((sum, item) => sum + item.size, 0)

  onProgress({
    scanned: items.length,
    total: items.length,
    currentFile: 'Complete',
    phase: 'metadata'
  })

  return { items, totalFiles: items.length, totalSize }
}
