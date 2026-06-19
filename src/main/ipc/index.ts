import { ipcMain, dialog } from 'electron'
import { extname } from 'path'
import { scanDirectoryService } from '../services/scanner'
import { thumbnailService } from '../services/thumbnail-generator'
import { metadataService } from '../services/metadata.service'
import { cacheService } from '../services/cache.service'
import { detectLivePhotos, getLivePhotoVideoPath } from '../services/live-photo.service'
import { heicToJpeg } from '../services/heic.service'
import type { ScanProgress } from '@shared/types'

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
    return thumbnailService.getThumbnail(filePath, size as 'small' | 'medium' | 'large')
  })

  // Metadata
  ipcMain.handle('metadata:get', async (_event, filePath: string) => {
    return metadataService.extractMetadata(filePath)
  })

  // Preview
  ipcMain.handle('preview:readFile', async (_event, filePath: string) => {
    const ext = extname(filePath).toLowerCase()
    if (ext === '.heic' || ext === '.heif') {
      // Convert HEIC to JPEG for Chromium compatibility
      const jpegBuffer = await heicToJpeg(filePath)
      return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`
    }
    return `file:///${filePath.replace(/\\/g, '/')}`
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
