import { ipcMain, dialog } from 'electron'
import { extname } from 'path'
import { scanDirectoryService } from '../services/scanner'
import { thumbnailService } from '../services/thumbnail-generator'
import { metadataService } from '../services/metadata.service'
import { cacheService } from '../services/cache.service'
import { detectLivePhotos, getLivePhotoVideoPath } from '../services/live-photo.service'
import type { ScanProgress } from '@shared/types'

const VIDEO_EXTS = new Set(['.mov', '.mp4', '.webm', '.mkv', '.avi'])

export function registerIpcHandlers(): void {
  // Directory selection
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // Directory scanning
  ipcMain.handle('scan:directory', async (event, dirPath: string) => {
    const onProgress = (progress: ScanProgress): void => {
      event.sender.send('scan:progress', progress)
    }
    const result = await scanDirectoryService(dirPath, onProgress)
    const livePhotoPairs = detectLivePhotos(result.items)
    return { ...result, livePhotoPairs }
  })

  // Thumbnail
  ipcMain.handle('thumbnail:get', async (_event, filePath: string, size: string) => {
    return thumbnailService.getThumbnail(filePath, size as 'small' | 'medium' | 'large' | 'preview')
  })

  // Metadata
  ipcMain.handle('metadata:get', async (_event, filePath: string) => {
    return metadataService.extractMetadata(filePath)
  })

  // Preview — for images: 1600px resized JPEG (cached on disk).
  // For videos: raw file:// URL for playback.
  ipcMain.handle('preview:readFile', async (_event, filePath: string) => {
    const ext = extname(filePath).toLowerCase()
    if (VIDEO_EXTS.has(ext)) {
      return `file:///${filePath.replace(/\\/g, '/')}`
    }
    return thumbnailService.getThumbnail(filePath, 'preview')
  })

  // Live Photo
  ipcMain.handle('livephoto:getVideoPath', async (_event, heicPath: string) => {
    return getLivePhotoVideoPath(heicPath)
  })

  // Cache
  ipcMain.handle('cache:clear', async () => {
    await cacheService.clear()
  })
}
